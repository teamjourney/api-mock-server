import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Request methods', () => {
  it('should support POST requests', async () => {
    server.mock(
      { path: '/post-request', method: 'POST' },
      { status: 201 },
    );

    const response = await chakram.post('/post-request');

    expect(response).to.have.status(201);
  });

  it('should support PUT requests', async () => {
    server.mock(
      { path: '/put-request', method: 'PUT' },
      { status: 204 },
    );

    const response = await chakram.put('/put-request');

    expect(response).to.have.status(204);
  });

  it('should support DELETE requests', async () => {
    server.mock(
      { path: '/delete-request', method: 'DELETE' },
      { status: 204 },
    );

    const response = await chakram.delete('/delete-request');

    expect(response).to.have.status(204);
  });

  it('should support HEAD requests', async () => {
    server.mock(
      { path: '/head-request', method: 'HEAD' },
      { status: 204 },
    );

    const response = await chakram.head('/head-request');

    expect(response).to.have.status(204);
  });

  it('should match correctly if multiple mocks are specified with the same path but different methods', async () => {
    server.mock(
      { path: '/something', method: 'GET' },
      { status: 200 },
    );
    server.mock(
      { path: '/something', method: 'POST' },
      { status: 201 },
    );

    const firstResponse = await chakram.get('/something');
    const secondResponse = await chakram.post('/something');

    expect(firstResponse).to.have.status(200);
    expect(secondResponse).to.have.status(201);
  });
});
