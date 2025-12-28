# Contributing to ReactorUMG

Thanks for helping improve ReactorUMG. This guide keeps contributions predictable and easy to review.

## Ways to contribute
- File issues for bugs, docs gaps, or feature requests.
- Improve docs or examples.
- Submit pull requests for fixes or small features. For large changes, open an issue first to align on scope.

## Environment and setup
- Unreal Engine 5.x with this project opened.
- Node.js 18+ and a package manager (Yarn preferred).
- From the repo root, open the project.
- TypeScript workspace (`TypeScript/`):
  - `yarn dev` for hot-preview.
  - `yarn build` for full build (outputs to `Content/JavaScript`).
  - `yarn build:watch` for incremental rebuilds.
  - `yarn lint` must be clean before submitting.

## Repository layout
- Runtime/editor UI scripts live under `TypeScript/src/ReactorUMGDemo/<Widget>` and `TypeScript/src/ReactorUMGDemo/Editor/`.
- Shared framework helpers stay in `reactorumg` npm package and are mirrored upstream at https://github.com/Caleb196x/ReactorUMG-TS; keep framework-level changes aligned with that repo.
- The vendored plugin lives in `Plugins/ReactorUMG`; treat `Source`, `Scripts`, and `docs` there as upstream-managed and change them only when required.

## Coding standards
- C++: follow Unreal defaults (tabs, braces on new lines, PascalCase types, camelCase methods, `b`-prefixed booleans).
- TypeScript: follow `TypeScript/eslint.config.js`; keep imports ordered, use functional React components, and type props explicitly.
- Asset/widget naming: runtime widgets `RU_*`, editor widgets `ERU_*`, and mirror the same names in the `TypeScript/src` paths so generated `launch.tsx` files map correctly.

## Commit and PR guidelines
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) with subjects <=72 characters.
- Branch naming examples: `feat/<topic>` or `fix/<issue>`.
- PRs should include:
  - Scope and motivation.
  - Tests/commands run (e.g., `yarn lint`, `yarn test`, `yarn build`, automation line if applicable).
  - Screenshots or clips for UI-visible changes.
  - Note if `Content/JavaScript` or plugin binaries need regeneration.

## Testing expectations
- For gameplay/plugin changes, add or run Unreal automation tests under the `ReactorUMG.*` filter.
- The TypeScript workspace does not yet include Jest/Vitest; rely on `yarn lint`, `yarn dev`, and in-editor preview. If a `yarn test` single-run suite is available, run it before submitting and document the result. Describe any manual verification in the PR body.

## 中文速览
- 提交前请先提 Issue 对齐需求；小修可以直接 PR。
- 环境：UE5.x，Node.js 18+，推荐 Yarn。根目录命令同上；TypeScript 工作区需通过 `yarn lint`，构建用 `yarn build`。
- 目录：运行时/编辑器脚本放在 `TypeScript/src/ReactorUMGDemo`，框架工具在 `reactorumg` npm仓库中，与 https://github.com/Caleb196x/ReactorUMG-TS 同步，改动请优先向上游提交；`Plugins/ReactorUMG` 下的 `Source/Scripts/docs` 视为上游托管，非必要不改。
- 规范：C++ 遵循 Unreal 风格；TS 遵循 lint 规则，使用函数式 React 组件并显式类型化 props；资产命名 `RU_*`/`ERU_*`。
- 提交：使用 Conventional Commits；PR 需写清动机、范围、已运行的命令（包括 `yarn lint`、`yarn test`、`yarn build` 等），并为 UI 变化附图/视频。
