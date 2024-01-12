const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./js/main.js",
  devtool: "inline-source-map",
  mode: "development",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "js"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     template: "./pages/game_menu.html",
  //   }),
  // ],
  // devServer: {
  //   static: ["css", "images"],
  //   port: 3000,
  //   open: true,
  //  },
};
