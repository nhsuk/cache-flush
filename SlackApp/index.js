const qs = require('querystring');
const rp = require('request-promise-native');
const processingView = require('./views/processing.json');

module.exports = async function index(context, req) {
  const input = qs.decode(req.body);

  const parsedInput = JSON.parse(input.payload);

  // if (parsedInput.type === 'view_submission') {
  const {
    environment: { environment_input: { selected_option: { value: envValue } } },
    urls: { urls_input: { value: urlsValue } },
  } = parsedInput.view.state.values;

  const objects = urlsValue.split('\n'); // Let the cache flush app handle this? - .filter(Boolean);
  const cacheFlushUrl = process.env.CACHE_FLUSH_FUNCTION_APP_FULL_URL_WITH_PATH_AND_CODE;
  // TODO: From the response the view will need to be updated via the API
  // https://api.slack.com/surfaces/modals/using#updating_apis
  rp({
    body: {
      environment: envValue,
      objects,
    },
    json: true,
    method: 'POST',
    url: cacheFlushUrl,
  })
    .then((res) => {
      context.log(res);
    })
    .catch((err) => {
      context.log.error(err);
    });
  // }

  // TODO: Due to the cache flush function potentially taking longer than 3 secs
  // to respond there needs to be an initial ack. The response from the cache
  // flush then needs to be pushed back to the modal with a message saying
  // the request is being processed. Once the response from the cache flush
  // returns (above) the view will be updated again.
  // Below use this https://api.slack.com/surfaces/modals/using#updating_response
  context.log('*********RETURNING');
  return {
    body: {
      response_action: 'update',
      view: processingView,
    },
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  };
};
