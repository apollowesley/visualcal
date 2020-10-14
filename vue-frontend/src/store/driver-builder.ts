import { defineModule } from 'direct-vuex';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/src/bench-configuration';
import { CustomInstruction, Driver, Instruction, InstructionSet } from '../driver-builder';
import { moduleActionContext, moduleGetterContext } from './';
import { CommunicationInterfaceActionInfo, IpcChannels, QueryStringInfo, Status, WriteInfo } from 'visualcal-common/src/driver-builder';

export interface DriverBuilderState {
  instructions: Instruction[];
  instructionSets: InstructionSet[];
  drivers: Driver[];
  currentDriver: Driver;
  communicationInterfaceInfos: CommunicationInterfaceConfigurationInfo[];
  selectedCommunicationInterfaceInfo?: CommunicationInterfaceConfigurationInfo;
  deviceGpibAddress: number;
  isSelectedCommunicationInterfaceConnected: boolean
}

const employeesModule = defineModule({
  // eslint-disable-next-line
  namespaced: true as true,
  state: (): DriverBuilderState => {
    return {
      instructions: [],
      instructionSets: [],
      drivers: [],
      currentDriver: {
        manufacturer: '',
        model: '',
        nomenclature: '',
        identifiable: false,
        identityQueryCommand: '*IDN?',
        isGpib: false,
        terminator: 'None',
        instructionSets: []
      },
      communicationInterfaceInfos: [],
      selectedCommunicationInterfaceInfo: undefined,
      deviceGpibAddress: 1,
      isSelectedCommunicationInterfaceConnected: false
    }
  },
  getters: {
    isSelectedInterfaceGpib(...args): boolean {
      /* eslint-disable @typescript-eslint/no-use-before-define */
      const { state } = getterContext(args);
      if (!state.selectedCommunicationInterfaceInfo) return false;
      return state.selectedCommunicationInterfaceInfo && state.selectedCommunicationInterfaceInfo.type.toLocaleUpperCase().includes('GPIB')
    }
  },
  mutations: {
    setInstructions(state, value: Instruction[]) {
      state.instructions = value;
    },
    setCurrentDriver(state, value: Driver) {
      state.currentDriver = value;
    },
    setManufacturer(state, value: string) {
      state.currentDriver.manufacturer = value;
    },
    setModel(state, value: string) {
      state.currentDriver.model = value;
    },
    setNomenclature(state, value: string) {
      state.currentDriver.nomenclature = value;
    },
    setIdentifiable(state, value: boolean) {
      state.currentDriver.identifiable = value;
    },
    setIdentityQueryCommand(state, value: string) {
      state.currentDriver.identityQueryCommand = value;
    },
    setIsGpib(state, value: boolean) {
      state.currentDriver.isGpib = value;
    },
    setTerminator(state, value: string) {
      state.currentDriver.terminator = value;
    },
    setInstructionSets(state, value: InstructionSet[]) {
      state.currentDriver.instructionSets = value;
    },
    addNewDriverInstructionSet(state) {
      state.currentDriver.instructionSets.push({
        name: 'New Instruction Set',
        instructions: []
      });
    },
    removeDriverInstructionSet(state, name: string) {
      const setIndex = state.currentDriver.instructionSets.findIndex(i => i.name === name);
      if (setIndex < 0) return;
      state.currentDriver.instructionSets.splice(setIndex, 1);
    },
    addNewDriverInstructionToSet(state, opts: { instructionSetName: string, newInstruction: CustomInstruction }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.name === opts.instructionSetName);
      if (!instructionSet) return;
      instructionSet.instructions.push({ ...opts.newInstruction });
    },
    updateDriverInstructionFromInstructionSet(state,  opts: { instructionSetName: string, instruction: CustomInstruction }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.name === opts.instructionSetName);
      if (!instructionSet) return;
      const instructionIndex = instructionSet.instructions.findIndex(i => i.id === opts.instruction.id);
      if (instructionIndex <= -1) return;
      instructionSet.instructions.splice(instructionIndex, 1, { ...opts.instruction });
    },
    removeDriverInstructionFromInstructionSet(state, opts: { instructionSetName: string, instructionId: string }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.name === opts.instructionSetName);
      if (!instructionSet) return;
      const instructionIndex = instructionSet.instructions.findIndex(i => i.id === opts.instructionId);
      if (instructionIndex <= -1) return;
      instructionSet.instructions.splice(instructionIndex, 1);
    },
    setInstructionSetInstructionsOrder(state, opts: { instructionSetName: string, instructions: CustomInstruction[] }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.name === opts.instructionSetName);
      if (!instructionSet) return;
      instructionSet.instructions = opts.instructions;
    },
    renameInstructionSet(state, opts: { oldName: string, newName: string }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.name === opts.oldName);
      if (!instructionSet) return;
      instructionSet.name = opts.newName;
    },
    setCommunicationInterfaceInfos(state, value: CommunicationInterfaceConfigurationInfo[]) {
      state.communicationInterfaceInfos = value;
    },
    setSelectedCommunicationInterfaceInfo(state, value?: CommunicationInterfaceConfigurationInfo) {
      state.selectedCommunicationInterfaceInfo = value;
    },
    setDeviceGpibAddress(state, value: number) {
      if (value < 1) value = 1;
      if (value > 31) value = 31;
      state.deviceGpibAddress = value;
    },
    setIsSelectedCommunicationInterfaceConnected(state, value: boolean) {
      state.isSelectedCommunicationInterfaceConnected = value;
    }
  },
  actions: {
    async init(context) {
      const { state, commit, dispatch } = actionContext(context);
      window.electron.ipcRenderer.on(IpcChannels.communicationInterface.connect.response, () => commit.setIsSelectedCommunicationInterfaceConnected(true));
      window.electron.ipcRenderer.on(IpcChannels.communicationInterface.connect.error, (_, error: Error) => alert(error.message));

      window.electron.ipcRenderer.on(IpcChannels.communicationInterface.disconnect.response, () => commit.setIsSelectedCommunicationInterfaceConnected(false));
      window.electron.ipcRenderer.on(IpcChannels.communicationInterface.disconnect.error, (_, error: Error) => alert(error.message));

      window.electron.ipcRenderer.on(IpcChannels.communicationInterface.write.error, (_, error: Error) => alert(error.message));

      await dispatch.refreshCommunicationInterfaceInfos(); 
      window.electron.ipcRenderer.once(IpcChannels.communicationInterface.getStatus.response, (_, status: Status) => {
        commit.setIsSelectedCommunicationInterfaceConnected(status.isConnected);
        if (status.communicationInterfaceName) {
          const selectedCommunicationInterfaceInfo = state.communicationInterfaceInfos.find(c => c.name === status.communicationInterfaceName);
          if (selectedCommunicationInterfaceInfo) commit.setSelectedCommunicationInterfaceInfo(selectedCommunicationInterfaceInfo);
        }
      });
      window.electron.ipcRenderer.send(IpcChannels.communicationInterface.getStatus.request);
    },
    async refreshCommunicationInterfaceInfos(context) {
      const { commit } = actionContext(context);
      const currentUser = await window.ipc.getCurrentUser();
      if (!currentUser) return;
      const viewInfo = await window.ipc.getViewInfo();
      if (!viewInfo || !viewInfo.session.configuration || !viewInfo.session.configuration.benchConfigName) return;
      const benchConfig = currentUser.benchConfigs.find(b => {
        if (!viewInfo || !viewInfo.session.configuration || !viewInfo.session.configuration.benchConfigName) return;
        return b.name === viewInfo.session.configuration.benchConfigName;
      });
      if (!benchConfig) return;
      commit.setCommunicationInterfaceInfos(benchConfig.interfaces);
      if (benchConfig.interfaces.length <= 0) return;
      commit.setSelectedCommunicationInterfaceInfo(benchConfig.interfaces[0]);
    },
    async connect(context) {
      const { state } = actionContext(context);
      if (!state.selectedCommunicationInterfaceInfo) throw new Error('Selected communication interface info cannot be undefined');
      window.electron.ipcRenderer.send(IpcChannels.communicationInterface.connect.request, state.selectedCommunicationInterfaceInfo);
    },
    async disconnect() {
      window.electron.ipcRenderer.send(IpcChannels.communicationInterface.disconnect.request);
    },
    async write(context, data: ArrayBufferLike) {
      const { getters, state } = actionContext(context);
      const info: WriteInfo = {
        data: data,
        deviceGpibAddress: getters.isSelectedInterfaceGpib ? state.deviceGpibAddress : undefined
      };
      window.electron.ipcRenderer.send(IpcChannels.communicationInterface.write.request, info);
    },
    async read(context) {
      const { getters, state } = actionContext(context);
      const info: CommunicationInterfaceActionInfo = {
        deviceGpibAddress: getters.isSelectedInterfaceGpib ? state.deviceGpibAddress : undefined
      };
      return new Promise<ArrayBufferLike>((resolve, reject) => {
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.read.response, (_, data: ArrayBufferLike) => {
          return resolve((data));
        });
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.read.error, (_, error: Error) => {
          return reject(error);
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.read.request, info);
      });
    },
    async queryString(context, data: string) {
      const { getters, state } = actionContext(context);
      return new Promise<string>((resolve, reject) => {
        const info: QueryStringInfo = {
          data: data,
          deviceGpibAddress: getters.isSelectedInterfaceGpib ? state.deviceGpibAddress : undefined
        };
        window.electron.ipcRenderer.on(IpcChannels.communicationInterface.queryString.response, (_, data: string) => {
          return resolve(data);
        });
        window.electron.ipcRenderer.on(IpcChannels.communicationInterface.queryString.error, (_, error: Error) => {
          return reject(error);
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.queryString.request, info);
      });
    }
  }
});

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line
const getterContext = (args: [any, any, any, any]) => moduleGetterContext(args, employeesModule);
const actionContext = (context: any) => moduleActionContext(context, employeesModule);
export default employeesModule;
