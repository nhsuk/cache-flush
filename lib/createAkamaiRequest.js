const util = require('util');
const EdgeGrid = require('edgegrid');

function createAkamaiRequest(uniqueURLs, environment, debug) {
  const { env } = process;
  const {
    // eslint-disable-next-line camelcase
    access_token, client_secret, client_token, host,
  } = env;

  const eg = new EdgeGrid(client_token, client_secret, access_token, host, !!debug);
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
