import { config as dotEnvConfig } from 'dotenv';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose'; 
import { getHome } from './getHome';
import { getAll as getAllDrivers, addOrUpdate as addOrUpdateDriver } from './DriverLibrary';
import cors from 'cors';
import { init as initWebSocketServer } from './SocketIo';

dotEnvConfig();

if (!process.env.DBHOST || !process.env.DBPORT || !process.env.DBUSER || !process.env.DBPASS) throw new Error('DBHOST, DBPORT, DBUSER and DBPASS environment variables are required but not set');

const PORT = process.env.PORT || 80;

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

app.get('/', getHome);
app.get('/drivers', async (req, res) => await getAllDrivers(req, res));
app.post('/drivers', async (req, res) => await addOrUpdateDriver(req, res));

initWebSocketServer(server);

server.listen(PORT, async () => {
  console.info(`Started listening on port ${PORT}`);
  await mongoose.connect(`mongodb://${process.env.DBUSER}:${process.env.DBPASS}@${process.env.DBHOST}:${process.env.DBPORT}/?authSource=admin`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 1000
  }, (err) => {
    if (err) {
      server.close();
      throw err;
    }
  });
});
