/* 玩家提供的遊戲商店截圖。received 為收到資料日期，並非售價生效日期。
   截圖未提供平台；不同平台、活動或調價可能造成差異。
   單包內容沿用 PACK_DATA，海外售價依卡池及階級分別記錄。 */
window.REGIONAL_PACK_PRICES = [
  ...[
    ...['月卡復刻池','生日復刻池'].map(pool=>[pool,'月卡生日卡復刻池-港幣.JPG',[30,150,320,390,820],[8,38,68,98,218]]),
    ['混池','混池-港幣.JPG',[15,30,150,320,390,590,820,1690],[5,8,38,78,98,168,218,428]],
    ['生日池','生日池-港幣.JPG',[15,30,150,290,390,820,1490],[5,8,38,68,98,218,368],'2026-10-19']
  ].flatMap(([pool,file,twd,prices,received='2026-10-07'])=>prices.map((price,i)=>({pool,tier:'一二三四五六七八'[i],currency:'HKD',twdPrice:twd[i],price,source:`references/prices/${file}`,platform:'未提供',received}))),
  ...[
    ...['月卡復刻池','生日復刻池'].map(pool=>[pool,'月卡生日卡復刻池-馬幣.jpg',[30,150,320,390,820],[4.9,22.9,39.9,59.9,124.9]]),
    ['混池','混池-馬幣.JPG',[15,30,150,320,390,590,820,1690],[1.9,4.9,22.9,49.9,59.9,99.9,124.9,249.9]],
    ['生日池','生日池-馬幣.JPG',[15,30,150,290,390,820,1490],[1.9,4.9,22.9,39.9,59.9,124.9,229.9],'2026-10-19']
  ].flatMap(([pool,file,twd,prices,received='2026-10-07'])=>prices.map((price,i)=>({pool,tier:'一二三四五六七八'[i],currency:'MYR',twdPrice:twd[i],price,source:`references/prices/${file}`,platform:'未提供',received}))),
  ...[['HKD',8,'月卡生日卡復刻池-港幣.JPG'],['MYR',4.9,'月卡生日卡復刻池-馬幣.jpg']].map(([currency,price,file])=>({pool:'協會補給',tier:'Lv10',currency,twdPrice:30,price,source:`references/prices/${file}`,platform:'未提供',received:'2026-10-07'}))
];

// 2026-10-21 使用者同意跨池參照；2026-10-24 確認月卡與混池復刻售價。
// 金額沿用來源階級；日卡池仍屬推估，其餘參照池依使用者確認標示實價。
// 混池復刻各階折扣對應一般混池二至七階，不套用月卡／生日復刻的 NT$320 售價。
window.REGIONAL_PACK_PRICE_REFERENCES = [
  ['日卡池','混池','一二三四五七八',false],
  ['月卡池','生日池','一二三四五六七',true],
  ['混池復刻池','混池','二三四五六七',true]
].flatMap(([pool,referencePool,referenceTiers,confirmed])=>[...referenceTiers].map((referenceTier,i)=>({
  pool,tier:'一二三四五六七八'[i],referencePool,referenceTier,
  ...(confirmed?{confirmed:true,confirmedAt:'2026-10-24'}:{})
})));
