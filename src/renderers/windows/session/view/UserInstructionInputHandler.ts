import { ipcRenderer } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../../../constants';

interface Events {
  input: (value: string | number | boolean) => void;
}

interface ConstructorOptions {
  modalId: string;
  titleElementId: string;
  textElementId: string;
  imageElementId: string;
  imputFormElementId: string;
  inputLabelElementId: string;
  inputElementId: string;
  okButtonElementId: string;
  stopButtonElementId: string;
}

export class UserInstructionInputHandler extends TypedEmitter<Events> {

  private fModalId: string;
  private fTitleElement: HTMLHeadingElement;
  private fTextElement: HTMLParagraphElement;
  private fImageElement: HTMLImageElement;
  private fInputFormElement: HTMLFormElement;
  private fInputLabelElement: HTMLLabelElement;
  private fInputElement: HTMLInputElement;
  private fOkButtonElement: HTMLButtonElement;
  private fStopButtonElement: HTMLButtonElement;
  private fLastRequest?: UserInputRequest;

  constructor(opts: ConstructorOptions) {
    super();
    this.fModalId = opts.modalId;
    this.fTitleElement = document.getElementById(opts.titleElementId) as HTMLHeadingElement;
    this.fTextElement = document.getElementById(opts.textElementId) as HTMLHeadingElement;
    this.fImageElement = document.getElementById(opts.imageElementId) as HTMLImageElement;
    this.fInputFormElement = document.getElementById(opts.imputFormElementId) as HTMLFormElement;
    this.fInputLabelElement = document.getElementById(opts.inputLabelElementId) as HTMLLabelElement;
    this.fInputElement = document.getElementById(opts.inputElementId) as HTMLInputElement;
    this.fOkButtonElement = document.getElementById(opts.okButtonElementId) as HTMLButtonElement;
    this.fStopButtonElement = document.getElementById(opts.stopButtonElementId) as HTMLButtonElement;

    this.fOkButtonElement.addEventListener('click', async () => {
      if (!this.fLastRequest) return;
      const response: UserInputResponse = {
        action: this.fLastRequest.action,
        nodeId: this.fLastRequest.nodeId,
        section: this.fLastRequest.section,
        cancel: false
      };
      switch (this.fLastRequest.dataType) {
        case 'boolean':
          response.result = !!this.fInputElement.value;
          break;
        case 'float':
          response.result = parseFloat(this.fInputElement.value);
          break;
        case 'integer':
          response.result = parseInt(this.fInputElement.value);
          break;
        case 'string':
          response.result = this.fInputElement.value;
          break;
      }
      ipcRenderer.send(IpcChannels.user.input.result, response);
      await this.close();
    });

    this.fStopButtonElement.addEventListener('click', () => {
      if (!this.fLastRequest) return;
      const response: UserInputResponse = {
        action: this.fLastRequest.action,
        nodeId: this.fLastRequest.nodeId,
        section: this.fLastRequest.section,
        cancel: true,
        result: false
      };
      ipcRenderer.send(IpcChannels.user.input.result, response);
    });

    ipcRenderer.on(IpcChannels.user.input.request, async (_, opts: UserInputRequest) => {
      await this.show(opts);
    });
  }

  async show(opts: UserInputRequest) {
    this.fLastRequest = opts;
    this.fTitleElement.innerText = opts.title;
    this.fTextElement.innerText = opts.text;
    if (opts.showImage && opts.fileBase64Contents) {
      this.fImageElement.src = opts.fileBase64Contents;
      this.fImageElement.classList.remove('collapse');
    } else {
      this.fImageElement.classList.add('collapse');
    }
    switch (opts.dataType) {
      case 'none':
        this.fInputFormElement.classList.add('collapse');
        break;
      case 'boolean':
        this.fInputFormElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = '';
        this.fInputElement.type = 'checkbox';
        break;
      case 'float':
        this.fInputFormElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = `Enter a floating point number`;
        this.fInputElement.type = 'number';
        break;
      case 'integer':
        this.fInputFormElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = `Enter a integer number`;
        this.fInputElement.type = 'number';
        break;
      case 'string':
        this.fInputFormElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = `Enter a string value`;
        this.fInputElement.type = 'text';
        break;
    }
    if (opts.append) this.fInputLabelElement.innerText = `${this.fInputLabelElement.innerText} (${opts.append})`;
    await ($(`#${this.fModalId}`) as any).modal({
      backdrop: 'static',
      keyboard: false,
      focus: true,
      show: true
    });
  }

  async close() {
    await ($(`#${this.fModalId}`) as any).modal('hide');
  }

}