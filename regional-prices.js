/* 玩家提供的遊戲商店截圖。received 為收到資料日期，並非售價生效日期。
   截圖未提供平台；不同平台、活動或調價可能造成差異。
   單包內容沿用 PACK_DATA，海外售價依卡池及階級分別記錄。 */
window.REGIONAL_PACK_PRICES = [
  ...[
    ['復刻池','復刻池-港幣.JPG',[30,150,320,390,820],[8,38,68,98,218]],
    ['混池','混池-港幣.JPG',[15,30,150,320,390,590,820,1690],[5,8,38,78,98,168,218,428]]
  ].flatMap(([pool,file,twd,prices])=>prices.map((price,i)=>({pool,tier:'一二三四五六七八'[i],currency:'HKD',twdPrice:twd[i],price,source:`references/prices/${file}`,platform:'未提供',received:'2026-10-07'}))),
  ...[
    ['復刻池','復刻池-馬幣.jpg',[30,150,320,390,820],[4.9,22.9,39.9,59.9,124.9]],
    ['混池','混池-馬幣.JPG',[15,30,150,320,390,590,820,1690],[1.9,4.9,22.9,49.9,59.9,99.9,124.9,249.9]]
  ].flatMap(([pool,file,twd,prices])=>prices.map((price,i)=>({pool,tier:'一二三四五六七八'[i],currency:'MYR',twdPrice:twd[i],price,source:`references/prices/${file}`,platform:'未提供',received:'2026-10-07'}))),
  ...[['HKD',8,'復刻池-港幣.JPG'],['MYR',4.9,'復刻池-馬幣.jpg']].map(([currency,price,file])=>({pool:'協會補給',tier:'Lv10',currency,twdPrice:30,price,source:`references/prices/${file}`,platform:'未提供',received:'2026-10-07'}))
];
