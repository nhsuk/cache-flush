const chai = require('chai');

const expect = chai.expect;

const akamaiResponse = {
  detail: 'Request accepted',
  estimatedSeconds: 5,
  httpStatus: 201,
  purgeId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  supportId: 'xxxxxxxxxxxxxxxxxxxx-xxxxxxxxx',
};

function expectResponseValid(res, status) {
  expect(res.status).to.equal(status);
  expect(res.body).is.not.be.null;
  expect(res.headers).is.not.be.null;
  expect(res.headers).have.property('Content-Type', 'application/json');
}

function expectResponseValidWithBody(res, status, expectedResponse) {
  expectResponseValid(res, status);
  expect(res.body).to.deep.equal(expectedResponse);
}

function expectResponseValidWithMessage(res, status, msg) {
  expectResponseValid(res, status);
  expect(res.body.message).to.equal(msg);
}

function expectLoggingValid(messages, expectedResponse) {
  expect(messages.length).to.equal(3);
  expect(messages[0]).to.equal('Cache flush function started.');
  expect(messages[1]).to.equal('Request sent to Akamai.');
  expect(messages[2]).to.deep.equal(expectedResponse);
}

function expectLoggingErrorValid(err, logCount, res) {
  expect(logCount).to.equal(1);
  expect(err).to.deep.equal(res.body);
}

function expectSingleURLInRepsonse(res, url) {
  expect(res.body.urls).to.be.an('array');
  expect(res.body.urls).to.have.lengthOf(1);
  expect(res.body.urls).to.include(url);
}

module.exports = {
  akamaiResponse,
  expectLoggingErrorValid,
  expectLoggingValid,
  expectResponseValid,
  expectResponseValidWithBody,
  expectResponseValidWithMessage,
  expectSingleURLInRepsonse,
};
