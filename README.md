# AI-Debugging-Agent

An AI agent that finds the root cause of a bug, applies a minimal fix and verifies it by re-running the tests.

## How it works
1. Runs the tests and sees the failure
2. Reads the buggy file
3. Finds the root cause
4. Applies a minimal fix (a `.bak` backup is saved)
5. Runs the tests again to verify
6. Writes a report: Bug, Cause, Fix, Verified, Confidence

## Tools
- `readFile`: reads source files with line numbers
- `runTests`: runs the test command and returns pass or fail
- `applyFix`: replaces the buggy code (handles Windows line endings)

## Features
- Report-only mode (no files changed)
- Model fallback and retry on 503 and 429 errors
- Loop guard that blocks repeated tool calls
- Max 10 steps

## Setup
```
npm install
```
Create `.env`:
```
GEMINI_API_KEY=your_key_here
```

## Usage
```
node src/index.js "bug description" "test command"
node src/index.js "bug description" "test command" --report-only
```

## Example
```
node src/index.js "getUserName crashes when user is undefined" "node sample-bugs/test.js"
```

## Tech
Node.js, Gemini API (function calling)
