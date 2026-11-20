const assert = require("assert");
const { getTotal } = require("./cart");

assert.strictEqual(getTotal([{ price: 100, qty: 2 }, { price: 50, qty: 1 }]), 250);
assert.strictEqual(getTotal([]), 0);
console.log("All tests passed");
