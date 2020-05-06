import chakram from 'chakram';
import { assert } from 'chai';

import server from '../harness';

describe('Feature: Log handled requests', () => {
  it('should return any handled paths', async () => {
    server.mock({ path: '/endpoint' });

    await chakram.get('/endpoint');

    const requests = server.getHandledRequests();

    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
        },
        response: {
          status: 200,
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });

  it('should not include any requests that were unhandled', async () => {
    server.mock({ path: '/endpoint' });

    await chakram.get('/endpoint');
    await chakram.get('/another-endpoint');

    const requests = server.getHandledRequests();

    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
        },
        response: {
          status: 200,
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });

  it('should return any handled requests with response body', async () => {
    server.mock(
      { path: '/endpoint' },
      { status: 201, body: { data: 'something' } },
    );

    await chakram.get('/endpoint');

    const requests = server.getHandledRequests();

    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
        },
        response: {
          status: 201,
          body: {
            data: 'something',
          },
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });

  it('should return any handled requests with response headers', async () => {
    server.mock(
      { path: '/endpoint' },
      { status: 201, headers: { 'x-data': 'something' } },
    );

    await chakram.get('/endpoint');

    const requests = server.getHandledRequests();

    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
        },
        response: {
          status: 201,
          headers: {
            'x-data': 'something',
          },
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });
});
