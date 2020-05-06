import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Response statuses', () => {
  it('should support different return statuses', async () => {
    server.mock({ path: '/created-status' }, { status: 201 });
    server.mock({ path: '/not-found-status' }, { status: 404 });

    const createdResponse = await chakram.get('/created-status');
    const notFoundResponse = await chakram.get('/not-found-status');

    expect(createdResponse).to.have.status(201);
    expect(notFoundResponse).to.have.status(404);
  });

  it('should default to response status of 200', async () => {
    server.mock({ path: '/something' });

    const response = await chakram.get('/something');

    expect(response).to.have.status(200);
  });
});
