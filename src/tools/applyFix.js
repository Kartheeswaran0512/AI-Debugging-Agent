const fs = require("fs");
const path = require("path");

function applyFix(filePath, oldCode, newCode, reportOnly = false) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    return { success: false, error: "File not found: " + filePath };
  }

  const original = fs.readFileSync(fullPath, "utf-8");
  const usesCRLF = original.includes("\r\n");
  const content = original.replace(/\r\n/g, "\n");
  const oldNorm = oldCode.replace(/\r\n/g, "\n");
  const newNorm = newCode.replace(/\r\n/g, "\n");

  if (!content.includes(oldNorm)) {
    return { success: false, error: "Old code not found in file. Read the file again and copy the exact text." };
  }

  if (reportOnly) {
    return { success: true, applied: false, message: "Report only mode, no changes made" };
  }

  fs.writeFileSync(fullPath + ".bak", original);
  let updated = content.replace(oldNorm, newNorm);
  if (usesCRLF) updated = updated.replace(/\n/g, "\r\n");
  fs.writeFileSync(fullPath, updated);
  return { success: true, applied: true, backup: filePath + ".bak" };
}

module.exports = { applyFix };