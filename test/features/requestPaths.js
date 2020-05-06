import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Request paths', () => {
  it('should support matching based on URL', async () => {
    server.mock({ path: '/does-exist' }, { status: 200 });

    const response = await chakram.get('/does-exist');

    expect(response).to.have.status(200);
  });
});
