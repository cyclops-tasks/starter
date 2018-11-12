import { basename, dirname, extname, join } from "path"

// Packages
import { createPromptModule } from "inquirer"
import dotStoreFs from "@dot-store/fs"
import dotStoreGlob from "@dot-store/glob"
import deepMerge from "deepmerge"

import { ensureDir, pathExists, readJson } from "fs-extra"

// Constants
import { projectTypes } from "./projectTypes"

export const cleanInstall = ["basics", "jest/test"]
export const templatesPath = join(__dirname, "../templates")

// Helpers
export default function(options) {
  const { events, store } = options

  dotStoreFs({ events, store })
  dotStoreGlob({ events, store })

  events.on({
    "cyclops.beforeSetTaskPaths": initProject,
    "cyclops.startTask": askStarter,
  })

  return options
}

async function initProject({ events, store }) {
  const pkgPaths = store.get("packagePaths")

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
  const task = store.get(`tasks.${taskId}`)

  await events.glob("templateDirs", {
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

async function askForStarters({ store }) {
  const argv = Object.keys(store.get("argv")).filter(
    arg => arg !== "_"
  )

  if (argv.length) {
    return {
      starters: argv.filter(
        arg => ["_", "basics"].indexOf(arg) == -1
      ),
    }
  }

  const ask = createPromptModule()
  const choices = Object.keys(projectTypes)
  const paths = store.get("glob.templateDirs")
  const templates = paths.map(path => basename(path))

  return await ask([
    {
      choices,
      message: "What kind of project is this?",
      name: "projectType",
      type: "list",
    },
    {
      choices: ({ projectType }) => {
        return templates.map(template => {
          const checked = projectTypes[
            projectType
          ].includes(template)
          return { checked, name: template }
        })
      },
      message:
        "Select starter templates (see https://git.io/fa8FQ)",
      name: "starters",
      type: "checkbox",
    },
  ])
}

async function buildStarters({ events, store }) {
  await events.glob("templatePaths", {
    options: { dot: true, nodir: true },
    pattern: templatesPath + "/**/*",
  })

  const paths = store.get("glob.templatePaths")

  let starters = {}

  for (const path of paths) {
    const relPath = path.slice(templatesPath.length + 1)
    const starter = relPath.match(/^[^/]+/)[0]
    const starterPath = relPath.match(/^[^/]+\/(.+)/)

    if (starterPath) {
      starters[starter] = starters[starter] || {}

      const value =
        extname(relPath) == ".json"
          ? await readJson(path)
          : true

      starters[starter][starterPath[1]] = value
    }
  }

  return starters
}

function convertTargetPath(targetPath) {
  return targetPath
    .replace(/\/gitignore$/, "/.gitignore")
    .replace(/\/npmignore$/, "/.npmignore")
}

function isCleanInstall(starter, starterPath) {
  const path = join(starter, starterPath)

  for (const clean of cleanInstall) {
    if (clean == path.slice(0, clean.length)) {
      return true
    }
  }
}

async function mergeStarters({
  depsOnly,
  dirPath,
  events,
  starters,
  store,
}) {
  if (!starters) {
    return
  }

  const starterBuild = await buildStarters({
    events,
    store,
  })

  for (const starter of starters) {
    for (const starterPath in starterBuild[starter]) {
      const targetPath = convertTargetPath(
        join(dirPath, starterPath)
      )
      const exists = await pathExists(targetPath)
      const clean = isCleanInstall(starter, starterPath)

      if (clean && exists) {
        continue
      }

      if (extname(targetPath) == ".json" && exists) {
        const target = await readJson(targetPath)
        const dontMerge = (_, source) => source

        let newTarget = deepMerge(
          target,
          starterBuild[starter][starterPath],
          { arrayMerge: dontMerge }
        )

        if (depsOnly) {
          newTarget = {
            ...target,
            dependencies: newTarget.dependencies,
            devDependencies: newTarget.devDependencies,
          }
        }

        await events.fs("writeJson", {
          ensure: true,
          json: newTarget,
          options: { spaces: 2 },
          path: targetPath,
        })

        // eslint-disable-next-line no-console
        console.log(`${starter} -> ${targetPath}`)
      } else if (!depsOnly) {
        const absStarterPath = join(
          templatesPath,
          starter,
          starterPath
        )

        await ensureDir(dirname(targetPath))

        await events.fs("copy", {
          dest: targetPath,
          src: absStarterPath,
        })

        // eslint-disable-next-line no-console
        console.log(`${starter} -> ${targetPath}`)
      }
    }
  }
}

async function writePackage({
  events,
  name,
  pkgPath,
  starters,
}) {
  const exists = await pathExists(pkgPath)
  const merge = exists ? await readJson(pkgPath) : {}

  const pkg = {
    cyclops: {
      "starter-tasks": {},
      "version-tasks": {},
    },
    name: name,
    ...merge,
  }

  if (starters) {
    pkg.starters = starters
  }

  await events.fs("writeJson", {
    json: pkg,
    options: { spaces: 2 },
    path: pkgPath,
  })

  return pkg
}
