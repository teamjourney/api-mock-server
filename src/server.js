import express from 'express';
import { middleware } from './router';

let server;

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(middleware);

const start = async (port) => {
  server = await app.listen(port);

  return server;
};
const stop = () => server.close();

export default {
  start,
  stop,
};
