const electron = require('electron')
const {
    remote,
    ipcRenderer
} = electron
var uniqid = require('uniqid');

const CURRENT_WINDOW = remote.getCurrentWindow()
CURRENT_WINDOW.openDevTools()

/* SECTIIONS */
const NEW_TASK_SECTION = document.querySelector('.new-task')
const LOADER_SECTION = document.querySelector('.loading-screen')

const NEW_TASK_FORM = document.querySelector('.new-task form')

const USER_DATA = remote.getGlobal('sharedObj').user


/* OPEN NEW TASK FORM */
document.getElementById('new-task-btn').addEventListener('click', () => {
    NEW_TASK_FORM.reset()
    NEW_TASK_SECTION.style.height = '100vh'
})

/* SUBMIT NEW TASK FORM */
NEW_TASK_FORM.addEventListener('submit', (e) => {
    e.preventDefault()

    const taskID = uniqid.time()
    const taskData = {
        task_id: taskID,
        task_name: NEW_TASK_FORM.task_name.value,
        description: NEW_TASK_FORM.description.value,
        keywords: NEW_TASK_FORM.keywords.value.split(','),
        wordCountLimit: NEW_TASK_FORM.word_count.value
    }

    ipcRenderer.send('run-blog-article-task', taskData)

    /* CREATE NEW TASK ELEMENT IN LIST */
    const listItem = document.createElement('div')
    listItem.className = 'task-item active-task'
    listItem.id = taskData.task_id
    listItem.innerHTML = `<h2>${taskData.task_name}</h2>
    <p>Active</p>`

    document.querySelector('main .list').prepend(listItem)

    NEW_TASK_SECTION.style.height = '0'
    NEW_TASK_FORM.reset()
})

/* CANCEL NEW TASK FORM */
NEW_TASK_FORM.addEventListener('reset', () => {
    NEW_TASK_SECTION.style.height = '0'
})

/* SHOW A MESSAGE */
function showMessage(message) {
    const messagebox = document.createElement('div')
    messagebox.className = 'alert'

    const messagetext = document.createElement('p')
    messagetext.innerHTML = message
    messagebox.appendChild(messagetext)

    const closebtn = document.createElement('img')
    closebtn.src = '../assets/images/close-white.svg'

    closebtn.addEventListener('click', () => {
        document.querySelector('.alert-wrapper').removeChild(messagebox)
    })

    messagebox.appendChild(closebtn)

    document.querySelector('.alert-wrapper').innerHTML = ''
    document.querySelector('.alert-wrapper').appendChild(messagebox)

    const closeMessage = setTimeout(() => {
        document.querySelector('.alert-wrapper').removeChild(messagebox)
    }, 5000)
}

document.querySelector('main .top-bar #main-menu-btn').addEventListener('click', () => {
    LOADER_SECTION.style.height = '100vh'
    setTimeout(() => {
        ipcRenderer.send('nav-mainmenu')
    }, 500);
})

ipcRenderer.on('blog-article-task-ready', (evt, data) => {
    document.getElementById(data.task_id).className = 'task-item'
    document.querySelector(`#${data.task_id} p`).innerHTML = 'Ready'
})

ipcRenderer.on('blog-article-task-failed', (evt, data) => {
    document.getElementById(data.task_id).className = 'task-item failed-task'
    document.querySelector(`#${data.task_id} p`).innerHTML = 'Failed'
})

setTimeout(() => {
    LOADER_SECTION.style.height = '0'
}, 200);