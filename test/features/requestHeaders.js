import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Request headers', () => {
  it('should match if header is mocked', async () => {
    server.mock({ path: '/something', headers: { Auth: 'ABC' } });

    const response = await chakram.get('/something', {
      headers: {
        Auth: 'ABC',
      },
    });

    expect(response).to.have.status(200);
  });

  it('should not match no header if header is mocked', async () => {
    server.mock({ path: '/something', headers: { Auth: 'ABC' } });

    const response = await chakram.get('/something');

    expect(response).to.have.status(501);
  });

  it('should not match incorrect header if header is mocked', async () => {
    server.mock({ path: '/something', headers: { Auth: 'ABC' } });

    const response = await chakram.get('/something', {
      headers: {
        Auth: 'XYZ',
      },
    });

    expect(response).to.have.status(501);
  });

  it('should match all if multiple headers are mocked', async () => {
    server.mock({ path: '/something', headers: { Auth: 'ABC', Custom: '123' } });

    const response = await chakram.get('/something', {
      headers: {
        Auth: 'ABC',
        Custom: '123',
      },
    });

    expect(response).to.have.status(200);
  });

  it('should not match only some headers if multiple headers are mocked', async () => {
    server.mock({ path: '/something', headers: { Auth: 'ABC', Custom: '123' } });

    const response = await chakram.get('/something', {
      headers: {
        Auth: 'XYZ',
      },
    });

    expect(response).to.have.status(501);
  });

  it('should match any header if not specified', async () => {
    server.mock({ path: '/something' });

    const response = await chakram.get('/something', {
      headers: {
        Auth: 'ABC',
        Custom: '123',
      },
    });

    expect(response).to.have.status(200);
  });

  it('should match correctly if multiple mocks are specified with the same path but different headers', async () => {
    server.mock(
      { path: '/something', headers: { 'x-data': 'something' } },
      { status: 201 },
    );
    server.mock(
      { path: '/something', headers: { 'x-data': 'something else' } },
      { status: 204 },
    );

    const firstResponse = await chakram.get('/something', { headers: { 'x-data': 'something' } });
    const secondResponse = await chakram.get('/something', { headers: { 'x-data': 'something else' } });

    expect(firstResponse).to.have.status(201);
    expect(secondResponse).to.have.status(204);
  });
});
