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

* Install the appropriate version of
  [Azure Functions Core Tools version 2.x](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools)
  for your development platform of choice
* Clone the repository - `git clone https://github.com/nhsuk/cache-flush.git`
* Install npm dependencies - `npm install`
* Rename [example.local.settings.json](example.local.settings.json) to
  [local.settings.json](local.settings.json). Edit the file to include valid
  values.
  [Akamai's documentation](https://developer.akamai.com/legacy/introduction/Prov_Creds.html)
  provides details on how to setup API credentials.

## Run Azure Function App locally

* Start the Function app - `func start`

## Deployments and environments

Deployments to all environments are fully automated and are tested to confirm
the deployment has been successful as part of the deployment process.
Therefore, if the deployment job succeeds you can be confident the application
is working.

Deployments are configured via [azure-pipelines.yml](./azure-pipelines.yml) and
run within the
[nhsuk.utilities](https://dev.azure.com/nhsuk/nhsuk.utilities/_build?definitionId=323)
project. The pipeline is not public. In order to view it a login is required.
The deployed applications are protected using the standard function app
authorisation mechanism i.e.
[authorization keys](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook#authorization-keys).
The keys are maintained as secrets to prevent abuse and unwanted use.

### Review environments
Review environments are deployed for every PR and are available at
[https://nhsuk-cache-flush-func-dev-uks-pr-<PR_NUMBER>.azurewebsites.net/](https://nhsuk-cache-flush-func-dev-uks-pr-XXX.azurewebsites.net/).
When a PR is merged into `master` the review environment will be deleted.

### [Integration](https://nhsuk-cache-flush-func-int-uks.azurewebsites.net/)
Merges to `master` generate a deployment to the integration environment.

### [Staging](https://nhsuk-cache-flush-func-stag-uks.azurewebsites.net/)
The creation of a [release](https://github.com/nhsuk/cache-flush/releases)
generates a deployment to the staging environment.

### [Production](https://nhsuk-cache-flush-func-prod-uks.azurewebsites.net/)
Deployments to production are only possible if the change has been deployed to
the staging environment. The deployment to production must be
[approved](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops#approvals).
Using approvals enables a pause between the deployment to staging and the
deployment to production. It is often necessary to seek a sign-off prior to
deploying to production and this setup allows that to happen.

## Environment variables

Environment variables are expected to be managed by the environment in which
the application is being run. This is best practice as described by
[twelve-factor](https://12factor.net/config). Environment variables are stored
in an instance of [HashiCorp Vault](https://www.vaultproject.io/).

The following environment variables are required for the application to run
successfully.
| Variable          | Description                                    | Default           | Required  |
| ----------------- | ---------------------------------------------- | ----------------- | --------- |
| `access_token`    | Akamai API access token                        |                   | Yes       |
| `client_secret`   | Akamai API client secret                       |                   | Yes       |
| `client_token`    | Akamai API client token                        |                   | Yes       |
| `host`            | Akamai API base hostname without the scheme    |                   | Yes       |

During deployment of the application additional environment variables are
retrieved from Vault. They define the details of where the application will be
deployed within Azure.

Given the variables vary for each environment, there are no default values and
they must all have values set.
| Variable                       | Description                                                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_PLAN`                     | [The App Service plan](https://docs.microsoft.com/en-us/azure/app-service/overview-hosting-plans) used by the function app                                 |
| `LOCATION`                     | [The location](https://azure.microsoft.com/en-us/global-infrastructure/locations/) where the function app is deployed to                                   |
| `RESOURCE_GROUP`               | [The Resource Group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-overview#resource-groups) the function app belongs to    |
| `WEBSITE_NODE_DEFAULT_VERSION` | [Version of node used by function app runtime](https://docs.microsoft.com/en-us/azure/azure-functions/functions-app-settings#website_node_default_version) |
