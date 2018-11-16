// Packages
import dotStoreFs from "@dot-store/fs"
import dotStoreGlob from "@dot-store/glob"
import dotStoreLog from "@dot-store/log"
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

  dotStoreFs({ events, store })
  dotStoreGlob({ events, store })
  dotStoreLog({ events, store })

  events.onAny({
    starter: askStarter,
    starterSetup: initProject,
  })

  return options
}

async function initProject(options) {
  const { store } = options
  const pkgPaths = store.get("cyclops.packagePaths")

  for (const pkgPath of pkgPaths) {
    const dirPath = dirname(pkgPath)

    await mergeStarters({
      ...options,
      dirPath,
      starters: ["basics"],
    })

    await writePackage({
      ...options,
      name: basename(dirPath),
      pkgPath,
    })
  }
}

async function askStarter(options) {
  const { events, task } = options
  const props = propsFn(options)

  await events.glob(props("globTemplateDirs"), {
    pattern: templatesPath + "/!(basics)",
  })

  const { starters } = await askForStarters(options)

  await mergeStarters({
    ...options,
    dirPath: task.projectPath,
    starters,
  })
}
