export function dryMode({ events, store }) {
  if (!store.get("argv.dry")) {
    return
  }

  events.onAny("before.fs", async ({ event }) => {
    event.signal.cancel = true
  })

  events.onAny("before.spawn", async ({ event }) => {
    event.signal.cancel = true
  })
}