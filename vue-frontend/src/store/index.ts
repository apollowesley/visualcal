import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import Vuetify from '@/plugins/vuetify';
import { User, ViewInfo } from '../types/session';

interface State {
  darkMode: boolean;
  viewInfo: ViewInfo | null;
  activeSessionName?: string;
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
      viewInfo: null
    }
  },
  getters: {
    darkMode: (state) => state.darkMode,
    user: (state): User | null => (state.viewInfo && state.viewInfo.user) ? state.viewInfo.user : null,
    sessions: (state) => (state.viewInfo && state.viewInfo.user) ? state.viewInfo.user.sessions : [],
    activeSession: (state) => (state.viewInfo && state.viewInfo.session) ? state.viewInfo.session : null,
    activeBenchConfig: (state) => (state.viewInfo && state.viewInfo.benchConfig) ? state.viewInfo.benchConfig : null
  },
  mutations: {
    setDarkMode(state, value: boolean) {
      state.darkMode = value;
      Vuetify.framework.theme ? Vuetify.framework.theme.dark = value : Vuetify.userPreset.theme = { dark: value };
    },
    setViewInfo(state, value: ViewInfo | null) {
      state.viewInfo = value;
    }
  },
  actions: {
    async refreshViewInfo(context) {
      const { commit } = rootActionContext(context);
      const info = await window.ipc.getViewInfo();
      commit.setViewInfo(info);
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
