import matches from './matcher';

export default (possibleMatches, logger) => (actualRequest, actualResponse, next) => {
  const match = possibleMatches.find(
    (possibleMatch) => matches(possibleMatch.request, actualRequest),
  );

  if (match) {
    const { response } = match;

    logger.logHandledRequest(match);

    return actualResponse.set(response.headers).status(response.status).json(response.body);
  }

  logger.logUnhandledRequest(actualRequest);

  return next();
};
