import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import projectName from "../dist/project-name"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  projectName({ events, store })
  dotTask({ events, store })

  events.onAny({
    "before.spawn": ({ event }) => {
      event.signal.cancel = true
    },
  })
})

async function run(...argv) {
  await events.task({
    argv,
    op: "projectName",
    path: `${__dirname}/fixture`,
  })
}

test("projectName", async () => {
  const calls = {}

  events.onAny("before.fs", ({ action, event }) => {
    calls[action] = calls[action] || []
    calls[action].push(event.args[0])
  })

  await run()

  expect(calls.writeFile).toContainEqual({})
})
