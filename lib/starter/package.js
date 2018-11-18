// Packages
import { pathExists, readJson } from "fs-extra"

// Helpers
import { propsFn } from "./props"

export async function writePackage(options) {
  const { events, name, packagePath, starters } = options
  const props = propsFn(options)
  const exists = await pathExists(packagePath)
  const merge = exists ? await readJson(packagePath) : {}

  const pkg = {
    name: name,
    operations: {
      git: {},
      link: {},
      starter: {},
      version: {},
    },
    ...merge,
  }

  if (starters) {
    pkg.starters = starters
  }

  await events.fs(props("writePackage"), {
    action: "writeJson",
    json: pkg,
    path: packagePath,
    spaces: 2,
  })

  return pkg
}
