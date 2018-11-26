// Packages
import dotArgv, { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStore from "@dot-event/store"

// Helpers
import { argv } from "./project-name/argv"
import { subTask } from "./project-name/sub-task"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("projectName")) {
    return options
  }

  dotArgv({ events })
  dotFs({ events })
  dotLog({ events })
  dotSpawn({ events })
  dotStore({ events })

  events.onAny({
    projectName: [argv, argvRelay],
    projectNameSubTask: subTask,
  })

  return options
}
