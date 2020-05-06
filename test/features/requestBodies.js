import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Request bodies', () => {
  it('should support request bodies', async () => {
    server.mock(
      { path: '/post-request', method: 'POST', body: { data: 'something' } },
      { status: 201 },
    );

    const response = await chakram.post('/post-request', { data: 'something' });

    expect(response).to.have.status(201);
  });

  it('should support deeply nested request bodies', async () => {
    server.mock(
      { path: '/post-request', body: { data: { nested: 'something' } } },
      { status: 201 },
    );

    const response = await chakram.post('/post-request', { data: { nested: 'something' } });

    expect(response).to.have.status(201);
  });

  it('should not match incorrect deeply nested request bodies', async () => {
    server.mock(
      { path: '/post-request', body: { data: { nested: 'something' } } },
      { status: 201 },
    );

    const response = await chakram.post('/post-request', { data: { nested: 'something else' } });

    expect(response).to.have.status(501);
  });

  it('should not match request with request body on empty request', async () => {
    server.mock(
      { path: '/post-request', method: 'POST', body: { data: 'something' } },
      { status: 201 },
    );

    const response = await chakram.post('/post-request');

    expect(response).to.have.status(501);
  });

  it('should not match request with request body on incorrect request', async () => {
    server.mock(
      { path: '/post-request', method: 'POST', body: { data: 'something' } },
      { status: 201 },
    );

    const response = await chakram.post('/post-request', { data: 'something else' });

    expect(response).to.have.status(501);
  });

  it('should match any request to the URL if no body was specified', async () => {
    server.mock(
      { path: '/post-request', method: 'POST' },
      { status: 201 },
    );

    const response = await chakram.post('/post-request', { data: 'something' });

    expect(response).to.have.status(201);
  });

  it('should default to POST if there is a body specified', async () => {
    server.mock(
      { path: '/post-request', body: { data: 'something' } },
      { status: 201 },
    );

    const response = await chakram.post('/post-request', { data: 'something' });

    expect(response).to.have.status(201);
  });

  it('should match correctly if multiple mocks are specified with the same path but different bodies', async () => {
    server.mock(
      { path: '/something', body: { data: 'something' } },
      { status: 200 },
    );
    server.mock(
      { path: '/something', body: { data: 'something else' } },
      { status: 201 },
    );

    const firstResponse = await chakram.post('/something', { data: 'something' });
    const secondResponse = await chakram.post('/something', { data: 'something else' });

    expect(firstResponse).to.have.status(200);
    expect(secondResponse).to.have.status(201);
  });
});
