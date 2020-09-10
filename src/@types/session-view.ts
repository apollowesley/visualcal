export interface SessionViewWindowOpenIPCInfo {
  user: User;
  benchConfig?: BenchConfig;
  session: Session,
  procedure: Procedure;
  sections: SectionInfo[];
  deviceNodes: DeviceNodeDriverRequirementsInfo[];
}
