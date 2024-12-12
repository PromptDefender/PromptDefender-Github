import crypto from 'crypto';
import { retrieveScore } from './api.js';
import { CosmosClient } from '@azure/cosmos';
import {
  loadConfig,
  postSuccessStatus,
  postStartingStatus,
  retrievePullRequestFiles,
  sendSuccessStatus,
} from './github.js';

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);

const DEFENDER_URL = process.env.DEFENDER_URL;
const PROMPT_DEFENDER_CONFIG_PATH = '.github/prompt-defender.yml';
const PROMPT_DEFENCE_CHECK_NAME = 'Prompt Defence check';
const PROMPT_DEFENCE_CHECK_TITLE = 'Checking prompts';
const PROMPT_DEFENCE_CHECK_SUMMARY = 'Checking prompts for security vulnerabilities';
const PROMPT_DEFENCE_CHECK_TEXT = 'Checking prompts for security vulnerabilities';


const handleConfigFileChange = (app, config) => {
  app.log.info('Config file has changed getting all prompt files');
  return config.prompts.map(prompt => {
    return {
      filename: prompt,
      status: 'modified',
    };
  });
};

export default (app) => {
  app.on('installation.created', async (context) => {
    const installationId = context.payload.installation.id;
    const accountId = context.payload.installation.account.id;
    const accountType = context.payload.installation.account.type;
    const repositories = context.payload.repositories;

    const installationData = {
      installationId,
      accountId,
      accountType,
      createdAt: new Date().toISOString(),
      repositoriesCount: repositories.length
    };

    await saveToCosmosDB('Installations', installationData);
  });

  app.on('marketplace_purchase', async (context) => {
    const accountId = context.payload.marketplace_purchase.account.id;
    const planId = context.payload.marketplace_purchase.plan.id;
    const planName = context.payload.marketplace_purchase.plan.name;
    const eventType = context.payload.action;

    const subscriptionData = {
      accountId,
      planId,
      planName,
      eventType,
      eventTime: new Date().toISOString()
    };

    await saveToCosmosDB('Subscriptions', subscriptionData);
  });

  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    const pullRequest = context.payload.pull_request;
    const branchName = pullRequest.head.ref;

    const config = await loadConfig(
      context.octokit, 
      branchName, 
      PROMPT_DEFENDER_CONFIG_PATH, 
      context.repo().owner, 
      context.repo().repo
    );

    const files = await retrievePullRequestFiles(context.octokit, pullRequest, context.repo().owner, context.repo().repo);
    let promptFiles = retrievePromptsFromFiles(files, config);

    const changedFiles = files.data.map(file => file.filename);

    if (changedFiles.includes(PROMPT_DEFENDER_CONFIG_PATH)) {
      promptFiles = handleConfigFileChange(app, config);
    }

    app.log.info(`Files changed: ${files.data.map(file => file.filename)}`);
    app.log.info(`Prompt files: ${promptFiles.map(file => file.filename)}`);

    if (promptFiles.length === 0) {
      await postSuccessStatus(context, pullRequest, PROMPT_DEFENCE_CHECK_NAME);
      return;
    }

    const statusCreated = await postStartingStatus(context, pullRequest, PROMPT_DEFENCE_CHECK_NAME, PROMPT_DEFENCE_CHECK_TITLE, PROMPT_DEFENCE_CHECK_SUMMARY, PROMPT_DEFENCE_CHECK_TEXT);
    app.log.info(`Responses: ${JSON.stringify(statusCreated, null, 2)}`);

    const responses = [];

    for (const file of promptFiles) {

      app.log.info(`Checking file ${file.filename}`);

      if (file.status === 'removed') {
        app.log.info(`File ${file.filename} has been removed. Skipping.`);
        continue;
      }

      const { data: fileContent } = await context.octokit.repos.getContent({
        owner: context.repo().owner,
        repo: context.repo().repo,
        path: file.filename,
        ref: branchName,
      });

      const prompt = Buffer.from(fileContent.content, 'base64').toString();

      const response = await retrieveScore(prompt);
      app.log.info(`Prompt score: ${response.score}`);

      responses.push({
        file: file.filename,
        score: response.score,
        explanation: response.explanation,
        hash: crypto.createHash('sha256').update(prompt).digest('hex'),
        passOrFail: response.score >= config.threshold ? 'pass' : 'fail',
      });
    }

    await processResults(app, context, pullRequest, config.threshold, responses, statusCreated.data.id);

  });
};

const processResults = async (app, context, pullRequest, threshold, responses, statusId) => {

  if (!statusId) {
    app.log.error('Status ID is not defined. Exiting processResults.');
    return;
  }

  const failedChecks = responses.filter(response => response.passOrFail === 'fail').length;

  let conclusion = 'success';
  if (failedChecks > 0) {
    conclusion = 'failure';
  }

  const summary = responses.map(response => {
    const badge = response.passOrFail === 'pass' ? '![Pass](https://img.shields.io/badge/Status-Pass-green)' : '![Fail](https://img.shields.io/badge/Status-Fail-red)';
    return `
    ## Prompt Defence - ${response.passOrFail.toUpperCase()} ${badge}
    Threshold is set to ${threshold}
    
    ### File: ${response.file}
    - **Score**: ${response.score}
    - **Explanation**: ${response.explanation}
    - **Pass/Fail**: ${response.passOrFail} 
    - [Prompt Defence - test results](${DEFENDER_URL}/score/${response.hash})
    `;
  }).join('\n\n'); // Ensure each section is separated by an empty line

  await sendSuccessStatus(context, statusId, conclusion, pullRequest, failedChecks, summary);
};

const retrievePromptsFromFiles = (files, config) => {
  return files.data.filter((file) => config.prompts.includes(file.filename));
};

const saveToCosmosDB = async (containerName, data) => {
  const { container } = client.database('YourDatabaseName').container(containerName);
  await container.items.create(data);
};

const fetchFromCosmosDB = async (containerName, query) => {
  const { container } = client.database('YourDatabaseName').container(containerName);
  const { resources } = await container.items.query({ query: `SELECT * FROM c WHERE c.installationId = @installationId AND c.month = @month`, parameters: query }).fetchAll();
  return resources[0];
};

const recordTestRun = async (installationId, repositoryId) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const usageData = await fetchFromCosmosDB('Usage', { installationId, month: currentMonth });

  const newTestRunCount = (usageData?.testRunCount || 0) + 1;

  const updatedUsageData = {
    installationId,
    repositoryId,
    month: currentMonth,
    testRunCount: newTestRunCount
  };

  await saveToCosmosDB('Usage', updatedUsageData);
};

