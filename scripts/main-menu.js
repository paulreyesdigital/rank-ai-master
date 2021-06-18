const electron = require('electron')
const {remote, ipcRenderer } = electron

const CURRENT_WINDOW = remote.getCurrentWindow()
CURRENT_WINDOW.openDevTools()

const MY_ACCOUNT_SECTION = document.querySelector('.my-account')
const MY_ACCOUNT_FORM = document.querySelector('.my-account form')

const LOADER_SECTION = document.querySelector('.loading-screen')

const USER_DATA = remote.getGlobal('sharedObj').user

/* ADD DATA TO MY ACCOUNT FORM */
function loadUserData() {
    document.querySelector('.my-account form .user_fullname').innerHTML = `${USER_DATA.first_name} ${USER_DATA.last_name}`
    document.querySelector('.my-account form .username').innerHTML = USER_DATA.username
    MY_ACCOUNT_FORM.password.value = USER_DATA.password
    MY_ACCOUNT_FORM.conversion_username.value = USER_DATA.conversion_username ? USER_DATA.conversion_username : ''
    MY_ACCOUNT_FORM.conversion_password.value = USER_DATA.conversion_password ? USER_DATA.conversion_password : ''
    MY_ACCOUNT_FORM.folder_path.value = USER_DATA.folder_path ? USER_DATA.folder_path : ''
}

/* MY ACCOUNT FORM SUBMIT */
MY_ACCOUNT_FORM.addEventListener('submit', (e) => {
    e.preventDefault()

    const formDATA = {
        password: MY_ACCOUNT_FORM.password.value,
        conversion_username: MY_ACCOUNT_FORM.conversion_username.value,
        conversion_password: MY_ACCOUNT_FORM.conversion_password.value,
        folder_path: MY_ACCOUNT_FORM.folder_path.value
    }

    ipcRenderer.send('my-account-form-submit', formDATA)
    MY_ACCOUNT_SECTION.style.height = '0'   
})

/* MY ACCOUNT FORM RESET */
MY_ACCOUNT_FORM.addEventListener('reset', (e) => {
    MY_ACCOUNT_SECTION.style.height = '0'
})

/* MY ACCOUNT FORM SUBMIT RESULT */
ipcRenderer.on('my-account-data-reply', (evt, data) => {
    if (data) {
        /* SAVED SUCCESSFULLY */
        showMessage('Account Information saved successfully!')

        /* UPDATE GLOBAL.USER */
        remote.getGlobal('sharedObj').user.password = MY_ACCOUNT_FORM.password.value
        remote.getGlobal('sharedObj').user.conversion_username = MY_ACCOUNT_FORM.conversion_username.value
        remote.getGlobal('sharedObj').user.conversion_password = MY_ACCOUNT_FORM.conversion_password.value
        remote.getGlobal('sharedObj').user.folder_path = MY_ACCOUNT_FORM.folder_path.value

    } else {
        /* FAILED TO SAVE */
        showMessage('Failed to save account information.')
    }
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

    setTimeout(() => {
        document.querySelector('.alert-wrapper').removeChild(messagebox)
    }, 5000)
}

/* GO TO BLOG POST */
document.querySelector('main .menu-items #blog-articles-btn').addEventListener('click', () => {    
    LOADER_SECTION.style.height = '100vh'
    setTimeout(() => {
        ipcRenderer.send('nav-blogarticle')
    }, 500);
})

/* OPEN MY ACCOUNT FORM */
document.getElementById('my-account-btn').addEventListener('click', () => {
    MY_ACCOUNT_FORM.reset()
    loadUserData()
    MY_ACCOUNT_SECTION.style.height = '100vh'
})

/* SWITCH ACCOUNT */
document.querySelector('main .top-bar #switch-account-btn').addEventListener('click', () => {
    ipcRenderer.send('nav-login')
    CURRENT_WINDOW.close()
})

/* SHOW DIRECTORY DIALOG FOR FOLDER PATH ON CLICK */
document.querySelector('.my-account form input[name=folder_path]').addEventListener('click', () => {
    const path = remote.dialog.showOpenDialogSync(CURRENT_WINDOW, { properties: ['openDirectory'] })
    document.querySelector('.my-account form input[name=folder_path]').value = path
})

setTimeout(() => {
    LOADER_SECTION.style.height = '0'
}, 200);