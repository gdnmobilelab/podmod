const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    entry: {
        worker: "./src/worker.ts",
        client: "./src/client.ts"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader"]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        alias: {
            react: "preact-compat",
            "react-dom": "preact-compat"
        }
    },
    devtool: "eval",
    plugins: [
        new HTMLWebpackPlugin({
            title: "Podmod",
            filename: "index.html",
            excludeChunks: ["worker"],
            template: "src/index.ejs"
        }),
        new webpack.ProvidePlugin({
            React: "preact-compat"
        }),
        new CopyWebpackPlugin([
            {
                from: "bundles",
                to: "bundles"
            }
        ])
    ]
};
