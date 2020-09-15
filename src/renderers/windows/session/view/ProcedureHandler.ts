import { TypedEmitter } from 'tiny-typed-emitter';
import { SelectHandler } from '../../../components/SelectHandler';

interface Events {
  actionChanged: (action?: ActionInfo) => void;
  runNameChanged: (name?: string) => void;
  ready: (section: SectionInfo, action: ActionInfo, runName?: string) => void;
  notReady: () => void;
}

interface ConstructorOptions {
  titleElementId: string;
  sectionElementId: string;
  actionElementId: string;
  runTimeElementId: string;
}

export class ProcedureHandler extends TypedEmitter<Events> {

  private fTitleElement: HTMLHeadingElement;
  private fSectionHandler: SelectHandler<SectionInfo>;
  private fActionHandler: SelectHandler<ActionInfo>;

  private fRunNameElement: HTMLInputElement;

  private fRunName?: string;

  constructor(opts: ConstructorOptions) {
    super();
    this.fTitleElement = document.getElementById(opts.titleElementId) as HTMLHeadingElement;

    this.fSectionHandler = new SelectHandler({ elementId: opts.sectionElementId });
    this.fSectionHandler.on('changed', (section) => this.onSectionChanged(section));

    this.fActionHandler = new SelectHandler({ elementId: opts.actionElementId });
    this.fActionHandler.on('changed', (action) => this.onActionChanged(action));

    this.fRunNameElement = document.getElementById(opts.runTimeElementId) as HTMLInputElement;
    this.fRunNameElement.addEventListener('keyup', () => this.onRunNameElementValueChanged());
  }

  get sectionHandler() { return this.fSectionHandler; }
  get actionHandler() { return this.fActionHandler; }

  get runName() { return this.fRunName ? this.fRunName : null; }
  set runName(value: string | null) {
    if (!this.fRunName && !value) return;
    if (this.fRunName === value) return;
    value ? this.fRunName = value : this.fRunName = undefined;
    this.onRunNameChanged(this.fRunName);
  }

  get isReady() { return this.sectionHandler.selectedItem && this.actionHandler.selectedItem; }

  setTitle(title: string) {
    this.fTitleElement.textContent = title;
  }

  private onCheckRunStateAndNotify() {
    if (this.sectionHandler.selectedItem && this.actionHandler.selectedItem) this.emit('ready', this.sectionHandler.selectedItem, this.actionHandler.selectedItem, this.runName ? this.runName : undefined);
    else this.emit('notReady');
  }

  private onRunNameElementValueChanged() {
    this.runName = this.fRunNameElement.value;
  }

  protected onRunNameChanged(name?: string) {
    this.emit('runNameChanged', name);
    this.onCheckRunStateAndNotify();
  }

  protected onSectionChanged(section?: SectionInfo) {
    if (!section) {
      this.onCheckRunStateAndNotify();
      return;
    }
    this.actionHandler.items = section.actions;
  }

  protected onActionChanged(_?: ActionInfo) {
    this.onCheckRunStateAndNotify();
  }

}
