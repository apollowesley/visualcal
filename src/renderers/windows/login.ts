import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../constants';
import electronLog from 'electron-log';
import bootstrap from 'bootstrap';

const log = electronLog.scope('renderers/windows/login.js');

const form = document.getElementById('vc-form');
const btnLogin = document.getElementById('vc-button-login');
const usernameInput = document.getElementById('vc-email') as HTMLInputElement;
const passwordInput = document.getElementById('vc-password') as HTMLInputElement;
const errorAlert = document.getElementById('#vc-error-alert') as HTMLDivElement;
const errorAlertText = document.getElementById('vc-error-text') as HTMLElement;
const errorAlertCloseButton = document.getElementById('vc-error-alert-close-button') as HTMLButtonElement;
const alert = new bootstrap.Alert(errorAlert);

if (!form || ! btnLogin || !usernameInput || !passwordInput || !errorAlert || !errorAlertText || !errorAlertCloseButton) throw new Error('Missing required HTML elements');

const onBtnLoginClicked = () => {
  const credentials: LoginCredentials = {
    username: usernameInput.value,
    password: passwordInput.value
  };
  log.info('Sending login credentials');
  ipcRenderer.send(IpcChannels.user.login.request, credentials);
}

ipcRenderer.on(IpcChannels.user.login.error, (_, err: Error) => {
  errorAlertText.innerText = err.message;
  
});

form.addEventListener('submit', (e) => e.preventDefault());
btnLogin.addEventListener('click', onBtnLoginClicked);
errorAlertCloseButton.addEventListener('click', () => alert.close());
