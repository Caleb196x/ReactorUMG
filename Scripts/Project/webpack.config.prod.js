const path = require('path');

module.exports = {
    mode: 'production', //打包后会压缩混淆代码
    entry: './src/TankProject/start_game.ts', //修改成你的ts入口文件
    output: {
        path: path.resolve(__dirname, '../Content/JavaScript/'),
        filename: 'start_game.js', //修改成你的js入口文件
        library: "commonjs2"
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            src: path.resolve(__dirname, './src')
        }
    },
  //如果你是nodejs后端，取消下面一行的注释
  //  target: "node",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        ue: 'commonjs ue', // 告诉 Webpack ue 是外部模块，使用 require("ue")
        puerts: 'commonjs puerts' // 告诉 Webpack puerts 是外部模块，使用 require("puerts")
    },
    devtool: 'hidden-source-map'
};