export const isLoggedIn = () => global.visualCal.user !== null;

export const login = (credentials: LoginCredentials) => {
  return credentials.username.toLocaleUpperCase() === 'TEST@EXAMPLE.COM'.toLocaleUpperCase();
};
