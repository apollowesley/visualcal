import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import { Session } from '../types/session';
import Vuetify from '@/plugins/vuetify';

interface State {
  darkMode: boolean;
  sessions: Session[];
}

Vue.use(Vuex);

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  state: (): State => {
    return {
      darkMode: false,
      sessions: []
    }
  },
  getters: {
    darkMode: (state) => state.darkMode
  },
  mutations: {
    setDarkMode(state, value: boolean) {
      state.darkMode = value;
      Vuetify.framework.theme ? Vuetify.framework.theme.dark = value : Vuetify.userPreset.theme = { dark: value };
    },
    setSessions(state, value: Session[]) {
      state.sessions = value;
    }
  },
  actions: {
    async refreshSessions(context) {
      const { commit } = rootActionContext(context);
      const sessions = await window.ipc.getAllSessions();
      commit.setSessions(sessions);
    }
  }
})
 
// Export the direct-store instead of the classic Vuex store.
export default store;
 
// The following exports will be used to enable types in the
// implementation of actions and getters.
export {
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
}
 
// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore;
  }
}
