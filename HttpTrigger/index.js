// const EdgeGrid = require('edgegrid');

module.exports = async function index(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  // const baseUri = process.env.host;
  // const accessToken = process.env.access_token;
  // const clientSecret = process.env.client_secret;
  // const clientToken = process.env.client_token;

  // const eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri);

  if (req.query.name || (req.body && req.body.name)) {
    // eslint-disable-next-line no-param-reassign
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: `Hello ${req.query.name || req.body.name}`,
    };
  } else {
    // eslint-disable-next-line no-param-reassign
    context.res = {
      body: 'Please pass a name on the query string or in the request body',
      status: 400,
    };
  }
};
