const assert = require("assert");
const { cartReducer } = require("./cartReducer");

const initial = { items: [] };
const next = cartReducer(initial, { type: "ADD_ITEM", item: { id: 1 } });

assert.strictEqual(next.items.length, 1);
assert.notStrictEqual(next, initial, "must return a new state object");
assert.strictEqual(initial.items.length, 0, "must not mutate the old state");
console.log("All tests passed");
