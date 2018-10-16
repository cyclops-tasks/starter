const express = require("express")
const next = require("next")

const routes = require("./routes")

const app = next({
  dev: !process.env.NODE_ENV,
})

const handler = routes.getRequestHandler(app)

app.prepare().then(() => {
  express()
    .use(handler)
    .listen(3000)
})
