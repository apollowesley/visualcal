import { IpcService } from './IpcService';

const ipcService = new IpcService();
const form = document.getElementById('form');
const btnLogin = document.getElementById('btn-login');
const usernameInput = document.getElementById('input-username') as HTMLInputElement;
const passwordInput = document.getElementById('input-password') as HTMLInputElement;
const lblError = document.getElementById('lbl');

if (!form || ! btnLogin || !usernameInput || !passwordInput) throw new Error('Missing required HTML elements');

const onBtnLoginClicked = async (e: MouseEvent) => {
  const result = await ipcService.login({
    username: usernameInput.value,
    password: passwordInput.value
  });
  console.info(result);
  if (result) lblError.innerText = result;
}

form.addEventListener('submit', (e) => e.preventDefault());
btnLogin.addEventListener('click', onBtnLoginClicked);