import express from 'express';

export default class Server {
  constructor(router, proxy) {
    this.router = router;
    this.proxy = proxy;
  }

  async start(port, proxyBaseUrl) {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.router.middleware.bind(this.router));

    if (proxyBaseUrl) {
      this.app.use(this.proxy.middleware(proxyBaseUrl).bind(this.proxy));
    }

    this.app.use(this.router.catchAllMiddleware.bind(this.router));

    this.server = await this.app.listen(port);

    return this.server;
  }

  stop() {
    this.server.close();
  }
}
