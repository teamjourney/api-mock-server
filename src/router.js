import { Router } from 'express';

import { normalizeRequest, normalizeResponse } from './normalizer';
import handler from './handler';

const defaultRoute = { request: { path: '*' }, response: { status: 501 } };

let routes = [];
let router;

const addToRouter = (route) => {
  const request = normalizeRequest(route.request);
  const response = normalizeResponse(route.response);

  const method = request.method.toLowerCase();

  router[method](request.path, handler(request, response));
};

const build = () => {
  router = Router();

  routes.forEach(addToRouter);

  addToRouter(defaultRoute);
};

const add = (request, response) => {
  routes.push({ request, response });
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
