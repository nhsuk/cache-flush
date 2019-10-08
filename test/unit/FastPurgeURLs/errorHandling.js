const chai = require('chai');
const fastPurgeUrls = require('../../../FastPurgeUrls/index');
const { assertResponse, assertSingleURLInRepsonse } = require('../../helpers/expecations');
const { validEnvironments } = require('../../../lib/constants');
const { setUpNockError } = require('../../helpers/setUpNock');
const {
  // eslint-disable-next-line camelcase
  access_token, client_secret, client_token, host,
} = require('../../../example.local.settings').Values;

const expect = chai.expect;

describe('FastPurgeUrls', () => {
  let err;
  let fakeCtx;
  let logErrorCount;

  before('set up environment', () => {
    fakeCtx = { log: () => {} };
    fakeCtx.log.error = (e) => { err = e; logErrorCount += 1; };

    process.env = {
      access_token,
      client_secret,
      client_token,
      host,
    };
  });

  beforeEach('reset logger objects', () => {
    err = {};
    logErrorCount = 0;
  });

  after('reset environment', () => {
    process.env = {
      access_token: '',
      client_secret: '',
      client_token: '',
      host: '',
    };
  });

  describe('invalid requests and error handling', () => {
    const environment = 'staging';
    const unparseableURL = 'no.protocol.url';
    const validURL = 'https://nhs.uk';

    describe('required input', () => {
      const missingInputMessage = 'Request must contain required properties: \'environment\', \'objects\'.';

      it('should return status code 400 if the request does not include a property for \'objects\'.', async () => {
        const body = { body: { environment: 'potentially-valid' } };

        const res = await fastPurgeUrls(fakeCtx, body);

        assertResponse(res, 400);
        expect(logErrorCount).to.equal(1);
        expect(err).to.deep.equal(res.body);
        expect(res.body.message).to.equal(missingInputMessage);
      });

      it('should return status code 400 if the request does not include a property for \'environment\'.', async () => {
        const body = { body: { objects: [validURL] } };

        const res = await fastPurgeUrls(fakeCtx, body);

        assertResponse(res, 400);
        expect(logErrorCount).to.equal(1);
        expect(err).to.deep.equal(res.body);
        expect(res.body.message).to.equal(missingInputMessage);
      });

      [[], null, undefined, '', validURL].forEach((testValue) => {
        it(`should return status code 400 if the request does not include a potentially valid objects property as an array. Testing ${testValue}.`, async () => {
          const body = { body: { environment: 'potentially-valid', objects: testValue } };

          const res = await fastPurgeUrls(fakeCtx, body);

          assertResponse(res, 400);
          expect(logErrorCount).to.equal(1);
          expect(err).to.deep.equal(res.body);
          expect(res.body.message).to.equal(missingInputMessage);
        });
      });

      [null, undefined, ''].forEach((testValue) => {
        it(`should return status code 400 if the request does not include a potentially valid environment property. Testing ${testValue}.`, async () => {
          const body = { body: { environment: testValue, objects: [validURL] } };

          const res = await fastPurgeUrls(fakeCtx, body);

          assertResponse(res, 400);
          expect(logErrorCount).to.equal(1);
          expect(err).to.deep.equal(res.body);
          expect(res.body.message).to.equal(missingInputMessage);
        });
      });
    });

    describe('invalid environment', () => {
      it('should return status code 406 for an environment not on the white list', async () => {
        const notWhitelistedEnv = 'not-whitelisted';
        const body = { environment: notWhitelistedEnv, objects: [validURL] };

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 406);
        expect(logErrorCount).to.equal(1);
        expect(err).to.deep.equal(res.body);
        expect(res.body.message).to.equal(`'${notWhitelistedEnv}' is not a valid option for environment. It must be one of: ${validEnvironments.join(', ')}.`);
      });
    });

    describe('invalid URLs', () => {
      it('should return status code 406 when a single, invalid URL submitted', async () => {
        const body = { environment, objects: [unparseableURL] };

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 406);
        expect(logErrorCount).to.equal(1);
        expect(err).to.deep.equal(res.body);
        expect(res.body.message).to.equal('Some URLs are invalid as they are not parseable into a valid URL.');
        assertSingleURLInRepsonse(res, unparseableURL);
      });

      it('should return status code 406 when a single, invalid URL is submitted along with valid URLs', async () => {
        const body = { environment, objects: ['https://not.nhs.uk', unparseableURL, validURL] };

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 406);
        expect(res.body.message).to.equal('Some URLs are invalid as they are not parseable into a valid URL.');
        assertSingleURLInRepsonse(res, unparseableURL);
      });

      it('should return status code 403 when a URL does not end in \'nhs.uk\'', async () => {
        const invalidURL = 'https://nhs.uk.end';
        const body = { environment, objects: [invalidURL] };

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 403);
        expect(logErrorCount).to.equal(1);
        expect(err).to.deep.equal(res.body);
        expect(res.body.message).to.equal('Some URLs are invalid as they are not for the domain \'nhs.uk\'.');
        assertSingleURLInRepsonse(res, invalidURL);
      });
    });

    describe('unparseable data returned from Akamai', () => {
      it('should return status code 500 when the response from Akamai can not be parsed', async () => {
        const body = { environment, objects: [validURL] };

        setUpNockError(environment, body.objects);

        const res = await fastPurgeUrls(fakeCtx, { body });

        assertResponse(res, 500);
        expect(logErrorCount).to.equal(1);
        expect(res.body.message).to.equal('An error has occurred during cache flush.');
      });
    });
  });
});
