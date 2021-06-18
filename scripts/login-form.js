const electron = require('electron')
const {remote, ipcRenderer} = electron

const CURRENT_WINDOW = remote.getCurrentWindow()
CURRENT_WINDOW.openDevTools()

const LOGIN_FORM = document.getElementById('login-form')
const FORM_ERROR = document.querySelector('main form .error-message')

LOGIN_FORM.addEventListener('submit', (e) => {
    e.preventDefault()

    FORM_ERROR.innerHTML = ''
    document.querySelector('.loading-screen').style.height = '100vh'

    const login = {
        username: LOGIN_FORM.username.value,
        password: LOGIN_FORM.password.value
    }

    ipcRenderer.send('user-login', login)

})

/* ACCESS GRANTED */
ipcRenderer.on('access-granted', () => {
    FORM_ERROR.innerHTML = ''
    CURRENT_WINDOW.close()
})

/* ACCESS DENIED */
ipcRenderer.on('access-denied', (evt, data) => {
    setTimeout(() => {
        FORM_ERROR.innerHTML = data
        document.querySelector('.loading-screen').style.height = '0'
        LOGIN_FORM.username.select()
    }, 1000)

})

setTimeout(() => {
    document.querySelector('.loading-screen').style.height = '0'
}, 2000);