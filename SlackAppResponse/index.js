module.exports = async function activityFunction(context) {
  context.log('Starting orchestrator function');
  const { input } = context.bindings;
  context.log(`INPUT....................${input}`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  context.log(`INPUT....................${input}`);

  return context.input;
};
