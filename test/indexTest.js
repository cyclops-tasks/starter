// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import dotStarter from "../"

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  dotStarter({ events })
  dotTask({ events })

  const cancel = ({ event }) => (event.signal.cancel = true)

  events.onAny({
    "before.fsCopy": cancel,
    "before.fsWriteFile": cancel,
    "before.fsWriteJson": cancel,
  })
})

async function run() {
  await events.task({
    argv: ["fixture", "--basics"],
    op: "starter",
    path: __dirname,
  })
}

test("starts a new project", async () => {
  const calls = []

  events.onAny("before.fsWriteFile", ({ event }) => {
    calls.push(event.options)
  })

  await run()

  expect(calls).toContainEqual({
    body: "dist\nnode_modules\n",
    ensure: true,
    path: `${__dirname}/fixture/.gitignore`,
  })

  expect(calls).toContainEqual({
    body: "lib\ntest\n",
    ensure: true,
    path: `${__dirname}/fixture/.npmignore`,
  })

  // prettier-ignore
  expect(calls).toContainEqual({
    body: expect.stringContaining("\"name\": \"fixture\""),
    ensure: true,
    path: `${__dirname}/fixture/package.json`,
  })

  expect(calls).toContainEqual({
    body: "# fixture\n",
    ensure: true,
    path: `${__dirname}/fixture/README.md`,
  })
})
