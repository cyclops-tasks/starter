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
    "before.fs": ({ copy, event, writeJson }) => {
      if (copy || writeJson) {
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

  events.onAny(
    "before.fs",
    ({ copy, event, writeJson }) => {
      if (copy) {
        copies.push(event.args[0])
      }

      if (writeJson) {
        writes.push(event.args[0])
      }
    }
  )

  await run()

  expect(copies).toEqual([
    {
      copy: true,
      dest: `${__dirname}/fixture/.gitignore`,
      src: `${templatesPath}/basics/gitignore`,
    },
    {
      copy: true,
      dest: `${__dirname}/fixture/.npmignore`,
      src: `${templatesPath}/basics/npmignore`,
    },
    {
      copy: true,
      dest: `${__dirname}/fixture/package.json`,
      src: `${templatesPath}/basics/package.json`,
    },
    {
      copy: true,
      dest: `${__dirname}/fixture/README.md`,
      src: `${templatesPath}/basics/README.md`,
    },
  ])

  expect(writes).toEqual([
    {
      json: {
        cyclops: {
          git: {},
          link: {},
          starter: {},
          version: {},
        },
        name: "fixture",
      },
      options: { spaces: 2 },
      path: `${__dirname}/fixture/package.json`,
      writeJson: true,
    },
  ])
})
