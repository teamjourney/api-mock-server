import { assert } from 'chai';

import server from '../harness';

describe('Feature: No duplicate mocks', () => {
  it('should throw an exception with multiple identical mock requests', () => {
    server.mock({ path: '/endpoint' });

    const message = `Request matching {
  "method": "GET",
  "path": "/endpoint"
} already mocked`;

    assert.throws(() => server.mock({ path: '/endpoint' }), message);
  });
});
