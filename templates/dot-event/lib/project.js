// Packages
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"

// Helpers
import { dryMode } from "./project/dry"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("project")) {
    return options
  }

  dotFs({ events, store })
  dotLog({ events, store })
  dotSpawn({ events, store })

  events.onAny({
    project: [
      dryMode,
      async options => {
        const { action } = options

        if (actions[action]) {
          await actions[action](options)
        }
      },
    ],

    projectSetup: () =>
      events.argv("argv", {
        alias: {
          a: ["action"],
          d: ["dry"],
        },
      }),
  })

  return options
}

export const actions = {}
