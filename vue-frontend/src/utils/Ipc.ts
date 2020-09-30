import { TypedEmitter } from 'tiny-typed-emitter';
import { User, ViewInfo } from '../types/session';
import { IpcChannels as SessionViewIpcChannels, SessionViewRequestResponseInfo, Procedure, Session } from 'visualcal-common/src/session-view-info';
import { IpcChannels as LoginIpcChannels, LoginCredentials } from 'visualcal-common/src/user';
import { ProcedureForCreate } from 'visualcal-common/src/procedure';
import { SessionForCreate } from 'visualcal-common/src/session';
import { IpcChannels as AutoUpdateIpcChannels, ProgressInfo, UpdateInfo } from 'visualcal-common/src/auto-update';
import { BenchConfig, IpcChannels as BenchConfigIpcChannels } from 'visualcal-common/src/bench-configuration';
import { IpcChannels as ResultIpcChannels, LogicRun } from 'visualcal-common/src/result';
import { PortInfo } from 'serialport';

interface AutoUpdateEvents {
  updateError: (error: Error) => void;
  checkingForUpdatesStarted: () => void;
  updateAvailable: (info: UpdateInfo) => void;
  updateNotAvailable: (info: UpdateInfo) => void;
  downloadProgressChanged: (progress: ProgressInfo) => void;
  updateDownloaded: (info: UpdateInfo) => void;
}

interface Events extends AutoUpdateEvents {
  error: (error: Error) => void;
}

export class Ipc extends TypedEmitter<Events> {

  constructor() {
    super();
  }

  private get ipcRenderer() {
    return window.electron.ipcRenderer;
  }

  send(channel: string, ...args: unknown[]) {
    this.ipcRenderer.send(channel, ...args);
  }

  request<TReturn, TError>(requestChannel: string, responseChannel: string, errorChannel: string, ...args: unknown[]) {
    return new Promise<TReturn>((resolve, reject) => {
      this.ipcRenderer.once(errorChannel, (_, err: TError) => {
        return reject(err);
      });
      this.ipcRenderer.once(responseChannel, (_, response: TReturn) => {
        return resolve(response);
      });
      this.send(requestChannel, ...args);
    });
  }

  async getViewInfo() {
    return await this.request<ViewInfo | null, string>('session-view-info-request', 'session-view-info-response', 'session-view-info-error');
  }

  async login(credentials: LoginCredentials) {
    console.info(this);
    return await this.request<User, string>(LoginIpcChannels.Request, LoginIpcChannels.Response, LoginIpcChannels.Error, credentials);
  }

  async getCurrentUser() {
    return await this.request<User | null, Error>('user-active-request', 'user-active-response', 'user-active-error');
  }

  async getProcedures() {
    return await this.request<Procedure[], string>('getAll-procedures-request', 'getAll-procedures-response', 'getAll-procedures-error');
  }

  async getProcedureExists(procedureName: string) {
    return await this.request<boolean, string>('get-exists-procedure-request', 'get-exists-procedure-response', 'get-exists-procedure-error', procedureName);
  }

  async getActiveProcedureName() {
    return await this.request<string, string>('get-active-procedure-request', 'get-active-procedure-response', 'get-active-procedure-error');
  }

  async setActiveProcedure(procedureName: string) {
    return await this.request<Procedure, string>('set-active-procedure-request', 'set-active-procedure-response', 'set-active-procedure-error', procedureName);
  }

  async createProcedure(procedure: ProcedureForCreate) {
    return await this.request<Procedure, string>('create-procedure-request', 'create-procedure-response', 'create-procedure-error', procedure);
  }

  async getSessions() {
    return await this.request<Session[], string>('session-get-all-for-active-user-request', 'session-get-all-for-active-user-response', 'session-get-all-for-active-user-error');
  }

  async getSessionExists(email: string, sessionName: string) {
    return await this.request<boolean, string>('get-exists-session-request', 'get-exists-session-response', 'get-exists-session-error', { email: email, sessionName: sessionName });
  }

  async setActiveSession(sessionName: string) {
    return await this.request<Session, string>('session-set-active-request', 'session-set-active-response', 'session-set-active-error', sessionName);
  }

  async createSession(session: SessionForCreate) {
    return await this.request<Session, string>('create-session-request', 'create-session-response', 'create-session-error', session);
  }

  async getSessionViewInfo() {
    return await this.request<SessionViewRequestResponseInfo | null, string>(SessionViewIpcChannels.Request, SessionViewIpcChannels.Response, SessionViewIpcChannels.Error);
  }

  async getSerialPorts() {
    return await this.request<PortInfo[], Error>(BenchConfigIpcChannels.GetSerialPortsRequest, BenchConfigIpcChannels.GetSerialPortsResponse, BenchConfigIpcChannels.GetSerialPortsError);
  }

  async saveBenchConfigurationsForCurrentUser(configs: BenchConfig[]) {
    return await this.request<boolean, Error>(BenchConfigIpcChannels.SaveConfigsForCurrentUserRequest, BenchConfigIpcChannels.SaveConfigsForCurrentUserResponse, BenchConfigIpcChannels.SaveConfigsForCurrentUserError, configs);
  }

  async getRunsForCurrentSession() {
    return await this.request<LogicRun<string, number>[], Error>(ResultIpcChannels.getAllBasicInfosForCurrentSession.request, ResultIpcChannels.getAllBasicInfosForCurrentSession.response, ResultIpcChannels.getAllBasicInfosForCurrentSession.error);
  }

  listenForAutoUpdateEvents() {
    if (!window.electron) return;
    window.electron.ipcRenderer.on(AutoUpdateIpcChannels.DownloadProgressChanged, (_, progress: ProgressInfo) => this.emit('downloadProgressChanged', progress));
    window.electron.ipcRenderer.on(AutoUpdateIpcChannels.Error, (_, err: Error) => this.emit('error', err));
    window.electron.ipcRenderer.on(AutoUpdateIpcChannels.StartedChecking, () => this.emit('checkingForUpdatesStarted'));
    window.electron.ipcRenderer.on(AutoUpdateIpcChannels.UpdateAvailable, (_, info: UpdateInfo) => this.emit('updateAvailable', info));
    window.electron.ipcRenderer.on(AutoUpdateIpcChannels.UpdateDownloaded, (_, info: UpdateInfo) => this.emit('updateDownloaded', info));
    window.electron.ipcRenderer.on(AutoUpdateIpcChannels.UpdateNotAvailable, (_, info: UpdateInfo) => this.emit('updateNotAvailable', info));
  }

  removeAutoUpdateEventListeners() {
    if (!window.electron) return;
    window.electron.ipcRenderer.removeAllListeners(AutoUpdateIpcChannels.DownloadProgressChanged);
    window.electron.ipcRenderer.removeAllListeners(AutoUpdateIpcChannels.Error);
    window.electron.ipcRenderer.removeAllListeners(AutoUpdateIpcChannels.StartedChecking);
    window.electron.ipcRenderer.removeAllListeners(AutoUpdateIpcChannels.UpdateAvailable);
    window.electron.ipcRenderer.removeAllListeners(AutoUpdateIpcChannels.UpdateDownloaded);
    window.electron.ipcRenderer.removeAllListeners(AutoUpdateIpcChannels.UpdateNotAvailable);
  }

}
