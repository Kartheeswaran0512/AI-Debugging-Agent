const fs = require("fs");
const path = require("path");

function readFile(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    return { success: false, error: "File not found: " + filePath };
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  const numbered = content
    .split("\n")
    .map((line, i) => `${i + 1}: ${line}`)
    .join("\n");
  return { success: true, path: filePath, content: numbered };
}

module.exports = { readFile };