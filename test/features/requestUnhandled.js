import chakram, { expect } from 'chakram';

import '../harness';

describe('Feature: Request not handled', () => {
  it('should not match unmocked GET requests', async () => {
    const response = await chakram.get('/does-not-exist');

    expect(response).to.have.status(501);
  });

  it('should not match unmocked POST requests', async () => {
    const response = await chakram.post('/post-request');

    expect(response).to.have.status(501);
  });
});
