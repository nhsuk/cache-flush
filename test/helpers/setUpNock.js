const nock = require('nock');

const { akamaiResponse } = require('./expecations');
const { Values } = require('../../example.local.settings');

const { host } = Values;

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
