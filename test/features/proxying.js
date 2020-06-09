import chakram, { expect } from 'chakram';
import chai, { assert } from 'chai';
import chaiSubset from 'chai-subset';
import express from 'express';
import { isEqual } from 'lodash';

import { MockServer } from '../../src';

describe('Feature: Proxying', () => {
  const mockPort = 9101;
  const proxiedPort = 9102;

  let proxiedServer;
  let mockServer;

  before(() => {
    chai.use(chaiSubset);
  });

  beforeEach(async () => {
    proxiedServer = new MockServer();
    mockServer = new MockServer();

    proxiedServer.start(proxiedPort);
    mockServer.start(mockPort, `http://localhost:${proxiedPort}`);

    chakram.setRequestDefaults({
      baseUrl: `http://localhost:${mockPort}`,
    });
  });

  afterEach(() => {
    chakram.clearRequestDefaults();
    proxiedServer.stop();
    mockServer.stop();
  });

  it('should proxy requests and return response codes', async () => {
    proxiedServer.mock({ path: '/' });

    const response = await chakram.get('/');

    expect(response).to.have.status(200);
  });

  it('should return the whole response from the proxy', async () => {
    proxiedServer.mock({ path: '/' }, { status: 201, body: { data: 'something' }, headers: { 'X-Header': 'Something' } });

    const response = await chakram.get('/');

    expect(response).to.have.status(201);
    expect(response).to.have.json({ data: 'something' });
    expect(response).to.have.header('X-Header', 'Something');
  });

  it('should proxy request bodies', async () => {
    proxiedServer.mock({ path: '/', body: { data: 'some data' } });

    const response = await chakram.post('/', { data: 'some data' });

    expect(response).to.have.status(200);
  });

  it('should proxy response errors', async () => {
    const response = await chakram.get('/');

    expect(response).to.have.status(501);
  });

  it('should preserve URL encoding when proxying if set', async () => {
    proxiedServer.stop();

    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.post('/', (request, response) => {
      if (isEqual(request.body, { data: 'something' })) {
        response.status(200).end();
      }

      response.status(500).end();
    });

    const server = await app.listen(proxiedPort);

    const response = await chakram.post('/', null, { json: false, form: { data: 'something' } });

    server.close();
    await proxiedServer.start(proxiedPort);

    expect(response).to.have.status(200);
  });

  it('should still handle mocked requests', async () => {
    proxiedServer.mock({ path: '/' }, { status: 201 });
    mockServer.mock({ path: '/' }, { status: 204 });

    const response = await chakram.get('/');

    expect(response).to.have.status(204);
  });

  it('should proxy requests that match a route but not request shape', async () => {
    proxiedServer.mock({ path: '/', body: { data: 'something' } }, { status: 201 });
    mockServer.mock({ path: '/', body: { data: 'something else' } }, { status: 204 });

    const response = await chakram.post('/', { data: 'something' });

    expect(response).to.have.status(201);
  });

  it('should record proxied requests', async () => {
    proxiedServer.mock({ path: '/' }, { body: { data: 'something' } });

    await chakram.get('/');

    const requests = mockServer.getProxiedRequests();

    const expected = [
      {
        request: {
          path: '/',
          method: 'GET',
        },
        response: {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: {
            data: 'something',
          },
        },
      },
    ];

    assert.containSubset(requests, expected);
  });
});
