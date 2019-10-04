const chai = require('chai');
const nock = require('nock');
const querystring = require('querystring');
const fastPurgeUrls = require('../FastPurgeUrls/index');
const {
  // eslint-disable-next-line camelcase
  access_token, client_secret, client_token, host,
} = require('../example.local.settings').Values;

const expect = chai.expect;

function assertResponse(res, status) {
  expect(res.status).to.equal(status);
  expect(res.body).is.not.be.null;
  expect(res.headers).is.not.be.null;
  expect(res.headers).have.property('Content-Type', 'application/json');
}

describe('FastPurgeUrls', () => {
  before('setup environment', () => {
    process.env = {
      access_token,
      client_secret,
      client_token,
      host,
    };
  });

  const fakeCtx = {
    log: () => {},
  };
  fakeCtx.log.error = () => {};

  describe('valid requests', () => {
    const validURL = 'https://not.real.nhs.uk/test/page/';
    // let expectedResponse;

    const akamaiResponse = {
      detail: 'Request accepted',
      estimatedSeconds: 5,
      httpStatus: 201,
      purgeId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      supportId: 'xxxxxxxxxxxxxxxxxxxx-xxxxxxxxx',
    };

    it('should allow a request body upto 50000 characters', async () => {
      const body = { objects: `${validURL}${'a'.repeat(49000)}` };
      const req = { body: querystring.encode(body) };
      const urls = body.objects;
      const temp = { urls: [urls] };
      const expectedResponse = Object.assign(temp, akamaiResponse);

      nock(`https://${host}:443`, { encodedQueryParams: true })
        .post('/ccu/v3/invalidate/url/production', { objects: [urls] })
        .reply(201, akamaiResponse);

      const res = await fastPurgeUrls(fakeCtx, req);

      expect(res.status).to.equal(201);
      expect(res.body).is.not.null;
      expect(res.body).to.deep.equal(expectedResponse);
    });

    it('should remove leading and trailing whitespace from a URL', async () => {
      const anotherValidURL = `${validURL}another/`;
      const temp = { urls: [validURL, anotherValidURL] };
      const expectedResponse = Object.assign(temp, akamaiResponse);
      const body = { objects: `${validURL}     \n     ${anotherValidURL}` };
      const req = { body: querystring.encode(body) };

      nock(`https://${host}:443`, { encodedQueryParams: true })
        .post('/ccu/v3/invalidate/url/production', { objects: [validURL, anotherValidURL] })
        .reply(201, akamaiResponse);

      const res = await fastPurgeUrls(fakeCtx, req);

      expect(res.status).to.equal(201);
      expect(res.body).is.not.null;
      expect(res.body).to.deep.equal(expectedResponse);
    });

    it('should remove any duplicate URLs', async () => {
      const temp = { urls: [validURL] };
      const expectedResponse = Object.assign(temp, akamaiResponse);
      const body = { objects: `${validURL}\n${validURL}` };
      const req = { body: querystring.encode(body) };

      nock(`https://${host}:443`, { encodedQueryParams: true })
        .post('/ccu/v3/invalidate/url/production', { objects: [validURL] })
        .reply(201, akamaiResponse);

      const res = await fastPurgeUrls(fakeCtx, req);

      expect(res.status).to.equal(201);
      expect(res.body).is.not.null;
      expect(res.body).to.deep.equal(expectedResponse);
    });

    it('should remove any blank lines submitted', async () => {
      const temp = { urls: [validURL] };
      const expectedResponse = Object.assign(temp, akamaiResponse);
      const body = { objects: `\n${validURL}\n` };
      const req = { body: querystring.encode(body) };

      nock(`https://${host}:443`, { encodedQueryParams: true })
        .post('/ccu/v3/invalidate/url/production', { objects: [validURL] })
        .reply(201, akamaiResponse);

      const res = await fastPurgeUrls(fakeCtx, req);

      expect(res.status).to.equal(201);
      expect(res.body).is.not.null;
      expect(res.body).to.deep.equal(expectedResponse);
    });

    it('should return a list of URLs that have been requested to be invalidated in the cache', async () => {
      const temp = { urls: [validURL] };
      const expectedResponse = Object.assign(temp, akamaiResponse);
      const body = { objects: validURL };
      const req = { body: querystring.encode(body) };

      nock(`https://${host}:443`, { encodedQueryParams: true })
        .post('/ccu/v3/invalidate/url/production', { objects: [validURL] })
        .reply(201, akamaiResponse);

      const res = await fastPurgeUrls(fakeCtx, req);

      expect(res.status).to.equal(201);
      expect(res.body).is.not.null;
      expect(res.body).to.deep.equal(expectedResponse);
    });

    it('should allow the environment to be overridden by the request', async () => {
      const temp = { urls: [validURL] };
      const expectedResponse = Object.assign(temp, akamaiResponse);
      const environment = 'staging';
      const body = { environment, objects: validURL };
      const req = { body: querystring.encode(body) };

      nock(`https://${host}:443`, { encodedQueryParams: true })
        .post(`/ccu/v3/invalidate/url/${environment}`, { objects: [validURL] })
        .reply(201, akamaiResponse);

      const res = await fastPurgeUrls(fakeCtx, req);

      expect(res.status).to.equal(201);
      expect(res.body).is.not.null;
      expect(res.body).to.deep.equal(expectedResponse);
    });

    it('should allow an environment in the request of \'production\'', async () => {
      const temp = { urls: [validURL] };
      const expectedResponse = Object.assign(temp, akamaiResponse);
      const environment = 'production';
      const body = { environment, objects: validURL };
      const req = { body: querystring.encode(body) };

      nock(`https://${host}:443`, { encodedQueryParams: true })
        .post(`/ccu/v3/invalidate/url/${environment}`, { objects: [validURL] })
        .reply(201, akamaiResponse);

      const res = await fastPurgeUrls(fakeCtx, req);

      expect(res.status).to.equal(201);
      expect(res.body).is.not.null;
      expect(res.body).to.deep.equal(expectedResponse);
    });
  });

  describe('invalid requests', () => {
    const unparseableURL = 'no.protocol.url';

    it('should return status code 413 if the request body is more than 50000 characters', async () => {
      const body = { objects: 'a'.repeat(49993) };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 413);
      expect(res.body.message).to.equal('Request can be no larger than 50000 bytes.');
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
      expect(res.body.message).to.equal(`'${notWhitelistedEnv}' is not a valid option for environment. It must be 'staging' or 'production' with 'production' being used if no environment is specified.`);
    });

    it('should return status code 406 when a single, invalid URL submitted', async () => {
      const body = { objects: unparseableURL };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 406);
      expect(res.body.message).to.equal('Some URLs are invalid as they are not parseable into a valid URL.');
      expect(res.body.urls).to.be.an('array');
      expect(res.body.urls).to.have.lengthOf(1);
      expect(res.body.urls).to.include(unparseableURL);
    });

    it('should return status code 406 when a single, invalid URL is submitted along with valid URLs', async () => {
      const body = { objects: `http://non.secure.nhs.uk/\n${unparseableURL}\nhttps://nhs.uk` };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 406);
      expect(res.body.message).to.equal('Some URLs are invalid as they are not parseable into a valid URL.');
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
      expect(res.body.message).to.equal('Some URLs are invalid as they are not for the domain \'nhs.uk\'.');
      expect(res.body.urls).to.be.an('array');
      expect(res.body.urls).to.have.lengthOf(1);
      expect(res.body.urls).to.include(invalidURL);
    });

    it('should return status code 400 when the request body does not contain \'objects\'', async () => {
      const req = { body: querystring.encode({}) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 400);
      expect(res.body.message).to.equal('Request must contain a populated \'objects\' value.');
    });

    it('should return status code 400 when the request body contains an empty \'objects\'', async () => {
      const req = { body: querystring.encode({ objects: '' }) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 400);
      expect(res.body.message).to.equal('Request must contain a populated \'objects\' value.');
    });
  });
});
