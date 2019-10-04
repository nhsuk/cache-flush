const chai = require('chai');

const expect = chai.expect;

const akamaiResponse = {
  detail: 'Request accepted',
  estimatedSeconds: 5,
  httpStatus: 201,
  purgeId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  supportId: 'xxxxxxxxxxxxxxxxxxxx-xxxxxxxxx',
};

function assertResponse(res, status) {
  expect(res.status).to.equal(status);
  expect(res.body).is.not.be.null;
  expect(res.headers).is.not.be.null;
  expect(res.headers).have.property('Content-Type', 'application/json');
}

function assertSingleURLInRepsonse(res, url) {
  expect(res.body.urls).to.be.an('array');
  expect(res.body.urls).to.have.lengthOf(1);
  expect(res.body.urls).to.include(url);
}

module.exports = {
  akamaiResponse,
  assertResponse,
  assertSingleURLInRepsonse,
};
