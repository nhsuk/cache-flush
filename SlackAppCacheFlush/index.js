const qs = require('querystring');
const rp = require('request-promise-native');

const successView = require('./views/success.json');
const errorView = require('./views/error.json');

module.exports = async function cacheFlush(context, input) {
  context.log('****************CACHEFLUSH...');
  const payload = JSON.parse(qs.unescape(qs.parse(input).payload));
  context.log(payload);

  const {
    environment: { environment_input: { selected_option: { value: envValue } } },
    urls: { urls_input: { value: urlsValue } },
  } = payload.view.state.values;

  const objects = urlsValue.split('\n');
  // context.log('****************objects');
  // context.log(objects);
  const cacheFlushUrl = process.env.CACHE_FLUSH_FUNCTION_APP_FULL_URL_WITH_PATH_AND_CODE;
  let view;
  try {
    const cacheFlushRes = await rp({
      body: {
        environment: envValue,
        objects,
      },
      json: true,
      method: 'POST',
      resolveWithFullResponse: true,
      url: cacheFlushUrl,
    });
    context.log.error('*******************cacheFlushRes');
    context.log.error(cacheFlushRes);
    // TODO: Create a 'markdown block creator' helper and append them to blocks
    successView.blocks[1].text.text = `*Environment:* ${envValue}`;
    successView.blocks[2].text.text = `*URLs:*\n${urlsValue}`;
    view = successView;
  } catch (err) {
    // TODO: Create a 'markdown block creator' helper and append them to blocks
    errorView.blocks[1].text.text = `*Status Code:* ${err.statusCode}`;
    errorView.blocks[2].text.text = `*Error:*\n\`\`\`${JSON.stringify(err.error, null, '\t')}\`\`\``;
    view = errorView;
    context.log('**************BUSTED');
    context.log(err);
  }
  // TODO: Move this to another function and call from orchestrator
  // TODO: Send the appropriate view
  // SUCCESS - include env and URLs that were flushed as read only fields
  // FAILED - include env and URLs as editable fields
  try {
    const viewUpdateRes = await rp({
      body: {
        view,
        view_id: payload.view.id,
      },
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`,
      },
      json: true,
      method: 'POST',
      url: 'https://slack.com/api/views.update',
    });
    context.log('*******************VIEW WAS SUCCESSFULLY UPDATED');
    context.log(viewUpdateRes);
  } catch (err) {
    context.log.error('*******************ERROR OCCURRED DURING UPDATING VIEW');
    context.log.error(err);
  }

  context.log('*********RETURNING');
  // context.done(null, 'done');
};
