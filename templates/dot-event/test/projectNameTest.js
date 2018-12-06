// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import projectName from "../"

async function run(...argv) {
  await events.task({
    argv,
    op: "projectName",
    path: `${__dirname}/fixture`,
  })
}

// Constants
const cancel = ({ event }) => (event.signal.cancel = true)

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  projectName({ events })
  dotTask({ events })

  events.onAny({
    "before.spawn": cancel,
  })
})

test("projectName", async () => {
  const calls = []

  events.onAny("before.fsWriteJson", ({ event }) =>
    calls.push(event.options)
  )

  await run()

  expect(calls).toContainEqual({})
})
