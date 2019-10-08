const util = require('util');
const EdgeGrid = require('edgegrid');
const { buildResponse } = require('../lib/responseBuilder');
const { validEnvironments } = require('../lib/constants');
const { isEnvironmentValid, isMandatoryInputIncluded } = require('../lib/validateRequest');

module.exports = async function index(context, req) {
  context.log('Cache flush function started.');

  const { debug, environment, objects } = req.body;
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
    return buildResponse(body, 406);
  }

  const urls = objects.filter(Boolean).map((url) => url.trim());
  const uniqueURLs = [...new Set(urls)];
  const unparseableURLs = [];
  const invalidURLs = [];
  const validDomain = 'nhs.uk';

  uniqueURLs.forEach((url) => {
    try {
      const parsedURL = new URL(url);
      if (!parsedURL.host.endsWith(validDomain)) {
        invalidURLs.push(url);
      }
    } catch (err) {
      unparseableURLs.push(url);
    }
  });

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
      message: `Some URLs are invalid as they are not for the domain '${validDomain}'.`,
      urls: invalidURLs,
    };

    context.log.error(body);
    return buildResponse(body, 403);
  }

  const baseUri = process.env.host;
  const accessToken = process.env.access_token;
  const clientSecret = process.env.client_secret;
  const clientToken = process.env.client_token;

  const eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri, !!debug);
  eg.auth({
    body: {
      objects: uniqueURLs,
    },
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    path: `/ccu/v3/invalidate/url/${environment}`,
  });

  const asyncSend = util.promisify(eg.send.bind(eg));
  try {
    context.log('Request sent to Akamai.');
    const response = await asyncSend();
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
// TODO: Refactor this file, remove response building duplication and put the
// validation into functions
