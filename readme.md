# API Mock Server

API mocking library that runs as a real HTTP server in Node.js

API Mock Server can be used to test code that performs HTTP requests without
calling the real service and allows full control over the request and responses.

## How it works

API Mock Server runs on a real port and responds to real HTTP requests. This
means that it is ideal for testing or simulating HTTP requests made by any
language or system without interacting with its code directly.

This approach differs to projects such as [nock](https://github.com/nock/nock)
which work by overriding Node's `http.request` function.

Control of the mock is handled in Node.js and works well with testing frameworks
such as [Mocha](https://mochajs.org/) or [Jasmine](https://jasmine.github.io/).

## Install

TBC

### Node version support

Tested on Node.js 10.x and 12.x

## Usage

```javascript
const server = require('api-mock-server');

server.start(9001)
    .then(() => {
        server.mock(
            { path: '/my-endpoint' },
            { body: { data: 'something' } },
        );

        // Call GET http://localhost:9001/my-endpoint here
        // It will return with a JSON body of { data: 'something' }

        server.stop();
    });
```

### Starting the server

Calling `start` with a port number allows you to specify a port.

```javascript
server.start(9002)
```

Calling `start` without a port will attempt to start on a random port. It
returns a promise which resolves to `http.Server` object. This allows for
finding out the port it is being run on.

```javascript
server.start()
    .then((httpServer) => {
        const { port } = serverInfo.address();

        ...
    });
```

### Stopping the server

Calling `stop` will stop the server.

```javascript
server.stop();
```

### Resetting the server

Calling `reset` will keep the server running but will clear all mocks and logged
requests.

```javascript
server.reset();
```

### Defining mocks

Mocking requests and responses simply involves calling `mock` with two
arguments. The first defines the request shape and the second the response
shape.

The simplest call would be

```javascript
server.mock({ path: '/my-endpoint' });
```

This would handle any GET requests (the default method) to `/my-endpoint` and
return am empty 200 response (the default response status).

There are numerous ways to configure specific behaviours that are
defined below.

#### Unmocked requests

Any unmocked requests will return an empty 501 (Not Implemented) response.

#### Duplicate mocks

Calling `mock` with a request shape that matches an already mocked request will
throw an error.

```javascript
server.mock({ path: '/my-endpoint' });
server.mock({ path: '/my-endpoint' });
```

Will throw an error with the following message:

```
Request matching {
    "method": "GET",
    "path": "/my-endpoint"
} already mocked
```

### Mocking requests

#### Specifying paths

The `path` is the only required property when defining the request shape.

```javascript
server.mock({ path: '/my-endpoint' });
```

#### Specifying HTTP methods

Providing a `method` will match only requests using that method. If no `method`
is specified and the request has a body (see below) then the method defaults to
POST, otherwise it defaults to GET.

```javascript
server.mock({ path: '/my-endpoint', method: 'DELETE' });
```

The `method` string is case-insensitive.

Supported methods are `GET`, `POST`, `PUT`, `DELETE` and `HEAD`.

Multiple mocks defined on the same endpoint with different methods are treated
as independent mocks.

#### Specifying query strings

Query strings can be mocked in 2 ways; either by adding the query string to the
path field or by providing a separate object on the `query` field.

```javascript
server.mock({ path: '/my-endpoint?page=1&perPage=20' });
```

or

```javascript
server.mock({ path: '/my-endpoint', query: { page: '1', perPage: '20' } });
```

In the second style, the object values should always be specified as strings.

If no query string is specified in the mock then any request to that endpoint
will match, regardless of the query string.

#### Specifying request bodies

Request bodies can be mocked by providing the `body` property. Deeply nested
object structures will be matched recursively.

```javascript
server.mock({ path: '/my-endpoint', body: { foo: 'bar' } });
```

The data types of the mock and the request fields need to match exactly. This is
by design, as many real servers are sensitive to this.

If a request body is specified but with no `method`, the method will default to
POST.

If no request body is specified in the mock then any request to that endpoint
using that method will match, regardless of the request body.

#### Specifying request headers

Request headers can be mocked by providing the `headers` property with header
type and value being object properties and values respectively.

```javascript
server.mock({ path: '/my-endpoint', headers: { 'X-Foo', 'bar' } });
```

Requests will be handled if all the headers specified in the mock match. Any
other headers on the request will match, regardless of the headers.

## Current Limitations

* There is no support for non-JSON request or response bodies
* The server cannot be run with any hostname other than `localhost`
* The path matcher uses Express routes under the hood so theoretically any
pattern that Express supports should work, but this functionality is untested
