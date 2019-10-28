const { buildResponseAndLog } = require('../lib/responseBuilder');

module.exports = async function index(context, req) {
  context.log('Slack App function started.');

  return buildResponseAndLog({ body: req }, 200, context.log);
};
