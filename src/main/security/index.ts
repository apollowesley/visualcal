export const login = (credentials: LoginCredentials) => {
  if (credentials.username.toLocaleUpperCase() === 'TEST@EXAMPLE.COM'.toLocaleUpperCase()) return 'Logged in';
  return new Error('Failed!');
};
