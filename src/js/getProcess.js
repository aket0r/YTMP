const fs = require("fs");
const processList = require('node-processlist');
const child_process = require("child_process");

function setLogs(message) {
    const filename = 'src/logs/logs.txt';
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;
        fs.writeFileSync(`src/logs/logs.txt`,  `${(data === "" ? data : data + '\n')}[${new Date().toLocaleString()}] ${message} \n`, () => {});
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

let processesValues = getData('src/processes/processes.json');



const isRunning = localStorage.getItem("isRunning");
const isRunningMetaData = localStorage.getItem("isRunningMetaData");

let processes = [];
async function getProcessList() {
    await processList.getProcesses()
    .then(data => {
        processes = data;
    }).catch((e) => {
        console.log(`%c[ERROR] %c${e} %cat %cgetProcess.js:%c33`, 'color: red;', 'color:yellow;', 'color: white;', 'color: royalblue;');
        setLogs(e);
        processes = e;
        throw e;
    });

    setTimeout(() => {
        loadProcesses();
    }, 500);
}

async function getProcessById(pid, id) {
    await processList.getProcessById(pid)
    .then(res => {
        if(!res) {
            delete processesValues[id];

            processesValues = processesValues.filter(value => {
                return value != null && value != 'empty' && value != undefined;
            });

            fs.writeFileSync(`src/processes/processes.json`, JSON.stringify(processesValues, null, '\t'), () => {});
        }
    }).catch((e) => {
        setLogs(e);
        console.log(`%c[ERROR] %c${e} %cat %cgetProcess.js:%c56`, 'color: red;', 'color:yellow;', 'color: white;', 'color: royalblue;');
        throw e;
    });
}

getProcessList();

function setCheckboxesToActive() {
    const elements = document.querySelectorAll("table tr .pid");
    const isSelectedProcessItem = document.querySelectorAll("table tr td #isSelectedProcess");
    const isSelectedProcess = document.querySelectorAll("table tr");

    elements.forEach((element, index) => {
        for(let i = 0; i < processesValues.length; i++) {
            if(element.innerText == processesValues[i].pid) {
                isSelectedProcessItem[index-1].checked = true;
                isSelectedProcess[index].classList.add('active');
            }
        }
    })
}


function createHTMLElement(element, path, value = {}, isTitle = false) {
    if(!element || !path) throw 'Some arguments are not specified [getProcess.js:17]';

    const HTMLElement = document.createElement(element);
    const content = 
    `
        <td>
            ${(!isTitle) ? `<input type="checkbox" onchange="isChecked(event)" data-pid="${value.pid}" name="${value.name}" id="isSelectedProcess">` : 'STATUS'}
        </td>
        <td class="title" title="${value.name}">
            ${value.name}
        </td>
        <td>
            ${value.date}
        </td>
        <td class="pid">
            ${value.pid}
        </td>
    `;
    (isTitle === true) ? HTMLElement.classList.add('title-container') : null;
    HTMLElement.innerHTML = content;
    document.querySelector(path).prepend(HTMLElement);
}

function loadProcesses() {
    const loadingElement = document.querySelector(".loading");
    const processesLength = document.querySelector(".processes-length");
    processesLength.innerText = processes.length;

    for (let i = 0; i < processesValues.length; i++) {
        getProcessById(processesValues[i].pid, i);
    }

    for (const process of processes) {
        createHTMLElement('tr', 'table', {
            name: process.name,
            date: new Date().toLocaleString(),
            pid: process.pid
        })
    }

    createHTMLElement('tr', 'table', {
        name: "NAME",
        date: "DATE",
        pid: "PID"
    }, true);

    setCheckboxesToActive();
    
    loadingElement.remove();
}