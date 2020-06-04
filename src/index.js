import { difference } from 'lodash';

import Server from './server';
import Router from './router';
import Proxy from './proxy';
import Logger from './logger';

export class MockServer {
  constructor() {
    this.logger = new Logger();
    this.router = new Router(this.logger);
    this.proxy = new Proxy(this.logger);
    this.server = new Server(this.router, this.proxy);
  }

  start(port, proxyBaseUrl) {
    return this.server.start(port, proxyBaseUrl);
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

  getProxiedRequests() {
    return this.logger.getProxiedRequests();
  }

  getUncalledMocks() {
    const handled = this.logger.getHandledRequests();
    const mocked = this.router.get();

    return difference(mocked, handled);
  }
}

const server = new MockServer();

const start = (port, proxyBaseUrl) => server.start(port, proxyBaseUrl);
const stop = () => server.stop();
const reset = (requests) => server.reset(requests);
const mock = (request, response) => server.mock(request, response);
const getUnhandledRequests = () => server.getUnhandledRequests();
const getHandledRequests = () => server.getHandledRequests();
const getProxiedRequests = () => server.getProxiedRequests();
const getUncalledMocks = () => server.getUncalledMocks();

export default {
  start,
  stop,
  mock,
  reset,
  getUnhandledRequests,
  getHandledRequests,
  getUncalledMocks,
  getProxiedRequests,
};
