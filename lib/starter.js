// Packages
import dotFs from "@dot-event/fs"
import dotGlob from "@dot-event/glob"
import dotLog from "@dot-event/log"
import { basename, dirname } from "path"

// Helpers
import { askForStarters } from "./starter/ask"
import {
  mergeStarters,
  templatesPath,
} from "./starter/merge"
import { writePackage } from "./starter/package"
import { propsFn } from "./starter/props"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("starter")) {
    return options
  }

  dotFs({ events, store })
  dotGlob({ events, store })
  dotLog({ events, store })

  events.onAny({
    starter: askStarter,
    starterSetup: initProject,
  })

  return options
}

async function initProject(options) {
  const { store } = options
  const { taskPackagePaths } = store.get("task")

  for (const packagePath of taskPackagePaths) {
    const dirPath = dirname(packagePath)

    await mergeStarters({
      ...options,
      dirPath,
      starters: ["basics"],
    })

    await writePackage({
      ...options,
      name: basename(dirPath),
      packagePath,
    })
  }
}

async function askStarter(options) {
  const { events, task } = options
  const props = propsFn(options)

  await events.glob(props("globTemplateDirs"), {
    action: "storeGlob",
    pattern: templatesPath + "/!(basics)",
  })

  const { starters } = await askForStarters(options)

  await mergeStarters({
    ...options,
    dirPath: task.projectPath,
    starters,
  })
}
