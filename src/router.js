import { Router as ExpressRouter } from 'express';
import { groupBy, forIn, find } from 'lodash';

import { normalizeRequest, normalizeResponse } from './normalizer';
import handler from './handler';
import matches from './matcher';

export default class Router {
  constructor(logger) {
    this.logger = logger;
    this.routes = [];
  }

  addToRouter(path, method, possibleRoutes) {
    this.router[method.toLowerCase()](path, handler(possibleRoutes, this.logger));
  }

  build() {
    this.router = ExpressRouter();

    const byPath = groupBy(this.routes, 'request.path');

    forIn(byPath, (routesForPath, path) => {
      const byMethod = groupBy(routesForPath, 'request.method');

      forIn(byMethod, (routesForMethod, method) => {
        this.addToRouter(path, method, routesForMethod);
      });
    });
  }

  add(request, response) {
    const normalized = {
      request: normalizeRequest(request),
      response: normalizeResponse(response),
    };

    if (find(this.routes, normalized)) {
      throw Error(`Request matching ${JSON.stringify(normalized.request, 0, 2)} already mocked`);
    }

    this.routes.push(normalized);
    this.build();
  }

  get() {
    return this.routes;
  }

  reset(requests) {
    if (requests) {
      requests.forEach((request) => {
        const normalized = normalizeRequest(request);

        this.routes = this.routes.filter((route) => !(normalized.path === route.request.path
          && normalized.method === route.request.method
          && matches(normalized, route.request)));
      });
    } else {
      this.routes = [];
    }

    this.build();
  }

  middleware(request, response, next) {
    if (!this.router) {
      this.build();
    }

    this.router(request, response, next);
  }

  catchAllMiddleware(request, response) {
    this.logger.logUnhandledRequest(request);

    response.status(501).end();
  }
}
