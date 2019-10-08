const util = require('util');
const EdgeGrid = require('edgegrid');
const { validEnvironments } = require('../lib/constants');

module.exports = async function index(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  const { debug, environment, objects } = req.body;
  if (!environment || !objects || objects.length === 0 || typeof (objects) !== 'object') {
    const body = {
      message: 'Request must contain required properties: \'environment\', \'objects\'.',
    };
    context.log.error(body);
    return {
      body,
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    };
  }

  if (!validEnvironments.includes(environment)) {
    const body = {
      message: `'${environment}' is not a valid option for environment. It must be one of: ${validEnvironments.join(', ')}.`,
    };
    context.log.error(body);
    return {
      body,
      headers: { 'Content-Type': 'application/json' },
      status: 406,
    };
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
    return {
      body,
      headers: { 'Content-Type': 'application/json' },
      status: 406,
    };
  }

  if (invalidURLs.length) {
    const body = {
      message: `Some URLs are invalid as they are not for the domain '${validDomain}'.`,
      urls: invalidURLs,
    };

    context.log.error(body);
    return {
      body,
      headers: { 'Content-Type': 'application/json' },
      status: 403,
    };
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
    context.log('Send request to Akamai');
    const response = await asyncSend();
    const data = JSON.parse(response.body);
    data.urls = uniqueURLs;
    context.log(data);
    return {
      body: data,
      headers: { 'Content-Type': 'application/json' },
      status: data.httpStatus,
    };
  } catch (err) {
    context.log.error(err);
    return {
      body: {
        error: {
          message: err.message,
          name: err.name,
        },
        message: 'An error has occurred during cache flush.',
      },
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    };
  }
};

// TODO: Consider what logging is needed
// TODO: Refactor this file, remove response building duplication and put the
// validation into functions
