import yaml from 'js-yaml';

const DEFENDER_URL = process.env.DEFENDER_URL;

export const loadConfig = async (octokit, branchName, configPath, owner, repo) => {
  const { data: fileContent } = await octokit.repos.getContent({
    owner: owner,
    repo: repo,
    path: configPath,
    ref: branchName,
  });

  const content = Buffer.from(fileContent.content, 'base64').toString();
  return yaml.load(content);
};

export const postSuccessStatus = async (context, pullRequest, checkName) => {
  await context.octokit.checks.create({
    owner: context.repo().owner,
    repo: context.repo().repo,
    name: checkName,
    head_sha: pullRequest.head.sha,
    status: 'completed',
    conclusion: 'success',
    output: {
      title: 'Checks Passed',
      summary: 'No prompt files have changed.',
      text: 'No prompt files have been changed.',
    },
  });
};

export const postStartingStatus = async (context, pullRequest, checkName, checkTitle, checkSummary, checkText) => {
  return await context.octokit.checks.create({
    owner: context.repo().owner,
    repo: context.repo().repo,
    name: checkName,
    head_sha: pullRequest.head.sha,
    status: 'in_progress',
    output: {
      title: checkTitle,
      summary: checkSummary,
      text: checkText,
    },
  });
};

export const retrievePullRequestFiles = async (octokit, pullRequest, owner, repo) => {
  return await octokit.pulls.listFiles({
    owner: owner,
    repo: repo,
    pull_number: pullRequest.number,
  });
};

export const fetchInstallationDetails = async (context, installationId) => {
  const response = await context.octokit.request('GET /app/installations/{installation_id}', {
    installation_id: installationId
  });

  return response.data;
};

export const fetchMarketplaceDetails = async (context, accountId) => {
  const response = await context.octokit.request('GET /marketplace_listing/accounts/{account_id}', {
    account_id: accountId
  });

  return response.data;
};

export async function sendSuccessStatus(context, statusId, conclusion, pullRequest, failedChecks, summary) {
    try {
      await context.octokit.checks.update({
        owner: context.repo().owner,
        repo: context.repo().repo,
        check_run_id: statusId,
        status: 'completed',
        conclusion: conclusion,
        details_url: `${DEFENDER_URL}/score/${pullRequest.head.sha}`,
        output: {
          title: 'Checks Complete',
          summary: (failedChecks > 0) ? 'One or more checks have failed.' : 'All checks have passed.',
          text: summary,
        },
      });
    } catch (error) {
      context.log.error('Failed to update check run:', error);
      throw error;
    }
  }
  
  export 

  async function retrieveContent(context, file, branchName) {
    return await context.octokit.repos.getContent({
      owner: context.repo().owner,
      repo: context.repo().repo,
      path: file.filename,
      ref: branchName,
    });
  }
  
  
  