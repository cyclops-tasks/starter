import { pathExists, readJson } from "fs-extra"

export async function writePackage({
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
