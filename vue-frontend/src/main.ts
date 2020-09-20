import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import { Ipc } from './utils/Ipc';
import VueDebounce from 'vue-debounce';

Vue.config.productionTip = false;

window.ipc = new Ipc();
Vue.use(VueDebounce);

const app = new Vue({
  router,
  store: store.original,
  vuetify,
  render: h => h(App)
}).$mount('#app');

window.app = app;
