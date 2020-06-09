import { isEmpty, omit } from 'lodash';

const ignoredHeaders = ['accept', 'connection', 'host', 'content-length', 'content-type'];

const parseResponseBody = (response) => new Promise((resolve) => {
  let body = '';
  response.on('data', (chunk) => {
    body = chunk;
  });

  response.on('end', () => {
    const json = body.toString() ? JSON.parse(body.toString()) : null;

    resolve(json);
  });
});

const convertExpressRequestToMockRequest = (expressRequest) => {
  const request = {
    path: expressRequest.path,
    method: expressRequest.method,
  };

  if (!isEmpty(expressRequest.body)) {
    request.body = expressRequest.body;
  }

  if (!isEmpty(expressRequest.query)) {
    request.query = expressRequest.query;
  }

  if (!isEmpty(omit(expressRequest.headers, ignoredHeaders))) {
    request.headers = omit(expressRequest.headers, ignoredHeaders);
  }

  return request;
};

const convertProxiedResponseToMockResponse = async (proxiedResponse) => {
  const response = {
    status: proxiedResponse.statusCode,
    headers: proxiedResponse.headers,
    body: await parseResponseBody(proxiedResponse),
  };

  return response;
};

export default class Logger {
  constructor() {
    this.reset();
  }

  logUnhandledRequest(expressRequest) {
    this.unhandledRequests.push({
      request: convertExpressRequestToMockRequest(expressRequest),
    });
  }

  async logProxiedRequest(expressRequest, proxiedResponse) {
    this.proxiedRequests.push({
      request: convertExpressRequestToMockRequest(expressRequest),
      response: await convertProxiedResponseToMockResponse(proxiedResponse),
    });
  }

  logHandledRequest(match) {
    this.handledRequests.push(match);
  }

  getUnhandledRequests() {
    return this.unhandledRequests;
  }

  getHandledRequests() {
    return this.handledRequests;
  }

  getProxiedRequests() {
    return this.proxiedRequests;
  }

  reset() {
    this.unhandledRequests = [];
    this.handledRequests = [];
    this.proxiedRequests = [];
  }
}
