const { execSync } = require("child_process");

function runTests(command = "npm test") {
  try {
    const output = execSync(command, { encoding: "utf-8", timeout: 30000, stdio: "pipe" });
    return { success: true, passed: true, output };
  } catch (err) {
    return {
      success: true,
      passed: false,
      output: (err.stdout || "") + (err.stderr || ""),
    };
  }
}

module.exports = { runTests };