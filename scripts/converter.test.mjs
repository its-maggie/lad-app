import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
const converter = inlineScript.slice(inlineScript.indexOf('const MONTHLY_DIA='), inlineScript.indexOf('/* ---------- init ---------- */'));
const packs = fs.readFileSync(new URL('../packs.js', import.meta.url), 'utf8');
const regionalPrices = fs.readFileSync(new URL('../regional-prices.js', import.meta.url), 'utf8');

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
  vm.runInContext(regionalPrices, context);
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

test('monthly rerun returns become usable after milestones and cap at twenty tickets',()=>{
  const {context}=mount();
  for(const [target,expected] of [[0,0],[10,0],[11,1],[12,2],[20,2],[21,3],[22,4],[30,4],[32,6],[40,6],[42,8],[50,8],[52,10],[75,10],[76,11],[80,15],[100,15],[101,16],[105,20],[300,20]]){
    assert.equal(context.officialTicketCount('月卡復刻池',target),expected,`target ${target}`);
    assert.equal(context.officialTicketCount('生日復刻池',target),0);
  }
});

test('mixed reruns return five tickets at 50, 100 and 150 pulls, usable only after each milestone',()=>{
  const {context}=mount();
  for(const [target,expected] of [[0,0],[49,0],[50,0],[51,1],[54,4],[55,5],[99,5],[100,5],[101,6],[104,9],[105,10],[149,10],[150,10],[151,11],[154,14],[155,15],[250,15],[255,15],[300,15]]){
    assert.equal(context.officialTicketCount('混池復刻池',target),expected,`target ${target}`);
  }
});

test('mixed rerun returns update the estimate, diamond gap and recommendation without counting reserves',()=>{
  const {context,get,storage}=mount({calc:{pool:'混池復刻池',pulls:155}});
  assert.equal(get('officialTickets').value,15);
  assert.equal(get('officialTicketNote').textContent,'自動估算 15 張：免費贈送 0 張＋目標前可折抵累抽返還 15 張');
  assert.equal(get('paidPulls').textContent,140);
  assert.equal(get('gapDia').textContent,'21,000');
  assert.match(get('packMsg').innerHTML,/還需課金 <b>140<\/b> 抽/);
  const automaticCost=get('packTotalValue').textContent;
  get('officialTickets').value='0';context.setOfficialTickets();
  assert.equal(get('paidPulls').textContent,155);
  assert.equal(get('gapDia').textContent,'23,250');
  assert.notEqual(get('packTotalValue').textContent,automaticCost);
  const reload=mount(storage);
  assert.equal(reload.get('officialTickets').value,0);
  reload.context.restoreOfficialTickets();
  assert.equal(reload.get('officialTickets').value,15);
  assert.equal(reload.get('packTotalValue').textContent,automaticCost);
  reload.get('targetPulls').value='50';reload.get('reservePulls').value='150';reload.context.calc();
  assert.equal(reload.get('officialTickets').value,0);
  assert.equal(reload.get('paidPulls').textContent,200);
});

test('rerun choices update tickets, diamond gap and costs together',()=>{
  const {context,get,storage}=mount({calc:{pool:'月卡復刻池',pulls:100}});
  assert.equal(get('officialTickets').value,15);
  assert.equal(get('paidPulls').textContent,85);
  assert.equal(get('gapDia').textContent,'12,750');
  assert.equal(get('packTotalValue').textContent,'NT$3,310');
  get('poolSel').value='生日復刻池';context.calc();
  assert.equal(get('officialTickets').value,0);
  assert.equal(get('paidPulls').textContent,100);
  assert.equal(get('gapDia').textContent,'15,000');
  assert.equal(get('packTotalValue').textContent,'NT$4,130');
  get('poolSel').value='月卡復刻池';context.calc();
  get('officialTickets').value='0';context.setOfficialTickets();
  assert.equal(get('packTotalValue').textContent,'NT$4,130');
  const reload=mount(storage);
  assert.equal(reload.get('officialTickets').value,0);
  reload.context.restoreOfficialTickets();
  assert.equal(reload.get('officialTickets').value,15);
  reload.get('reservePulls').value='100';reload.context.calc();
  assert.equal(reload.get('officialTickets').value,15);
});

test('both legacy rerun names preserve records without copying selections into monthly reruns',()=>{
  for(const legacy of ['復刻池','月卡／生日復刻池']){
    const {context,get,storage}=mount({calc:{pool:legacy,pulls:100,officialTicketsByPool:{[legacy]:7}},packQuantities:{[legacy]:[1,1,1,3,2]}});
    assert.equal(get('poolSel').value,'生日復刻池');
    assert.equal(get('officialTickets').value,7);
    assert.deepEqual(storage.packQuantities['生日復刻池'],[1,1,1,3,2]);
    assert.equal(storage.packQuantities[legacy],undefined);
    get('poolSel').value='月卡復刻池';context.calc();
    assert.equal(get('officialTickets').value,15);
    context.setPackQuantity(4,1);
    assert.deepEqual(storage.packQuantities['月卡復刻池'],[1,1,1,3,1]);
    get('poolSel').value='生日復刻池';context.calc();
    assert.deepEqual(storage.packQuantities['生日復刻池'],[1,1,1,3,2]);
    assert.equal(get('officialTickets').value,7);
  }
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

test('regional totals preserve decimal prices and currency switches preserve resources and quantities', () => {
  const { context, get, storage } = mount({calc:{pool:'混池',cur:150,tickets:2,pulls:40,officialTicketsByPool:{混池:0}},packQuantities:{混池:[2,1,0,0,0,0,0,0]}});
  const quantities=structuredClone(storage.packQuantities),calc=structuredClone(storage.calc);
  context.setPackCurrency('MYR');
  assert.equal(get('packTotalValue').textContent, 'RM8.7');
  assert.deepEqual(storage.packQuantities, quantities);
  assert.deepEqual(storage.calc, calc);
  assert.equal(storage.packCurrency, 'MYR');
  const reload=mount(storage);
  assert.equal(reload.get('packTotalValue').textContent, 'RM8.7');
  context.setPackCurrency('HKD');
  assert.equal(get('packTotalValue').textContent, 'HK$18');
  get('poolSel').value='月卡池';context.calc();
  assert.match(get('packTable').innerHTML, /推估/);
  assert.match(get('packTotalNote').textContent, /含推估價格/);
});

test('old rerun quantities clamp to corrected purchase caps and recommendations respect 254 pull limit', () => {
  const { context, get, storage } = mount({calc:{pool:'復刻池',pulls:254},packQuantities:{復刻池:[1,3,5,3,10]}});
  assert.equal(get('poolSel').value,'生日復刻池');
  assert.deepEqual(storage.packQuantities['生日復刻池'],[1,1,1,3,10]);
  assert.equal(storage.packQuantities.復刻池,undefined);
  assert.equal(get('packTotalValue').textContent,'NT$9,870');
  assert.match(get('packTotalNote').textContent,/254 抽/);
  get('targetPulls').value='255';context.calc();
  assert.match(get('packMsg').innerHTML,/超過此卡池單輪上限/);
  context.setPackQuantity(1,3);context.setPackQuantity(2,5);
  assert.deepEqual(storage.packQuantities['生日復刻池'],[1,1,1,3,10]);
});

test('birthday screenshot prices remove estimates and keep the final bundle pull count unknown',()=>{
  const {context,get}=mount({calc:{pool:'生日池'},packQuantities:{生日池:[3,3,3,2,2,10,1]}});
  context.setPackCurrency('HKD');
  assert.equal(get('packTotalValue').textContent,'HK$3,033');
  assert.doesNotMatch(get('packTable').innerHTML,/推估/);
  assert.match(get('packTotalNote').textContent,/已知抽數 271 抽/);
  context.setPackCurrency('MYR');
  assert.equal(get('packTotalValue').textContent,'RM1,767.6');
  assert.doesNotMatch(get('packTotalNote').textContent,/推估/);
});

test('legacy rerun ticket overrides migrate without replacing existing new-pool selections',()=>{
  const {context,get,storage}=mount({calc:{pool:'復刻池',pulls:100,officialTicketsByPool:{復刻池:7}},packQuantities:{復刻池:[1,1,1,3,10],'生日復刻池':[0,0,0,0,1]}});
  assert.equal(get('officialTickets').value,7);
  assert.equal(storage.calc.officialTicketsByPool.復刻池,undefined);
  assert.equal(storage.calc.officialTicketsByPool['生日復刻池'],7);
  assert.deepEqual(storage.packQuantities['生日復刻池'],[0,0,0,0,1]);
  assert.equal(get('packTotalValue').textContent,'NT$820');
  context.calc();
  assert.equal(get('officialTickets').value,7);
});

test('missing regional prices cannot silently understate a selected total or be recorded', () => {
  const { context, get } = mount({calc:{pool:'混池',pulls:30}});
  context.window.REGIONAL_PACK_PRICES=[];
  context.setPackCurrency('MYR');
  context.setPackQuantity(0,1);
  assert.equal(get('packTotalValue').textContent,'金額待確認');
  assert.equal(get('recordPacks').disabled,true);
  assert.match(get('packMsg').innerHTML,/售價尚待確認/);
});

test('mixed reruns use the 590 tier, respect the 302 pull limit, and keep selections separate across rerun types',()=>{
  const {context,get,storage}=mount({calc:{pool:'混池復刻池',pulls:70}});
  assert.match(get('packMsg').innerHTML,/第 五 階/);
  assert.match(get('packMsg').innerHTML,/70 抽/);
  assert.equal(get('packTotalValue').textContent,'NT$2,260');
  context.setPackQuantity(4,3);
  assert.match(get('packTotalNote').textContent,/102 抽/);
  assert.equal(get('packTotalValue').textContent,'NT$3,440');
  get('poolSel').value='生日復刻池';get('targetPulls').value='254';context.calc();
  assert.equal(get('packTotalValue').textContent,'NT$9,870');
  get('poolSel').value='混池復刻池';get('targetPulls').value='302';context.calc();
  assert.deepEqual(storage.packQuantities['混池復刻池'],[1,1,1,3,3,0]);
  context.applyRecommendedPacks();
  assert.equal(get('packTotalValue').textContent,'NT$11,640');
  assert.match(get('packTotalNote').textContent,/302 抽/);
  get('targetPulls').value='317';context.calc();
  assert.doesNotMatch(get('packMsg').innerHTML,/超過此卡池單輪上限/);
  get('targetPulls').value='318';context.calc();
  assert.match(get('packMsg').innerHTML,/超過此卡池單輪上限/);
  context.setPackCurrency('MYR');context.setPackQuantity(4,1);
  assert.equal(get('packTotalValue').textContent,'金額待確認');
  assert.equal(get('recordPacks').disabled,true);
});
