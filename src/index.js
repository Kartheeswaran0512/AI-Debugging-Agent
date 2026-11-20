const { runAgent } = require("./agent/agent");

const args = process.argv.slice(2);
const reportOnly = args.includes("--report-only");
const [bugReport, testCommand] = args.filter((a) => a !== "--report-only");

if (!bugReport || !testCommand) {
  console.log('Usage: node src/index.js "bug description" "test command" [--report-only]');
  process.exit(1);
}

runAgent(bugReport, testCommand, reportOnly).then((report) => {
  console.log("\n=========== FINAL REPORT ===========");
  console.log(report);
});
