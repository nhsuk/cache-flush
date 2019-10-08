const util = require('util');
const EdgeGrid = require('edgegrid');

function createAkamaiRequest(uniqueURLs, environment, debug) {
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

  return util.promisify(eg.send.bind(eg));
}
module.exports = {
  createAkamaiRequest,
};
