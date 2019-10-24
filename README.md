# Akamai Cache Flush Azure Function App

[![GitHub Release](https://img.shields.io/github/release/nhsuk/cache-flush.svg)](https://github.com/nhsuk/cache-flush/releases/latest/)
[![Build Status](https://dev.azure.com/nhsuk/nhsuk.utilities/_apis/build/status/nhsuk.cache-flush?branchName=master)](https://dev.azure.com/nhsuk/nhsuk.utilities/_build/latest?definitionId=323&branchName=master)

> An Azure Function App for flushing items out of Akamai's cache using
[Fast Purge](https://developer.akamai.com/api/core_features/fast_purge/v3.html).

## API definition

The API of the app has been documented using
[OpenAPI 3.0 Specification](https://swagger.io/docs/specification/about/).
The file is available in the repo - [swagger.yml](./swagger.yml).
To view the file in an online editor, click this
[link](https://editor.swagger.io?url=https://raw.githubusercontent.com/nhsuk/cache-flush/master/swagger.yml).
_Note: there is no link between the editor and the repository. Any changes made
in the editor will not be saved back to the repository._

## Installation

* Install the appropriate version for your development platform of
  [Azure Functions Core Tools version 2.x](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools)
* Clone the repository - `git clone https://github.com/nhsuk/cache-flush.git`
* Install npm dependencies - `npm install`
* Rename [example.local.settings.json](example.local.settings.json) to
  [local.settings.json](local.settings.json). Edit the file to include valid
  values.
  [Akamai's documentation](https://developer.akamai.com/legacy/introduction/Prov_Creds.html)
  provides details on how to setup API credentials.


## Run Azure Function App locally

* Start the Function app - `func start`


## Environment variables

Environment variables are expected to be managed by the environment in which
the application is being run. This is best practice as described by
[twelve-factor](https://12factor.net/config).

| Variable          | Description                                    | Default           | Required  |
| ----------------- | ---------------------------------------------- | ----------------- | --------- |
| `access_token`    | Akamai API access token                        |                   | Yes       |
| `client_secret`   | Akamai API client secret                       |                   | Yes       |
| `client_token`    | Akamai API client token                        |                   | Yes       |
| `host`            | Akamai API base hostname without the scheme    |                   | Yes       |
