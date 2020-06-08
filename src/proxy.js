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
      onProxyReq(_proxyRequest, request) {
        // Clear any request body added by previous middleware so that raw request
        // body is proxied and encodings are honoured.
        if (request.body) {
          delete request.body;
        }

        return request;
      },
    });
  }
}
