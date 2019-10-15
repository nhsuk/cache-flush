const { validEnvironments } = require('../lib/constants');

function isEnvironmentValid(env) {
  return validEnvironments.includes(env);
}

function isMandatoryInputIncluded(env, objects) {
  return env && objects && objects.length > 0 && typeof (objects) === 'object';
}

module.exports = {
  isEnvironmentValid,
  isMandatoryInputIncluded,
};
