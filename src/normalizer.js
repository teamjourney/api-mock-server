import { pickBy, identity } from 'lodash';
import { parse } from 'querystring';

const normalizeMethod = (request) => (request.body ? 'POST' : 'GET');
const normalizeQuery = (request) => {
  const pathParts = request.path.split('?');
  return (pathParts.length > 1) ? parse(pathParts[1]) : undefined;
};
const normalizePath = (request) => request.path.split('?')[0];

export const normalizeRequest = (request) => pickBy({
  method: normalizeMethod(request),
  query: normalizeQuery(request),
  ...request,
  path: normalizePath(request),
}, identity);

export const normalizeResponse = (response) => pickBy({
  status: 200,
  headers: null,
  ...response,
}, identity);
