<h1 id="reactorumg">ReactorUMG</h1>

![](./docs/imgs/Cover.png)

![Liscense](https://img.shields.io/badge/license-MIT-blue.svg)

ReactorUMG helps you build **UMG** game UI and editor UI in Unreal Engine using **React**.
The plugin is built on **PuertTS** scripting and pairs with AI assistance so you can develop and iterate UI efficiently with a web-style workflow. **It is especially suited to using AI to quickly build a variety of in-editor UI tools.**

> **Keywords:** Unreal Engine, UE5, UMG, UI, Slate, React, TypeScript, Plugin, Hot Reload, Live Preview, Puerts

⚠️ **Alpha stage**: APIs and structure may still change; a stable release will follow once things settle.

⚠️ **Before you start**: Please read the FAQ first to avoid known pitfalls.

---
[跳转到中文](./README_zh.md)

<h2 id="767fa455">Contents</h2>

+ [Why use ReactorUMG](#ca757ae1)
+ [Core Features](#d2ffce75)
+ [System Requirements](#19c93d0a)
+ [Install and Quick Start](#2e52a2da)
+ [Project Structure Example](#f2407408)
+ [FAQ](#faq)
+ [Roadmap](#c644eeae)
+ [Contribution Guide](#f31ccad5)
+ [License](#20a28457)
+ [Links and Resources](#477c63ed)

---

<h2 id="ca757ae1">Why use ReactorUMG</h2>

UMG is powerful, but it lacks a text-first, programmable front-end ecosystem, making it hard to plug into AI and front-end engineering practices (componentization, hot reload, static checks, automated testing, etc.). That slows teams who need quick iteration.
To solve this, we built the ReactorUMG plugin. **ReactorUMG** lets you use **native React + TypeScript + AI** to quickly build game UI or editor UI. It is WYSIWYG, supports live preview and hot reload while editing, and connects modern web front-end practices to game UI development.

---

<h2 id="d2ffce75">Core Features</h2>

+ **Native React experience**: Supports React Hooks, function/class components, TSX syntax, React container layouts, React native components, and UMG components.
+ **Scriptable interaction**: Use PuerTS to call engine and editor scripting interfaces as a Blueprint substitute.
+ **AI-assisted development**: Use AI Coding to quickly build editor tool panels, runtime UI, and reusable component libraries.
+ **Live preview**: Hot-reload validation and in-editor live preview to verify layout and interaction quickly.
+ **Comprehensive examples**: Samples and templates from beginner to advanced.
+ **UI animation**: Import Spine and Rive UI animations.

---

<h2 id="19c93d0a">Development System Requirements</h2>

+ Unreal Engine **5.x**
+ **Node.js >= 18** and **Yarn / PNPM / NPM** (choose one)
+ VSCode / Cursor (recommended)
+ Windows 10/11, Linux

---

<h2 id="2e52a2da">Install and Quick Start</h2>
See the docs: https://caleb196x.github.io/ReactorUMGOnlineDoc/quickstart/

---

<h2 id="x0qyv">Runtime UI Supported Platforms</h2>

+ Windows, Android, Linux

<h2 id="faq">FAQ</h2>

**Q: How does this relate to native UMG/Slate?**
A: ReactorUMG targets teams who build UI with React and complements UMG/Slate; it still relies on UE for UI rendering and the scripting bridge.

**Q: How is performance?**
A: UI complexity and state-change frequency affect performance. Control component granularity, lift state, reduce unnecessary re-renders, and disable debug overhead when needed.

---

<h2 id="c644eeae">Roadmap</h2>

- [x] Support basic native React components and basic CSS styles
- [ ] Design a ReactorUMG-centered component library to support complex game UI, improving runtime efficiency and stability
- [ ] Support Tailwind CSS
...

Want something not listed? Submit a request in Issues.

---

<h2 id="f31ccad5">Contribution Guide</h2>

We welcome all kinds of contributions: bug reports, docs updates, feature proposals, and PRs.

1. Fork the repo and create a branch: `feat/your-feature` or `fix/your-bug`
2. Run local examples to validate changes
3. Submit a PR with a brief summary of motivation, scope, and testing

See **CONTRIBUTING.md** for submission flow, coding standards, and commit message conventions.

---

<h2 id="20a28457">License</h2>

This project uses the **MIT License**. See **LICENSE** for details.

---

<h2 id="477c63ed">Links and Resources</h2>

+ **Docs Home**: https://caleb196x.github.io/ReactorUMGOnlineDoc/
+ **Sample Project**: https://github.com/Caleb196x/ReactorUMGDemo
+ **Release Downloads (Releases)**: __
+ **Issues and Suggestions (Issues)**: __
+ **Discussion Board (Discussions)**: __

---

If this project helps you, feel free to **Star**, **share**, and tell us your use cases and needs!
