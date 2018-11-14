import cyclops from "cyclops"
import dotEvent from "dot-event"
import dotStore from "dot-store"
import starter from "../dist/starter"
import { templatesPath } from "../dist/starter/merge"

let events, store

function cancelEvent({ event }) {
  event.signal.cancel = true
}

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)
  cyclops({ events, store })

  events.onAny({
    "before.fs.copy": cancelEvent,
    "before.fs.writeJson": cancelEvent,
  })
})

async function run() {
  await events.cyclops({
    argv: ["test/fixture"],
    composer: starter,
    path: __dirname,
    task: "starter-tasks",
  })
}

test("starts a new project", async () => {
  const copies = []
  const writes = []

  events.onAny("before.fs.copy", ({ event }) => {
    copies.push(event.args[0])
  })

  events.onAny("before.fs.writeJson", ({ event }) => {
    writes.push(event.args[0])
  })

  await run()

  expect(copies).toEqual([
    {
      dest: `${__dirname}/fixture/.gitignore`,
      src: `${templatesPath}/basics/gitignore`,
    },
    {
      dest: `${__dirname}/fixture/.npmignore`,
      src: `${templatesPath}/basics/npmignore`,
    },
    {
      dest: `${__dirname}/fixture/package.json`,
      src: `${templatesPath}/basics/package.json`,
    },
    {
      dest: `${__dirname}/fixture/README.md`,
      src: `${templatesPath}/basics/README.md`,
    },
  ])

  expect(writes).toEqual([
    {
      ensure: true,
      json: { cyclops: { "starter-tasks": {} } },
      path: `${__dirname}/fixture/package.json`,
    },
    {
      json: {
        cyclops: {
          "starter-tasks": {},
          "version-tasks": {},
        },
        name: "fixture",
      },
      options: { spaces: 2 },
      path: `${__dirname}/fixture/package.json`,
    },
  ])
})
