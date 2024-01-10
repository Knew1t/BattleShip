const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./source_code/refactoring/main.js",
  devtool: "inline-source-map",
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./pages/game_menu_refactoring.html",
    }),
  ],
  devServer: {
    static: ["css", "images"],
    port: 3000,
    open: true,
   },
};
