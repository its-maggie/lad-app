import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../analytics.js', import.meta.url), 'utf8');

function mount(url = 'https://lad-pocket.vercel.app/') {
  const listeners = {}, scripts = [], timers = new Map();
  let timerId = 0;
  const window = { location: new URL(url) };
  vm.runInNewContext(source, {
    window, URL, URLSearchParams, Date,
    document: {
      referrer: 'https://www.threads.com/@example?email=private@example.com',
      querySelector: () => ({ dataset: { tab: 'cal' } }),
      addEventListener: (name, fn) => { listeners[name] = fn; },
      createElement: () => ({}),
      head: { appendChild: script => scripts.push(script) },
    },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  const events = () => (window.dataLayer || []).map(args => Array.from(args)).filter(args => args[0] === 'event');
  return { window, listeners, scripts, timers, events };
}

test('local, file and Vercel preview pages never load GA or collect events', () => {
  for (const url of ['http://127.0.0.1:8118/', 'file:///tmp/index.html', 'https://lad-pocket-preview.vercel.app/']) {
    const app = mount(url);
    assert.equal(app.scripts.length, 0);
    assert.equal(app.window.LAD_ANALYTICS, undefined);
  }
});

test('initial visit records a feature view without claiming a tool was used', () => {
  const app = mount();
  assert.equal(app.scripts.length, 1);
  assert.match(app.scripts[0].src, /gtag\/js\?id=G-MGM1BK0TZD$/);
  assert.deepEqual(JSON.parse(JSON.stringify(app.events())), [['event', 'feature_view', { feature: 'calendar' }]]);
  app.window.LAD_ANALYTICS.view('cal');
  assert.equal(app.events().length, 1);
  app.window.LAD_ANALYTICS.view('calc');
  app.window.LAD_ANALYTICS.use('converter', 'calculate');
  assert.equal(app.events().at(-1)[1], 'app_use');
});

test('only fixed feature/action labels and allowlisted campaign parameters leave the app', () => {
  const app = mount('https://lad-pocket.vercel.app/?utm_source=threads&utm_medium=social&email=private%40example.com&utm_term=private%40example.com#secret-note');
  const config = app.window.dataLayer.map(args => Array.from(args)).find(args => args[0] === 'config')[2];
  assert.equal(config.page_location, 'https://lad-pocket.vercel.app/?utm_source=threads&utm_medium=social');
  assert.equal(config.page_referrer, 'https://www.threads.com');
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  const count = app.events().length;
  app.window.LAD_ANALYTICS.use('wallet', 'private note');
  app.window.LAD_ANALYTICS.use('__proto__', 'expense_add');
  app.window.LAD_ANALYTICS.view('private@example.com');
  assert.equal(app.events().length, count);
  app.window.LAD_ANALYTICS.use('wallet', 'expense_add', { amount: 9999, note: 'secret' });
  assert.deepEqual(JSON.parse(JSON.stringify(app.events().at(-1)[2])), { feature: 'wallet', action: 'expense_add' });
});

test('typing is debounced and wallet text inputs never trigger calculator analytics', () => {
  const app = mount();
  for (const id of ['expNote', 'expAmt', 'budgetInput']) app.listeners.input({ target: { id, value: 'private' } });
  assert.equal(app.timers.size, 0);
  for (let n = 0; n < 3; n++) app.listeners.input({ target: { id: 'targetPulls', value: String(n) } });
  assert.equal(app.timers.size, 1);
  const run = [...app.timers.values()][0];
  app.timers.clear();
  run();
  const uses = app.events().filter(args => args[1] === 'app_use');
  assert.equal(uses.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(uses[0][2])), { feature: 'converter', action: 'calculate' });
});
