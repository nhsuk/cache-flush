const EdgeGrid = require('edgegrid');
const util = require('util');

module.exports = async function index(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  const baseUri = process.env.host;
  const accessToken = process.env.access_token;
  const clientSecret = process.env.client_secret;
  const clientToken = process.env.client_token;
  const debug = true;
  const environment = 'production'; // By default the environment will be `production`. It can also be `staging`
  //
  // TODO: Need to remove the empty entries
  // TODO: Remove any whitespace at the start and end of each string
  const urls = req.body.split('\n');
  console.log(urls);
  // TODO: Add this information to the response
  console.log(urls.length);
  console.log('**************');
  // return {
  //   body: {
  //     urls,
  //   },
  // };

  // TODO:
  // check the total number of characters for all of the URLs does not exceeed 50K
  const body = {
    objects: urls,
  };
  const eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri, debug);
  eg.auth({
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: `/ccu/v3/invalidate/url/${environment}`,
  });

  const asyncSend = util.promisify(eg.send.bind(eg));
  try {
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
