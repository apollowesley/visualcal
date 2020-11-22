import { TypedEmitter } from 'tiny-typed-emitter';

interface SelectActionValue {
  section: SectionInfo;
  action: ActionInfo;
}

interface Events {
  actionChanged: (action?: ActionInfo) => void;
  runNameChanged: (name?: string) => void;
  ready: (section: SectionInfo, action: ActionInfo, runName?: string) => void;
  notReady: () => void;
}

interface ConstructorOptions {
  selectActionElementId: string;
  runTimeElementId: string;
}

export class ProcedureHandler extends TypedEmitter<Events> {

  private fActionSelectElement: HTMLSelectElement;

  private fRunNameElement: HTMLInputElement;

  constructor(opts: ConstructorOptions) {
    super();

    this.fActionSelectElement = document.getElementById(opts.selectActionElementId) as HTMLSelectElement;
    this.fActionSelectElement.addEventListener('change', () => {
      const selectedValue = this.selectedValue;
      this.onActionChanged(selectedValue);
    });

    this.fRunNameElement = document.getElementById(opts.runTimeElementId) as HTMLInputElement;
    this.fRunNameElement.addEventListener('keyup', () => this.onRunNameElementValueChanged());
  }

  get actionSelectElement() { return this.fActionSelectElement; }

  get runName() { return this.fRunNameElement.value ? this.fRunNameElement.value : null; }
  set runName(value: string | null) {
    if (!this.fRunNameElement.value && !value) return;
    if (this.fRunNameElement.value === value) return;
    value ? this.fRunNameElement.value = value : this.fRunNameElement.value = '';
    this.onRunNameChanged(this.fRunNameElement.value);
  }

  get isReady() { return this.actionSelectElement.selectedOptions.length > 0; }

  get selectedValue() {
    const selectedOption = this.fActionSelectElement.selectedOptions[0];
    if (!selectedOption) return;
    const selectedValue = JSON.parse(selectedOption.value) as SelectActionValue;
    return selectedValue;
  }

  updateSections(sections: SectionInfo[]) {
    const actionSelectElement = this.actionSelectElement;
    actionSelectElement.options.length = 0;
    sections.forEach(section => {
      const sectionGroupdEl = document.createElement('optgroup');
      sectionGroupdEl.label = section.name;
      sectionGroupdEl.nodeValue = section.name;
      actionSelectElement.add(sectionGroupdEl);
      section.actions.forEach(action => {
        const actionEl = document.createElement('option');
        actionEl.label = action.name;
        actionEl.value = JSON.stringify({ section: section, action: action });
        sectionGroupdEl.append(actionEl);
      });
    });
    this.onCheckRunStateAndNotify();
  }

  private onCheckRunStateAndNotify() {
    if (this.isReady && this.selectedValue) {
      const actionValue = this.selectedValue;
      this.emit('ready', actionValue.section, actionValue.action, this.runName ? this.runName : undefined);
    } else {
      this.emit('notReady');
    }
  }

  private onRunNameElementValueChanged() {
    this.runName = this.fRunNameElement.value;
  }

  protected onRunNameChanged(name?: string) {
    this.emit('runNameChanged', name);
    this.onCheckRunStateAndNotify();
  }

  protected onActionChanged(_?: SelectActionValue) {
    this.onCheckRunStateAndNotify();
  }

}
