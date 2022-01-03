const path = require("path");
module.exports = {
  plugins: [],
  entry: {
    main: path.join(__dirname, "./index.js"),
  },
  output: {},
  externals: {},
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            "plugins": [
                ["@babel/transform-runtime"]
            ]
          },
        },
      },
    ],
  },
};
