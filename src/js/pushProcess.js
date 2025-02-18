function isChecked(event) {
    event.preventDefault();
    const target = event.target;
    const pid = target.dataset.pid;
    const name = target.getAttribute("name");
    const parent = event.target.parentNode.parentNode;
    parent.classList.toggle('active');

    if(target.checked == true) {
        processesValues.push({
            name: name,
            createdAt: new Date().toLocaleString(),
            pid: pid
        });
    } else if (target.checked == false) {
        for (let i = 0; i < processesValues.length; i++) {
            if(processesValues[i].pid == target.dataset.pid && target.checked == false) {
                delete processesValues[i];
            }
        }
        processesValues = processesValues.filter(value => {
            return value != null && value != 'empty' && value != undefined;
        });
    }
    fs.writeFileSync(`src/processes/processes.json`, JSON.stringify(processesValues, null, '\t'), () => {});
}