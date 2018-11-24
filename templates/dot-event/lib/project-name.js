// Packages
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"

// Helpers
import { dryMode } from "./project-name/dry"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("projectName")) {
    return options
  }

  dotFs({ events, store })
  dotLog({ events, store })
  dotSpawn({ events, store })

  events.onAny({
    projectName: [
      dryMode,
      async options => {
        const { action = "projectName" } = options

        if (actions[action]) {
          await actions[action](options)
        }
      },
    ],

    projectNameSetup: () =>
      events.argv({
        alias: {
          a: ["action"],
          d: ["dry"],
        },
      }),
  })

  return options
}

export const actions = {
  projectName: async () => {},
}
