/* =============================================================
   深空帳本 · 課金禮包資料（由營運方維護）
   來源：戀與深空_禮包總表 / 月卡黨每月獲鑽
   -------------------------------------------------------------
   每個卡池的階級為「累計購買」：買到第 N 階即累計可得 cumPulls 抽、
   花費 cumCost、平均單抽 per。per = null 代表官方未固定抽數（X）。
   價格幣別沿用 App 的 NT$；若你的數據是其他幣別，跟我說即可整批換。
   ============================================================= */

window.MONTHLY_DIA = 7060;                 // 月卡黨每月約可獲得鑽石
window.PACK_POOLS  = ["日卡池","混池","月卡池","生日池","復刻池","協會補給","其他"];

// 官方免費金券：initial 為開池即送；milestones 為完成該累抽數後返還的張數。
window.OFFICIAL_TICKET_RULES = {
  "日卡池": {initial:10,milestones:[{every:10,reward:1,maxReward:10}]},
  "混池": {initial:10,milestones:[
    {at:50,reward:5},{at:100,reward:5},{at:150,reward:5},{at:250,reward:5}
  ]},
  "月卡池": {initial:0,milestones:[
    {every:5,reward:1,from:5,to:50},
    {every:10,reward:2,from:60,to:100}
  ]},
  "生日池": {initial:20,milestones:[]},
  "復刻池": {initial:0,milestones:[]},
  "協會補給": {initial:0,milestones:[]},
  "其他": {initial:0,milestones:[]}
};

window.PACK_DATA = {
  "日卡池":[
    {tier:"一",price:15,qty:5,packPulls:1,cumPulls:5,  cumCost:75,    per:15},
    {tier:"二",price:30,qty:5,packPulls:2,cumPulls:15, cumCost:225,   per:15},
    {tier:"三",price:150,qty:5,packPulls:6,cumPulls:45, cumCost:975,   per:25},
    {tier:"四",price:320,qty:5,packPulls:10,cumPulls:95,cumCost:2575, per:32},
    {tier:"五",price:390,qty:3,packPulls:12,cumPulls:131,cumCost:3745,per:32.5},
    {tier:"六",price:820,qty:10,packPulls:20,cumPulls:331,cumCost:11945,per:41},
    {tier:"七",price:1690,qty:1,packPulls:40,cumPulls:371,cumCost:13635,per:42.25},
  ],
  "混池":[
    {tier:"一",price:15,qty:5,packPulls:1,cumPulls:5,cumCost:75,per:15},
    {tier:"二",price:30,qty:3,packPulls:2,cumPulls:11,cumCost:165,per:15},
    {tier:"三",price:150,qty:5,packPulls:6,cumPulls:41,cumCost:915,per:25},
    {tier:"四",price:320,qty:5,packPulls:10,cumPulls:91,cumCost:2515,per:32},
    {tier:"五",price:390,qty:5,packPulls:12,cumPulls:151,cumCost:4465,per:32.5},
    {tier:"六",price:590,qty:3,packPulls:16,cumPulls:199,cumCost:6235,per:36.88},
    {tier:"七",price:820,qty:10,packPulls:20,cumPulls:399,cumCost:14435,per:41},
    {tier:"八",price:1690,qty:1,packPulls:40,cumPulls:439,cumCost:16125,per:42.25},
  ],
  "月卡池/生日池":[
    {tier:"一",price:15,qty:3,packPulls:1,cumPulls:3,cumCost:45,per:15},
    {tier:"二",price:30,qty:3,packPulls:2,cumPulls:9,cumCost:135,per:15},
    {tier:"三",price:150,qty:3,packPulls:6,cumPulls:27,cumCost:585,per:25},
    {tier:"四",price:290,qty:2,packPulls:10,cumPulls:47,cumCost:1165,per:29},
    {tier:"五",price:390,qty:2,packPulls:12,cumPulls:71,cumCost:1945,per:32.5},
    {tier:"六",price:820,qty:10,packPulls:20,cumPulls:271,cumCost:10145,per:41},
    {tier:"七",price:1490,qty:1,packPulls:null,cumPulls:271,cumCost:11635,per:null},
  ],
  "復刻池":[
    {tier:"一",price:30,qty:1,packPulls:2,cumPulls:2,cumCost:30,per:15},
    {tier:"二",price:150,qty:3,packPulls:6,cumPulls:20,cumCost:480,per:25},
    {tier:"三",price:320,qty:5,packPulls:10,cumPulls:70,cumCost:2080,per:32},
    {tier:"四",price:390,qty:3,packPulls:12,cumPulls:106,cumCost:3250,per:32.5},
    {tier:"五",price:820,qty:10,packPulls:20,cumPulls:306,cumCost:11450,per:41},
  ],
  "協會補給":[
    {tier:"Lv10",price:30,packPulls:2,cumPulls:2,cumCost:30,per:15},
    {tier:"Lv15",price:150,packPulls:6,cumPulls:8,cumCost:180,per:25},
    {tier:"Lv20",price:220,packPulls:8,cumPulls:16,cumCost:400,per:27.5},
    {tier:"Lv25",price:320,packPulls:12,cumPulls:28,cumCost:720,per:26.67},
    {tier:"Lv30",price:490,packPulls:15,cumPulls:43,cumCost:1210,per:32.67},
    {tier:"Lv35",price:590,packPulls:20,cumPulls:63,cumCost:1800,per:29.5},
    {tier:"Lv40",price:890,packPulls:30,cumPulls:93,cumCost:2690,per:29.67},
    {tier:"Lv50",price:1490,packPulls:50,cumPulls:143,cumCost:4180,per:29.8},
    {tier:"Lv60",price:1790,packPulls:60,cumPulls:203,cumCost:5970,per:29.83},
    {tier:"Lv65",price:2990,packPulls:100,cumPulls:303,cumCost:8960,per:29.9},
  ],
};

// 月卡池與生日池使用同一份禮包表，但官方免費金券規則不同。
window.PACK_DATA["月卡池"] = window.PACK_DATA["月卡池/生日池"];
window.PACK_DATA["生日池"] = window.PACK_DATA["月卡池/生日池"];

// 「其他」為定期禮包，無累計抽數，僅列單抽 CP 值
window.PACK_OTHER = [
  {name:"周卡",                     price:220, per:31.4},
  {name:"特別密約",                 price:320, per:26.6},
  {name:"升級版特別密約（只計金券）", price:490, per:40.8},
];
