const assert = require("assert");
const { getUserName } = require("./profile");

assert.strictEqual(getUserName({ name: "karthi" }), "KARTHI");
assert.strictEqual(getUserName(undefined), "GUEST");
console.log("All tests passed");