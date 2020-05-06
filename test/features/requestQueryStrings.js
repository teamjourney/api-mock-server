import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Request query strings', () => {
  it('should match if query string is mocked', async () => {
    server.mock({ path: '/something', query: { page: '1', perPage: '20' } });

    const response = await chakram.get('/something?page=1&perPage=20');

    expect(response).to.have.status(200);
  });

  it('should not match no query string if query string is mocked', async () => {
    server.mock({ path: '/something', query: { page: 1, perPage: 20 } });

    const response = await chakram.get('/something');

    expect(response).to.have.status(501);
  });

  it('should not match incorrect query string if no query string is mocked', async () => {
    server.mock({ path: '/something', query: { page: 1, perPage: 20 } });

    const response = await chakram.get('/something?page=2&perPage=20');

    expect(response).to.have.status(501);
  });

  it('should match any query string if not specified', async () => {
    server.mock({ path: '/something' });

    const response = await chakram.get('/something?page=1&perPage=20');

    expect(response).to.have.status(200);
  });

  it('should match correctly if multiple mocks are specified with the same path but different query strings', async () => {
    server.mock(
      { path: '/something', query: { field: 'value' } },
      { status: 200 },
    );
    server.mock(
      { path: '/something', query: { field: 'another value' } },
      { status: 201 },
    );

    const firstResponse = await chakram.get('/something?field=value');
    const secondResponse = await chakram.get('/something?field=another value');

    expect(firstResponse).to.have.status(200);
    expect(secondResponse).to.have.status(201);
  });

  it('should auto detect query string parameters', async () => {
    server.mock({ path: '/something?page=1&perPage=20' });

    const response = await chakram.get('/something?page=1&perPage=20');

    expect(response).to.have.status(200);
  });
});
