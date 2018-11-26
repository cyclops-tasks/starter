export async function argv({ events }) {
  await events.argv({
    alias: {
      d: ["dry"],
      s: ["sub-task"],
    },
  })
}
