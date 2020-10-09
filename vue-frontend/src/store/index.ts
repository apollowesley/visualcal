import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import Vuetify from '@/plugins/vuetify';
import { User, ViewInfo } from '../types/session';
import { SessionViewRequestResponseInfo, ProcedureSection, ProcedureAction } from 'visualcal-common/dist/session-view-info';
import { LoginCredentials } from 'visualcal-common/dist/user';
import DriverBuilderModule from './driver-builder';
import { isDev } from '@/utils';

interface State {
  darkMode: boolean;
  user: User | null;
  viewInfo: ViewInfo | null;
  activeSessionName?: string;
  sessionViewInfo: SessionViewRequestResponseInfo | null;
  selectedSection: ProcedureSection | null;
  selectedAction: ProcedureAction | null;
}

Vue.use(Vuex);

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  strict: isDev(),
  modules: {
    driverBuilder: DriverBuilderModule
  },
  state: (): State => {
    return {
      darkMode: false,
      user: null,
      viewInfo: null,
      sessionViewInfo: null,
      selectedSection: null,
      selectedAction: null
    }
  },
  getters: {
    darkMode: (state) => state.darkMode,
    user: (state): User | null => (state.viewInfo && state.viewInfo.user) ? state.viewInfo.user : null,
    isLoggedIn: (state) => state.user !== null,
    sessions: (state) => (state.viewInfo && state.viewInfo.user) ? state.viewInfo.user.sessions : [],
    activeSession: (state) => (state.viewInfo && state.viewInfo.session) ? state.viewInfo.session : null,
    activeBenchConfig: (state) => (state.viewInfo && state.viewInfo.benchConfig) ? state.viewInfo.benchConfig : null
  },
  mutations: {
    setDarkMode(state, value: boolean) {
      state.darkMode = value;
      Vuetify.framework.theme ? Vuetify.framework.theme.dark = value : Vuetify.userPreset.theme = { dark: value };
    },
    setUser(state, value: User | null) {
      state.user = value;
    },
    setViewInfo(state, value: ViewInfo | null) {
      state.viewInfo = value;
    },
    setSessionViewInfo(state, value: SessionViewRequestResponseInfo | null) {
      state.sessionViewInfo = value;
      if (!value || !value.procedure || value.procedure.sections.length <= 0) return;
      const firstSection = value.procedure.sections[0];
      state.selectedSection = firstSection;
      if (firstSection.actions.length <= 0) return;
      state.selectedAction = firstSection.actions[0];
    },
    setSelectedSection(state, value: ProcedureSection | null) {
      state.selectedSection = value;
    },
    setSelectedAction(state, value: ProcedureAction | null) {
      state.selectedAction = value;
    }
  },
  actions: {
    async refreshViewInfo(context) {
      const { commit } = rootActionContext(context);
      const info = await window.ipc.getViewInfo();
      commit.setViewInfo(info);
    },
    async refreshSessionViewInfo(context) {
      const { commit } = rootActionContext(context);
      const info = await window.ipc.getSessionViewInfo();
      commit.setSessionViewInfo(info);
    },
    async login(context, credentials: LoginCredentials) {
      const { commit } = rootActionContext(context);
      const user = await window.ipc.login(credentials);
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
};
 
// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store;
declare module 'vuex' {
  // eslint-disable-next-line
  interface Store<S> {
    direct: AppStore;
  }
}
