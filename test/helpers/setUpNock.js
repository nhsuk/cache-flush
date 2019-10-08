const nock = require('nock');

const { akamaiResponse } = require('./expecations');
const { host } = require('../../example.local.settings').Values;

function setUpNock(env, urls) {
  nock(`https://${host}:443`, { encodedQueryParams: true })
    .post(`/ccu/v3/invalidate/url/${env}`, { objects: urls })
    .reply(201, akamaiResponse);
}

function setUpNockError(env, urls) {
  nock(`https://${host}:443`, { encodedQueryParams: true })
    .post(`/ccu/v3/invalidate/url/${env}`, { objects: urls })
    .reply(201, 'not json');
}

module.exports = {
  setUpNock,
  setUpNockError,
};
