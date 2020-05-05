import { parse } from 'querystring';

const normalizeMethod = (request) => (request.body ? 'POST' : 'GET');
const normalizeQuery = (request) => {
  const pathParts = request.path.split('?');
  return (pathParts.length > 1) ? parse(pathParts[1]) : undefined;
};
const normalizePath = (request) => request.path.split('?')[0];

export const normalizeRequest = (request) => ({
  method: normalizeMethod(request),
  query: normalizeQuery(request),
  ...request,
  path: normalizePath(request),
});

export const normalizeResponse = (response) => ({
  status: 200,
  headers: [],
  ...response,
});
