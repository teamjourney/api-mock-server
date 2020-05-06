import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Reset', () => {
  it('should support resetting routes', async () => {
    server.mock({ path: '/does-exist' }, { status: 200 });
    server.reset();

    const response = await chakram.get('/does-exist');

    expect(response).to.have.status(501);
  });
});
