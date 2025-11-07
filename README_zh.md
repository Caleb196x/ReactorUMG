<h1 id="reactorumg">ReactorUMG</h1>

![](./docs/imgs/Cover.png)

在虚幻引擎（Unreal Engine）中，允许您使用 **React** 开发 **UMG** 游戏UI和编辑器UI的辅助插件。  
插件基于 **PuertTS** 脚本能力构建，结合 AI 辅助，让您能以Web前端的开发方式高效完成游戏UI和编辑器UI的研发与迭代。**特别适用于使用AI快速开发出编辑器下的各类UI工具。**

> **关键词**：Unreal Engine、UE5、UMG、UI、Slate、React、TypeScript、插件、热重载、实时预览、Puerts
>

⚠️ **当前为开发测试阶段（Alpha）**：API 与结构仍可能变化；稳定后将发布正式版本。

⚠️ **使用前注意**：**使用开发前请务必查看FAQ，避免您重复踩坑。**

---

<h2 id="767fa455">目录</h2>

+ [为什么使用ReactorUMG](#ca757ae1)
+ [核心特性](#d2ffce75)
+ [系统要求](#19c93d0a)
+ [安装与快速上手](#2e52a2da)
+ [项目结构示例](#f2407408)
+ [FAQ](#faq)
+ [路线图](#c644eeae)
+ [贡献指南](#f31ccad5)
+ [许可证](#20a28457)
+ [链接与资源](#477c63ed)

---

<h2 id="ca757ae1">为什么使用ReactorUMG</h2>

虚幻引擎的UI开发组件 UMG 足够强大，但**缺少文本化/可编程的前端生态**，难以直接套用 AI/前端工程体系（如组件化、热重载、静态检查、自动化测试等）对想要快速完成迭代的开发人员来说不是非常友好。  
为了解决这个需求痛点，我们开发出了ReactorUMG插件，** ReactorUMG** 允许您用 **原生 React + TypeScript** **+ AI**来快速构建游戏UI或编辑器UI，**所见即所得，支持实时预览和编辑时热更新**，把 Web 前端的最佳实践与游戏 UI 开发连接起来。

---

<h2 id="d2ffce75">核心特性</h2>

+ **原生 React 体验**：以函数&类组件/Hook 架构组织 UI；支持 JSX/TSX。
+ **组件化开发**：拆分可复用 UI 组件，便于设计系统与皮肤迭代。
+ **脚本化交互**：在 TypeScript 中书写交互逻辑，复用前端生态，快速验证。
+ **实时预览**：保存即刷新，快速验证布局与交互。
+ **示例齐全**：提供从入门到进阶的示例与模板。
+ **AI 友好**：文本化代码让大模型更易生成/补全/重构 UI。
+ **UI动画**: 支持导入spine和Rive UI动画。

---

<h2 id="19c93d0a">开发系统要求</h2>

+ Unreal Engine **5.x**
+ **Node.js ≥ 18** 与 **Yarn / PNPM / NPM**（任选其一）
+ VSCode / Cursor（建议）
+ Windows 10/11，Linux

---

<h2 id="2e52a2da">安装与快速上手</h2>

<h3 id="R6bLK">安装node.js和yarn包管理</h3>

此处不再赘述安装过程。

<h3 id="ETmfW">获取插件</h3>

+ 前往 **Releases** 页面下载最新的 `ReactorUMG` 压缩包  
（或使用源码将 `Plugins/ReactorUMG` 放入你的 UE 项目中）。

<h3 id="CvlCM">放置目录</h3>

+ 项目级：`<YourUEProject>/Plugins/ReactorUMG`
+ 引擎级（可选）：`<UE_5.x>/Engine/Plugins/Marketplace/ReactorUMG`

<h3 id="lRyZS">初始化环境</h3>

+ 到`Plugins/ReactorUMG/Tools`目录下双击运行`SetupEnv.bat`初始化脚本。

<h3 id="iLatG">启用插件</h3>

+ 启动UE项目，如果您使用的是源码版，您还需要编译插件代码。
+ 打开 UE → `Edit > Plugins` 搜索 **ReactorUMG** → 勾选启用 → 按需重启编辑器。

<h3 id="vzBuB">创建 UI</h3>
<h4 id="tWaIr">创建游戏运行时UI</h4>

+ 启动项目（如果使用源码版，需要先完成编译）
+ 在内容浏览器中右键选中**ReactorUMG->ReactorUMG**创建**ReactorUIWidget**蓝图资产。
<img src="./docs/imgs/startup_create_gameui.png" alt="创建资产" width="200" height="300">

+ 创建完成后，系统将自动编译和加载脚本文件，双击打开可以看到初始页面。
<img src="./docs/imgs/startup_create_ui_editor.png" alt="创建资产" width="400">

+ 创建完成后插件将在`<ProjectDir>/TypeScript/src/<ProjectName>/<AssetPath>`路径下创建UI目录和自动生成必要的模板文件，具体目录和文件含义见**项目目录结构。**
<img src="./docs/imgs/startup_dir_struct.png" alt="创建资产" width="200">

+ 如图中RW_Debug目录所示，**launch.tsx均为系统自动生成的UI启动脚本，请不要做任何修改，否则影响UI正常运行。**
+ UI程序入口位于`<AssetName>.tsx`中，示例中的AssetName为RW_Debug。您可以自行在该文件中添加任意react代码。
+ 在游戏中使用UI完全和UMG Widget保持一致，在蓝图或C++中使用CreateWidget创建UI界面即可。

<h4 id="DodkW">创建编辑器UI</h4>

+ 启动项目（如果使用源码版，需要先完成编译）
+ 在内容浏览器中右键选择**ReactorUMG->EditorUtilityUMG**创建 **EditorUtitlityWidget**蓝图资产
<img src="./docs/imgs/startup_create_editorui.png" alt="创建资产" width="200" height="300">

+ 创建完成后，插件会在`<ProjectDir>/TypeScript/src/<ProjectName>/Editor/<AssetPath>`路径下创建UI目录和自动生成必要的模板文件，**注意和游戏运行时UI的差别是模板文件会存放在Editor目录下。**
+ 在UI编辑器界面中可以直接运行预览UI结果
<img src="./docs/imgs/startup_editor_preview.png" alt="创建资产" width="400">

**<font style="color:#DF2A3F;">提示：</font>**

1. 建议遵循UE的资产命名，为ReactorUMG的字母缩写**RW_XXX（运行时UI），ERW_XXX（编辑器UI）**。

更多详细内容请参考文档：

---

<h2 id="f2407408">项目结构示例</h2>

```plain
MyProject/
├─ Content/                        # UE 资源目录
│  └─ JavaScript/                  # JS输出目录
├─ Plugins/
│  └─ ReactorUMG/                  # ReactorUMG 插件
│     ├─ Scripts/
│     │  ├─ Project/src/reactorUMG/# 项目模板
│     │  └─ System/JavaScript/     # 系统脚本
│     └─ Source/                   # 插件C++源码
├─ TypeScript/                     # React/TS 开发环境, 由插件自动生成
│  ├─ src/
│  │  ├─ MyProject/                # 编辑器/运行时 UI
│  |  |  ├─ Editor/								 # 编辑器UI所在目录
│  |  │  └─ RW_Test/							 # 游戏运行时UI脚本存放目录
│  |  |     ├─ index.tsx					 # 默认导出模块声明
│  |  |     ├─ launch.tsx					 # UI启动脚本
│  |  |     └─ RW_Test.tsx				 # 实际UI运行脚本
│  │  ├─ reactorUMG/               # ReactorUMG 框架
│  │  └─ types/                    # Puerts/UE 类型声明
│  ├─ node_modules/                # 依赖库
│  ├─ tsconfig.json
│  └─ package.json
└─ MyProject.uproject
```

**说明：下面对重要目录的作用进行解释说明。**

+ JavaScript：存放系统JS脚本文件和TS编译后的脚本文件，打包时需要作为非资产进行打包，否则在运行时无法正常运行脚本。
+ TypeScript：以前端工程目录结构构建的TS项目目录
+ TypeScript/src/MyProject：插件自动生成UI脚本目录以及用户编辑的脚本都将放置在此目录下。

---

<h2 id="x0qyv">运行时UI支持平台</h2>

+ Windows、Android、Linux

<h2 id="faq">FAQ</h2>

**Q: 和原生 UMG/Slate 的关系？**  
A: ReactorUMG 面向“用 React 构建 UI”的团队，与 UMG/Slate 互补；底层仍依赖 UE 的 UI 渲染体系与脚本桥接。

**Q: 性能如何？**  
A: UI 复杂度与状态变更频率会影响性能。推荐进行组件颗粒度控制、状态下沉、减少不必要重渲染，并按需关闭开发时的调试开销。

---

<h2 id="c644eeae">路线图</h2>

- [ ] 支持tailwind css

想要的功能不在清单里？欢迎在 Issues 中提交需求。

---

<h2 id="f31ccad5">贡献指南</h2>

我们欢迎所有形式的贡献：Bug 反馈、文档修订、新特性提案与 PR。

1. Fork 仓库并创建分支：`feat/your-feature` 或 `fix/your-bug`
2. 运行本地示例验证变更
3. 确保通过构建与基本检查：`yarn build && yarn lint && yarn test`
4. 提交 PR，并简要说明动机、影响范围与测试方式

详情请见 **CONTRIBUTING.md**（将提供提交流程、代码规范、提交信息规范等）。

---

<h2 id="20a28457">许可证</h2>

本项目采用 **MIT License**。详见 [**LICENSE**](https://chatgpt.com/c/LICENSE)。

---

<h2 id="477c63ed">链接与资源</h2>

+ **文档主页**：
+ **示例工程**：
+ **发行版下载（Releases）**：__
+ **问题与建议（Issues）**：__
+ **讨论区（Discussions）**：__

---

✨ 如果这个项目对你有帮助，欢迎 **Star**、**分享**，并告诉我们你的使用场景与需求！
