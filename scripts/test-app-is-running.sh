#!/bin/bash

# Use the env var set from the previous task with the path to the function app
echo "Going to make request to function app: '$APP_SERVICE_URL'. "

HTTP_STATUS="$(curl -s -o /dev/null -w '%{http_code}' -XGET "$APP_SERVICE_URL")"
echo "Got status: '$HTTP_STATUS'."

if [ "$HTTP_STATUS" != "200" ]; then
  echo "Non-successful HTTP Status code: '$HTTP_STATUS'. Exiting with failure."
  exit 1
fi
