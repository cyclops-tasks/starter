import cyclops from "cyclops"
import dotEvent from "dot-event"
import dotStore from "dot-store"
import starter from "../dist/starter"
import { templatesPath } from "../dist/starter/merge"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  cyclops({ events, store })

  events.onAny({
    "before.fs": ({ action, event }) => {
      if (["copy", "writeJson"].indexOf(action) > -1) {
        event.signal.cancel = true
      }
    },
  })
})

async function run() {
  await events.cyclops({
    argv: ["fixture", "--basics"],
    composer: starter,
    op: "starter",
    path: __dirname,
  })
}

test("starts a new project", async () => {
  const copies = []
  const writes = []

  events.onAny("before.fs", ({ action, event }) => {
    if (action === "copy") {
      copies.push(event.args[0])
    }

    if (action === "writeJson") {
      writes.push(event.args[0])
    }
  })

  await run()

  expect(copies).toEqual([
    {
      action: "copy",
      dest: `${__dirname}/fixture/.gitignore`,
      src: `${templatesPath}/basics/gitignore`,
    },
    {
      action: "copy",
      dest: `${__dirname}/fixture/.npmignore`,
      src: `${templatesPath}/basics/npmignore`,
    },
    {
      action: "copy",
      dest: `${__dirname}/fixture/package.json`,
      src: `${templatesPath}/basics/package.json`,
    },
    {
      action: "copy",
      dest: `${__dirname}/fixture/README.md`,
      src: `${templatesPath}/basics/README.md`,
    },
  ])

  expect(writes[0]).toMatchObject({
    action: "writeJson",
    ensure: true,
    json: { cyclops: { starter: {} } },
    path: `${__dirname}/fixture/package.json`,
    spaces: 2,
  })

  expect(writes[1]).toMatchObject({
    action: "writeJson",
    json: {
      cyclops: {
        git: {},
        link: {},
        starter: {},
        version: {},
      },
      name: "fixture",
    },
    path: `${__dirname}/fixture/package.json`,
    spaces: 2,
  })
})
