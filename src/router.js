import { Router } from 'express';
import { groupBy, forIn, find } from 'lodash';

import { normalizeRequest, normalizeResponse } from './normalizer';
import handler from './handler';
import logger from './logger';

let routes = [];
let router;

const addToRouter = (path, method, possibleRoutes) => {
  router[method.toLowerCase()](path, handler(possibleRoutes));
};

const build = () => {
  router = Router();

  const byPath = groupBy(routes, 'request.path');

  forIn(byPath, (routesForPath, path) => {
    const byMethod = groupBy(routesForPath, 'request.method');

    forIn(byMethod, (routesForMethod, method) => {
      addToRouter(path, method, routesForMethod);
    });
  });

  router.all('*', (request, response) => {
    logger.logUnhandledRequest(request);

    response.status(501).end();
  });
};

const add = (request, response) => {
  const normalized = {
    request: normalizeRequest(request),
    response: normalizeResponse(response),
  };

  if (find(routes, normalized)) {
    throw Error(`Request matching ${JSON.stringify(normalized.request, 0, 2)} already mocked`);
  }

  routes.push(normalized);
  build();
};

const reset = () => {
  routes = [];
  build();
};

const middleware = (request, response, next) => {
  if (!router) {
    build();
  }

  router(request, response, next);
};

export default {
  add,
  reset,
  middleware,
};
