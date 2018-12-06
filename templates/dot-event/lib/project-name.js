// Packages
import dotArgv, { argvRelay } from "@dot-event/argv"
import dotLog from "@dot-event/log"
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
  dotLog({ events })
  dotStore({ events })

  events.onAny({
    projectName: argvRelay,
    projectNameSetupOnce: argv,
    projectNameSubTask: subTask,
  })

  return options
}
