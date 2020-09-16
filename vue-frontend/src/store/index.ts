import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import { Session } from '../types/session';

interface State {
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
      sessions: []
    }
  },
  mutations: {
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
