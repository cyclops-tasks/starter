// Packages
import deepMerge from "deepmerge"
import { ensureDir, pathExists, readJson } from "fs-extra"
import { dirname, extname, join } from "path"

// Constants
export const cleanInstall = ["basics", "jest/test"]
export const templatesPath = join(
  __dirname,
  "../../templates"
)

// Helpers
export async function mergeStarters({
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
