interface ProcedureNameInfo {
  name: string;
  validationErrors?: string[];
}

interface ProcedureSection {
  name: string;
  order?: number;
  description: string;
  icon?: string;
  guiEditor: 'tms' | 'grapesjs' | 'indysoft' | 'linear';
  isCompleted: boolean | ProcedureSectionIsCompletedCallback;
  isRunning: boolean;
}

interface ProcedureFile {
  name: string;
  version?: string;
  description?: string;
  authorOrganization?: string;
  authors?: Person[];
}

interface ActionInfo {
  name: string;
}

interface SectionInfo {
  name: string;
  actions: ActionInfo[];
}

interface ProcedureInfo {
  name: string;
  version: string;
  description: string;
  authorOrganization: string;
  authors: Person[];
  sections: SectionInfo[];
  requiredStandards?: RequiredStandard[];
}

interface Procedure {
  name: string;
  version: string;
  description: string;
  authorOrganization: string;
  authors: Person[];
  sections: ProcedureSection[];
  requiredStandards?: RequiredStandard[];
}

interface ProcedureSectionIsCompletedCallback {
  (): boolean;
}

interface ProcedureSectionLoadInfo {
  procedure: string;
  section: string;
}

interface ProcedureSectionRuntimeFiles {
  compiled: SourceFile;
  components: SourceFile;
}

interface ProcedureSectionEditorFiles {
  program: SourceFile;
  unit: SourceFile;
  components: SourceFile;
  compiled?: SourceFile;
}

interface ProcedureSectionEditorSaveFiles extends ProcedureSectionRuntimeFiles {
  unit: SourceFile;
}

interface CreateProcedureInfo {
  name: string;
  version?: string;
  description?: string;
  authorOrganization?: string;
  authors?: Person[];
}

interface CreatedProcedureInfo {
  name: string;
}

interface ProceduresFile {
  active?: string;
}
