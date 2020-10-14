import { defineModule } from 'direct-vuex';
import { CommunicationInterfaceConfigurationInfo } from 'visualcal-common/src/bench-configuration';
import { CustomInstruction, Driver, Instruction, InstructionSet } from '../driver-builder';
import { moduleActionContext, moduleGetterContext } from './';

export interface DriverBuilderState {
  instructions: Instruction[];
  instructionSets: InstructionSet[];
  drivers: Driver[];
  currentDriver: Driver;
  communicationInterfaceInfos: CommunicationInterfaceConfigurationInfo[];
  selectedCommunicationInterfaceInfo?: CommunicationInterfaceConfigurationInfo;
  deviceGpibAddress: number;
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
      deviceGpibAddress: 1
    }
  },
  // getters: {
  //   examiners(...args): Examiner[] {
  //     /* eslint-disable @typescript-eslint/no-use-before-define */
  //     const { state } = getterContext(args);
  //     return state.employees.filter(e => e.type === EmployeeTypes.Examiner && !e.deleted) as Examiner[];
  //   },
  // },
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
      instructionSet.instructions.push(opts.newInstruction);
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
    }
  },
  actions: {
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
    }
  }
});

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line
const getterContext = (args: [any, any, any, any]) => moduleGetterContext(args, employeesModule);
const actionContext = (context: any) => moduleActionContext(context, employeesModule);
export default employeesModule;
