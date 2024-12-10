import yaml from 'js-yaml';
import crypto from 'crypto';
import { retrieveScore } from './api.js';

const DEFENDER_URL = process.env.DEFENDER_URL;

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

export default (app) => {
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    const pullRequest = context.payload.pull_request;
    const branchName = pullRequest.head.ref;

    const { data: fileContent } = await context.octokit.repos.getContent({
      owner: context.repo().owner,
      repo: context.repo().repo,
      path: '.github/prompt-defender.yml',
      ref: branchName,
    });

    const content = Buffer.from(fileContent.content, 'base64').toString();
    const config = yaml.load(content);

    app.log.info(`Config is ${JSON.stringify(config)}`);

    const files = await retrievePullRequestFiles(context, pullRequest);
    var promptFiles = retrievePromptsFromFiles(files, config);

    // Log the files that have changed.
    
    const changedFiles = files.data.map(file => file.filename);
    if (changedFiles.includes('.github/prompt-defender.yml')) {

      app.log.info('Config file has changed getting all prompt files');
      promptFiles = config.prompts.map(prompt => {
        return {
          filename: prompt,
          status: 'modified',
        };
      });
    }
    
    app.log.info(`Files changed: ${files.data.map(file => file.filename)}`);
    app.log.info(`Prompt files: ${promptFiles.map(file => file.filename)}`);

    if (promptFiles.length === 0) {
      app.log.info('No prompt files found');
      // Post success status to github 
      await context.octokit.checks.create({
        owner: context.repo().owner,
        repo: context.repo().repo,
        name: 'Prompt Defence check',
        head_sha: pullRequest.head.sha,
        status: 'completed',
        conclusion: 'success',
        output: {
          title: 'Checks Passed',
          summary: 'All checks have passed.',
          text: 'No prompt files found.',
        },
      });
    }

    for (const file of promptFiles) {

      app.log.info(`Checking file ${file.filename}`);

      if (file.status === 'removed') {
        continue;
      }

      const { data: fileContent } = await context.octokit.repos.getContent({
        owner: context.repo().owner,
        repo: context.repo().repo,
        path: file.filename,
        ref: branchName,
      });

      // Log prompt content 
      const prompt = Buffer.from(fileContent.content, 'base64').toString();
      app.log.info(`Prompt content: ${prompt}`);

      const response = await retrieveScore(prompt);

      app.log.info(`Prompt response: ${response}`);

      app.log.info(`Prompt score: ${response.score}`);

      if (response.score < config.threshold) {
        app.log.info(`Setting failed status for ${file.filename}`);

        const fileHash = crypto.createHash('sha256').update(prompt).digest('hex');


        await setFailedStatus(context, pullRequest, file, response, config, fileHash);
        return;
      }
    }

    await context.octokit.checks.create({
      owner: context.repo().owner,
      repo: context.repo().repo,
      name: 'Prompt Defence check',
      head_sha: pullRequest.head.sha,
      status: 'completed',
      conclusion: 'success',
      output: {
        title: 'Checks Passed',
        summary: 'All checks have passed.',
        text: 'All prompt files have passed.',
      },
    });

  });
};

async function setFailedStatus(context, pullRequest, file, response, config, fileHash) {
  await context.octokit.checks.create({
    owner: context.repo().owner,
    repo: context.repo().repo,
    name: 'Prompt Defence check',
    head_sha: pullRequest.head.sha,
    status: 'completed',
    details_url: `https://pdappservice.azurewebsites.net/score/${fileHash}`,
    conclusion: 'failure',
    output: {
      title: 'Checks Failed',
      summary: `One or more checks have failed for file ${file.filename}.`,
      text: `The file ${file.filename} has a score of ${response.score}, which is below the threshold of ${config.threshold}.\n\nExplanation: ${response.explanation}.\n\nView the full report [here](https://defender.safetorun.com/score/${fileHash}).`,
    },
  });
}

function retrievePromptsFromFiles(files, config) {
  return files.data.filter((file) => config.prompts.includes(file.filename)
  );
}

async function retrievePullRequestFiles(context, pullRequest) {
  return await context.octokit.pulls.listFiles({
    owner: context.repo().owner,
    repo: context.repo().repo,
    pull_number: pullRequest.number,
  });
}