// Packages
import { createPromptModule } from "inquirer"
import { basename } from "path"

// Helpers
import { projectTypes } from "./projectTypes"

export async function askForStarters(options) {
  const { events, props } = options
  const argv = Object.keys(events.get("argv.opts")).filter(
    arg => arg !== "_"
  )

  if (argv.length) {
    return { starters: argv }
  }

  const ask = createPromptModule()
  const choices = Object.keys(projectTypes)
  const paths = events.get([...props, "globTemplateDirs"])
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
