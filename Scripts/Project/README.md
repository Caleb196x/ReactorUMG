# ReactorUMG TypeScript Project Guide

This package contains the ReactorUMG TypeScript runtime and samples for describing and rendering UMG via React/TS inside UE.

## Requirements
- ReactorUMG 1.0.0
- Yarn 1.x

## Install
```bash
yarn build
```

## Scripts
| Command | Description |
| --- | --- |
| `yarn dev` | Run webpack with the development config |
| `yarn pack` | Bundle with the production config |
| `yarn build` | Install deps and run `tsx build.ts` to generate outputs |
| `yarn lint` | Run ESLint |
| `yarn test` | Run Mocha+Chai unit tests with c8 coverage (covers all modules under `src/reactorUMG`) |

## Project structure
- `src/reactorUMG/` core renderer, parsers, and jsx-to-umg transforms
- `src/reactorUMG/misc/` utilities and resource loaders
- `src/reactorUMG/parsers/` CSS/attribute parsers
- `test/` unit tests (tsx + mocha + chai)

## Testing
Tests use `test/setup.ts` to provide lightweight UE/puerts stubs, so UE runtime is not required. Coverage reports are written to `coverage/` and summarized in the console. Run:
```bash
yarn test
```

## Development notes
- TypeScript config: `tsconfig.json`
- Webpack configs: `webpack.config.dev.js` and `webpack.config.prod.js`
- When adding new parsing/transform logic, please add corresponding unit tests.
