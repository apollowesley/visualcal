import { ipcRenderer } from 'electron';

const form = document.getElementById('form');
const btnLogin = document.getElementById('btn-login');
const usernameInput = document.getElementById('input-username') as HTMLInputElement;
const passwordInput = document.getElementById('input-password') as HTMLInputElement;
const lblError = document.getElementById('lbl');

if (!form || ! btnLogin || !usernameInput || !passwordInput || !lblError) throw new Error('Missing required HTML elements');

const onBtnLoginClicked = async (e: MouseEvent) => {
  const credentials = {
    username: usernameInput.value,
    password: passwordInput.value
  };
  ipcRenderer.send('login', credentials);
}

ipcRenderer.on('login-error', (event, args) => {
  lblError.innerText = args;
});

form.addEventListener('submit', (e) => e.preventDefault());
btnLogin.addEventListener('click', onBtnLoginClicked);
