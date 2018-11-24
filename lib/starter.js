// Packages
import dotFs from "@dot-event/fs"
import dotGlob from "@dot-event/glob"
import dotLog from "@dot-event/log"
import { basename } from "path"

// Helpers
import { askForStarters } from "./starter/ask"
import {
  mergeStarters,
  templatesPath,
} from "./starter/merge"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("starter")) {
    return options
  }

  dotFs({ events, store })
  dotGlob({ events, store })
  dotLog({ events, store })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      starter: async options => {
        const { cwd, events, props } = options

        await events.glob([...props, "globTemplateDirs"], {
          pattern: templatesPath + "/!(basics)",
          save: true,
        })

        const { starters } = await askForStarters(options)
        const name = basename(cwd)

        await mergeStarters({
          ...options,
          dirPath: cwd,
          name,
          starters,
        })
      },
    })

  return options
}
