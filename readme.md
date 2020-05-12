# API Mock Server

API mocking library that runs as a real HTTP server in Node.js

API Mock Server can be used to test code that performs HTTP requests without
calling the real service and allows full control over the request and responses.

## How does it work?

API Mock Server runs on a real port and responds to real HTTP requests. This
means that it is ideal for testing or simulating HTTP requests made by any 
language or system without interacting with the code directly.

This approach differs to projects such as [nock](https://github.com/nock/nock)
which work by overriding Node's `http.request` function.

Control of the mock is handled in Node.js and works well with testing frameworks
such as [Mocha](https://mochajs.org/) or [Jasmine](https://jasmine.github.io/).

## Install

TBC

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

        server.stop();
    });
```
