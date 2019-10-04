const chai = require('chai');
const querystring = require('querystring');
const fastPurgeUrls = require('../../../FastPurgeUrls/index');
const { assertResponse, assertSingleURLInRepsonse } = require('../../helpers/expecations');

const expect = chai.expect;

describe('FastPurgeUrls', () => {
  let fakeCtx;

  before('set up environment', () => {
    fakeCtx = {
      log: () => {},
    };
    fakeCtx.log.error = () => {};
  });

  describe('invalid requests and error handling', () => {
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
      assertSingleURLInRepsonse(res, unparseableURL);
    });

    it('should return status code 406 when a single, invalid URL is submitted along with valid URLs', async () => {
      const body = { objects: `https://not.nhs.uk/\n${unparseableURL}\nhttps://nhs.uk` };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 406);
      expect(res.body.message).to.equal('Some URLs are invalid as they are not parseable into a valid URL.');
      assertSingleURLInRepsonse(res, unparseableURL);
    });

    it('should return status code 403 when a URL does not end in \'nhs.uk\'', async () => {
      const invalidURL = 'https://nhs.uk.end';
      const body = { objects: invalidURL };
      const req = { body: querystring.encode(body) };

      const res = await fastPurgeUrls(fakeCtx, req);

      assertResponse(res, 403);
      expect(res.body.message).to.equal('Some URLs are invalid as they are not for the domain \'nhs.uk\'.');
      assertSingleURLInRepsonse(res, invalidURL);
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
