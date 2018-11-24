import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import dotStarter from "../dist/starter"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  dotStarter({ events, store })
  dotTask({ events, store })

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

  expect(calls).toContainEqual({
    body:
      // prettier-ignore
      "{\n  \"name\": \"fixture\",\n  \"version\": \"0.0.1\",\n  \"description\": \"\",\n  \"keywords\": [\n    \"\"\n  ],\n  \"author\": \" <>\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+ssh://git@github.com//fixture.git\"\n  },\n  \"license\": \"MIT\",\n  \"homepage\": \"https://github.com//fixture#readme\",\n  \"operations\": {\n    \"git\": {},\n    \"link\": {},\n    \"starter\": {},\n    \"version\": {}\n  }\n}\n",
    ensure: true,
    path: `${__dirname}/fixture/package.json`,
  })

  expect(calls).toContainEqual({
    body: "# fixture\n",
    ensure: true,
    path: `${__dirname}/fixture/README.md`,
  })
})
