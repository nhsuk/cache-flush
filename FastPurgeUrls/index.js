const querystring = require('querystring');
const util = require('util');
const EdgeGrid = require('edgegrid');

module.exports = async function index(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  const maxChars = 50000;

  if (req.body.length > maxChars) {
    const message = `Request can be no larger than ${maxChars} bytes.`;
    context.log.error(message);
    return {
      body: { message },
      headers: { 'Content-Type': 'application/json' },
      status: 413,
    };
  }

  const body = querystring.decode(req.body);
  const objects = body.objects;

  if (!objects) {
    const message = 'Request must contain a populated \'objects\' value.';
    context.log.error(message);
    return {
      body: { message },
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    };
  }
  const environment = body.environment || 'production';

  if (!['staging', 'production'].includes(environment)) {
    return {
      body: {
        message: `'${environment}' is not a valid option for environment. It must be 'staging' or 'production' with 'production' being used if no environment is specified.`,
      },
      headers: { 'Content-Type': 'application/json' },
      status: 406,
    };
  }

  const urls = objects.split('\n').filter(Boolean).map((url) => url.trim());
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
      context.log.error(`${url} is not a valid URL.`);
    }
  });

  if (unparseableURLs.length) {
    return {
      body: {
        message: 'Some URLs are invalid as they are not parseable into a valid URL.',
        urls: unparseableURLs,
      },
      headers: { 'Content-Type': 'application/json' },
      status: 406,
    };
  }

  if (invalidURLs.length) {
    return {
      body: {
        message: `Some URLs are invalid as they are not for the domain '${validDomain}'.`,
        urls: invalidURLs,
      },
      headers: { 'Content-Type': 'application/json' },
      status: 403,
    };
  }

  const baseUri = process.env.host;
  const accessToken = process.env.access_token;
  const clientSecret = process.env.client_secret;
  const clientToken = process.env.client_token;
  const debug = true;

  const eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri, debug);
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
