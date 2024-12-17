import { CosmosClient } from '@azure/cosmos';
import {
  loadConfig,
  postSuccessStatus,
  postStartingStatus,
  retrievePullRequestFiles,
  sendSuccessStatus,
  retrieveContent,
} from './github.js';

import {
  fetchFromCosmosDB,
  INSTALLATIONS_CONTAINER,
  saveToCosmosDB,
  updateCosmosDB,
  USAGE_CONTAINER
} from './api.js';

import {
  run_score
} from '../run_score/run_score.js';

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);

const PROMPT_DEFENDER_CONFIG_PATH = '.github/prompt-defender.yml';
const PROMPT_DEFENCE_CHECK_NAME = 'Prompt Defence check';

const pullRequestFunctions = (context, logger) => {

  let owner = context.repo().owner;
  let repo = context.repo().repo;
  let branch_name = context.payload.pull_request.head.ref;
  let octokit = context.octokit;
  let pull_request = context.payload.pull_request;
  let installation_id = context.payload.installation.id;
  let repository_id = context.payload.repository.id;

  return {
    pull_request: pull_request,
    branch_name: branch_name,
    octokit: octokit,
    owner: owner,
    repo: repo,
    loadConfig: async () => await loadConfig(
      octokit,
      branch_name,
      PROMPT_DEFENDER_CONFIG_PATH,
      owner,
      repo
    ),
    retrievePullRequestFiles: async () => await retrievePullRequestFiles(
      octokit,
      pull_request,
      owner,
      repo
    ),
    postStartingStatus: async (checkName, checkTitle, checkSummary, checkText) => await postStartingStatus(
      context,
      pull_request,
      checkName,
      checkTitle,
      checkSummary,
      checkText
    ),
    postSuccessStatus: async () => await postSuccessStatus(
      context,
      context.payload.pull_request,
      PROMPT_DEFENCE_CHECK_NAME
    ),
    retrieveContent: async (file) => await retrieveContent(
      context,
      file,
      branch_name
    ),
    sendSuccessStatus: async (statusId, conclusion, failedChecks, summary) => await sendSuccessStatus(
      context,
      statusId,
      conclusion,
      context.payload.pull_request,
      failedChecks,
      summary
    ),
    recordTestRun: async (number_of_tests_run) => await recordTestRun(
      logger,
      installation_id,
      repository_id,
      number_of_tests_run,

    )
  }
}

export default (app) => {
  app.on(['installation.created', 'installation.deleted'], async (context) => {
    const installationId = context.payload.installation.id;
    const accountId = context.payload.installation.account.id;
    const accountType = context.payload.installation.account.type;
    const repositories = context.payload.repositories;

    const installationData = {
      installationId,
      accountId,
      accountType,
      createdAt: new Date().toISOString(),
      repositoriesCount: repositories.length,
      organization: context.payload.organization,
      requester: context.payload.requester,
      sender: context.payload.sender,
      enterprise: context.payload.enterprise,
      repositories: context.payload.repositories,
      action: context.payload.action
    };

    await saveToCosmosDB(app.log, INSTALLATIONS_CONTAINER, installationData);
  });

  app.on(['installation_repositories.added', 'installation_repositories.removed'], async (context) => {
    const installationId = context.payload.installation.id;

    const repositoryData = {
      installationId,
      repositories: context.payload.repositories,
      action: context.payload.action
    };

    await saveToCosmosDB(app.log, INSTALLATIONS_CONTAINER, repositoryData);

  });

  app.on('marketplace_purchase', async (context) => {
    const accountId = context.payload.marketplace_purchase.account.id;
    const planId = context.payload.marketplace_purchase.plan.id;
    const planName = context.payload.marketplace_purchase.plan.name;
    const eventType = context.payload.marketplace_purchase.action;
    const effective_date = context.payload.marketplace_purchase.effective_date;
    const enterprise = context.payload.marketplace_purchase.account.enterprise;
    const organization = context.payload.marketplace_purchase.account.organization;

    const subscriptionData = {
      accountId,
      planId,
      planName,
      eventType,
      eventTime: new Date().toISOString(),
      effective_date,
      enterprise
    };

    await saveToCosmosDB(app.log, 'Subscriptions', subscriptionData);
  });

  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    run_score(pullRequestFunctions(context, app.log), app.log);
  });
};

const recordTestRun = async (logger, installationId, repositoryId, number_of_tests_run) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const usageData = await fetchFromCosmosDB(logger, USAGE_CONTAINER, [
    { name: "@installationId", value: installationId },
    { name: "@month", value: currentMonth }
  ]);

  if (!usageData) {
    logger.info(`No usage data found for installation ${installationId} in month ${currentMonth}`);
  } else {
    logger.info(`Usage data found for installation ${installationId} in month ${currentMonth} with Id ${usageData.id} and other properties ${JSON.stringify(usageData)}`);
  }

  const newTestRunCount = (usageData?.testRunCount || 0) + number_of_tests_run;

  const updatedUsageData = {
    installationId: installationId,
    repositoryId: repositoryId,
    month: currentMonth,
    testRunCount: newTestRunCount
  };

  if (!usageData) {
    logger.info(`Creating new usage data for installation ${installationId} in month ${currentMonth}`);
    await saveToCosmosDB(logger, USAGE_CONTAINER, updatedUsageData);
  } else {
    logger.info(`Updating usage data for installation ${installationId} in month ${currentMonth}`);
    await updateCosmosDB(logger, USAGE_CONTAINER, usageData.id, installationId, updatedUsageData);
  }
};