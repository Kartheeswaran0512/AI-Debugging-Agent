require("dotenv").config();
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { readFile } = require("../tools/readFile");
const { runTests } = require("../tools/runTests");
const { applyFix } = require("../tools/applyFix");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tools = [
  {
    functionDeclarations: [
      {
        name: "readFile",
        description: "Read a source file with line numbers",
        parameters: {
          type: SchemaType.OBJECT,
          properties: { filePath: { type: SchemaType.STRING } },
          required: ["filePath"],
        },
      },
      {
        name: "runTests",
        description: "Run the test command and return pass/fail output",
        parameters: {
          type: SchemaType.OBJECT,
          properties: { command: { type: SchemaType.STRING } },
          required: ["command"],
        },
      },
      {
        name: "applyFix",
        description: "Replace oldCode with newCode in a file",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            filePath: { type: SchemaType.STRING },
            oldCode: { type: SchemaType.STRING },
            newCode: { type: SchemaType.STRING },
          },
          required: ["filePath", "oldCode", "newCode"],
        },
      },
    ],
  },
];

// const SYSTEM_PROMPT = `You are a software debugging agent.
// Steps: 1) run the tests to see the failure, 2) read the buggy file, 3) find the root cause, 4) apply a minimal fix, 5) run the tests again to verify.
// At the end reply with: Bug, Cause, Fix, Verified (yes/no), Confidence (low/medium/high).`;
const SYSTEM_PROMPT = `You are a software debugging agent.
Steps: 1) run the tests to see the failure, 2) read the buggy file, 3) find the root cause, 4) apply a minimal fix, 5) run the tests again to verify.
Rules: after applyFix succeeds, immediately run the tests. Never repeat the same tool call. If tests pass, stop and write the final report.
At the end reply with: Bug, Cause, Fix, Verified (yes/no), Confidence (low/medium/high).`;
async function sendWithRetry(modelName, contents, retries = 4) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    tools,
    systemInstruction: SYSTEM_PROMPT,
  });

  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent({ contents });
    } catch (err) {
      if (err.status === 429) throw new Error("Model still busy after retries");
      const networkError = err.message && err.message.includes("fetch failed");
      if (err.status !== 503 && !networkError) throw err;
      const wait = 2000 * (i + 1);
      console.log(`Error: ${err.status || ""} retrying in ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error("Model still busy after retries");
}

async function runAgent(bugReport, testCommand, reportOnly = false) {
  const handlers = {
    readFile: (a) => readFile(a.filePath),
    runTests: (a) => runTests(a.command || testCommand),
    applyFix: (a) => applyFix(a.filePath, a.oldCode, a.newCode, reportOnly),
  };

  const models = [
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
  ];
  let modelIndex = 0;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text:
            `Bug report: ${bugReport}\nTest command: ${testCommand}` +
            (reportOnly
              ? "\nMODE: report only. applyFix will not change files. Call applyFix once to propose the fix, do not run the tests again, and write the final report with Verified: no."
              : ""),
        },
      ],
    },
  ];

  const send = async () => {
    for (;;) {
      try {
        return await sendWithRetry(models[modelIndex], contents);
      } catch (err) {
        const busy = err.message === "Model still busy after retries";
        if (!busy || modelIndex === models.length - 1) throw err;
        modelIndex++;
        console.log(`Switching to fallback model ${models[modelIndex]}...`);
      }
    }
  };

  const seen = new Set();
  let result = await send();

  for (let step = 1; step <= 10; step++) {
    const calls = result.response.functionCalls();
    if (!calls || calls.length === 0) break;

    contents.push(result.response.candidates[0].content);

    const parts = [];
    for (const call of calls) {
      console.log(`Step ${step}: ${call.name}`);
      const key = call.name + JSON.stringify(call.args);
      let output;
      if (seen.has(key) && call.name !== "runTests") {
        output = { success: false, error: "Already done. Run the tests now and write the final report." };
      } else {
        seen.add(key);
        const handler = handlers[call.name];
        output = handler
          ? handler(call.args)
          : { success: false, error: "Unknown tool: " + call.name };
      }
      console.log("  Result:", JSON.stringify(output).slice(0, 120));
      parts.push({ functionResponse: { name: call.name, response: output } });
    }
    contents.push({ role: "user", parts });

    result = await send();
  }

  return result.response.text();
}

module.exports = { runAgent };