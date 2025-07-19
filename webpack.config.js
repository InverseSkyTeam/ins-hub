const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

entriesName = ['index'];

let entries = {};
let plugins = [new MiniCssExtractPlugin()];

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
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
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
