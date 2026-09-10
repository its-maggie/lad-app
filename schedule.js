/* =============================================================
   深空帳本 · 官方公告與 2026-09-10 排期預測整理
   預測來源：0910排期預測更新.JPG（右側第 2 版）。
   秦徹猩紅復刻以官方 9/8–9/15 為準，不採用圖中的 9/10–9/16。
   保留既有八月活動；九月起未公告排期改依本版，不沿用舊版推測。
   密約只提供可能開啟日，結束日與角色尚未確認。
   注意：tentative 為 true 的項目屬預測資料，日期及內容皆可能變動。
   ============================================================= */

window.SCHEDULE_META = {
  updated: "2026-09-10",
  label: "排期整理",
  forecastSource: "0910排期預測更新.JPG（右側第 2 版）"
};

window.SCHEDULE = [
  { name: "夏以晝月卡",                 type: "monthly", start: "2026-08-05", end: "2026-08-14", tentative: false, leads: ["夏以晝"] },
  { name: "花承春意、甜夢清歡周邊",     type: "merch",   start: "2026-08-10", end: "2026-08-20", tentative: false, leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "祁煜日卡",                   type: "daily",   start: "2026-08-14", end: "2026-08-28", tentative: true,  leads: ["祁煜"] },
  { name: "秦徹不設防禁區復刻",         type: "rerun",   start: "2026-08-24", end: "2026-08-31", tentative: false, leads: ["秦徹"] },
  { name: "黎深生日＋生日復刻",         type: "birthday",start: "2026-08-31", end: "2026-09-07", tentative: true,  leads: ["黎深"] },
  { name: "密約・秦徹／祁煜",           type: "pass",    start: "2026-08-24", end: "2026-10-21", tentative: false, leads: ["秦徹", "祁煜"] },
  { name: "秦徹猩紅日卡2.0復刻",         type: "rerun",   start: "2026-09-08", end: "2026-09-15", tentative: false, source: "https://www.facebook.com/loveanddeepspace.tw/videos/1651548833246382/", leads: ["秦徹"] },
  { name: "新混池5",                    type: "mixed",   start: "2026-09-19", end: "2026-10-04", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "祁煜長思入畫復刻",           type: "rerun",   start: "2026-09-27", end: "2026-10-04", tentative: true,  leads: ["祁煜"] },
  { name: "半透明侵占復刻",             type: "rerun",   start: "2026-10-04", end: "2026-10-11", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹"] },
  { name: "沈星回生日＋生日復刻",       type: "birthday",start: "2026-10-11", end: "2026-10-18", tentative: true,  leads: ["沈星回"] },
  { name: "祁煜單人月卡",               type: "monthly", start: "2026-10-21", end: "2026-10-30", tentative: true,  leads: ["祁煜"] },
  { name: "新密約（開啟日待確認）",     type: "pass",    start: "2026-10-21", end: "",           tentative: true,  leads: [] },
  { name: "遵命飼養官復刻",             type: "rerun",   start: "2026-11-02", end: "2026-11-10", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹"] },
  { name: "沈星回日卡3.0",              type: "daily",   start: "2026-11-13", end: "2026-11-27", tentative: true,  leads: ["沈星回"] },
  { name: "秦徹熾光淋漓復刻",           type: "rerun",   start: "2026-11-20", end: "2026-11-27", tentative: true,  leads: ["秦徹"] },
  { name: "新混池6",                    type: "mixed",   start: "2026-11-30", end: "2026-12-14", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "黎深脈脈傾音復刻",           type: "rerun",   start: "2026-12-07", end: "2026-12-14", tentative: true,  leads: ["黎深"] },
  { name: "奔湧至昨夜盡頭復刻",         type: "rerun",   start: "2026-12-14", end: "2026-12-22", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "夏以晝日卡2.0復刻",    type: "rerun",   start: "2026-12-22", end: "2026-12-28", tentative: true,  leads: ["夏以晝"] },
  { name: "周年慶混池",                 type: "mixed",   start: "2026-12-31", end: "2027-01-20", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "沈星回銀瀑奏鳴復刻",         type: "rerun",   start: "2027-01-14", end: "2027-01-20", tentative: true,  leads: ["沈星回"] }
];
