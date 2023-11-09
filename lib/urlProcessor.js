const { validDomain, validHosts } = require('../lib/constants');

function processURLs(objects) {
  const urls = objects.map((url) => url.trim());
  const uniqueURLs = [...new Set(urls)];
  const unparseableURLs = [];
  const invalidURLs = [];

  uniqueURLs.forEach((url) => {
    try {
      const parsedURL = new URL(url);
      if (!parsedURL.host.endsWith(validDomain) && (!validHosts.includes(parsedURL.host))) {
        invalidURLs.push(url);
      }
    } catch (err) {
      unparseableURLs.push(url);
    }
  });

  return {
    invalidURLs,
    uniqueURLs,
    unparseableURLs,
  };
}

module.exports = {
  processURLs,
};
