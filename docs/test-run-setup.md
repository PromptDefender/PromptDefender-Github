# Setup

To use the test runner, you need to add a single file to your repository and install the application 

## Step 1: Add the test runner configuration file

* Create the .github directory in the root of your repository if it doesn't already exist:

```bash
mkdir .github
```

* Create a new file in the .github directory called prompt-defender.yml:

```bash
touch .github/prompt-defender.yml
```

* Add the following content to the prompt-defender.yml file:

```yaml
prompts:
  - 'path/to/your/prompt-file1.txt'
  - 'path/to/your/prompt-file2.txt'
threshold: 0.5
```

Replace path/to/your/prompt-file1.txt and path/to/your/prompt-file2.txt with the paths to the prompt files you want to test.

## Step 2: Install the application

To install the application, go to the [GitHub Marketplace](https://github.com/apps/prompt-shield-llm-app-security)

That's it. To start a test run, simply push a commit to your repository.