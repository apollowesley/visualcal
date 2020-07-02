import path from 'path';

let files: VisualCalAugmentFiles;

export const getFiles = () => files;

export const init = (dirs: VisualCalAugmentDirs) => {
  files = {
    proceduresJson: path.join(dirs.userHomeData.procedures, 'procedures.json'),
    sessionsJson: path.join(dirs.userHomeData.sessions, 'sessions.json')
  }
}
