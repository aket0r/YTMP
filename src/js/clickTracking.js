const readTextFile = require('open-file-text-editor');
const logsBtn = document.querySelector("#navigation #logs");


function showHudTab(id, haveToBeHiddenIds = []) {
    const element = document.getElementById(id);
    element.classList.active('active');

    if(haveToBeHiddenIds) {
        haveToBeHiddenIds.forEach(el => {
            document.getElementById(el).classList.add('hidden');
        });
    }
}

function hideHubTab(id, haveToBeShowedIds = []) {
    const element = document.getElementById(id);
    element.classList.remove('active');

    if(haveToBeShowedIds) {
        haveToBeShowedIds.forEach(el => {
            document.getElementById(el).classList.remove('hidden');
        });
    }
}


logsBtn.addEventListener("click", function() {
    readTextFile('src/logs/logs.txt');
});