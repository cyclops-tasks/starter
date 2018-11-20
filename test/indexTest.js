import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import dotStarter from "../dist/starter"
import { templatesPath } from "../dist/starter/merge"

const cancelActions = ["copy", "writeFile", "writeJson"]

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  dotStarter({ events, store })
  dotTask({ events, store })

  events.onAny({
    "before.fs": ({ action, event }) => {
      if (cancelActions.indexOf(action) > -1) {
        event.signal.cancel = true
      }
    },
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
  const calls = {}

  events.onAny("before.fs", ({ action, event }) => {
    calls[action] = calls[action] || []
    calls[action].push(event.args[0])
  })

  await run()

  expect(calls.writeFile).toContainEqual({
    action: "writeFile",
    body: "dist\nnode_modules\n",
    ensure: true,
    path: `${__dirname}/fixture/.gitignore`,
  })

  expect(calls.writeFile).toContainEqual({
    action: "writeFile",
    body: "lib\ntest\n",
    ensure: true,
    path: `${__dirname}/fixture/.npmignore`,
  })

  expect(calls.writeFile).toContainEqual({
    action: "writeFile",
    body:
      // prettier-ignore
      "{\n  \"name\": \"fixture\",\n  \"version\": \"0.0.1\",\n  \"description\": \"\",\n  \"keywords\": [\n    \"\"\n  ],\n  \"author\": \" <>\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+ssh://git@github.com//fixture.git\"\n  },\n  \"license\": \"MIT\",\n  \"homepage\": \"https://github.com//fixture#readme\"\n}\n",
    ensure: true,
    path: `${__dirname}/fixture/package.json`,
  })

  expect(calls.writeFile).toContainEqual({
    action: "writeFile",
    body: "# fixture\n",
    ensure: true,
    path: `${__dirname}/fixture/README.md`,
  })
})
