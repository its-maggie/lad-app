import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
const converter = inlineScript.slice(inlineScript.indexOf('const MONTHLY_DIA='), inlineScript.indexOf('/* ---------- init ---------- */'));
const packs = fs.readFileSync(new URL('../packs.js', import.meta.url), 'utf8');

function mount(saved = {}) {
  const storage = structuredClone(saved);
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', innerHTML: '', disabled: false,
      classList: { add() {}, remove() {}, toggle() {} },
    });
    return elements.get(id);
  };
  const pool = get('poolSel');
  pool.value = storage.calc?.pool || '日卡池';
  Object.defineProperty(pool, 'selectedIndex', { set() { this.value = '日卡池'; } });
  for (const [id, key] of Object.entries({ curDia: 'cur', curTickets: 'tickets', targetPulls: 'pulls', reservePulls: 'reserve' })) get(id).value = String(storage.calc?.[key] || '');
  const context = vm.createContext({
    window: {}, document: { getElementById: get },
    DB: { get: (key, fallback) => structuredClone(storage[key] ?? fallback), set: (key, value) => { storage[key] = structuredClone(value); } },
    I: {}, svg: () => '', esc: value => String(value), NT: value => `NT$${value}`, fmtPulls: value => String(value),
  });
  vm.runInContext(packs, context);
  vm.runInContext(converter, context);
  if (storage.calc?.reserveUnit === 'dia') context.setReserveUnit('dia', false);
  context.calc();
  return { context, get, storage };
}

test('page JavaScript parses and automatic returns exclude the target milestone and reserves', () => {
  new vm.Script(inlineScript);
  const { context, get } = mount();
  assert.equal(context.officialTicketCount('混池', 50), 10);
  assert.equal(context.officialTicketCount('混池', 51), 11);
  assert.equal(context.officialTicketCount('混池', 55), 15);
  get('poolSel').value = '混池';
  get('targetPulls').value = '50';
  get('reservePulls').value = '100';
  context.calc();
  assert.equal(get('officialTickets').value, 10);
});

test('zero remaining official tickets changes the diamond gap and pack recommendation together', () => {
  const { context, get } = mount();
  get('targetPulls').value = '70';
  context.calc();
  assert.equal(get('officialTickets').value, 16);
  assert.equal(get('paidPulls').textContent, 54);
  const automaticCost = get('packTotalValue').textContent;
  get('officialTickets').value = '0';
  context.setOfficialTickets();
  assert.equal(get('officialTickets').value, 0);
  assert.equal(get('gapDia').textContent, '10,500');
  assert.equal(get('paidPulls').textContent, 70);
  assert.match(get('packMsg').innerHTML, /70.*抽/);
  assert.notEqual(get('packTotalValue').textContent, automaticCost);
  context.setPackQuantity(3, 0);
  assert.match(get('packTotalNote').textContent, /尚差 25 抽/);
  context.restoreOfficialTickets();
  assert.equal(get('officialTickets').value, 16);
  assert.equal(get('paidPulls').textContent, 54);
});

test('manual tickets survive other edits, pool switches and reloads, including zero', () => {
  const { context, get, storage } = mount();
  get('officialTickets').value = '0';
  context.setOfficialTickets();
  get('targetPulls').value = '100';
  context.calc();
  assert.equal(get('officialTickets').value, 0);
  get('poolSel').value = '生日池';
  context.calc();
  assert.equal(get('officialTickets').value, 20);
  get('officialTickets').value = '7';
  context.setOfficialTickets();
  const reload = mount(storage);
  assert.equal(reload.get('officialTickets').value, 7);
  reload.get('poolSel').value = '日卡池';
  reload.context.calc();
  assert.equal(reload.get('officialTickets').value, 0);
  reload.context.restoreOfficialTickets();
  assert.equal(reload.get('officialTickets').value, 19);
  assert.equal(reload.storage.calc.officialTicketsByPool['生日池'], 7);
});

test('manual ticket inputs reject negative, fractional and nonfinite counts', () => {
  const { context, get } = mount();
  for (const [value, expected] of [['-2', 0], ['3.8', 3], ['Infinity', 0], ['', 0]]) {
    get('officialTickets').value = value;
    context.setOfficialTickets();
    assert.equal(get('officialTickets').value, expected);
  }
});

test('reset clears converter resources, overrides and packs while preserving the wallet', () => {
  const wallet = [{ amount: 320, category: '抽卡禮包' }];
  const { context, get, storage } = mount({
    expenses: wallet,
    calc: { pool: '生日池', cur: 1500, tickets: 5, pulls: 70, reserve: 300, reserveUnit: 'dia', officialTicketsByPool: { '生日池': 0 } },
    packQuantities: { '生日池': [1, 1], '日卡池': [2, 0] },
  });
  context.resetConverter();
  assert.equal(get('poolSel').value, '日卡池');
  for (const id of ['curDia', 'curTickets', 'targetPulls', 'reservePulls']) assert.equal(get(id).value, '');
  assert.equal(storage.calc.reserveUnit, 'pulls');
  assert.deepEqual(storage.calc.officialTicketsByPool, {});
  assert.deepEqual(storage.packQuantities, {});
  assert.deepEqual(storage.expenses, wallet);
  assert.equal(get('officialTickets').value, 10);
  assert.equal(get('recordPacks').disabled, true);
});
