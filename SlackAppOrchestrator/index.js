const df = require('durable-functions');

module.exports = df.orchestrator(function* orchestratorFunctionName(context) {
  context.log('******************ORCHESTRATION START');
  // const input = yield context.df.getInput();
  // context.log(`INPUT....................${JSON.stringify(input)}`);
  // return input;
  const output = [];
  output.push(yield context.df.callActivity('SlackAppResponse', 'param'));

  return output;
});
