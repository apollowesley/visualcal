export default class SourceFile {
  name: string;
  originalName: string;
  // eslint-disable-next-line
  content: any;
  modified: boolean;

  constructor(name: string, originalName: string, content: string, modified: boolean = false) {
    this.name = name;
    this.originalName = originalName;
    this.content = content;
    this.modified = modified;
  }

}
