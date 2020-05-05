import matches from './matcher';

export default (expectedRequest, expectedResponse) => (actualRequest, actualResponse) => {
  let status = 501;
  let body;
  let headers;

  if (matches(expectedRequest, actualRequest)) {
    status = expectedResponse.status;
    body = expectedResponse.body;
    headers = expectedResponse.headers;
  }

  actualResponse.set(headers).status(status).json(body);
};
