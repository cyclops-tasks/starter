// Packages
import { pathExists, readJson } from "fs-extra"

// Helpers
import { propsFn } from "./props"

export async function writePackage(options) {
  const { events, name, pkgPath, starters } = options
  const props = propsFn(options)
  const exists = await pathExists(pkgPath)
  const merge = exists ? await readJson(pkgPath) : {}

  const pkg = {
    cyclops: {
      git: {},
      link: {},
      starter: {},
      version: {},
    },
    name: name,
    ...merge,
  }

  if (starters) {
    pkg.starters = starters
  }

  await events.fs(props("writePackage"), {
    action: "writeJson",
    json: pkg,
    path: pkgPath,
    spaces: 2,
  })

  return pkg
}
