import express from 'express';
import router from './router';

let server;

const app = express();
app.use(express.json());
app.use(router.middleware);

const start = async (port) => {
  server = await app.listen(port);

  return server;
};
const stop = () => server.close();
const mock = (request, response) => router.add(request, response);
const reset = () => router.reset();

export default {
  start,
  stop,
  mock,
  reset,
};
