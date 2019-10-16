#!/bin/bash

if [ -z "$APP_SERVICE_HOST" ]; then
  echo "APP_SERVICE_HOST is not set, unable to continue. Exiting with failure."
  exit 1
fi

APP_SERVICE_URL=$APP_SERVICE_HOST/api/FastPurgeUrls

# Use the env var set from the previous task with the path to the function app
echo "Going to make request to function app: '$APP_SERVICE_URL'. "

HTTP_STATUS=$(curl -sS -XPOST "$APP_SERVICE_URL" -H "Content-Type: application/json" -d "@./scripts/test-payload.json" | jq '.httpStatus == 400')
echo "Got status '$HTTP_STATUS' from the response body of the request made to the function app."

# httpStatus (HTTP_STATUS) should be 400. This is the status code from the
# response from the request the function app has made to the Akamai API.  Due
# to the request body having no URLs to purge the request should have been
# rejected as a bad request.
if [ "$HTTP_STATUS" != "400" ]; then
  echo "HTTP Status code was not 400. Please confirm the function app has been deployed successfully."
  exit 1
fi
