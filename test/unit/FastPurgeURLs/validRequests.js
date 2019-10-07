const chai = require('chai');

const fastPurgeUrls = require('../../../FastPurgeUrls/index');
const { validEnvironments } = require('../../../lib/constants');
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
    fakeCtx = { log: () => {} };
    fakeCtx.log.error = () => {};

    process.env = {
      access_token,
      client_secret,
      client_token,
      host,
    };
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
    const validEnv = validEnvironments[0];

    describe('basic functionality', () => {
      it('should return a list of URLs that have been requested to be invalidated in the cache', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { environment: validEnv, objects: [validURL] };

        setUpNock(validEnv, [validURL]);

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      validEnvironments.forEach((envTestValue) => {
        it(`should allow the environment to be set to one of the valid options. Testing '${envTestValue}'.`, async () => {
          const expectedResponse = { ...akamaiResponse };
          expectedResponse.urls = [validURL];
          const body = { environment: envTestValue, objects: [validURL] };

          setUpNock(envTestValue, [validURL]);

          const res = await fastPurgeUrls(fakeCtx, { body });

          assertResponse(res, 201);
          expect(res.body).to.deep.equal(expectedResponse);
        });
      });
    });

    describe('cleaning up requests', () => {
      it('should remove leading and trailing whitespace from a URL', async () => {
        const anotherValidURL = `${validURL}another/`;
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL, anotherValidURL];
        const body = { environment: validEnv, objects: [`${validURL}     `, `     ${anotherValidURL}`] };

        setUpNock(validEnv, [validURL, anotherValidURL]);

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      it('should remove any duplicate URLs', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { environment: validEnv, objects: [validURL, validURL] };

        setUpNock(validEnv, [validURL]);

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });

      it('should remove any blank lines submitted', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { environment: validEnv, objects: ['', validURL, ''] };

        setUpNock(validEnv, [validURL]);

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 201);
        expect(res.body).to.deep.equal(expectedResponse);
      });
    });
  });
});
