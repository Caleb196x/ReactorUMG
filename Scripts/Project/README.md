# ReactorUMG TypeScript 项目指南

本仓库包含 ReactorUMG 的 TypeScript 端实现与示例，用于在 UE 中通过 React/TS 描述并渲染 UMG。

## 环境要求

- Node.js (建议 18+)
- Yarn 1.x

## 安装

```bash
yarn build
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `yarn dev` | 使用开发配置运行 webpack |
| `yarn pack` | 使用生产配置打包 |
| `yarn build` | 安装依赖并执行 `tsx build.ts` 生成输出 |
| `yarn lint` | 运行 ESLint |
| `yarn test` | 运行 Mocha+Chai 单测并输出覆盖率（c8，覆盖 `src/reactorUMG` 全部模块） |

## 项目结构

- `src/reactorUMG/` 核心渲染器、解析器、jsx/umg 转换器
- `src/reactorUMG/misc/` 工具、资源加载
- `src/reactorUMG/parsers/` CSS/属性解析
- `test/` 单元测试（基于 tsx + mocha + chai）

## 单测说明

测试通过 `test/setup.ts` 提供的 UE/puerts 轻量 stub 运行，无需 UE 运行时。覆盖率报告输出到 `coverage/` 目录，并在控制台打印摘要。运行：

```bash
yarn test
```

## 开发提示

- TypeScript 配置在 `tsconfig.json`
- Webpack 配置：`webpack.config.dev.js` 与 `webpack.config.prod.js`
- 如需新增解析/转换逻辑，建议补充对应的单元测试。***
