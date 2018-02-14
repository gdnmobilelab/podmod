const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

const webpack = require("webpack");

let env = process.env.NODE_ENV || "development";

let configEnv = process.env.CONFIG_ENV || env;

let config = require(`./config/${configEnv}.json`);

let fullConfig = Object.assign({}, config, { "process.env.NODE_ENV": env, BUILD_TIME: Date.now() });
let stringifiedConfig = {};
Object.keys(fullConfig).forEach(key => {
    stringifiedConfig[key] = JSON.stringify(fullConfig[key]);
});

module.exports = {
    entry: {
        worker: "./src/worker.ts",
        client: "./src/client.ts"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    // node: false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["awesome-typescript-loader"]
            },
            {
                test: /\.(gif|png|svg|jpg)?$/,
                use: ["file-loader"]
            },
            {
                test: /src\/(.*)\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use:
                        "typings-for-css-modules-loader?modules&namedExport&camelCase&sourceMap=true&localIdentName=[name]__[local]"
                })
            },
            {
                test: /node_modules\/(.*)\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        modules: [path.join(__dirname, "node_modules")]
    },
    devtool: "source-map",
    plugins: [
        new HTMLWebpackPlugin({
            title: "Strange Bird",
            filename: "index.html",
            excludeChunks: ["worker"],
            template: "src/index.ejs"
        }),
        new CopyWebpackPlugin([
            {
                from: "bundles",
                to: "bundles"
            }
        ]),
        new ExtractTextPlugin("styles.css"),
        new webpack.DefinePlugin(stringifiedConfig)
    ]
};

if (env === "production") {
    module.exports.plugins.push(new UglifyJSPlugin());
}
