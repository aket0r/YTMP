const hoursElement = document.querySelector(".cp--hours");
const minutesElement = document.querySelector(".cp--minutes");
const secondsElement = document.querySelector(".cp--seconds");


const data = getData('src/config/config.json');
const processesDB = getData('src/processes/processes.json');


function checkConfig() {
    if(!data || data.length == 0) {
        setData('src/config/config.json', {
            ver: '1.5.3',
            collection: {
                TIME_SECTION: [6,0,0]
            },
            running: new Date().toLocaleString()
        });
    }

    return getData('src/config/config.json');
}

const requirements = checkConfig();

function convertNumbersToStr(str) {
    return (str.length == 1) ? '0' + str : str;
}

window.addEventListener("load", function() {
    let showDate = this.document.querySelector('#running-time');
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    if(!isRunning) {
        this.localStorage.setItem("isRunning", new Date().toLocaleString());
        this.localStorage.setItem("isRunningMetaData", JSON.stringify([day, month, year]));
    }

    const runningData = JSON.parse(isRunningMetaData);

    if(day > runningData[0] || month > runningData[1] || year > runningData[2]) {
        this.localStorage.setItem("isRunning", new Date().toLocaleString());
        this.localStorage.setItem("isRunningMetaData", JSON.stringify([day, month, year]));
    }

    setTimeout(() => {
        showDate.innerText = isRunning || new Date().toLocaleString();
    }, 100);

    hoursElement.value = convertNumbersToStr(`${requirements.collection.TIME_SECTION[0]}`);
    minutesElement.value = convertNumbersToStr(`${requirements.collection.TIME_SECTION[1]}`);
    secondsElement.value = convertNumbersToStr(`${requirements.collection.TIME_SECTION[2]}`);
});


const initTimerBtn = document.querySelector("#start-stop");
let init = null;
function startTime(pid) {
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

    // HOURS


    hoursElement.value = convertNumbersToStr(`${requirements.collection.TIME_SECTION[0]}`);
    minutesElement.value = convertNumbersToStr(`${requirements.collection.TIME_SECTION[1]}`);
    secondsElement.value = convertNumbersToStr(`${requirements.collection.TIME_SECTION[2]}`);

    if(requirements.collection.TIME_SECTION[2] === 0 && requirements.collection.TIME_SECTION[1] === 0 && requirements.collection.TIME_SECTION[0] === 0) {
        for(const prc of processesDB) {
            shutDownProcesses(prc.pid);
        }

        return;
    }
    init = setTimeout(() => {
        startTime(pid);
    }, 1000);

    requirements.collection.TIME_SECTION[2] = requirements.collection.TIME_SECTION[2] - 1;
}


async function shutDownProcesses(pid) {
    await fs.writeFileSync(`src/processes/taskkill.bat`, `taskkill /PID ${pid}`, () => {});
    setTimeout(() => {
        console.warn(`"%SystemRoot%/system32/WindowsPowerShell/v1.0/powershell.exe" Start-Process "${__dirname}\\processes\\taskkill.bat"`)
        child_process.exec(`start %SystemRoot%/system32/WindowsPowerShell/v1.0/powershell.exe Start-Process '${__dirname.replaceAll("\\", '/')}/processes/taskkill.bat'`, function(error, stdout, stderr){
            if(error) {
                setLogs(error);
                console.log(`%c[ERROR] %c${error} %cat %cgetProcess.js:%c33`, 'color: red;', 'color:yellow;', 'color: white;', 'color: royalblue;');
            }
        });
    }, 1000);
}

initTimerBtn.addEventListener("click", function() {
    processes: for (let i = 0; i < processes.length; i++) {
        processesBase: for(let k = 0; k < processesDB.length; k++) {
            if (processesDB[k].name == processes[i].name) {
                startTime(processesDB[k].pid)
            }
        }
    }
});