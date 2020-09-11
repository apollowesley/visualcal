export const setNoUpdateNotifier = (enable: boolean) => {
  process.env['NO_UPDATE_NOTIFIER'] = `${enable ? '0' : '1'}`;
}
