import express from 'express';

export default class Server {
  constructor(router) {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded());
    this.app.use(router.middleware.bind(router));
  }

  async start(port) {
    this.server = await this.app.listen(port);

    return this.server;
  }

  stop() {
    this.server.close();
  }
}
