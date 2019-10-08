const { buildResponse } = require('../lib/buildResponse');
const { validDomain, validEnvironments } = require('../lib/constants');
const { createAkamaiRequest } = require('../lib/createAkamaiRequest');
const { processURLs } = require('../lib/processURLs');
const { isEnvironmentValid, isMandatoryInputIncluded } = require('../lib/validateRequest');

module.exports = async function index(context, req) {
  context.log('Cache flush function started.');

  const { body: reqBody } = req;
  const { debug, environment, objects } = reqBody;
  if (!isMandatoryInputIncluded(environment, objects)) {
    const body = {
      message: 'Request must contain required properties: \'environment\', \'objects\'.',
    };
    context.log.error(body);
    return buildResponse(body, 400);
  }

  if (!isEnvironmentValid(environment)) {
    const body = {
      message: `'${environment}' is not a valid option for environment. It must be one of: ${validEnvironments.join(', ')}.`,
    };
    context.log.error(body);
    return buildResponse(body, 422);
  }

  const { invalidURLs, uniqueURLs, unparseableURLs } = processURLs(objects);

  if (unparseableURLs.length) {
    const body = {
      message: 'Some URLs are invalid as they are not parseable into a valid URL.',
      urls: unparseableURLs,
    };
    context.log.error(body);
    return buildResponse(body, 406);
  }

  if (invalidURLs.length) {
    const body = {
      message: `Some URLs can not be flushed from cache as they are not for the domain '${validDomain}'.`,
      urls: invalidURLs,
    };

    context.log.error(body);
    return buildResponse(body, 403);
  }

  const akamaiRequest = createAkamaiRequest(uniqueURLs, environment, debug);

  try {
    context.log('Request sent to Akamai.');
    const response = await akamaiRequest();
    const data = JSON.parse(response.body);
    data.urls = uniqueURLs;
    context.log(data);
    return buildResponse(data, data.httpStatus);
  } catch (err) {
    context.log.error(err);
    const body = {
      error: {
        message: err.message,
        name: err.name,
      },
      message: 'An error has occurred during cache flush.',
    };
    return buildResponse(body, 500);
  }
};
