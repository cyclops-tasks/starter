/* eslint-env jest */

var lib = require("./")

test("export something", function() {
  expect(Object.keys(lib).length).toBeGreaterThan(0)
})
