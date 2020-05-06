import chakram, { expect } from 'chakram';

import server from '../..';

describe('Feature: Start', () => {
  beforeEach(() => {
    server.stop();
    chakram.clearRequestDefaults();
  });

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
