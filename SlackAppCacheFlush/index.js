const qs = require('querystring');
const rp = require('request-promise-native');

module.exports = async function index(context, input) {
  const output = qs.decode(input);

  const payload = JSON.parse(output.payload);
  context.log('*****************PARSED INPUT');
  context.log(payload);

  // if (payload.type === 'view_submission') {
  const {
    environment: { environment_input: { selected_option: { value: envValue } } },
    urls: { urls_input: { value: urlsValue } },
  } = payload.view.state.values;

  const objects = urlsValue.split('\n'); // Let the cache flush app handle this? - .filter(Boolean);
  const cacheFlushUrl = process.env.CACHE_FLUSH_FUNCTION_APP_FULL_URL_WITH_PATH_AND_CODE;
  // TODO: From the response the view will need to be updated via the API
  // https://api.slack.com/surfaces/modals/using#updating_apis
  // rp({
  //   body: {
  //     environment: envValue,
  //     objects,
  //   },
  //   json: true,
  //   method: 'POST',
  //   url: cacheFlushUrl,
  // })
  //   .then((res) => {
  //     context.log(res);
  //   })
  //   .catch((err) => {
  //     context.log.error(err);
  //   });
  // }

  // Once the response from the cache flush
  // returns (above) the view will be updated again.
  // Below use this https://api.slack.com/surfaces/modals/using#updating_response
  context.log('*********RETURNING');
  context.done(null, 'done');
};
