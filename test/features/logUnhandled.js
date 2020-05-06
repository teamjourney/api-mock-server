import chakram from 'chakram';
import { assert } from 'chai';

import server from '../harness';

describe('Feature: Log unhandled requests', () => {
  it('should return any unhandled paths', async () => {
    await chakram.get('/endpoint');

    const requests = server.getUnhandledRequests();

    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });

  it('should not include any requests that were handled', async () => {
    server.mock(
      { path: '/some-endpoint' },
    );

    await chakram.get('/endpoint');
    await chakram.get('/some-endpoint');

    const requests = server.getUnhandledRequests();
    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });

  it('should return any unmatched requests based on request body', async () => {
    await chakram.post('/endpoint', { data: 'something else' });

    const requests = server.getUnhandledRequests();
    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'POST',
          body: {
            data: 'something else',
          },
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });

  it('should return any unmatched requests based on query string', async () => {
    await chakram.get('/endpoint?page=11');

    const requests = server.getUnhandledRequests();
    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
          query: {
            page: '11',
          },
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });

  it('should return any unmatched requests based on headers', async () => {
    await chakram.get('/endpoint', { headers: { 'X-Something': 'Something' } });

    const requests = server.getUnhandledRequests();
    const expected = [
      {
        request: {
          path: '/endpoint',
          method: 'GET',
          headers: {
            'x-something': 'Something',
          },
        },
      },
    ];

    assert.deepEqual(expected, requests);
  });
});
