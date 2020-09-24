const IndysoftNiGpib = require("../dist/binding.js");
const assert = require("assert");

assert(IndysoftNiGpib, "The expected function is undefined");

function testBasic()
{
    const result =  IndysoftNiGpib("hello");
    assert.strictEqual(result, "FLUKE, 45, 8081019, \x01", "Unexpected value returned");
}

assert.doesNotThrow(testBasic, undefined, "testBasic threw an expection");

console.log("Tests passed- everything looks OK!");