import chakram, { expect } from 'chakram';

import { MockServer } from '../../src';

describe('Feature: Multiple instances', () => {
  const firstMockPort = 9101;
  const secondMockPort = 9102;

  it('should support starting multiple independent instances', async () => {
    chakram.clearRequestDefaults();

    const firstMock = new MockServer();
    const secondMock = new MockServer();

    await firstMock.start(firstMockPort);
    await secondMock.start(secondMockPort);

    firstMock.mock({ path: '/my-endpoint' });
    secondMock.mock({ path: '/my-other-endpoint' });

    const successfulFirstMockRequest = await chakram.get(`http://localhost:${firstMockPort}/my-endpoint`);
    const failedFirstMockRequest = await chakram.get(`http://localhost:${firstMockPort}/my-other-endpoint`);

    const successfulSecondMockRequest = await chakram.get(`http://localhost:${secondMockPort}/my-other-endpoint`);
    const failedSecondMockRequest = await chakram.get(`http://localhost:${secondMockPort}/my-endpoint`);

    expect(successfulFirstMockRequest).to.have.status(200);
    expect(failedFirstMockRequest).to.have.status(501);

    expect(successfulSecondMockRequest).to.have.status(200);
    expect(failedSecondMockRequest).to.have.status(501);

    firstMock.stop();
    secondMock.stop();
  });
});
