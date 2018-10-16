import * as lib from "../dist"

test("export something", () => {
  expect(Object.keys(lib).length).toBeGreaterThan(0)
})
