const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "sample-bugs");
const originals = path.join(dir, "originals");

fs.readdirSync(originals).forEach((file) => {
  fs.copyFileSync(path.join(originals, file), path.join(dir, file));
});
console.log("Sample bugs reset");
