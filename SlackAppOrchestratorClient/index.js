const df = require('durable-functions');
const processingView = require('./views/processing.json');

module.exports = async function startOrchestration(context, req) {
  // TODO: Have the Slack app hit this endpoint
  const client = df.getClient(context);
  await client.startNew('SlackAppOrchestrator', undefined, req.body);
  // TODO: Return the view
  return {
    body: {
      response_action: 'update',
      view: processingView,
    },
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  };
};
