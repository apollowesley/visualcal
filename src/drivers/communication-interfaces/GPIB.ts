
export const enum StatusByteRegisterValues {
  None = 0,
  ErrorEventQueueSummary = 1 << 2,
  DataQuestionable = 1 << 3,
  MessageAvailable = 1 << 4,
  StandardEventSummary = 1 << 5,
  RequestingServiceOrMasterSummaryStatus = 1 << 6,
  OperationStatusSummary = 1 << 7
}

export const enum EventStatusRegisterValues {
  None = 0,
  OperationComplete = 1 << 0,
  RequestingControl = 1 << 1,
  QueryError = 1 << 2,
  DeviceSpecificError = 1 << 3,
  ExecutionError = 1 << 4,
  CommandError = 1 << 5,
  UserRequest = 1 << 6,
  PoweredOn = 1 << 7
}

export interface GpibInterface extends ICommunicationInterface {
  address: number;
  interfaceClear(): Promise<void>;
  selectedDeviceClear(address?: number): Promise<void>;
  getEndOfInstruction(): Promise<boolean>;
  setEndOfInstruction(enable: boolean): Promise<void>;
  getEndOfTransmission(): Promise<EndOfTransmissionOptions>;
  setEndOfTransmission(options: EndOfTransmissionOptions): Promise<void>;
  becomeControllerInCharge(): Promise<void>;
  gotToRemote(address: number): Promise<void>;
  goToLocal(address: number): Promise<void>;
  getListenOnly(): Promise<boolean>;
  setListenOnly(enable: boolean): Promise<void>;
  reset(): Promise<void>;
  serialPoll(primaryAddress: number, secondaryAddress?: number): Promise<StatusByteRegister>;
  readStatusByte(): Promise<StatusByteRegister>;
  readEventStatusRegister(): Promise<EventStatusRegister>;
  getEventStatusEnable(): Promise<EventStatusRegister>;
  setEventStatusEnable(values: EventStatusRegisterValues): Promise<void>;
  clearEventStatusEnable(): Promise<void>;
  clearStatusByte(): Promise<void>;
  trigger(addresses: number | number[]): Promise<void>;
}

abstract class EnumFlags<TEnum extends number> {

  private fValue: TEnum;

  protected constructor(value: TEnum) {
    this.fValue = value;
  }

  /**
   * Tests whether or not a bit is set in this instance of EnumFlags
   * @param test The value to test for against this instance value
   */
  protected isSet(test: TEnum | number) {
    return (this.fValue | test) === test;
  }

  get isEmpty() { return this.fValue === 0; }

}

export class StatusByteRegister extends EnumFlags<StatusByteRegisterValues> {

  constructor(value: StatusByteRegisterValues) {
    super(value);
  }

  get dataQuestionable() { return this.isSet(StatusByteRegisterValues.DataQuestionable); }
  get errorEventQueueSummary() { return this.isSet(StatusByteRegisterValues.ErrorEventQueueSummary); }
  get messageAvailable() { return this.isSet(StatusByteRegisterValues.MessageAvailable); }
  get operationStatusSummary() { return this.isSet(StatusByteRegisterValues.OperationStatusSummary); }
  get requestingServiceOrMasterSummaryStatus() { return this.isSet(StatusByteRegisterValues.RequestingServiceOrMasterSummaryStatus); }
  get standardEventSummary() { return this.isSet(StatusByteRegisterValues.StandardEventSummary); }

}

export class EventStatusRegister extends EnumFlags<EventStatusRegisterValues> {

  constructor(value: EventStatusRegisterValues) {
    super(value);
  }

  get commandError() { return this.isSet(EventStatusRegisterValues.CommandError); }
  get deviceSpecificError() { return this.isSet(EventStatusRegisterValues.DeviceSpecificError); }
  get executionError() { return this.isSet(EventStatusRegisterValues.ExecutionError); }
  get operationComplete() { return this.isSet(EventStatusRegisterValues.OperationComplete); }
  get poweredOn() { return this.isSet(EventStatusRegisterValues.PoweredOn); }
  get queryError() { return this.isSet(EventStatusRegisterValues.QueryError); }
  get requestingControl() { return this.isSet(EventStatusRegisterValues.RequestingControl); }
  get userRequest() { return this.isSet(EventStatusRegisterValues.UserRequest); }

}
