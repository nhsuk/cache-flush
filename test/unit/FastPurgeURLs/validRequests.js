const chai = require('chai');
const querystring = require('querystring');

const fastPurgeUrls = require('../../../FastPurgeUrls/index');
const { akamaiResponse, assertResponse } = require('../../helpers/expecations');
const { setUpNock } = require('../../helpers/setUpNock');
const {
  // eslint-disable-next-line camelcase
  access_token, client_secret, client_token, host,
} = require('../../../example.local.settings').Values;

const expect = chai.expect;

describe('FastPurgeUrls', () => {
  let fakeCtx;

  before('set up environment', () => {
    process.env = {
      access_token,
      client_secret,
      client_token,
      host,
    };
    fakeCtx = {
      log: () => {},
    };
    fakeCtx.log.error = () => {};
  });

  after('reset environment', () => {
    process.env = {
      access_token: '',
      client_secret: '',
      client_token: '',
      host: '',
    };
  });

  describe('valid requests', () => {
    const validURL = 'https://not.real.nhs.uk/test/page/';

    describe('basic functionality', () => {
      it('should allow a request body upto 50000 characters', async () => {
        const body = { objects: `${validURL}${'a'.repeat(49946)}` };
        const req = { body: querystring.encode(body) };
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [body.objects];

        setUpNock([body.objects]);

        const res = await fastPurgeUrls(fakeCtx, req);

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      it('should return a list of URLs that have been requested to be invalidated in the cache', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { objects: validURL };
        const req = { body: querystring.encode(body) };

        setUpNock([validURL]);

        const res = await fastPurgeUrls(fakeCtx, req);

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      it('should allow the environment to be overridden by the request', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const environment = 'staging';
        const body = { environment, objects: validURL };
        const req = { body: querystring.encode(body) };

        setUpNock([validURL], environment);

        const res = await fastPurgeUrls(fakeCtx, req);

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      it('should allow an environment in the request of \'production\'', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const environment = 'production';
        const body = { environment, objects: validURL };
        const req = { body: querystring.encode(body) };

        setUpNock([validURL]);

        const res = await fastPurgeUrls(fakeCtx, req);

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });
    });

    describe('cleaning up requests', () => {
      it('should remove leading and trailing whitespace from a URL', async () => {
        const anotherValidURL = `${validURL}another/`;
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL, anotherValidURL];
        const body = { objects: `${validURL}     \n     ${anotherValidURL}` };
        const req = { body: querystring.encode(body) };

        setUpNock([validURL, anotherValidURL]);

        const res = await fastPurgeUrls(fakeCtx, req);

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      it('should remove any duplicate URLs', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { objects: `${validURL}\n${validURL}` };
        const req = { body: querystring.encode(body) };

        setUpNock([validURL]);

        const res = await fastPurgeUrls(fakeCtx, req);

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      it('should remove any blank lines submitted', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { objects: `\n${validURL}\n` };
        const req = { body: querystring.encode(body) };

        setUpNock([validURL]);

        const res = await fastPurgeUrls(fakeCtx, req);

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });
    });
  });
});
