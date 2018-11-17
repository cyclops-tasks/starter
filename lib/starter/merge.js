// Packages
import deepMerge from "deepmerge"
import { ensureDir, pathExists, readJson } from "fs-extra"
import { dirname, extname, join } from "path"

// Helpers
import { propsFn } from "./props"

// Constants
export const cleanInstall = ["basics", "jest/test"]
export const templatesPath = join(
  __dirname,
  "../../templates"
)

// Helpers
export async function mergeStarters(options) {
  const { depsOnly, dirPath, events, starters } = options

  if (!starters) {
    return
  }

  const starterBuild = await buildStarters(options)
  const props = propsFn(options)

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

        await events.fs(props(starter, "fsWriteJson"), {
          action: "writeJson",
          ensure: true,
          json: newTarget,
          path: targetPath,
          spaces: 2,
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

        await events.fs(props(starter, "fsCopy"), {
          action: "copy",
          dest: targetPath,
          src: absStarterPath,
        })

        // eslint-disable-next-line no-console
        console.log(`${starter} -> ${targetPath}`)
      }
    }
  }
}

async function buildStarters(options) {
  const { events, store } = options
  const props = propsFn(options)

  await events.glob(props("globTemplates"), {
    options: { dot: true, nodir: true },
    pattern: templatesPath + "/**/*",
  })

  const paths = store.get(props("globTemplates"))

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
