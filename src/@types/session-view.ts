export interface SessionViewWindowOpenIPCInfo {
  session: Session,
  sections: SectionInfo[];
  deviceConfigurationNodeInfosForCurrentFlow: DeviceNodeDriverRequirementsInfo[];
}
