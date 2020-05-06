import { isEmpty, omit } from 'lodash';

const ignoredHeaders = ['accept', 'connection', 'host', 'content-length', 'content-type'];

let unhandledRequests = [];

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

const logUnhandledRequest = (expressRequest) => {
  unhandledRequests.push({
    request: convertExpressRequestToMockRequest(expressRequest),
  });
};

const getUnhandledRequests = () => unhandledRequests;

const reset = () => {
  unhandledRequests = [];
};

export default {
  logUnhandledRequest,
  getUnhandledRequests,
  reset,
};
