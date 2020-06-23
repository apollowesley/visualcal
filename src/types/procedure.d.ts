import { Person } from './user';
import SourceFile from './SourceFile';
import { RequiredStandard } from './standards';

export interface ProcedureNameInfo {
  name: string;
  shortName: string;
  validationErrors?: string[];
}

export interface ProcedureSection {
  name: string;
  shortName: string;
  order?: number;
  description: string;
  icon?: string;
  guiEditor: 'tms' | 'grapesjs' | 'indysoft' | 'linear';
  isCompleted: boolean | ProcedureSectionIsCompletedCallback;
  isRunning: boolean;
}

export interface ProcedureFile {
  name: string;
  shortName: string;
  version: string;
  description: string;
  authorOrganization: string;
  authors: Person[];
}

export interface ActionInfo {
  name: string;
}

export interface SectionInfo {
  name: string;
  shortName: string;
  actions: ActionInfo[];
}

export interface ProcedureInfo {
  name: string;
  shortName: string;
  version: string;
  description: string;
  authorOrganization: string;
  authors: Person[];
  sections: SectionInfo[];
  requiredStandards?: RequiredStandard[];
}

export interface Procedure {
  name: string;
  shortName: string;
  version: string;
  description: string;
  authorOrganization: string;
  authors: Person[];
  sections: ProcedureSection[];
  requiredStandards?: RequiredStandard[];
}

export interface ProcedureSectionIsCompletedCallback {
  (): boolean;
}

export interface ProcedureSectionLoadInfo {
  procedure: string;
  section: string;
}

export interface ProcedureSectionRuntimeFiles {
  compiled: SourceFile;
  components: SourceFile;
}

export interface ProcedureSectionEditorFiles {
  program: SourceFile;
  unit: SourceFile;
  components: SourceFile;
  compiled?: SourceFile;
}

export interface ProcedureSectionEditorSaveFiles extends ProcedureSectionRuntimeFiles {
  unit: SourceFile;
}

export interface CreateProcedureInfo {
  name: string;
  shortName?: string;
  version?: string;
  description?: string;
  authorOrganization?: string;
  authors?: Person[];
}

export interface CreatedProcedureInfo {
  name: string;
  shortName: string;
}

export interface ProceduresFile {
  active: string;
}
