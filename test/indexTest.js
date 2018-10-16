import dotEvent from "dot-event"
import dotStore from "dot-store"
import starter, { templatesPath } from "../dist/starter"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  starter({ events, store })

  await store.set("tasks.fixture", {
    projectPath: `${__dirname}/fixture`,
    projectPkgPath: `${__dirname}/fixture/package.json`,
    taskId: "fixture",
    taskIndex: 0,
    taskLeader: true,
  })

  const cancelEvent = ({ event }) =>
    (event.signal.cancel = true)

  events.onAny({
    "before.fs.copy": cancelEvent,
    "before.fs.writeJson": cancelEvent,
  })
})

async function run(option = "basics") {
  await store.set("argv", {
    _: ["starter"],
    [option]: true,
  })

  await Promise.all([
    events.emit("startTask", { taskId: "fixture" }),
  ])
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
      json: { name: "fixture", starters: ["basics"] },
      options: { spaces: 2 },
      path: `${__dirname}/fixture/package.json`,
    },
  ])
})
