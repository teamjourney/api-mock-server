import { difference } from 'lodash';

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
const getHandledRequests = () => logger.getHandledRequests();
const getUncalledMocks = () => {
  const handled = logger.getHandledRequests();
  const mocked = router.get();

  return difference(mocked, handled);
};

export default {
  start,
  stop,
  mock,
  reset,
  getUnhandledRequests,
  getHandledRequests,
  getUncalledMocks,
};
