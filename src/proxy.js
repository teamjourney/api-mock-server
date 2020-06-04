import proxy from 'express-http-proxy';

export default class Proxy {
  constructor(logger) {
    this.logger = logger;
  }

  middleware(proxyBaseUrl) {
    return proxy(proxyBaseUrl, {
      userResDecorator: (proxiedResponse, proxiedResponseData, request) => {
        this.logger.logProxiedRequest(request, proxiedResponse, proxiedResponseData);

        return proxiedResponseData;
      },
    });
  }
}
