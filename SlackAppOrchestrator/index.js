const df = require('durable-functions');

module.exports = df.orchestrator(function* orchestratorFunctionName(context) {
  context.log('******************ORCHESTRATION START');
  const input = context.df.getInput();

  // yield context.df.callActivity('SlackAppResponse', input);
  const cacheFlushRes = yield context.df.callActivity('SlackAppCacheFlush', input);
  // yield context.df.callActivity('SlackAppCacheFlushViewUpdate', cacheFlushRes);
});
