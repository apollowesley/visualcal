import tingodb from 'tingodb';
import type { Collection, Db, InsertWriteOpResult, MongoError, WithId } from 'mongodb';

export class Server {

  fEngine = tingodb();
  fDb: Db;
  fProcedures: Collection<ProcedureInfo>;

  constructor(baseDir: string) {
    this.fDb = new this.fEngine.Db(baseDir, {});
    this.fProcedures = this.fDb.collection('procedures');
  }

  get db() { return this.fDb; }

  async init() {
    await this.fProcedures.createIndex({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
  }

  addProcedure(procedure: ProcedureInfo) {
    return new Promise<InsertWriteOpResult<WithId<ProcedureInfo>> | MongoError>(async (resolve, reject) => {
      this.fProcedures.insert(procedure, (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
    });
  }

  getProcedure(name: string) {
    return new Promise<ProcedureInfo | MongoError>((resolve, reject) => {
      try {
        this.fProcedures.findOne({ name: name }, (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result);
          return reject(`Could not locate procedure, ${name}`);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

}
