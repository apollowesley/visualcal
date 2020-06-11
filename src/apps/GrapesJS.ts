import grapesjs from 'grapesjs';

console.info(grapesjs);

const editor = grapesjs.init({
  container: '#grapesjs-editor',
  fromElement: true,
  height: '300px',
  width: 'auto',
  storageManager: false,
  panels: { defaults: [] }
});

editor.BlockManager.add('my-block-id', {
  label: 'MyBlock',
  category: 'MyCategory'
});
