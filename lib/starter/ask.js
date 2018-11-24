// Packages
import { createPromptModule } from "inquirer"
import { basename } from "path"

// Helpers
import { projectTypes } from "./projectTypes"

export async function askForStarters(options) {
  const { props, store } = options
  const argv = Object.keys(store.get("argv.opts")).filter(
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
  const paths = store.get([...props, "globTemplateDirs"])
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
