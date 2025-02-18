const path = require("path");
const url = require("url");
const {app, BrowserWindow, Menu, Tray} = require("electron");
const fs = require("fs");
const os = require("os");
const child_process = require("child_process");
const actualVersion = '1.5.8b'

fs.readFile(`src/version.ver`, null, (error) => {
    if(error) {
        fs.writeFileSync(`src/version.ver`, actualVersion);
    }
});

function saveConfig(data = {h: 6, m: 0, s: 0}) {
    setData('src/config/config.json', {
        ver: actualVersion,
        collection: {
            TIME_SECTION: [data.h,data.m,data.s]
        },
        running: new Date().toLocaleString()
    });
}

function getData(file) {
    const buffer = fs.readFileSync(file);
    const data = JSON.parse(buffer);

    return data;
}

function setData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, '\t'), () => {});
}


let requirements = getData('src/config/config.json');
let init = null;
let isDone = false;
function startTime() {
    const processesDB = getData('src/processes/processes.json');
    console.log(`[${new Date().toLocaleString()}] ${requirements.collection.TIME_SECTION[0]}:${requirements.collection.TIME_SECTION[1]}:${requirements.collection.TIME_SECTION[2]}`);
    // SECONDS
    if(requirements.collection.TIME_SECTION[2] < 0) {
        requirements.collection.TIME_SECTION[2] = 59;
        requirements.collection.TIME_SECTION[1]--;
    }

    // MINUTES
    if(requirements.collection.TIME_SECTION[1] < 0) {
        requirements.collection.TIME_SECTION[1] = 59;
        requirements.collection.TIME_SECTION[0]--;
    }

    saveConfig({
        h: requirements.collection.TIME_SECTION[0],
        m: requirements.collection.TIME_SECTION[1],
        s: requirements.collection.TIME_SECTION[2]
    });

    if(requirements.collection.TIME_SECTION[2] === 0 && requirements.collection.TIME_SECTION[1] === 0 && requirements.collection.TIME_SECTION[0] === 0) {
        isDone = true;
        saveConfig();
        requirements = getData('src/config/config.json');
        for(const prc of processesDB) {
            shutDownProcesses(prc.pid);
        }
        return;
    }
    requirements.collection.TIME_SECTION[2] = requirements.collection.TIME_SECTION[2] - 1;
}


function shutDownProcesses(pid) {
    fs.writeFileSync(`src/processes/${pid}__taskkill.bat`, `taskkill /PID ${pid}`, () => {});
    setTimeout(() => {
        child_process.exec(`start %SystemRoot%/system32/WindowsPowerShell/v1.0/powershell.exe Start-Process '${__dirname.replaceAll("\\", '/')}/src/processes/${pid}__taskkill.bat'`, function(error, stdout, stderr){
            if(error) {
                console.log(`%c[ERROR] %c${error} %cat %cgetProcess.js:%c33`, 'color: red;', 'color:yellow;', 'color: white;', 'color: royalblue;');
            }
        });
    }, 3000);

    setTimeout(() => {
        fs.rmSync(`src/processes/${pid}__taskkill.bat`);
        fs.writeFileSync(`src/processes/processes.json`, JSON.stringify([], null, '\t'), () => {});
    }, 5000);
}

const processList = require('node-processlist');

let initObserver = null;
async function observer() {
    const processes = await getData('src/processes/processes.json');
    if (!processes || processes.length === 0) return;

    let executed = false;

    for (const prc of processes) {
        await processList.getProcessById(prc.pid)
            .then(res => {
                if (res && !executed) { // Вызываем `startTime()` только если ещё не запускали в этой итерации
                    if(!isDone) {
                        startTime();
                    }
                    executed = true;
                }
            })
            .catch((e) => {
                throw e;
            });
    }

    initObserver = setTimeout(observer, 1000);
}

let isObserver = false;
async function CheckProcessesLength() {
    const processes = await getData('src/processes/processes.json');

    if(processes.length > 0) {
        if(isObserver) return;
        observer();
        isDone = false;
        isObserver = true;
    } else {
        clearTimeout(initObserver);
        isObserver = false;
    }
}

const initPCL = setInterval(CheckProcessesLength, 1000);


let trayMenuTemplate = [
    {
        label: "Exit",
        click: function () {
            app.quit();
            app.quit();
        }
    }
];
let appTray = null;
let isTray = false;


async function createWindow() {
    trayIcon = path.join(__dirname, 'src/assets/icons');
    appTray = new Tray(path.join (trayIcon, 'icon.ico'));
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setToolTip(`YTM Program`);
    appTray.setContextMenu(contextMenu);
    

    appTray.on('click',function(){
        if(isTray) return;
        win = new BrowserWindow({
            resizable: true,
            width: 625,
            height: 500,
            autoHideMenuBar: true,
            icon: `${__dirname}/assets/icons/icon.ico`,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                __dirname: true
            },
            show: true
        });
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'src/index.html'),
            protocol: 'file:',
            slashes: true,
        }));
        // win.removeMenu();
        app.focus();
        isTray = true;
        // win.webContents.openDevTools();

        win.on('closed', () => {
            win = null;
            isTray = false;
        });
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {});




