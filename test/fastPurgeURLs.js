const chai = require('chai');
const querystring = require('querystring');
const fastPurgeUrls = require('../FastPurgeUrls/index');

const expect = chai.expect;

function assertResponse(res, status) {
  expect(res.status).to.equal(status);
  expect(res.body).is.not.be.null;
  expect(res.headers).is.not.be.null;
  expect(res.headers).have.property('Content-Type', 'application/json');
}

// TODO: consider disabling the no-unused-expressions rule for all tests
describe('FastPurgeUrls', () => {
  const fakeCtx = {
    log: () => {},
  };
  fakeCtx.log.error = () => {};

  describe('valid requests', () => {
    it('should allow a request of 50000 characters', async () => {
      // const req = {
      //   body: 'a'.repeat(50000),
      // };

      // const res = await fastPurgeUrls(fakeCtx, req);

      // expect(res.status).to.equal(201);
      // expect(res.body).is.not.be.null;
      // expect(res.body.message).to.equal('A maximum of 50000 characters in total can be submitted.');
    });

    it('should remove leading and trailing whitespace from a URL', () => {
    });

    it('should remove any blank lines submitted', () => {
    });

    it('should use the production environment by default', () => {
    });

    it('should allow the environment to be overridden by the request', () => {
    });

    it('should allow an environment in the request of \'production\'', () => {
    });

    it('should allow an environment in the request of \'staging\'', () => {
    });
  });

  describe('invalid requests', () => {
    const unparseableURL = 'no.protocol.url';

    it('should return status code 413 if more than 50000 characters are submitted', async () => {
      const body = { objects: 'a'.repeat(49993) };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 413);
      expect(res.body.message).to.equal('A maximum of 50000 characters in total can be submitted.');
    });

    it('should return status code 406 for an environment not on the white list', async () => {
      const notWhitelistedEnv = 'not-whitelisted';
      const body = {
        environment: notWhitelistedEnv,
        objects: 'https://valid.url',
      };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 406);
      expect(res.body.message).to.equal(`${notWhitelistedEnv} is not a valid option for environment. It must be 'staging' or 'production'. If no option is submitted the 'production' environment will be used.`);
    });

    it('should return status code 406 when a single, invalid URL submitted', async () => {
      const body = { objects: unparseableURL };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 406);
      expect(res.body.message).to.equal('Some URLs are invalid.');
      expect(res.body.urls).to.be.an('array');
      expect(res.body.urls).to.have.lengthOf(1);
      expect(res.body.urls).to.include(unparseableURL);
    });

    it('should return status code 406 when a single, invalid URL is submitted along with valid URLs', async () => {
      const body = { objects: `http://non.secure\n${unparseableURL}\nhttps://nhs.uk` };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 406);
      expect(res.body.message).to.equal('Some URLs are invalid.');
      expect(res.body.urls).to.be.an('array');
      expect(res.body.urls).to.have.lengthOf(1);
      expect(res.body.urls).to.include(unparseableURL);
    });

    it('should return status code 403 when a URL does not end in \'nhs.uk\'', async () => {
      const invalidURL = 'https://nhs.uk.end';
      const body = { objects: invalidURL };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 403);
      expect(res.body.message).to.equal('Some URLs are invalid.');
      expect(res.body.urls).to.be.an('array');
      expect(res.body.urls).to.have.lengthOf(1);
      expect(res.body.urls).to.include(invalidURL);
    });
  });
});

// TODO: Test the following:
// Empty lines are removed before the request is sent to Akamai
