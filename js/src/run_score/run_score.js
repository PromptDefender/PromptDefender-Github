
import crypto from 'crypto';
import { retrieveScore } from '../callback/api.js';

const DEFENDER_URL = process.env.DEFENDER_URL;
const PROMPT_DEFENDER_CONFIG_PATH = '.github/prompt-defender.yml';
const PROMPT_DEFENCE_CHECK_NAME = 'Prompt Defence check';
const PROMPT_DEFENCE_CHECK_TITLE = 'Checking prompts';
const PROMPT_DEFENCE_CHECK_SUMMARY = 'Checking prompts for security vulnerabilities';
const PROMPT_DEFENCE_CHECK_TEXT = 'Checking prompts for security vulnerabilities';


export const run_score = async (functions, logger) => {
    const config = await functions.loadConfig();
    const files = await functions.retrievePullRequestFiles();
    let promptFiles = retrievePromptsFromFiles(files, config);

    const changedFiles = files.data.map(file => file.filename);

    if (changedFiles.includes(PROMPT_DEFENDER_CONFIG_PATH)) {
        promptFiles = handleConfigFileChange(logger, config);
    }

    logger.info(`Files changed: ${files.data.map(file => file.filename)}`);
    logger.info(`Prompt files: ${promptFiles.map(file => file.filename)}`);

    if (promptFiles.length === 0) {
        await functions.postSuccessStatus();
        return;
    }

    const statusCreated = await functions.postStartingStatus(
        PROMPT_DEFENCE_CHECK_NAME,
        PROMPT_DEFENCE_CHECK_TITLE,
        PROMPT_DEFENCE_CHECK_SUMMARY,
        PROMPT_DEFENCE_CHECK_TEXT
    );

    logger.info(`Responses: ${JSON.stringify(statusCreated, null, 2)}`);

    const responses = [];

    for (const file of promptFiles) {

        logger.info(`Checking file ${file.filename}`);

        if (file.status === 'removed') {
            logger.info(`File ${file.filename} has been removed. Skipping.`);
            continue;
        }

        const { data: fileContent } = await functions.retrieveContent(file);

        const prompt = Buffer.from(fileContent.content, 'base64').toString();

        const response = await retrieveScore(prompt, logger.info);
        logger.info(`Prompt score: ${response}`);

        responses.push({
            file: file.filename,
            score: response.score,
            explanation: response.explanation,
            hash: crypto.createHash('sha256').update(prompt).digest('hex'),
            passOrFail: response.score >= config.threshold ? 'pass' : 'fail',
        });
    }

    functions.recordTestRun(responses.length);
    
    await processResults(logger, functions, config.threshold, responses, statusCreated.data.id);
}

const processResults = async (logger, functions, threshold, responses, statusId) => {

    if (!statusId) {
        logger.error('Status ID is not defined. Exiting processResults.');
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

    await functions.sendSuccessStatus(statusId, conclusion, failedChecks, summary);
};

const retrievePromptsFromFiles = (files, config) => {
    return files.data.filter((file) => config.prompts.includes(file.filename));
};

const handleConfigFileChange = (logger, config) => {
    logger.info('Config file has changed getting all prompt files');
    return config.prompts.map(prompt => {
      return {
        filename: prompt,
        status: 'modified',
      };
    });
  };