const hoursElement = document.querySelector(".cp--hours");
const minutesElement = document.querySelector(".cp--minutes");
const secondsElement = document.querySelector(".cp--seconds");

const data = getData('src/config/config.json');

function setVersion() {
    const filename = 'src/version.ver';
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;
        fs.writeFileSync(`src/version.ver`,  actualVersion, () => {});
    });

    return actualVersion;
}

const requirements = getData('src/config/config.json');

function convertNumbersToStr(str) {
    return (str.length == 1) ? '0' + str : str;
}

window.addEventListener("load", function() {
    if(isWindowed) {
        CheckProcesses();
    }

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
function startTime() {
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

    init = setTimeout(() => {
        startTime();
    }, 1000);

    requirements.collection.TIME_SECTION[2] = requirements.collection.TIME_SECTION[2] - 1;
}


let isInitialTime = false;
function CheckProcesses() {
    const processesDB = getData('src/processes/processes.json');
    if (processesDB.length == 0) {
        clearTimeout(init);
        isInitialTime = false;
    } else {
        if(isInitialTime) return;
        isInitialTime = true;
        startTime();
    }
}

const initCheckingData = setInterval(CheckProcesses, 1000);

initTimerBtn.addEventListener("click", function() {
    CheckProcesses();
});