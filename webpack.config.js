const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

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
                use: [
                    "string-replace-loader?search=React\\.createElement&replace=createElement&flags=g",
                    "awesome-typescript-loader"
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use:
                        "typings-for-css-modules-loader?modules&namedExport&camelCase&sourceMap=true&localIdentName=[name]__[local]"
                })
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },
    devtool: "source-map",
    plugins: [
        new HTMLWebpackPlugin({
            title: "Podmod",
            filename: "index.html",
            excludeChunks: ["worker"],
            template: "src/index.ejs"
        }),
        new webpack.ProvidePlugin({
            createElement: ["preact", "h"]
        }),
        new CopyWebpackPlugin([
            {
                from: "bundles",
                to: "bundles"
            }
        ]),
        new ExtractTextPlugin("styles.css")
    ]
};
