// Packages
import React from "react"

// Pages
export class IndexPage extends React.Component {
  render() {
    // eslint-disable-next-line no-console
    console.log(process.env.NODE_ENV)
    return `hello ${process.env.NODE_ENV}`
  }
}

export default IndexPage
