import { ipcRenderer } from 'electron';

const getIndySoftImage = async () => {
  const image = await ipcRenderer.send('get-indysoft-image');
  return image;
}
