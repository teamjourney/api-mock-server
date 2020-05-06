import chakram from 'chakram';
import { assert } from 'chai';

import server from '../harness';

describe('Feature: Log uncalled mocks', () => {
  it('should return all uncalled mocks', () => {
    server.mock({ path: '/endpoint' });

    const uncalled = server.getUncalledMocks();

    const expected = [
      {
        request: {
          method: 'GET',
          path: '/endpoint',
        },
        response: {
          status: 200,
        },
      },
    ];

    assert.deepEqual(expected, uncalled);
  });

  it('should not return any handled mocks', async () => {
    server.mock({ path: '/endpoint' });
    server.mock({ path: '/another-endpoint' });

    await chakram.get('/another-endpoint');

    const uncalled = server.getUncalledMocks();

    const expected = [
      {
        request: {
          method: 'GET',
          path: '/endpoint',
        },
        response: {
          status: 200,
        },
      },
    ];

    assert.deepEqual(expected, uncalled);
  });

  it('should not return any handled mocks with request bodies', async () => {
    server.mock({ path: '/endpoint', body: { data: 'something' } });
    server.mock({ path: '/another-endpoint', body: { data: 'something else' } });

    await chakram.post('/another-endpoint', { data: 'something else' });

    const uncalled = server.getUncalledMocks();

    const expected = [
      {
        request: {
          body: {
            data: 'something',
          },
          method: 'POST',
          path: '/endpoint',
        },
        response: {
          status: 200,
        },
      },
    ];

    assert.deepEqual(expected, uncalled);
  });
});
