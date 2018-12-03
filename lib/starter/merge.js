// Packages
import deepMerge from "deepmerge"
import { pathExists, readJson } from "fs-extra"
import { extname, join } from "path"

// Constants
export const templatesPath = join(
  __dirname,
  "../../templates"
)

// Helpers
export async function mergeStarters(options) {
  const { dirPath, events, name, props } = options

  if (!options.starters) {
    return
  }

  const starterBuild = await buildStarters(options)

  for (const starter of options.starters) {
    for (const starterPath in starterBuild[starter]) {
      const targetPath = convertTargetPath(
        join(dirPath, starterPath)
      )

      const exists = await pathExists(targetPath)

      let body

      if (extname(targetPath) == ".json" && exists) {
        const target = await readJson(targetPath)
        const dontMerge = (_, source) => source

        const newTarget = deepMerge(
          target,
          starterBuild[starter][starterPath],
          { arrayMerge: dontMerge }
        )

        body = replaceName(
          name,
          JSON.stringify(newTarget, null, 2)
        )
      } else {
        const absStarterPath = join(
          templatesPath,
          starter,
          starterPath
        )

        const starterSource = await events.fsReadFile({
          path: absStarterPath,
        })

        body = replaceName(name, starterSource.toString())
      }

      const path = replaceName(name, targetPath)

      await events.fsWriteFile(
        [...props, "mergeStarters", starter],
        { body, ensure: true, path }
      )

      // eslint-disable-next-line no-console
      console.log(`${starter} -> ${path}`)
    }
  }
}

async function buildStarters(options) {
  const { events, props } = options

  const paths = await events.glob(
    [...props, "buildStarters"],
    {
      dot: true,
      nodir: true,
      pattern: templatesPath + "/**/*",
    }
  )

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

function camelcase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

function convertTargetPath(targetPath) {
  return targetPath
    .replace(/\/gitignore$/, "/.gitignore")
    .replace(/\/npmignore$/, "/.npmignore")
}

function replaceName(name, str) {
  return str
    .replace(/project-name/g, name)
    .replace(/projectName/g, camelcase(name))
    .replace(/\s+"test": true\s+/g, "")
}
