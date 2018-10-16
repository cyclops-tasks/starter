const { EnvironmentPlugin } = require("webpack")

const {
  BundleAnalyzerPlugin,
} = require("webpack-bundle-analyzer")

const { ANALYZE } = process.env

module.exports = {
  distDir: "dist",
  webpack: function(config, { isServer }) {
    config.plugins.push(
      new EnvironmentPlugin({
        // Put env var defaults here
      })
    )

    if (ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }

    return config
  },
}
