const fastPurgeUrls = require('../../../FastPurgeUrls/index');
const { validEnvironments } = require('../../../lib/constants');
const { akamaiResponse, expectLoggingValid, expectResponseValidWithBody } = require('../../helpers/expectations');
const { setUpNock } = require('../../helpers/setUpNock');
const { Values } = require('../../../example.local.settings');

const {
  // eslint-disable-next-line camelcase
  access_token, client_secret, client_token, host,
} = Values;

describe('FastPurgeUrls', () => {
  let fakeCtx;
  let messages = [];

  before('set up environment', () => {
    fakeCtx = { log: (m) => { messages.push(m); } };
    fakeCtx.log.error = () => {};

    process.env = {
      access_token,
      client_secret,
      client_token,
      host,
    };
  });

  beforeEach('reset logger objects', () => {
    messages = [];
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
    const [validEnv] = validEnvironments;

    describe('basic functionality', () => {
      it('should return a list of URLs that have been requested to be invalidated in the cache', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { environment: validEnv, objects: [validURL] };

        setUpNock(validEnv, [validURL]);

        const res = await fastPurgeUrls(fakeCtx, { body });

        expectResponseValidWithBody(res, 201, expectedResponse);
        expectLoggingValid(messages, expectedResponse);
      });

      validEnvironments.forEach((envTestValue) => {
        it(`should allow the environment to be set to one of the valid options. Testing '${envTestValue}'.`, async () => {
          const expectedResponse = { ...akamaiResponse };
          expectedResponse.urls = [validURL];
          const body = { environment: envTestValue, objects: [validURL] };

          setUpNock(envTestValue, [validURL]);

          const res = await fastPurgeUrls(fakeCtx, { body });

          expectResponseValidWithBody(res, 201, expectedResponse);
          expectLoggingValid(messages, expectedResponse);
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

        expectResponseValidWithBody(res, 201, expectedResponse);
        expectLoggingValid(messages, expectedResponse);
      });

      it('should remove any duplicate URLs', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { environment: validEnv, objects: [validURL, validURL] };

        setUpNock(validEnv, [validURL]);

        const res = await fastPurgeUrls(fakeCtx, { body });

        expectResponseValidWithBody(res, 201, expectedResponse);
        expectLoggingValid(messages, expectedResponse);
      });

      it('should remove any blank lines submitted', async () => {
        const expectedResponse = { ...akamaiResponse };
        expectedResponse.urls = [validURL];
        const body = { environment: validEnv, objects: ['', validURL, ''] };

        setUpNock(validEnv, [validURL]);

        const res = await fastPurgeUrls(fakeCtx, { body });

        expectResponseValidWithBody(res, 201, expectedResponse);
        expectLoggingValid(messages, expectedResponse);
      });
    });
  });
});
