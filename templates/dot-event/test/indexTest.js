import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import dotProject from "../dist/project"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  dotProject({ events, store })
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
    op: "project",
    path: `${__dirname}/fixture`,
  })
}

test("project", async () => {
  const args = []

  events.onAny({
    "before.spawn": ({ event }) => args.push(event.args[0]),
  })

  await run()

  expect(args).toEqual([])
})
