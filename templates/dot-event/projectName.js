export default function projectName(dot, opts) {
  opts = opts || {}

  if (dot.state.ad) {
    return dot
  }

  dot.state.projectName = {
    initPromise: Promise.resolve(),
    slots: {},
    ...opts,
  }

  dot.any("projectName", function() {})

  return dot
}
