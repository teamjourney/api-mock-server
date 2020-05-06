import server from './src/server';
import router from './src/router';
import logger from './src/logger';

const start = async (port) => server.start(port);
const stop = () => server.stop();

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
