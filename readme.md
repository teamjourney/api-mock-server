# API Mock Server

API mocking library that runs as a real HTTP server in Node.js

API Mock Server can be used to test code that performs HTTP requests without
calling the real service and allows full control over the request and responses.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [How it works](#how-it-works)
- [Install](#install)
  - [Node version support](#node-version-support)
- [Usage](#usage)
  - [NodeJS](#nodejs)
  - [ES6](#es6)
  - [Multiple instances (optional)](#multiple-instances-optional)
  - [Starting the server](#starting-the-server)
  - [Stopping the server](#stopping-the-server)
  - [Resetting the server](#resetting-the-server)
  - [Defining mocks](#defining-mocks)
    - [Unmocked requests](#unmocked-requests)
    - [Duplicate mocks](#duplicate-mocks)
  - [Mocking requests](#mocking-requests)
    - [Specifying paths](#specifying-paths)
    - [Specifying HTTP methods](#specifying-http-methods)
    - [Specifying query strings](#specifying-query-strings)
    - [Specifying request bodies](#specifying-request-bodies)
    - [Specifying request headers](#specifying-request-headers)
  - [Mocking Responses](#mocking-responses)
    - [Specifying response statuses](#specifying-response-statuses)
    - [Specifying response bodies](#specifying-response-bodies)
    - [Specifying response headers](#specifying-response-headers)
  - [Recording](#recording)
    - [Getting unhandled requests](#getting-unhandled-requests)
    - [Getting handled requests](#getting-handled-requests)
    - [Getting uncalled mocks](#getting-uncalled-mocks)
  - [Proxying requests](#proxying-requests)
- [Current Limitations](#current-limitations)
- [Credits](#credits)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## How it works

API Mock Server runs on a real port and responds to real HTTP requests. This
means that it is ideal for testing or simulating HTTP requests made by any
language or system without interacting with its code directly.

This approach differs to projects such as [nock](https://github.com/nock/nock)
which work by overriding Node's `http.request` function.

Control of the mock is handled in Node.js and works well with testing frameworks
such as [Mocha](https://mochajs.org/) or [Jasmine](https://jasmine.github.io/).

## Install

```sh
npm install --save-dev @teamjourney/api-mock-server
```

or

```sh
yarn add --dev @teamjourney/api-mock-server
```

### Node version support

Tested on Node.js 10.x and 12.x

## Usage

### NodeJS

```javascript
const server = require('@teamjourney/api-mock-server').default;

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

### ES6

```javascript
import server from '@teamjourney/api-mock-server';

const init = async () => {
    await server.start(9001);

    server.mock(
        { path: '/my-endpoint' },
        { body: { data: 'something' } },
    );

    // Call GET http://localhost:9001/my-endpoint here
    // It will return with a JSON body of { data: 'something' }

    server.stop();
};

init();
```

### Multiple instances (optional)

It's possible (but optional) to create multiple instances of the mock server
running on different ports, each with their own routes and logging.

Use instances of the `MockServer` class to achieve this. The below example is
in ES6 for simplicity.

```javascript
import { MockServer } from '@teamjourney/api-mock-server';

const server = new MockServer();
```

`MockServer` has the same interface as the core library functions so all of the
below functions should work.

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

It's also possible to reset specific mocks by passing an array to `reset`.

```javascript
server.reset([ { path: '/my-endpoint' } ]);
```

This will remove the mock as well as removing it from the uncalled mocks list.
If the mock has been called however, it will still appear in the called mocks
list.

Trying to reset a mock that doesn't exist will fail silently.

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

### Mocking Responses

Customise the response for a particular mock by passing an object as the second
argument to `mock` to define the response shape.

The response argument is optional. If no response is provided the mock will
return a `200` status with an empty body.

#### Specifying response statuses

The response status can be set by providing a `status` property.

```javascript
server.mock({ path: '/my-endpoint' }, { status: 201 });
```

If no status is specified the response will default to `200`.

#### Specifying response bodies

The response body can be set by providing a `body` property.

```javascript
server.mock({ path: '/my-endpoint' }, { body: { foo: 'bar' } });
```

#### Specifying response headers

The response headers can be set by providing a `headers` property which should
be an object with header type and value being object properties and values
respectively.

```javascript
server.mock({ path: '/my-endpoint' }, { headers: { 'x-foo': 'bar' } });
```

The response will always contain the specified headers but may also contain
additional headers automatically added by the server.

### Recording

All mocks and requests are logged by the server which provides easy access to
this information in a format similar to the way mocks are defined. This
structure is intended to make adding and adjusting mocks easier.

#### Getting unhandled requests

To get any requests that were not handled by a mock, call
`getUnhandledRequests`.

```javascript
server.getUnhandledRequests();
```

This will return an array of requests in the order that they occurred. For
example:

```json
[
    {
        "request": {
            "path": "/my-endpoint",
            "method": "GET"
        }
    },
]
```

#### Getting handled requests

To get requests that were handled by mocks including what response was returned,
call `getHandledRequests`.

```javascript
server.getHandledRequests();
```

This will return an array of requests and responses in the order that they
occurred. For example:

```json
[
    {
        "request": {
            "path": "/my-endpoint",
            "method": "GET"
        },
        "response": {
            "status": 200
        }
    }
]
```

#### Getting uncalled mocks

To get a list of any mocks that have not been called, call `getUncalledMocks`.

```javascript
server.getUncalledMocks();
```

This will return an array of uncalled mocks in the order that they were defined.
For example:

```json
[
    {
        "request": {
            "path": "GET",
            "method": "/endpoint"
        },
        "response": {
            "status": 200
        }
    }
]
```

### Proxying requests

In some situations it maybe useful to be able to proxy requests that aren't
mocked to a real server.

```javascript
server.start(9001, 'http://realserver.com');
```

When a request is proxied the mock server will return the response exactly
as it was returned by the real server.

Both the request and the response are recorded and are available via the
`getProxiedRequests` method.

```javascript
server.getProxiedRequests();
```

Any mocks that match will be handled first and those requests won't be proxied.
This allows for selective mocking of APIs.

## Current Limitations

* There is no support for non-JSON request or response bodies
* The server cannot be run with any hostname other than `localhost`
* The path matcher uses Express routes under the hood so theoretically any
pattern that Express supports should work, but this functionality is untested

## Credits

This library was inspired and influenced by:

* [nock](https://github.com/nock/nock)
* [MockServer](https://www.mock-server.com/)
* [Stubborn](https://github.com/ybonnefond/stubborn)
* [Dyson](https://github.com/webpro/dyson)
* [mock-http-server](https://github.com/spreaker/node-mock-http-server)
* [Mockery](http://docs.mockery.io/en/latest/)

## License

[MIT](LICENSE)
