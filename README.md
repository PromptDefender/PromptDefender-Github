# prompt-defender-webhook

> A GitHub App built with [Probot](https://github.com/probot/probot) that A github application which will allow pull requests and  code repepositories to interact with prompt defender, integrating prLLM Security practices into the CI/CD pipeline

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Project Structure

```sh
.
├── js
│   ├── src
│   │   ├── callback
│   │   │   ├── api.js
│   │   │   └── app.js
│   │   ├── functions
│   │   │   └── pr-callback.js
│   │   └── index.js
│   └── test
│       └── index.test.js
└── py
    ├── src
    │   └── sample_app.py
    └── test
        └── test_sample_app.py
```

## Running the JavaScript Project

To run the JavaScript project, navigate to the `js` directory and execute the following commands:

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Running the Sample Python Application

To run the sample Python application, navigate to the `py/src` directory and execute the following command:

```sh
python sample_app.py
```

## Contributing

If you have suggestions for how prompt-defender-webhook could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2024 dllewellyn
