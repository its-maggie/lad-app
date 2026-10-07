import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function load(){
  const ctx=vm.createContext({window:{}});
  for(const file of ['regional-prices.js','packs.js'])vm.runInContext(fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8'),ctx);
  return ctx.window;
}
test('regional prices match the four supplied screenshots, including pool-specific 320 price points',()=>{
  const w=load();
  for(const [pool,code,prices] of [
    ['混池','HKD',[5,8,38,78,98,168,218,428]],
    ['混池','MYR',[1.9,4.9,22.9,49.9,59.9,99.9,124.9,249.9]],
    ['復刻池','HKD',[8,38,68,98,218]],
    ['復刻池','MYR',[4.9,22.9,39.9,59.9,124.9]]
  ]){
    const tiers=w.getPackTiers(pool,code);
    assert.deepEqual(Array.from(tiers,t=>t.price),prices);
    assert.ok(tiers.every(t=>t.priceStatus==='confirmed'&&t.priceSource.startsWith('references/prices/')));
  }
  assert.equal(w.getPackTiers('復刻池','TWD').at(-1).cumCost,9870);
  assert.equal(w.getPackTiers('復刻池','HKD').at(-1).cumCost,2588);
  assert.equal(w.getPackTiers('復刻池','MYR').at(-1).cumCost,1496.4);
});
test('other pools remain estimated until real evidence arrives; interpolation is explicitly identified',()=>{
  const w=load();
  for(const pool of ['日卡池','月卡池','生日池']){
    for(const currency of ['HKD','MYR'])assert.ok(w.getPackTiers(pool,currency).every(t=>t.priceStatus==='estimated'));
  }
  const t=w.getPackTiers('月卡池','MYR')[3];
  assert.equal(t.price,45.14);
  assert.match(t.priceMethod,/線性內插/);
  w.REGIONAL_PACK_PRICES.push({pool:'月卡池',tier:'四',currency:'MYR',price:39.9,source:'new-player-screenshot'});
  assert.equal(w.getPackTiers('月卡池','MYR')[3].price,39.9);
  assert.equal(w.getPackTiers('月卡池','MYR')[3].priceStatus,'confirmed');
});
test('unknown or conflicting prices stay unknown, and unknown pulls are not given a single-pull cost',()=>{
  const w=load();
  w.REGIONAL_PACK_PRICES.push({pool:'混池',tier:'四',currency:'HKD',price:68,source:'conflict'});
  assert.equal(w.getPackTiers('混池','HKD')[3].price,null);
  assert.equal(w.getPackTiers('混池','HKD').at(-1).cumCost,null);
  assert.equal(w.getPackTiers('月卡池','MYR').at(-1).per,null);
  assert.equal(w.resolvePackPrice('協會補給','Lv65','MYR').price,null);
  assert.equal(w.formatMoney(null,'MYR'),'待確認');
  assert.equal(w.formatMoney(4.9,'MYR'),'RM4.9');
});
