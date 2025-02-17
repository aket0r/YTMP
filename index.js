const path = require("path");
const url = require("url");
const {app, BrowserWindow, Menu, Tray} = require("electron");
const fs = require("fs");
const os = require("os");


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




