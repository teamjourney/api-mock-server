import chakram, { expect } from 'chakram';

import server from '../harness';

describe('Feature: Response headers', () => {
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
});
