/* eslint-env jest */

// Packages
import dotEvent from "dot-event"
import log from "@dot-event/log"

// Helpers
import projectName from "../"

const dot = dotEvent()

beforeEach(() => {
  dot.reset()
  log(dot)
  projectName(dot)
})

test("projectName", function() {
  dot.projectName()
})
