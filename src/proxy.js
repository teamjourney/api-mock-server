import { createProxyMiddleware } from 'http-proxy-middleware';
import querystring from 'querystring';

export default class Proxy {
  constructor(logger) {
    this.logger = logger;
  }

  middleware(proxyBaseUrl) {
    return createProxyMiddleware({
      target: proxyBaseUrl,
      logLevel: 'silent',
      onProxyReq: (proxyRequest, request) => {
        if (!request.body || !Object.keys(request.body).length) {
          return;
        }

        const contentType = proxyRequest.getHeader('Content-Type');
        const writeBody = (bodyData) => {
          proxyRequest.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyRequest.write(bodyData);
        };

        if (contentType === 'application/json') {
          writeBody(JSON.stringify(request.body));
        }

        if (contentType === 'application/x-www-form-urlencoded') {
          writeBody(querystring.stringify(request.body));
        }
      },
      onProxyRes: async (proxyResponse, request) => {
        await this.logger.logProxiedRequest(request, proxyResponse);
      },
    });
  }
}
