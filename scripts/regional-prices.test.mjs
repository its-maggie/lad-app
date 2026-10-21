import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function load(){
  const ctx=vm.createContext({window:{}});
  for(const file of ['regional-prices.js','packs.js'])vm.runInContext(fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8'),ctx);
  return ctx.window;
}
test('regional screenshot prices stay confirmed when other pools reference them',()=>{
  const w=load();
  for(const [pool,code,prices] of [
    ['混池','HKD',[5,8,38,78,98,168,218,428]],
    ['混池','MYR',[1.9,4.9,22.9,49.9,59.9,99.9,124.9,249.9]],
    ['生日復刻池','HKD',[8,38,68,98,218]],
    ['生日復刻池','MYR',[4.9,22.9,39.9,59.9,124.9]],
    ['月卡復刻池','HKD',[8,38,68,98,218]],
    ['月卡復刻池','MYR',[4.9,22.9,39.9,59.9,124.9]],
    ['生日池','HKD',[5,8,38,68,98,218,368]],
    ['生日池','MYR',[1.9,4.9,22.9,39.9,59.9,124.9,229.9]]
  ]){
    const tiers=w.getPackTiers(pool,code);
    assert.deepEqual(Array.from(tiers,t=>t.price),prices);
    assert.ok(tiers.every(t=>t.priceStatus==='confirmed'&&t.priceSource.startsWith('references/prices/')));
  }
  assert.equal(w.getPackTiers('復刻池','TWD').at(-1).cumCost,9870);
  assert.equal(w.getPackTiers('復刻池','HKD').at(-1).cumCost,2588);
  assert.equal(w.getPackTiers('復刻池','MYR').at(-1).cumCost,1496.4);
  assert.equal(w.getPackTiers('生日池','HKD').at(-1).cumCost,3033);
  assert.equal(w.getPackTiers('生日池','MYR').at(-1).cumCost,1767.6);
  assert.equal(w.getPackTiers('生日池','MYR').at(-1).per,null);
});
test('rerun pool structures differ by the 590 tier and mixed-rerun references follow regular mixed pools',()=>{
  const w=load();
  const monthly=w.getPackTiers('生日復刻池','TWD');
  const mixed=w.getPackTiers('混池復刻池','TWD');
  assert.deepEqual(Array.from(monthly,t=>[t.price,t.qty,t.packPulls]),[[30,1,2],[150,1,6],[320,1,10],[390,3,12],[820,10,20]]);
  assert.deepEqual(Array.from(mixed,t=>[t.price,t.qty,t.packPulls]),[[30,1,2],[150,1,6],[320,1,10],[390,3,12],[590,3,16],[820,10,20]]);
  assert.equal(monthly.at(-1).cumPulls,254);
  assert.deepEqual(Array.from(w.getPackTiers('月卡復刻池','TWD'),t=>[t.price,t.qty,t.packPulls]),Array.from(monthly,t=>[t.price,t.qty,t.packPulls]));
  assert.ok(w.PACK_POOLS.includes('月卡復刻池')&&w.PACK_POOLS.includes('生日復刻池'));
  assert.ok(!w.PACK_POOLS.includes('月卡／生日復刻池'));
  assert.equal(mixed.at(-1).cumPulls,302);
  assert.equal(mixed.at(-1).cumCost,11640);
  for(const [code,prices,total] of [['HKD',[8,38,78,98,168,218],3102],['MYR',[4.9,22.9,49.9,59.9,99.9,124.9],1806.1]]){
    const tiers=w.getPackTiers('混池復刻池',code);
    assert.deepEqual(Array.from(tiers,t=>t.price),prices);
    assert.ok(tiers.every(t=>t.priceStatus==='estimated'&&t.priceSource.includes('混池-')));
    assert.equal(tiers.at(-1).cumCost,total);
  }
});
test('daily and monthly pools use matching screenshot tiers as estimates; direct evidence takes priority',()=>{
  const w=load();
  for(const [pool,currency,prices] of [
    ['日卡池','HKD',[5,8,38,78,98,218,428]],
    ['日卡池','MYR',[1.9,4.9,22.9,49.9,59.9,124.9,249.9]],
    ['月卡池','HKD',[5,8,38,68,98,218,368]],
    ['月卡池','MYR',[1.9,4.9,22.9,39.9,59.9,124.9,229.9]]
  ]){
    const tiers=w.getPackTiers(pool,currency);
    assert.deepEqual(Array.from(tiers,t=>t.price),prices);
    assert.ok(tiers.every(t=>t.priceStatus==='estimated'&&t.priceMethod.includes('截圖售價')));
  }
  assert.equal(w.getPackTiers('月卡池','HKD').at(-1).cumCost,3033);
  assert.equal(w.getPackTiers('月卡池','MYR').at(-1).cumCost,1767.6);
  assert.equal(w.getPackTiers('月卡池','MYR').at(-1).per,null);
  w.REGIONAL_PACK_PRICES.push({pool:'月卡池',tier:'四',currency:'MYR',price:38.9,source:'new-player-screenshot'});
  assert.equal(w.getPackTiers('月卡池','MYR')[3].price,38.9);
  assert.equal(w.getPackTiers('月卡池','MYR')[3].priceStatus,'confirmed');
});
test('unknown or conflicting prices stay unknown, and unknown pulls are not given a single-pull cost',()=>{
  const w=load();
  w.REGIONAL_PACK_PRICES.push({pool:'混池',tier:'四',currency:'HKD',price:68,source:'conflict'});
  assert.equal(w.getPackTiers('混池','HKD')[3].price,null);
  assert.equal(w.getPackTiers('混池','HKD').at(-1).cumCost,null);
  assert.equal(w.getPackTiers('日卡池','HKD')[3].price,null);
  assert.equal(w.getPackTiers('混池復刻池','HKD')[2].price,null);
  assert.equal(w.getPackTiers('混池復刻池','HKD').at(-1).cumCost,null);
  w.REGIONAL_PACK_PRICES=w.REGIONAL_PACK_PRICES.filter(r=>!(r.pool==='生日池'&&r.tier==='四'&&r.currency==='MYR'));
  assert.equal(w.getPackTiers('月卡池','MYR')[3].price,null);
  assert.equal(w.getPackTiers('月卡池','MYR').at(-1).per,null);
  assert.equal(w.resolvePackPrice('協會補給','Lv65','MYR').price,null);
  assert.equal(w.formatMoney(null,'MYR'),'待確認');
  assert.equal(w.formatMoney(4.9,'MYR'),'RM4.9');
});
