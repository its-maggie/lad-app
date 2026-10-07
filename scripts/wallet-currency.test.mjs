import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const budget=js.slice(js.indexOf('/* ================= BUDGET'),js.indexOf('/* ================= CALENDAR'));
function mount(saved={}){
  const store=structuredClone(saved),elements=new Map();
  const get=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',style:{},classList:{add(){},toggle(){}},setAttribute(){},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);};
  const ctx=vm.createContext({window:{},document:{getElementById:get},navigator:{},alert:()=>{throw Error('Unexpected alert');},I:{},catIcon:{},svg:()=>'',
    DB:{get:(k,d)=>structuredClone(store[k]??d),set:(k,v)=>store[k]=structuredClone(v)},
    pad:n=>String(n).padStart(2,'0'),curMonth:()=> '2026-10',todayStr:()=> '2026-10-07',esc:s=>s||''});
  vm.runInContext(fs.readFileSync(new URL('../packs.js',import.meta.url),'utf8'),ctx);
  vm.runInContext('const NT=n=>window.formatMoney(n,walletCurrency);',ctx);
  vm.runInContext(budget,ctx);
  ctx.renderBudget();
  return {ctx,get,store};
}
test('legacy TWD entries and budgets remain intact while regional budgets and charts stay separate',()=>{
  const original=[{id:1,date:'2026-10-07',amt:320,cat:'抽卡禮包'},{id:2,date:'2026-10-07',amt:4.9,currency:'MYR',cat:'抽卡禮包'}];
  const {ctx,get,store}=mount({expenses:original,budgets:{'2026-10':{amount:3000,threshold:80}}});
  assert.equal(get('spentText').textContent,'NT$320');
  assert.equal(ctx.expenseMonthsData().at(-1).amount,320);
  ctx.setWalletCurrency('MYR');
  assert.equal(get('spentText').textContent,'RM4.9');
  assert.equal(get('budgetInput').value,'');
  assert.equal(ctx.expenseMonthsData().at(-1).amount,4.9);
  assert.equal(get('chartAverage').textContent,'RM0.82');
  get('budgetInput').value='99.9';get('thresholdInput').value='75';ctx.saveBudget();
  assert.equal(store.budgets['MYR:2026-10'].amount,99.9);
  assert.equal(store.budgets['2026-10'].amount,3000);
  assert.deepEqual(store.expenses,original);
  ctx.setWalletCurrency('TWD');
  assert.equal(get('budgetInput').value,3000);
});
test('new entries keep currency and decimals through editing and reload, and switching clears an unfinished amount',()=>{
  const {ctx,get,store}=mount();
  ctx.setWalletCurrency('MYR');
  get('expAmt').value='8.7';get('expCat').value='抽卡禮包';get('expDate').value='2026-10-07';ctx.addExpense();
  assert.equal(store.expenses[0].currency,'MYR');assert.equal(store.expenses[0].amt,8.7);
  ctx.openExpenseEditor(store.expenses[0].id);
  assert.equal(get('editExpAmtLabel').textContent,'金額（RM）');
  get('editExpAmt').value='9.9';ctx.saveExpenseEdit();
  assert.equal(store.expenses[0].currency,'MYR');assert.equal(store.expenses[0].amt,9.9);
  const reload=mount(store);assert.equal(reload.get('spentText').textContent,'RM9.9');
  get('expAmt').value='150';ctx.setWalletCurrency('HKD');
  assert.equal(get('expAmt').value,'');assert.equal(get('spentText').textContent,'HK$0');
});
