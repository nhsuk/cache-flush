const querystring = require('querystring');
const util = require('util');
// const URL = require('url');
const EdgeGrid = require('edgegrid');

module.exports = async function index(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  const maxChars = 50000;
  let { environment, objects } = querystring.decode(req.body);
  const objectsLength = objects.length + 'objects'.length + 1;

  if (objectsLength > maxChars) {
    const message = `A maximum of ${maxChars} characters in total can be submitted.`;
    context.log.error('ERROR', message);
    return {
      body: {
        message,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      status: 413,
    };
  }

  environment = environment || 'production';

  if (!['staging', 'production'].includes(environment)) {
    return {
      body: {
        message: `${environment} is not a valid option for environment. It must be 'staging' or 'production'. If no option is submitted the 'production' environment will be used.`,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      status: 406,
    };
  }

  const urls = objects.split('\n');
  const unparseableURLs = [];
  const invalidURLs = [];
  urls.forEach((url) => {
    try {
      const parsedURL = new URL(url);
      if (!parsedURL.host.endsWith('nhs.uk')) {
        invalidURLs.push(url);
      }
    } catch (err) {
      unparseableURLs.push(url);
      context.log.error('ERROR', `${url} is not a valid URL.`);
      console.log('BUSTED: ' + url);
      console.log(err);
    }
  });

  if (unparseableURLs.length) {
    return {
      body: {
        message: 'Some URLs are invalid.',
        urls: unparseableURLs,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      status: 406,
    };
  }

  if (invalidURLs) {
    return {
      body: {
        message: 'Some URLs are invalid.',
        urls: invalidURLs,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      status: 403,
    };
  }

  // TODO: Consider including all errors in the response (where it makes sense
  // i.e. the status code would be the same)

  // TODO: Need to test that objects are available
  context.log(req.body);
  context.log(environment);
  context.log(objects);
  return {
    body: {
      environment,
      objects,
    },
  };
  const baseUri = process.env.host;
  const accessToken = process.env.access_token;
  const clientSecret = process.env.client_secret;
  const clientToken = process.env.client_token;
  const debug = true;

  // TODO: Need to remove the empty entries
  // TODO: Remove any whitespace at the start and end of each string
  // console.log(urls);
  // TODO: Add this information to the response
  // console.log(urls.length);
  // console.log('**************');

  const eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri, debug);
  eg.auth({
    body: {
      objects: urls,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: `/ccu/v3/invalidate/url/${environment}`,
  });

  const asyncSend = util.promisify(eg.send.bind(eg));
  try {
    context.log('Send request to Akamai');
    const response = await asyncSend();
    const data = JSON.parse(response.body);
    context.log(data);
    return {
      body: data,
      headers: { 'Content-Type': 'application/JSON' },
      status: data.httpStatus,
    };
  } catch (err) {
    context.log.error('ERROR', err);
    return {
      body: {
        error: {
          message: err.message,
          name: err.name,
        },
        message: 'An error has occurred during cache flush.',
      },
      headers: { 'Content-Type': 'application/JSON' },
      status: 500,
    };
  }
};
