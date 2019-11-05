const df = require('durable-functions');
const qs = require('querystring');

module.exports = df.orchestrator(function* orchestratorFunctionName(context) {
  context.log('******************ORCHESTRATION START');
  const input = yield context.df.getInput();
  context.log('*****************');
  context.log(qs.parse(input).payload);
  context.log('*****************');
  context.log(JSON.parse(qs.unescape(qs.parse(input).payload)));
  context.log('*****************');

  const output = [];
  output.push(yield context.df.callActivity('SlackAppResponse', input));
  return output;
});
