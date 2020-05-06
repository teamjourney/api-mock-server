import server from './src/server';
import router from './src/router';
import logger from './src/logger';

const reset = () => {
  router.reset();
  logger.reset();
};
const start = (port) => server.start(port);
const stop = () => {
  reset();
  server.stop();
};

const mock = (request, response) => router.add(request, response);

const getUnhandledRequests = () => logger.getUnhandledRequests();

export default {
  start,
  stop,
  mock,
  reset,
  getUnhandledRequests,
};
