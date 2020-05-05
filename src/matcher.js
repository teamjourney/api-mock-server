import { isEqual } from 'lodash';

const matchField = (expected, actual, field) => !expected[field]
  || isEqual(actual[field], expected[field]);

const matchBody = (expected, actual) => matchField(expected, actual, 'body');
const matchQuery = (expected, actual) => matchField(expected, actual, 'query');
const matchHeaders = (expected, actual) => !expected.headers
  || Object.keys(expected.headers).every((key) => expected.headers[key] === actual.get(key));

export default (expected, actual) => matchBody(expected, actual)
  && matchQuery(expected, actual)
  && matchHeaders(expected, actual);
