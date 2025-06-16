# Service Analyzer (Task 9)

A console app that generates multi-perspective markdown reports for digital services using the OpenAI API.

## Requirements
- Node.js (v14+ recommended)
- npm
- OpenAI API key (see below)

## Installation
```bash
cd 9
npm install
```

## Usage
```bash
# Set your OpenAI API key in a .env file (see .env.example)
node service_analyzer.js
```

You will be prompted to enter a service name (e.g., "Spotify") or a description.

## Environment Variables
- `OPENAI_API_KEY` — your personal OpenAI API key (not to be committed!)

Copy `.env.example` to `.env` and add your key.

## Security & .gitignore
- The `.env` file is used to store your API key and **must never be committed to git**.
- `.env` is already included in `.gitignore` for your safety.
- **Never share or commit your OpenAI API key!**

## Sample Outputs
See `sample_outputs.md` for example reports. 