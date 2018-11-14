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

// Composer
export default function(options) {
  const { events, store } = options

  dotStoreFs({ events, store })
  dotStoreGlob({ events, store })
  dotStoreLog({ events, store })

  events.on({
    "before.cyclops.starter-tasks.task": initProject,
    "cyclops.starter-tasks.task": askStarter,
  })

  return options
}

async function initProject({ events, store }) {
  const pkgPaths = store.get("cyclops.packagePaths")

  for (const pkgPath of pkgPaths) {
    const dirPath = dirname(pkgPath)

    await mergeStarters({
      dirPath,
      events,
      starters: ["basics"],
      store,
    })

    await writePackage({
      ensure: true,
      events,
      name: basename(dirPath),
      pkgPath,
    })
  }
}

async function askStarter({ events, store, taskId }) {
  const task = store.get(`cyclops.tasks.${taskId}`)

  await events.glob("starter.templateDirs", {
    pattern: templatesPath + "/!(basics)",
  })

  const { starters } = await askForStarters({ store })

  await mergeStarters({
    dirPath: task.projectPath,
    events,
    starters,
    store,
  })
}
