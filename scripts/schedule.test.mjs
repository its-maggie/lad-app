import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
const calendar = inlineScript.slice(inlineScript.indexOf('const SCHED='), inlineScript.indexOf('const MONTHLY_DIA='));

function mount(events, today) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, { textContent: '', innerHTML: '', style: {} });
    return elements.get(id);
  };
  const context = vm.createContext({
    window: { SCHEDULE: events },
    document: { getElementById: get, querySelectorAll: () => [] },
    DB: { get: (_, fallback) => fallback },
    todayStr: () => today,
    pad: value => String(value).padStart(2, '0'),
    svg: () => '', esc: value => String(value), I: {}, evIcon: {},
  });
  vm.runInContext(calendar, context);
  return { context, get };
}

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
