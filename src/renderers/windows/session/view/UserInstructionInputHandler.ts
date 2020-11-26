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
  formElementId: string;
  inputWrapperElementId: string;
  inputLabelElementId: string;
  inputElementId: string;
  okButtonElementId: string;
  stopButtonElementId: string;
  closeButtonElementId: string;
}

export class UserInstructionInputHandler extends TypedEmitter<Events> {

  private fModalId: string;
  private fTitleElement: HTMLHeadingElement;
  private fTextElement: HTMLParagraphElement;
  private fImageElement: HTMLImageElement;
  private fFormElement: HTMLFormElement;
  private fInputWrapperElement: HTMLDivElement;
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
    this.fFormElement = document.getElementById(opts.formElementId) as HTMLFormElement;
    this.fInputWrapperElement = document.getElementById(opts.inputWrapperElementId) as HTMLDivElement;
    this.fInputLabelElement = document.getElementById(opts.inputLabelElementId) as HTMLLabelElement;
    this.fInputElement = document.getElementById(opts.inputElementId) as HTMLInputElement;
    this.fOkButtonElement = document.getElementById(opts.okButtonElementId) as HTMLButtonElement;
    this.fStopButtonElement = document.getElementById(opts.stopButtonElementId) as HTMLButtonElement;
    
    // Remove unused close button
    const closeButtonElement = document.getElementById(opts.closeButtonElementId) as HTMLButtonElement | null;
    if (closeButtonElement) closeButtonElement.remove();

    this.fInputElement.step = 'any';

    const handleOkButtonClickOrFormSubmit = async (event: Event) => {
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
    }

    const handleInputElementChangeOrKeyUp = () => {
      if (!this.fLastRequest || (this.fLastRequest.dataType !== 'float' && this.fLastRequest.dataType !== 'integer')) {
        this.fOkButtonElement.disabled = false;
        return;
      }
      if (this.fLastRequest.inputMin === undefined && this.fLastRequest.inputMax === undefined) {
        this.fOkButtonElement.disabled = false;
        return;
      }
      if (this.fInputElement.value.length <= 0) {
        this.fOkButtonElement.disabled = true;
        return;
      }
      const inputValue = this.fInputElement.valueAsNumber;
      if (this.fLastRequest.inputMin !== undefined && this.fLastRequest.inputMax === undefined) {
        this.fOkButtonElement.disabled = inputValue < this.fLastRequest.inputMin;
      } else if (this.fLastRequest.inputMin === undefined && this.fLastRequest.inputMax !== undefined) {
        this.fOkButtonElement.disabled = inputValue > this.fLastRequest.inputMax;
      } else if (this.fLastRequest.inputMin !== undefined && this.fLastRequest.inputMax !== undefined) {
        this.fOkButtonElement.disabled = inputValue < this.fLastRequest.inputMin || inputValue > this.fLastRequest.inputMax;
      }
    }

    this.fInputElement.addEventListener('change', () => {
      handleInputElementChangeOrKeyUp();
    });

    this.fInputElement.addEventListener('keyup', () => {
      handleInputElementChangeOrKeyUp();
    });

    this.fFormElement.addEventListener('submit', async (event) => {
      event.preventDefault();
    });

    this.fOkButtonElement.addEventListener('click', async (event) => {
      await handleOkButtonClickOrFormSubmit(event);
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

    $(`#${this.fModalId}`).on('shown.bs.modal', function() {
      $(this).find('.btn-primary').trigger('focus');
    });

    ipcRenderer.on(IpcChannels.user.input.request, async (_, opts: UserInputRequest) => {
      await this.show(opts);
    });
  }

  async show(opts: UserInputRequest) {
    this.fLastRequest = opts;
    this.fTitleElement.innerText = opts.title;
    this.fTextElement.innerText = opts.text;
    this.fOkButtonElement.disabled = false;
    if (opts.showImage && opts.fileBase64Contents) {
      this.fImageElement.src = opts.fileBase64Contents;
      this.fImageElement.style.display = '';
      this.fImageElement.classList.add('d-block');
    } else {
      this.fImageElement.classList.remove('d-block');
      this.fImageElement.style.display = 'none!important';
    }
    switch (opts.dataType) {
      case 'none':
        this.fInputWrapperElement.classList.add('collapse');
        break;
      case 'boolean':
        this.fInputWrapperElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = '';
        this.fInputElement.type = 'checkbox';
        this.fInputElement.min = '';
        this.fInputElement.max = '';
        break;
      case 'float':
        this.fInputWrapperElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = 'Enter a floating point number';
        this.fInputElement.type = 'number';
        opts.inputMin === undefined ? this.fInputElement.min = '' : this.fInputElement.min = opts.inputMin.toString();
        opts.inputMax === undefined ? this.fInputElement.max = '' : this.fInputElement.max = opts.inputMax.toString();
        if (opts.inputMin !== undefined) this.fInputLabelElement.innerText += ` >= ${opts.inputMin.toString()}`;
        if (opts.inputMax !== undefined) this.fInputLabelElement.innerText += ` and <= ${opts.inputMax.toString()}`;
        if (opts.inputMin !== undefined && opts.inputMax === undefined) {
          this.fInputElement.value = opts.inputMin.toString();
        } else if (opts.inputMin === undefined && opts.inputMax !== undefined) {
          this.fInputElement.value = opts.inputMax.toString();
        } else if (opts.inputMin !== undefined && opts.inputMax !== undefined) {
          this.fInputElement.value = opts.inputMin.toString();
        } else {
          this.fInputElement.value = '0';
        }
        break;
      case 'integer':
        this.fInputWrapperElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = 'Enter a integer number';
        this.fInputElement.type = 'number';
        opts.inputMin === undefined ? this.fInputElement.min = '' : this.fInputElement.min = opts.inputMin.toString();
        opts.inputMax === undefined ? this.fInputElement.max = '' : this.fInputElement.max = opts.inputMax.toString();
        if (opts.inputMin !== undefined) this.fInputLabelElement.innerText += ` >= ${opts.inputMin.toString()}`;
        if (opts.inputMax !== undefined) this.fInputLabelElement.innerText += ` and <= ${opts.inputMax.toString()}`;
        if (opts.inputMin !== undefined && opts.inputMax === undefined) {
          this.fInputElement.value = opts.inputMin.toString();
        } else if (opts.inputMin === undefined && opts.inputMax !== undefined) {
          this.fInputElement.value = opts.inputMax.toString();
        } else if (opts.inputMin !== undefined && opts.inputMax !== undefined) {
          this.fInputElement.value = opts.inputMin.toString();
        } else {
          this.fInputElement.value = '0';
        }
        break;
      case 'string':
        this.fInputWrapperElement.classList.remove('collapse');
        this.fInputLabelElement.innerText = 'Enter a string value';
        this.fInputElement.type = 'text';
        this.fInputElement.min = '';
        this.fInputElement.max = '';
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
    this.fLastRequest = undefined;
    await ($(`#${this.fModalId}`) as any).modal('hide');
  }

}