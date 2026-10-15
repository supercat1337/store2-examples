# store2-devtools — vanilla example

> Part of [store2-examples](https://github.com/supercat1337/store2-examples).

A minimal demonstration of [`@supercat1337/store2-devtools`](https://www.npmjs.com/package/@supercat1337/store2-devtools)
in a plain HTML page — no framework, no build complexity.

---

## Why DevTools?

Without them, debugging reactive state means `console.log` everywhere:

```js
count.value = 5;
console.log('count is now', count.value); // is it really 5?
console.log('doubled is', doubled.value); // did the computed recalculate?
// what was the value before? what triggered this change?
```

**DevTools answer all of these questions** with a single tool:

- **History** of every action — what happened, when, in what order.
- **State at any point** — click an action, see the full state _at that moment_.
- **Time-travel** — restore state to any past action with one click.
- **Diff** — compare two states to see exactly what changed.

This is what Redux users have had for years. `store2-devtools` brings the same
workflow to reactive state.

---

## What you'll see

Run the example and you'll get:

- A counter with a computed `doubled` value.
- Four buttons that trigger named actions.
- A history counter that grows with each action.
- Everything mirrored in the Redux DevTools Extension — actions on the left,
  state on the right, time-travel by clicking.

---

## Prerequisites

Before you start:

1. **Node.js 22 or newer** — `node --version` should print `v22.x.x` or higher.
2. **A Chromium-based browser** (Chrome, Edge, Brave) or **Firefox**.
3. **The Redux DevTools Extension installed**:
    - [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
    - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

    > The extension is a _generic_ state-debugging tool. Despite the name, it
    > works with any state container that speaks its protocol — Redux, MobX,
    > Zustand, and now `store2`.

---

## Step 1. Run the example

```bash
npm install
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`. Open it in your browser.

You'll see the counter, the buttons, and a hint box telling you to press `F12`.

---

## Step 2. Open the DevTools

Press `F12` (or `Cmd+Option+I` on macOS), then click the **Redux** tab.

If you don't see a Redux tab:

- The extension might be disabled. Check `chrome://extensions` (or
  `about:debugging` in Firefox).
- It might be hidden behind the `»` icon in the DevTools tab bar. Right-click
  the tab bar and enable Redux.

You should now see:

- **Left panel**: a list of actions, starting with `@@INIT` (the baseline
  snapshot taken at plugin install time).
- **Center panel**: the JSON state of the registered root at the currently
  selected action.
- **Top bar**: buttons for time-travel, reset, export.

---

## Step 3. Trigger some actions

Click **+1** three times in the browser window. Watch the Redux tab:

- Three new entries appear: `increment`, `increment`, `increment`.
- Each has a distinct timestamp.
- The state panel updates on each selection.

Click **+10** once. A new entry `add 10` appears. The counter now reads 13,
doubled reads 26.

---

## Step 4. Time-travel

Click on the **first** `increment` entry in the Redux tab.

The browser window updates immediately:

- Counter shows `1`.
- Doubled shows `2`.
- History counter drops back.

That's time-travel: you restored the entire app state to the moment right
after that action. Without reloading the page. Without losing history.

Now click **+10** again while positioned in the past. Notice what happens:

- A new entry `add 10` appears.
- The future entries (`increment`, `increment`) are **removed**.

This matches how Redux DevTools behave: taking a new action after a jump
truncates the future. Otherwise, the timeline would branch and become
impossible to reason about.

---

## Step 5. Reset

Click the **Reset** button in the DevTools top bar.

The history is cleared, a fresh `@@INIT` baseline is recorded, and the
counter returns to its initial value. This is useful when the history has
grown long enough to make navigation awkward.

---

## How it works

The example is roughly 60 lines. Here's the part that matters:

### 1. Create an isolated context

```js
const ctx = createStore2Context({ name: 'devtools-vanilla' });
```

Everything that follows binds to this context. In a real app, you'd create
one context per server request (for SSR) or one for the whole browser session.

### 2. Register the root for snapshotting

```js
runWithContext(ctx, () => {
    store = new Store();
    count = atom(0, { name: 'count' });
    doubled = computed(() => count.value * 2, { name: 'doubled' });
    store.addItems({ count, doubled });
    ctx.registerRoot('app', store);
});
```

`runWithContext` ensures that `count` and `doubled` bind to our context.
Items created at module top level would bind to the default context, and
`ctx.dumpGraph()` wouldn't see them.

`ctx.registerRoot('app', store)` tells the context: _"When asked for a
snapshot, serialize this store and everything inside it."_ Items that are
not part of a registered root are invisible to DevTools.

> **Why `runWithContext` twice?** In this example, we wrap both the item
> creation and the `autorun` in `runWithContext`. Both operations capture
> the current context at call time — the first for the items' `engine.context`,
> the second for the tracker used by `autorun`. It's fine to have multiple
> `runWithContext` calls; each one just installs the context for the
> duration of its callback.

### 3. Install the DevTools plugin

```js
const devtools = createDevToolsPlugin({ name: 'store2-devtools-vanilla' });
ctx.use(devtools);
```

`createDevToolsPlugin` registers a plugin with the context. On install, it:

1. Records a baseline snapshot as `@@INIT`.
2. Looks for `__REDUX_DEVTOOLS_EXTENSION__` on `globalThis` and connects to it
   if present.
3. Subscribes to action lifecycle events so it can record snapshots.

You can disable the Redux bridge with `connectToExtension: false` — useful
in tests or in environments where you don't want the extension to interfere.

### 4. Wrap mutations in actions

```js
ctx.action('increment', () => {
    count.value++;
});
```

Every `ctx.action(name, body)` call is one logical unit of work:

- DevTools records exactly **one snapshot** after it completes, no matter how
  many fields changed inside.
- Middleware (if registered) runs before the body.
- The action receives a unique `ActionInfo` with `id`, `name`, `startTime`,
  `endTime`.

Without `ctx.action`, individual mutations still trigger reactivity, but
DevTools won't group them — each field change would be recorded separately.

### 5. Render on change

```js
autorun(() => {
    countEl.textContent = String(count.value);
    doubledEl.textContent = String(doubled.value);
    historyEl.textContent = String(devtools.getHistory().length);
});
```

`autorun` re-runs whenever any dependency changes. When time-travel restores
a previous snapshot, `count` changes, `autorun` fires, and the DOM updates —
the browser window reflects the past state automatically.

---

## Troubleshooting

**The Redux tab doesn't appear in DevTools.**

The extension is either not installed or disabled. Visit
`chrome://extensions` (or `about:debugging` in Firefox) and check.

**The tab is there, but no actions are recorded.**

Check the browser console for `[store2-devtools]` warnings. Common causes:

- `ctx.registerRoot()` was never called, so there's nothing to snapshot.
- The extension is installed _after_ the page loaded. Reload the page.
- Another DevTools instance is connected. Only one is allowed at a time.

**Actions appear, but time-travel doesn't work.**

- Make sure you're clicking the action name itself, not the checkbox on the
  left (that's the "skip" filter, not the "jump" action).
- Check the console for errors during `hydrate()`.

**The state panel is empty.**

The registered root has no serializable items. `Computed` values are
intentionally excluded from snapshots — they recalculate on hydration.

---

## What to try next

- **Add a nested store.** Register it, watch how the JSON tree expands.
- **Add a failing action.** Throw an error inside `ctx.action()` and see how
  it's recorded (`error` field in `ActionInfo`).
- **Disable the extension** by setting `connectToExtension: false`. The plugin
  still records history; you just can't see it in the Redux tab. Access it
  via `devtools.getHistory()` in the browser console.

---

## Source files

- [`src/main.js`](./src/main.js) — the entire example, ~60 lines.
- [`index.html`](./index.html) — layout and styles.

---

## Try it online

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-000?logo=codesandbox)](https://codesandbox.io/s/github/supercat1337/store2-examples/tree/main/examples/devtools-vanilla)
[![Open in StackBlitz](https://img.shields.io/badge/Open%20in-StackBlitz-1269d3?logo=stackblitz)](https://stackblitz.com/github/supercat1337/store2-examples/tree/main/examples/devtools-vanilla)

## More examples

Additional examples will be added as the ecosystem grows:

- React bindings (`store2-react` + `store2-devtools`)
- Persistence (`store2-persist` + `localStorage`)
- SSR (`store2-ssr` + `runWithContextAsync`)

Follow the [store2-examples repository](https://github.com/supercat1337/store2-examples)
for updates.
