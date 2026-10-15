# store2-examples

Runnable examples for the [`@supercat1337/store2`](https://github.com/supercat1337/store2) ecosystem.

Each example is a self-contained workspace with its own `package.json` and
`README.md`. You can clone the repo and run the root-level scripts, or `cd`
into an individual example and treat it as a standalone project.

## Prerequisites

- Node.js **22.0.0** or newer
- npm **10.0.0** or newer

## Quick start

```bash
git clone https://github.com/supercat1337/store2-examples.git
cd store2-examples
npm install
npm run dev:devtools-vanilla
```

Open the URL printed by Vite (usually http://localhost:5173) with the
[Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
installed.

## Examples

| Example                                           | What it shows                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [`devtools-vanilla`](./examples/devtools-vanilla) | Time-travel debugging in plain HTML. **Start here** to see what `store2-devtools` does. |

More examples will be added as the ecosystem grows.

## Running a single example

Each workspace is standalone:

```bash
cd examples/devtools-vanilla
npm install
npm run dev
```

This also works in CodeSandbox and StackBlitz — click the badge inside each
example's README.

## Repository layout

- Root `package.json` — workspace definitions and shared tooling (ESLint, Prettier).
- `examples/*` — one directory per example. Each has its own `package.json`,
  dependencies, and README.

Runtime dependencies (like `@supercat1337/store2`) are declared **inside each
workspace**, not in the root. This keeps examples self-contained: cloning just
one folder works.

Shared tooling (ESLint, Prettier) lives in the root — those are development-only
and don't affect the runtime behavior of any example.

## Adding a new example

1. Create `examples/<name>/`.
2. Add a `package.json` with `"private": true` and its runtime dependencies.
3. Add `index.html`, `src/main.js`, and a `README.md`.
4. Add the example to the table above and to the CI matrix in `.github/workflows/ci.yml`.

## License

MIT © 2025–2026 Albert Bazaleev
