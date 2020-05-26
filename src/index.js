import { difference } from 'lodash';

import server from './server';
import router from './router';
import logger from './logger';

const reset = (requests) => {
  router.reset(requests);
  logger.reset(requests);
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
