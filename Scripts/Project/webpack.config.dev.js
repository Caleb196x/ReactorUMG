const path = require('path');

module.exports = {
    mode: 'development',
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
    devtool: 'eval-source-map', // 启用 Source Map
    watch: true, // 启用监视模式
    watchOptions: {
        ignored: /(node_modules)|(Content)/, // 忽略 node_modules 目录
        aggregateTimeout: 10, // 文件改变后延迟 300ms 再重新编译
        poll: 1000 // 每秒检查一次文件变化
    }
};