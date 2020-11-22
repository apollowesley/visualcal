import { TypedEmitter } from 'tiny-typed-emitter';
import { StateChangeInfo } from '../../../managers/RendererActionManager';

interface Events {
  stateChanged: (info: StateChangeInfo) => void;
}

interface ConstructorOptions {
  procedureStatusElementId: string;
  sectionStatusElementId: string;
  actionStatusElementId: string;
}

export class StatusHandler extends TypedEmitter<Events> {

  private fProcedureStatusElement: HTMLHeadingElement;
  private fSectionStatusElement: HTMLHeadingElement;
  private fActionStatusElement: HTMLHeadingElement;

  constructor(opts: ConstructorOptions) {
    super();
    this.fProcedureStatusElement = document.getElementById(opts.procedureStatusElementId) as HTMLHeadingElement;
    this.fSectionStatusElement = document.getElementById(opts.sectionStatusElementId) as HTMLHeadingElement;
    this.fActionStatusElement = document.getElementById(opts.actionStatusElementId) as HTMLHeadingElement;

    window.visualCal.actionManager.on('stateChanged', (info) => this.onActionManagerStateChanged(info));
  }

  onActionManagerStateChanged(info: StateChangeInfo) {
    switch (info.state) {
      case 'completed':
        this.fProcedureStatusElement.textContent = 'Ready';
        this.fSectionStatusElement.textContent = 'Section:  None';
        this.fActionStatusElement.textContent = 'Action:  Completed';
        break;
      case 'started':
        this.fProcedureStatusElement.innerText = 'Running';
        this.fSectionStatusElement.textContent = `Section:  ${info.section}`;
        this.fActionStatusElement.textContent = `Action:  ${info.action}`;
        break;
      case 'stopped':
        this.fProcedureStatusElement.textContent = 'Stopped';
        this.fSectionStatusElement.textContent = 'Section:  None';
        this.fActionStatusElement.textContent = 'Action:  None';
        break;
    }
    this.emit('stateChanged', info);
  }

}