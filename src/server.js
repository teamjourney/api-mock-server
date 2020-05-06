import express from 'express';
import router from './router';
import logger from './logger';

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
const reset = () => {
  router.reset();
  logger.reset();
};
const getUnhandledRequests = () => logger.getUnhandledRequests();

export default {
  start,
  stop,
  mock,
  reset,
  getUnhandledRequests,
};
