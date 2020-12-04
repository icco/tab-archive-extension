const path = require("path");
const SizePlugin = require("size-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

var output = path.join(__dirname, "distribution");

module.exports = {
  devtool: "source-map",
  stats: "errors-only",
  entry: {
    background: "./source/background",
    options: "./source/options",
  },
  output: {
    path: output,
    filename: "[name].js",
  },
  plugins: [
    new SizePlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "**/*",
          context: "source",
          globOptions: {
            ignore: ["*.js"],
          },
        },
        {
          from:
            "node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
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
