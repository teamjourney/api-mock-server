import chakram, { expect } from 'chakram';
import { assert } from 'chai';

import server from '../harness';

describe('Feature: Reset', () => {
  it('should support resetting all routes', async () => {
    server.mock({ path: '/does-exist' }, { status: 200 });
    server.reset();

    const response = await chakram.get('/does-exist');

    expect(response).to.have.status(501);
  });

  it('should support resetting an individual mock', async () => {
    server.mock({ path: '/my-endpoint', method: 'GET' }, { status: 200 });
    server.mock({ path: '/my-other-endpoint', method: 'GET' }, { status: 200 });

    server.reset([{ path: '/my-endpoint', method: 'GET' }]);

    const response = await chakram.get('/my-endpoint');
    const anotherResponse = await chakram.get('/my-other-endpoint');

    expect(response).to.have.status(501);
    expect(anotherResponse).to.have.status(200);
  });

  it('should only reset the mock that matches exactly', async () => {
    server.mock({ path: '/my-endpoint', method: 'POST', body: { data: 'something' } }, { status: 200 });
    server.mock({ path: '/my-endpoint', method: 'POST', body: { data: 'something else' } });

    server.reset([{ path: '/my-endpoint', method: 'POST', body: { data: 'something' } }]);

    const response = await chakram.post('/my-endpoint', { data: 'something' });
    const anotherResponse = await chakram.post('/my-endpoint', { data: 'something else' });

    expect(response).to.have.status(501);
    expect(anotherResponse).to.have.status(200);
  });

  it('should handle default values in mocks', async () => {
    server.mock({ path: '/my-endpoint', body: { data: 'something' } }, { status: 200 });
    server.mock({ path: '/my-endpoint', body: { data: 'something else' } });

    server.reset([{ path: '/my-endpoint', body: { data: 'something' } }]);

    const response = await chakram.post('/my-endpoint', { data: 'something' });
    const anotherResponse = await chakram.post('/my-endpoint', { data: 'something else' });

    expect(response).to.have.status(501);
    expect(anotherResponse).to.have.status(200);
  });

  it('should support resetting multiple mocks', async () => {
    server.mock({ path: '/my-endpoint', body: { data: 'something' } }, { status: 200 });
    server.mock({ path: '/my-endpoint', body: { data: 'something else' } });

    server.reset([
      { path: '/my-endpoint', body: { data: 'something' } },
      { path: '/my-endpoint', body: { data: 'something else' } },
    ]);

    const response = await chakram.post('/my-endpoint', { data: 'something' });
    const anotherResponse = await chakram.post('/my-endpoint', { data: 'something else' });

    expect(response).to.have.status(501);
    expect(anotherResponse).to.have.status(501);
  });

  it('should reset uncalled logs for the specified mock', async () => {
    server.mock({ path: '/my-endpoint' });

    server.reset([{ path: '/my-endpoint' }]);

    assert.deepEqual([], server.getUncalledMocks());
  });

  it('should throw an error if no mock exists', () => {
    const message = `Request matching {
  "method": "GET",
  "path": "/my-endpoint"
} was not mocked`;

    assert.throws(() => server.reset([{ path: '/my-endpoint' }]), message);
  });
});
