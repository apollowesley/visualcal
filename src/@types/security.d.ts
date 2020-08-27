interface LoginCredentials {
  username: string;
  password: string;
}

interface IpcRequest<TParms> {
  responseChannel?: string;
  params?: TParms[];
}
