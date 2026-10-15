import {
    createStore2Context,
    runWithContext,
    Store,
    atom,
    computed,
    autorun,
} from '@supercat1337/store2';
import { createDevToolsPlugin } from '@supercat1337/store2-devtools';

const ctx = createStore2Context({ name: 'devtools-vanilla' });

let store, count, doubled, devtools;

runWithContext(ctx, () => {
    store = new Store();
    count = atom(0, { name: 'count' });
    doubled = computed(() => count.value * 2, { name: 'doubled' });
    store.addItems({ count, doubled });
    ctx.registerRoot('app', store);
});

devtools = createDevToolsPlugin({ name: 'store2-devtools-vanilla' });
ctx.use(devtools);

/** @type {HTMLSpanElement} */
const countEl = /** @type {any} */ (document.getElementById('count'));
/** @type {HTMLSpanElement} */
const doubledEl = /** @type {any} */ (document.getElementById('doubled'));
/** @type {HTMLSpanElement} */
const historyEl = /** @type {any} */ (document.getElementById('history'));

runWithContext(ctx, () => {
    autorun(() => {
        countEl.textContent = String(count.value);
        doubledEl.textContent = String(doubled.value);
        historyEl.textContent = String(devtools.getHistory().length);
    });
});

// Event handlers call `ctx.action(...)`, which itself wraps the body in
// `runWithContext(ctx, ...)`. No extra wrapping needed here.
document.getElementById('inc')?.addEventListener('click', () => {
    ctx.action('increment', () => {
        count.value++;
    });
});

document.getElementById('dec')?.addEventListener('click', () => {
    ctx.action('decrement', () => {
        count.value--;
    });
});

document.getElementById('add10')?.addEventListener('click', () => {
    ctx.action('add 10', () => {
        count.value += 10;
    });
});

document.getElementById('reset')?.addEventListener('click', () => {
    ctx.action('reset', () => {
        count.value = 0;
    });
});

window.ctx = ctx;
window.store = store;
window.count = count;
window.devtools = devtools;
