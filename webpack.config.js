const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const output = path.join(__dirname, "distribution");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: {
    auth: "./source/auth.js",
    background: "./source/background.js",
    config: "./source/config.js",
    options: "./source/options.js",
    tabs: "./source/tabs.js",
  },
  output: {
    path: output,
    filename: "[name].js",
  },
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "**/*",
          context: "source",
          globOptions: {
            ignore: ["*.js"],
          },
        },
      ],
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            indent_level: 2, // eslint-disable-line camelcase
          },
        },
      }),
    ],
  },
};
