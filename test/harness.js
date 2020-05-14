import chakram from 'chakram';

import server from '../src';

const defaultPort = 9100;

before(() => {
  server.start(defaultPort);
});

beforeEach(async () => {
  server.reset();
  chakram.setRequestDefaults({
    baseUrl: `http://localhost:${defaultPort}`,
  });
});

afterEach(() => {
  chakram.clearRequestDefaults();
});

after(() => {
  server.stop();
});

export default server;
