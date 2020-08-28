import { ipcRenderer } from 'electron';
import { IpcChannels } from '../../constants';
import $ from 'jquery';
import electronLog from 'electron-log';

const log = electronLog.scope('renderers/windows/login.js');

const form = document.getElementById('vc-form');
const btnLogin = document.getElementById('vc-button-login');
const usernameInput = document.getElementById('vc-email') as HTMLInputElement;
const passwordInput = document.getElementById('vc-password') as HTMLInputElement;
const errorAlert = $<HTMLDivElement>('#vc-error-alert');
const errorAlertText = document.getElementById('vc-error-text') as HTMLElement;
const errorAlertCloseButton = document.getElementById('vc-error-alert-close-button') as HTMLButtonElement;

if (!form || ! btnLogin || !usernameInput || !passwordInput || !errorAlert) throw new Error('Missing required HTML elements');

const onBtnLoginClicked = () => {
  const credentials: LoginCredentials = {
    username: usernameInput.value,
    password: passwordInput.value
  };
  log.info('Sending login credentials');
  ipcRenderer.send(IpcChannels.user.login.request, credentials);
}

ipcRenderer.on(IpcChannels.user.login.error, (_, err: string) => {
  errorAlertText.innerText = err;
  errorAlert.alert();
});

form.addEventListener('submit', (e) => e.preventDefault());
btnLogin.addEventListener('click', onBtnLoginClicked);
errorAlertCloseButton.addEventListener('click', () => errorAlert.hide());
