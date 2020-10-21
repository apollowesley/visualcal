import { defineModule } from 'direct-vuex';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/src/bench-configuration';
import { CommandParameter, CommandParameterArgument, CustomInstruction, Driver, Instruction, InstructionSet, Library } from 'visualcal-common/src/driver-builder';
import { moduleActionContext, moduleGetterContext } from './';
import { CommunicationInterfaceActionInfo, IpcChannels, QueryStringInfo, Status, WriteInfo } from 'visualcal-common/src/driver-builder';
import { v4 as uuid } from 'uuid';
import Axios from 'axios';

interface OnlineStoreDriver {
  _id: string;
  id: string;
  name: string;
  driverManufacturer: string;
  driverModel: string;
  driverNomenclature: string;
}

interface OnlineStore {
  drivers: OnlineStoreDriver[];
}

export interface DriverBuilderState {
  instructions: Instruction[];
  instructionSets: InstructionSet[];
  drivers: Driver[];
  currentDriver: Driver;
  communicationInterfaceInfos: CommunicationInterfaceConfigurationInfo[];
  selectedCommunicationInterfaceInfo?: CommunicationInterfaceConfigurationInfo;
  deviceGpibAddress: number;
  isSelectedCommunicationInterfaceConnected: boolean;
  onlineStore: OnlineStore;
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
        identityQueryCommand: '*IDN?',
        terminator: 'Lf',
        instructionSets: []
      },
      communicationInterfaceInfos: [],
      selectedCommunicationInterfaceInfo: undefined,
      deviceGpibAddress: 1,
      isSelectedCommunicationInterfaceConnected: false,
      onlineStore: {
        drivers: []
      }
    }
  },
  getters: {
    isSelectedInterfaceGpib(...args): boolean {
      /* eslint-disable @typescript-eslint/no-use-before-define */
      const { state } = getterContext(args);
      if (!state.selectedCommunicationInterfaceInfo) return false;
      return state.selectedCommunicationInterfaceInfo && state.selectedCommunicationInterfaceInfo.type.toLocaleUpperCase().includes('GPIB')
    },
    library(...args): Library {
      /* eslint-disable @typescript-eslint/no-use-before-define */
      const { state } = getterContext(args);
      return {
        drivers: state.drivers,
        instructionSets: state.instructionSets,
        instructions: state.instructions
      }
    }
  },
  mutations: {
    setLibrary(state, value: Library) {
      state.drivers = value.drivers;
      state.instructionSets = value.instructionSets;
      state.instructions = value.instructions;
    },
    setInstructions(state, value: Instruction[]) {
      state.instructions = value;
    },
    setCurrentDriver(state, value: Driver) {
      const driverString = JSON.stringify(value);
      const driver = JSON.parse(driverString) as Driver;
      state.currentDriver = driver;
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
    setIdentityQueryCommand(state, value?: string) {
      state.currentDriver.identityQueryCommand = value;
    },
    setTerminator(state, value: string) {
      state.currentDriver.terminator = value;
    },
    setInstructionSets(state, value: InstructionSet[]) {
      state.currentDriver.instructionSets = value;
    },
    addDriverInstructionSet(state, instructionSet?: InstructionSet) {
      if (instructionSet) {
        const newInstructionSet = { ...instructionSet };
        state.currentDriver.instructionSets.push(newInstructionSet);
      } else {
        state.currentDriver.instructionSets.push({
          id: uuid(),
          name: 'New Instruction Set',
          instructions: []
        });
      }
    },
    removeDriverInstructionSet(state, id: string) {
      const setIndex = state.currentDriver.instructionSets.findIndex(i => i.id === id);
      if (setIndex < 0) return;
      state.currentDriver.instructionSets.splice(setIndex, 1);
    },
    addNewDriverInstructionToSet(state, opts: { instructionSetId: string, newInstruction: CustomInstruction }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.id === opts.instructionSetId);
      if (!instructionSet) return;
      instructionSet.instructions.push({ ...opts.newInstruction });
    },
    updateDriverInstructionFromInstructionSet(state,  opts: { instructionSetId: string, instruction: CustomInstruction }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.id === opts.instructionSetId);
      if (!instructionSet) return;
      const instructionIndex = instructionSet.instructions.findIndex(i => i.id === opts.instruction.id);
      if (instructionIndex <= -1) return;
      instructionSet.instructions.splice(instructionIndex, 1, { ...opts.instruction });
    },
    removeDriverInstructionFromInstructionSet(state, opts: { instructionSetId: string, instructionId: string }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.id === opts.instructionSetId);
      if (!instructionSet) return;
      const instructionIndex = instructionSet.instructions.findIndex(i => i.id === opts.instructionId);
      if (instructionIndex <= -1) return;
      instructionSet.instructions.splice(instructionIndex, 1);
    },
    setDriverInstructionSetInstructionCommandParameters(state, opts: { instructionSetId: string, instruction: CustomInstruction, parameters?: CommandParameter[] }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.id === opts.instructionSetId);
      if (!instructionSet) return;
      const instructionIndex = instructionSet.instructions.findIndex(i => i.id === opts.instruction.id);
      if (instructionIndex <= -1) return;
      const instruction = instructionSet.instructions[instructionIndex];
      opts.parameters && opts.parameters.length > 0 ? instruction.parameters = opts.parameters : instruction.parameters = undefined;
      instructionSet.instructions.splice(instructionIndex, 1, { ...instruction });
    },
    setInstructionSetInstructionsOrder(state, opts: { instructionSetId: string, instructions: CustomInstruction[] }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.id === opts.instructionSetId);
      if (!instructionSet) return;
      instructionSet.instructions = opts.instructions;
    },
    renameInstructionSet(state, opts: { id: string, oldName: string, newName: string }) {
      const instructionSet = state.currentDriver.instructionSets.find(i => i.id === opts.id);
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
    },
    saveInstructionSetToLibrary(state, value: InstructionSet) {
      const existingInstructionSetIndex = state.instructionSets.findIndex(i => i.id === value.id);
      if (existingInstructionSetIndex > -1) {
        state.instructionSets[existingInstructionSetIndex] = value;
      } else {
        state.instructionSets.push(value);
      }
    },
    removeInstructionSetFromLibrary(state, value: InstructionSet) {
      const existingInstructionSetIndex = state.instructionSets.findIndex(i => i.id === value.id);
      if (existingInstructionSetIndex <= -1) return;
      state.instructionSets.splice(existingInstructionSetIndex, 1);
    },
    removeDriverFromLibrary(state, value: Driver) {
      const existingDriverIndex = state.drivers.findIndex(i => i.manufacturer === value.manufacturer && i.model === value.model && i.nomenclature === value.nomenclature);
      if (existingDriverIndex <= -1) return;
      state.drivers.splice(existingDriverIndex, 1);
    },
    addOrReplaceDriverInLibrary(state, value: Driver) {
      const existingDriverIndex = state.drivers.findIndex(i => i.manufacturer === value.manufacturer && i.model === value.model && i.nomenclature === value.nomenclature);
      if (existingDriverIndex > -1) {
        state.drivers[existingDriverIndex] = { ...value };
      } else {
        state.drivers.push({ ...value });
      }
    },
    setOnlineStore(state, value: OnlineStore) {
      state.onlineStore = value;
    }
  },
  actions: {
    async init(context) {
      const { commit, dispatch } = actionContext(context);
      window.electron.ipcRenderer.on(IpcChannels.communicationInterface.disconnect.response, () => commit.setIsSelectedCommunicationInterfaceConnected(false));
      window.electron.ipcRenderer.on(IpcChannels.communicationInterface.disconnect.error, (_, error: Error) => alert(error.message));

      await dispatch.refreshCommunicationInterfaceInfos();
      await dispatch.initCommunicationInterfaces();

      return new Promise<void>((resolve) => {
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.getLibrary.response, (_, library: Library) => {
          commit.setLibrary(library);
          return resolve();
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.getLibrary.request);
      });
    },
    async initCommunicationInterfaces(context) {
      const { state, commit } = actionContext(context);
      return new Promise<void>((resolve) => {
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.getStatus.response, (_, status: Status) => {
          commit.setIsSelectedCommunicationInterfaceConnected(status.isConnected);
          if (status.communicationInterfaceName) {
            const selectedCommunicationInterfaceInfo = state.communicationInterfaceInfos.find(c => c.name === status.communicationInterfaceName);
            if (selectedCommunicationInterfaceInfo) commit.setSelectedCommunicationInterfaceInfo(selectedCommunicationInterfaceInfo);
          }
          return resolve();
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.getStatus.request);
      });
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
    async saveLibrary(context) {
      const { getters } = actionContext(context);
      return new Promise<void>((resolve, reject) => {
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.setLibrary.response, () => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.setLibrary.error);
          return resolve();
        });
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.setLibrary.error, (error) => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.setLibrary.response);
          return reject(error);
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.setLibrary.request, getters.library);
      });
    },
    async connect(context) {
      const { state, commit } = actionContext(context);
      if (!state.selectedCommunicationInterfaceInfo) throw new Error('Selected communication interface info cannot be undefined');
      window.electron.ipcRenderer.once(IpcChannels.communicationInterface.connect.response, () => {
        window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.connect.error);
        commit.setIsSelectedCommunicationInterfaceConnected(true);
      });
      window.electron.ipcRenderer.once(IpcChannels.communicationInterface.connect.error, (_, error: Error) => {
        window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.connect.response);
        alert(error.message);
      });
      window.electron.ipcRenderer.send(IpcChannels.communicationInterface.connect.request, state.selectedCommunicationInterfaceInfo);
    },
    async disconnect() {
      window.electron.ipcRenderer.send(IpcChannels.communicationInterface.disconnect.request);
    },
    async write(context, opts: { instruction: CustomInstruction, parameterArguments?: CommandParameterArgument[] }) {
      const { getters, state } = actionContext(context);
      return new Promise<void>((resolve, reject) => {
        let command = opts.instruction.command;
        if (opts.parameterArguments) {
          for (const argument of opts.parameterArguments) {
            command = `${command}${argument.parameter.beforeText ? argument.parameter.beforeText : ''}${argument.value}${argument.parameter.afterText ? argument.parameter.afterText : ''}`;
          }
        }
        const info: WriteInfo = {
          data: new TextEncoder().encode(command),
          deviceGpibAddress: getters.isSelectedInterfaceGpib ? state.deviceGpibAddress : undefined,
          terminator: state.currentDriver.terminator
        };
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.write.error, (_, error: Error) => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.write.response);
          return reject(error);
        });
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.write.response, () => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.write.error);
          return resolve();
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.write.request, info);
      });
    },
    async read(context) {
      const { getters, state } = actionContext(context);
      const info: CommunicationInterfaceActionInfo = {
        deviceGpibAddress: getters.isSelectedInterfaceGpib ? state.deviceGpibAddress : undefined,
        terminator: state.currentDriver.terminator
      };
      return new Promise<ArrayBufferLike>((resolve, reject) => {
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.read.response, (_, data: ArrayBufferLike) => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.read.error);
          return resolve((data));
        });
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.read.error, (_, error: Error) => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.read.response);
          return reject(error);
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.read.request, info);
      });
    },
    async queryString(context, opts: { instruction: CustomInstruction, parameterArguments?: CommandParameterArgument[] }) {
      const { getters, state } = actionContext(context);
      return new Promise<string>((resolve, reject) => {
        let command = opts.instruction.command;
        if (opts.parameterArguments) {
          for (const argument of opts.parameterArguments) {
            command = `${command}${argument.parameter.beforeText ? argument.parameter.beforeText : ''}${argument.value}${argument.parameter.afterText ? argument.parameter.afterText : ''}`;
          }
        }
        const info: QueryStringInfo = {
          data: command,
          deviceGpibAddress: getters.isSelectedInterfaceGpib ? state.deviceGpibAddress : undefined,
          terminator: state.currentDriver.terminator
        };
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.queryString.response, (_, data: string) => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.queryString.error);
          return resolve(data);
        });
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.queryString.error, (_, error: Error) => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.queryString.response);
          return reject(error);
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.queryString.request, info);
      });
    },
    async saveCurrentDriver(context) {
      const { state, commit } = actionContext(context);
      return new Promise<void>((resolve, reject) => {
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.saveDriver.response, () => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.saveDriver.error);
          commit.addOrReplaceDriverInLibrary(state.currentDriver);
          return resolve();
        });
        window.electron.ipcRenderer.once(IpcChannels.communicationInterface.saveDriver.error, (_, error: Error) => {
          window.electron.ipcRenderer.removeAllListeners(IpcChannels.communicationInterface.saveDriver.response);
          return reject(error);
        });
        window.electron.ipcRenderer.send(IpcChannels.communicationInterface.saveDriver.request, state.currentDriver);
      });
    },
    async refreshOnlineStore(context) {
      const { commit } = actionContext(context);
      const response = await Axios.get<OnlineStoreDriver[]>('https://visualcalstore.scottpage.us/drivers', { timeout: 1000 });
      const drivers = response.data;
      commit.setOnlineStore({ drivers });
    }
  }
});

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line
const getterContext = (args: [any, any, any, any]) => moduleGetterContext(args, employeesModule);
const actionContext = (context: any) => moduleActionContext(context, employeesModule);
export default employeesModule;
