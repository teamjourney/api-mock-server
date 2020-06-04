import { difference } from 'lodash';

import Server from './server';
import Router from './router';
import Logger from './logger';

export class MockServer {
  constructor() {
    this.logger = new Logger();
    this.router = new Router(this.logger);
    this.server = new Server(this.router);
  }

  start(port) {
    return this.server.start(port);
  }

  stop() {
    this.reset();
    this.server.stop();
  }

  mock(request, response) {
    this.router.add(request, response);
  }

  reset(requests) {
    this.router.reset(requests);
    this.logger.reset();
  }

  getUnhandledRequests() {
    return this.logger.getUnhandledRequests();
  }

  getHandledRequests() {
    return this.logger.getHandledRequests();
  }

  getUncalledMocks() {
    const handled = this.logger.getHandledRequests();
    const mocked = this.router.get();

    return difference(mocked, handled);
  }
}

const server = new MockServer();

const start = (port) => server.start(port);
const stop = () => server.stop();
const reset = (requests) => server.reset(requests);
const mock = (request, response) => server.mock(request, response);
const getUnhandledRequests = () => server.getUnhandledRequests();
const getHandledRequests = () => server.getHandledRequests();
const getUncalledMocks = () => server.getUncalledMocks();

export default {
  start,
  stop,
  mock,
  reset,
  getUnhandledRequests,
  getHandledRequests,
  getUncalledMocks,
};
