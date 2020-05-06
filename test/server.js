import chakram, { expect } from 'chakram';
import { assert } from 'chai';

import server from '../src/server';

describe('Server', () => {
  describe('start', () => {
    afterEach(() => server.stop());

    it('should respond to requests on the specified port', async () => {
      const port = 9123;

      await server.start(port);

      const response = await chakram.get(`http://localhost:${port}/`);

      expect(response).to.have.status(501);
    });

    it('should default to a randomly assigned port', async () => {
      const serverInfo = await server.start();

      const { port } = serverInfo.address();

      const response = await chakram.get(`http://localhost:${port}/`);

      expect(response).to.have.status(501);
    });
  });

  describe('reset', () => {
    const defaultPort = 9100;

    before(() => {
      chakram.setRequestDefaults({
        baseUrl: `http://localhost:${defaultPort}`,
      });
    });

    after(() => chakram.clearRequestDefaults());

    afterEach(() => server.stop());

    beforeEach(async () => server.start(defaultPort));

    it('should support resetting routes', async () => {
      server.mock({ path: '/does-exist' }, { status: 200 });
      server.reset();

      const response = await chakram.get('/does-exist');

      expect(response).to.have.status(501);
    });
  });

  describe('mock', () => {
    const defaultPort = 9100;

    before(() => {
      chakram.setRequestDefaults({
        baseUrl: `http://localhost:${defaultPort}`,
      });

      server.start(defaultPort);
    });

    beforeEach(async () => server.reset());

    after(() => {
      server.stop();
      chakram.clearRequestDefaults();
    });

    describe('All request methods', () => {
      it('should return 501 Not Implemented for any unregistered routes', async () => {
        const response = await chakram.get('/does-not-exist');

        expect(response).to.have.status(501);
      });

      it('should support matching based on URL', async () => {
        server.mock({ path: '/does-exist' }, { status: 200 });

        const response = await chakram.get('/does-exist');

        expect(response).to.have.status(200);
      });

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

      it('should throw an exception with multiple identical mock requests', () => {
        server.mock({ path: '/endpoint' });

        const message = `Request matching {
  "method": "GET",
  "path": "/endpoint"
} already mocked`;

        assert.throws(() => server.mock({ path: '/endpoint' }), message);
      });

      it('should support response bodies', async () => {
        server.mock({ path: '/return-something' }, { body: { field: 'value' } });

        const response = await chakram.get('/return-something');

        expect(response).to.have.json({ field: 'value' });
      });

      it('should support response headers', async () => {
        server.mock({ path: '/return-headers' }, { headers: { 'X-Something': 'value' } });

        const response = await chakram.get('/return-headers');

        expect(response).to.have.header('X-Something', 'value');
      });

      it('should support multiple response headers', async () => {
        server.mock({ path: '/return-headers' }, { headers: { 'X-One': 'value', 'X-Two': 'value' } });

        const response = await chakram.get('/return-headers');

        expect(response).to.have.header('X-One', 'value');
        expect(response).to.have.header('X-Two', 'value');
      });

      describe('header matching', () => {
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
    });

    describe('GET requests', () => {
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

    describe('POST requests', () => {
      it('should support POST requests', async () => {
        server.mock(
          { path: '/post-request', method: 'POST' },
          { status: 201 },
        );

        const response = await chakram.post('/post-request');

        expect(response).to.have.status(201);
      });

      it('should not match unmocked POST requests', async () => {
        const response = await chakram.post('/post-request');

        expect(response).to.have.status(501);
      });

      it('should support POST request bodies', async () => {
        server.mock(
          { path: '/post-request', method: 'POST', body: { data: 'something' } },
          { status: 201 },
        );

        const response = await chakram.post('/post-request', { data: 'something' });

        expect(response).to.have.status(201);
      });

      it('should support deeply nested POST request bodies', async () => {
        server.mock(
          { path: '/post-request', body: { data: { nested: 'something' } } },
          { status: 201 },
        );

        const response = await chakram.post('/post-request', { data: { nested: 'something' } });

        expect(response).to.have.status(201);
      });

      it('should not match incorrect deeply nested POST request bodies', async () => {
        server.mock(
          { path: '/post-request', body: { data: { nested: 'something' } } },
          { status: 201 },
        );

        const response = await chakram.post('/post-request', { data: { nested: 'something else' } });

        expect(response).to.have.status(501);
      });

      it('should not match POST request with request body on empty request', async () => {
        server.mock(
          { path: '/post-request', method: 'POST', body: { data: 'something' } },
          { status: 201 },
        );

        const response = await chakram.post('/post-request');

        expect(response).to.have.status(501);
      });

      it('should not match POST request with request body on incorrect request', async () => {
        server.mock(
          { path: '/post-request', method: 'POST', body: { data: 'something' } },
          { status: 201 },
        );

        const response = await chakram.post('/post-request', { data: 'something else' });

        expect(response).to.have.status(501);
      });

      it('should match any POST request to the URL if no body was specified', async () => {
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
          { path: '/something', body: { data: 'something else'} },
          { status: 201 },
        );

        const firstResponse = await chakram.post('/something', { data: 'something' });
        const secondResponse = await chakram.post('/something', { data: 'something else' });

        expect(firstResponse).to.have.status(200);
        expect(secondResponse).to.have.status(201);
      });
    });

    describe('PUT requests', () => {
      it('should support PUT requests', async () => {
        server.mock(
          { path: '/put-request', method: 'PUT' },
          { status: 204 },
        );

        const response = await chakram.put('/put-request');

        expect(response).to.have.status(204);
      });
    });

    describe('DELETE requests', () => {
      it('should support DELETE requests', async () => {
        server.mock(
          { path: '/delete-request', method: 'DELETE' },
          { status: 204 },
        );

        const response = await chakram.delete('/delete-request');

        expect(response).to.have.status(204);
      });
    });

    describe('HEAD requests', () => {
      it('should support HEAD requests', async () => {
        server.mock(
          { path: '/head-request', method: 'HEAD' },
          { status: 204 },
        );

        const response = await chakram.head('/head-request');

        expect(response).to.have.status(204);
      });
    });
  });

  describe('getUnhandledRequests', () => {
    const defaultPort = 9100;

    before(() => {
      chakram.setRequestDefaults({
        baseUrl: `http://localhost:${defaultPort}`,
      });

      server.start(defaultPort);
    });

    beforeEach(async () => server.reset());

    after(() => {
      server.stop();
      chakram.clearRequestDefaults();
    });

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
});
