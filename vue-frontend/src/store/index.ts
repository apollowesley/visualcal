import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import Vuetify from '@/plugins/vuetify';
import { User } from '../types/user';

interface State {
  darkMode: boolean;
  user: User | null;
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
      user: null
    }
  },
  getters: {
    darkMode: (state) => state.darkMode,
    sessions: (state) => state.user ? state.user.sessions : []
  },
  mutations: {
    setDarkMode(state, value: boolean) {
      state.darkMode = value;
      Vuetify.framework.theme ? Vuetify.framework.theme.dark = value : Vuetify.userPreset.theme = { dark: value };
    },
    setUser(state, value: User | null) {
      state.user = value;
    }
  },
  actions: {
    async refreshUser(context) {
      const { commit } = rootActionContext(context);
      const user = await window.ipc.getCurrentUser();
      commit.setUser(user);
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
