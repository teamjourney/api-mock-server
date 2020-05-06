import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Response bodies', () => {
  it('should support response bodies', async () => {
    server.mock({ path: '/return-something' }, { body: { field: 'value' } });

    const response = await chakram.get('/return-something');

    expect(response).to.have.json({ field: 'value' });
  });
});
