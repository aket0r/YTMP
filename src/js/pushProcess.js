function checkRequirementFiles() {
    const isMainFolder = fs.existsSync(`src`);
    if(!isMainFolder) {
        fs.mkdir(`src`, (message) => {
            if(!message) return;
            console.warn(message);
        });
    }

    const folders = ['config', 'processes', 'logs'];
    const files = [{
        path: 'config',
        name: 'config.json',
        text: '[]'
    },{
        path: 'processes',
        name: 'processes.json',
        text: '[]'
    },{
        path: 'logs',
        name: 'logs.txt',
        text: ''
    }]

    for (const folder of folders) {
        const isFolderCreated = fs.existsSync(`src/${folder}`);
        if(!isFolderCreated) {
            fs.mkdir(`src/${folder}`, (message) => {
                if(!message) return;
                console.warn(message);
            });
        }
    }

    for(const file of files) {
        fs.readFile(`src/${file.path}/${file.name}`, null, (error) => {
            if(error) {
                fs.writeFileSync(`src/${file.path}/${file.name}`, file.text);
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        });
    }
}

checkRequirementFiles();

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