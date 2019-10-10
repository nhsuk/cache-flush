const { createAkamaiRequest } = require('../lib/akamaiRequestBuilder');
const { validDomain, validEnvironments } = require('../lib/constants');
const { isEnvironmentValid, isMandatoryInputIncluded } = require('../lib/requestValidator');
const { buildResponseAndLog } = require('../lib/responseBuilder');
const { processURLs } = require('../lib/urlProcessor');

module.exports = async function index(context, req) {
  context.log('Cache flush function started.');

  const { body: reqBody } = req;
  const { debug, environment, objects } = reqBody;
  if (!isMandatoryInputIncluded(environment, objects)) {
    const body = {
      message: 'Request must contain required properties: \'environment\', \'objects\'.',
    };
    return buildResponseAndLog(body, 400, context.log.error);
  }

  if (!isEnvironmentValid(environment)) {
    const body = {
      message: `'${environment}' is not a valid option for environment. It must be one of: ${validEnvironments.join(', ')}.`,
    };
    return buildResponseAndLog(body, 400, context.log.error);
  }

  const { invalidURLs, uniqueURLs, unparseableURLs } = processURLs(objects);

  if (unparseableURLs.length) {
    const body = {
      message: 'Some URLs are invalid as they are not parseable into a valid URL.',
      urls: unparseableURLs,
    };
    return buildResponseAndLog(body, 400, context.log.error);
  }

  if (invalidURLs.length) {
    const body = {
      message: `Some URLs can not be flushed from cache as they are not for the domain '${validDomain}'.`,
      urls: invalidURLs,
    };
    return buildResponseAndLog(body, 403, context.log.error);
  }

  const akamaiRequest = createAkamaiRequest(uniqueURLs, environment, debug);

  try {
    context.log('Request sent to Akamai.');
    const response = await akamaiRequest();
    const data = JSON.parse(response.body);
    data.urls = uniqueURLs;
    return buildResponseAndLog(data, data.httpStatus, context.log);
  } catch (err) {
    const body = {
      error: {
        message: err.message,
        name: err.name,
      },
      message: 'An error has occurred during cache flush.',
    };
    return buildResponseAndLog(body, 500, context.log.error);
  }
};
