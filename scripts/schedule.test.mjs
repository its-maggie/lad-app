import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
const calendar = inlineScript.slice(inlineScript.indexOf('const SCHED='), inlineScript.indexOf('const MONTHLY_DIA='));

function mount(events, today, saved = {}) {
  const storage = structuredClone(saved);
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, { textContent: '', innerHTML: '', style: {} });
    return elements.get(id);
  };
  const context = vm.createContext({
    window: { SCHEDULE: events },
    document: { getElementById: get, querySelectorAll: () => [] },
    DB: { get: (key, fallback) => storage[key] ?? fallback, set: (key, value) => { storage[key] = structuredClone(value); } },
    todayStr: () => today,
    pad: value => String(value).padStart(2, '0'),
    svg: () => '', esc: value => String(value), I: {}, evIcon: {},
  });
  vm.runInContext(calendar, context);
  return { context, get, storage };
}

test('lead filters focus from all, allow multiple leads, persist, and reset when the last lead is removed', () => {
  const events = [
    { name: '星回活動', type: 'daily', start: '2026-11-01', end: '2026-11-02', leads: ['沈星回'] },
    { name: '黎深活動', type: 'daily', start: '2026-11-01', end: '2026-11-02', leads: ['黎深'] },
    { name: '共同活動', type: 'event', start: '2026-11-01', end: '2026-11-02', leads: [] },
  ];
  const { context, get, storage } = mount(events, '2026-11-01');
  vm.runInContext("calY=2026;calM=10;toggleLead('沈星回');", context);
  assert.deepEqual(storage.leadFilter, ['沈星回']);
  assert.match(get('dayList').innerHTML, /星回活動/);
  assert.doesNotMatch(get('dayList').innerHTML, /黎深活動/);
  assert.match(get('dayList').innerHTML, /共同活動/);
  context.toggleLead('黎深');
  assert.deepEqual(storage.leadFilter, ['沈星回', '黎深']);
  const reloaded = mount(events, '2026-11-01', storage);
  assert.equal(reloaded.context.filteredSchedule().length, 3);
  context.toggleLead('沈星回');
  assert.deepEqual(storage.leadFilter, ['黎深']);
  context.toggleLead('黎深');
  assert.equal(storage.leadFilter.length, 5);
  context.toggleLead('秦徹');
  assert.deepEqual(storage.leadFilter, ['秦徹']);
  context.clearLeadFilters();
  assert.equal(storage.leadFilter.length, 5);
  assert.equal(mount(events, '2026-11-01', { leadFilter: [] }).context.filteredSchedule().length, 3);
});

test('forecasts retain their status after the event ends; confirmed events remain distinct', () => {
  const forecast = { name: '預測生日池', type: 'birthday', start: '2027-02-27', end: '2027-03-07', tentative: true, leads: [] };
  const confirmed = { ...forecast, name: '官方已確認', tentative: false };
  for (const today of ['2026-10-24', '2027-03-01', '2028-01-01']) {
    const { context } = mount([], today);
    assert.equal(context.isForecast(forecast), true, today);
    assert.equal(context.isForecast(confirmed), false, today);
    assert.match(context.evItemHTML(forecast), /class="item tentative"/);
    assert.match(context.evItemHTML(forecast), /預測/);
    assert.doesNotMatch(context.evItemHTML(confirmed), /class="item tentative"/);
  }
});

test('calendar bars and list icons use dashed forecast styling, including past forecasts', () => {
  const events = [
    { name: '預測生日池', type: 'birthday', start: '2027-02-27', end: '2027-03-07', tentative: true, leads: [] },
    { name: '已確認復刻', type: 'rerun', start: '2027-03-15', end: '2027-03-22', tentative: false, leads: [] },
  ];
  const { context, get } = mount(events, '2028-01-01');
  vm.runInContext('calY=2027;calM=2;calSel=null;renderCal();', context);
  const grid = get('calGrid').innerHTML;
  assert.match(grid, /class="cal-event t-birthday tentative"/);
  assert.match(grid, /class="cal-event t-rerun "/);
  assert.match(get('dayList').innerHTML, /class="item tentative"/);
  assert.match(html, /\.cal-event\.tentative\s*\{[^}]*border:\s*1px dashed/);
  assert.match(html, /\.item\.tentative \.ico-chip\s*\{[^}]*border-style:\s*dashed/);
});
