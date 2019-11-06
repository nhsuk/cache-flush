module.exports = async function activityFunction(context) {
  context.log('*************Executing SlackAppResponse function - pre timeout');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  context.log('*************Executing SlackAppResponse function - post timeout');

  context.done(null, 'done');
};
