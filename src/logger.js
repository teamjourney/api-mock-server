import { isEmpty, omit } from 'lodash';

const ignoredHeaders = ['accept', 'connection', 'host', 'content-length', 'content-type'];

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

const convertProxiedResponseToMockResponse = (proxiedResponse, proxiedResponseBody) => {
  const body = proxiedResponseBody.toString('utf8');

  const response = {
    status: proxiedResponse.statusCode,
    headers: proxiedResponse.headers,
    body: body ? JSON.parse(body) : body,
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

  logProxiedRequest(expressRequest, proxiedResponse, proxiedResponseBody) {
    this.proxiedRequests.push({
      request: convertExpressRequestToMockRequest(expressRequest),
      response: convertProxiedResponseToMockResponse(proxiedResponse, proxiedResponseBody),
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
