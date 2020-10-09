import { defineModule } from 'direct-vuex';
import { CustomInstruction, Driver, Instruction, InstructionSet } from '../driver-builder';
import { moduleActionContext, moduleGetterContext } from './';

export interface DriverBuilderState {
  instructions: Instruction[];
  instructionSets: InstructionSet[];
  drivers: Driver[];
  currentDriver: Driver;
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
      }
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
    }
  },
  // actions: {
  //   async refreshInstructions(context) {
  //     const { commit } = actionContext(context);
  //     // const instructions = await getInstructions();
  //     // commit.setInstructions(instructions);
  //   }
  // },
});

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line
const getterContext = (args: [any, any, any, any]) => moduleGetterContext(args, employeesModule);
// eslint-disable-next-line
const actionContext = (context: any) => moduleActionContext(context, employeesModule);
export default employeesModule;
