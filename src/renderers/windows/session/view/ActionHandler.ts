import { TypedEmitter } from 'tiny-typed-emitter';

interface Events {
  sectionChanged: (section?: SectionInfo) => void;
  actionChanged: (action?: ActionInfo) => void;
  runNameChanged: (name?: string) => void;
  readyToStart: (section: SectionInfo, action: ActionInfo, runName: string) => void;
  notReadyToStart: () => void;
}

interface ConstructorOptions {
  sectionElementId: string;
  actionElementId: string;
  runTimeElementId: string;
}

export class ActionHandler extends TypedEmitter<Events> {

  private fSectionElement: HTMLSelectElement;
  private fActionElement: HTMLSelectElement;
  private fRunNameElement: HTMLInputElement;

  private fSection?: SectionInfo;
  private fAction?: ActionInfo;
  private fRunName?: string;

  constructor(opts: ConstructorOptions) {
    super();
    this.fSectionElement = document.getElementById(opts.sectionElementId) as HTMLSelectElement;
    this.fActionElement = document.getElementById(opts.actionElementId) as HTMLSelectElement;
    this.fRunNameElement = document.getElementById(opts.runTimeElementId) as HTMLInputElement;

    this.fSectionElement.addEventListener('change', () => this.onSectionElementSelectedOptionChanged());
    this.fActionElement.addEventListener('change', () => this.onActionElementSelectedOptionChanged());
    this.fRunNameElement.addEventListener('change', () => this.onRunNameElementSelectedOptionChanged());
  }

  get selectedSection() { return this.fSection ? this.fSection : null; }
  set selectedSection(value: SectionInfo | null) {
    if (!this.fSection && !value) return;
    if (this.fSection === value) return;
    value ? this.fSection = value : this.fSection = undefined;
    this.onSectionChanged(this.fSection);
  }

  get selectedAction() { return this.fAction ? this.fAction : null; }
  set selectedAction(value: ActionInfo | null) {
    if (!this.fAction && !value) return;
    if (this.fAction === value) return;
    value ? this.fAction = value : this.fAction = undefined;
    this.onActionChanged(this.fAction);
  }

  get runName() { return this.fRunName ? this.fRunName : null; }
  set runName(value: string | null) {
    if (!this.fRunName && !value) return;
    if (this.fRunName === value) return;
    value ? this.fRunName = value : this.fRunName = undefined;
    this.onRunNameChanged(this.fRunName);
  }

  get canStart() { return this.selectedSection && this.selectedAction && this.runName; }

  private onCheckRunStateAndNotify() {
    if (this.selectedSection && this.selectedAction && this.runName) this.emit('readyToStart', this.selectedSection, this.selectedAction, this.runName);
    else this.emit('notReadyToStart');
  }

  protected onSectionChanged(section?: SectionInfo) {
    this.emit('sectionChanged', section);
    this.onCheckRunStateAndNotify();
  }

  protected onActionChanged(action?: ActionInfo) {
    this.emit('actionChanged', action);
    this.onCheckRunStateAndNotify();
  }

  protected onRunNameChanged(name?: string) {
    this.emit('runNameChanged', name);
    this.onCheckRunStateAndNotify();
  }

  private onSectionElementSelectedOptionChanged() {
    this.fSectionElement.selectedOptions[0] ? this.selectedSection = JSON.parse(this.fSectionElement.selectedOptions[0].value) : null;
  }

  private onActionElementSelectedOptionChanged() {
    this.fActionElement.selectedOptions[0] ? this.selectedAction = JSON.parse(this.fActionElement.selectedOptions[0].value) : null;
  }

  private onRunNameElementSelectedOptionChanged() {
    this.runName = this.fRunNameElement.value;
  }

}
