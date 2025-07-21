const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

entriesName = ['index'];

let entries = {};
let plugins = [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
        patterns: [
            {
                from: "images",
                to: "images",
            }
        ]
    }),
];

for (let name of entriesName) {
    entries[name] = `./src/${name}.tsx`;
    plugins.push(
        new HtmlWebpackPlugin({
            template: './src/template.html',
            filename: `${name}.html`,
            chunks: [name],
        }),
    );
}

module.exports = {
    entry: entries,
    plugins: plugins,
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /.(jsx?)|(tsx?)$/,
                exclude: /(node_modules)/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    cache: {
        type: 'filesystem',
    },
};
