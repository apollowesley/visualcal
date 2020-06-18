export const login = (credentials: LoginCredentials) => {
  return credentials.username.toLocaleUpperCase() === 'TEST@EXAMPLE.COM'.toLocaleUpperCase();
};
