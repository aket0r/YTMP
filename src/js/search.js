const searchInput = document.querySelector("#processes-value");

function search() {
    const processName = document.querySelectorAll("table tr td.title");
    const table = document.querySelectorAll("table tr");

    if(!table) return;

    for (let i = 0; i < table.length; i++) {
        if(!(processName[i].innerText.toLowerCase().indexOf(searchInput.value.toLowerCase()) > -1)) {
            table[i].classList.add("hidden");
        } else {
            table[i].classList.remove("hidden");
        }
    }

    const processesLengthContent = document.querySelector(".processes-length");
    const hiddenProcessesLength = document.querySelectorAll("table tr.hidden").length;
    const processesLength = document.querySelectorAll("table tr").length;
    processesLengthContent.innerText = (processesLength - hiddenProcessesLength);
}

searchInput.addEventListener("input", search);