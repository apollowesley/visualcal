import { ipcRenderer } from 'electron';

const onBtnLoginClicked = (e: MouseEvent) => {
  alert('Clicked!');
}

ipcRenderer.on('login-error', (event) => {
  
});

document.getElementById('form').addEventListener('submit', (e) => e.preventDefault());
document.getElementById('btn-login').addEventListener('click', onBtnLoginClicked);
