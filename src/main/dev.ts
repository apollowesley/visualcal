import { isDev } from './utils';

export const installVueDevTools = () => {
  if (isDev()) {
    try {
      const VueDevTools = require('vue-devtools');
      VueDevTools.install();
    } catch (error) {
      console.warn('The following error from vue-devtools can be ignored.  It is only loaded in development.');
      console.error(error.message);
    }
  }
}
