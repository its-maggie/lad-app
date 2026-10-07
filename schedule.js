/* =============================================================
   深空省省 · 官方公告與 2026-10-07 排期預測整理
   預測來源：排期預測1007.jpg。
   保留既有官方確認資料；10/11 起未確認排期以本次圖片為準。
   11/13–12/1 混池與秦徹分線分列，保留類型與角色篩選。
   圖片中的「？密約」僅作可能開啟日，結束日與角色仍待確認。
   注意：tentative 為 true 的項目屬預測資料，日期及內容皆可能變動。
   ============================================================= */

window.SCHEDULE_META = {
  updated: "2026-10-07",
  label: "排期整理",
  forecastSource: "排期預測1007.jpg"
};

window.SCHEDULE = [
  { name: "夏以晝月卡",                 type: "monthly", start: "2026-08-05", end: "2026-08-14", tentative: false, leads: ["夏以晝"] },
  { name: "花承春意、甜夢清歡周邊",     type: "merch",   start: "2026-08-10", end: "2026-08-20", tentative: false, leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "祁煜日卡",                   type: "daily",   start: "2026-08-17", end: "2026-08-31", tentative: false, source: "https://www.threads.com/@love_deepspace_tw/post/DcAXrYgmTFP/", leads: ["祁煜"] },
  { name: "秦徹不設防禁區復刻",         type: "rerun",   start: "2026-08-24", end: "2026-08-31", tentative: false, leads: ["秦徹"] },
  { name: "黎深生日＋生日復刻",         type: "birthday",start: "2026-08-31", end: "2026-09-07", tentative: false, leads: ["黎深"] },
  { name: "密約・秦徹／祁煜",           type: "pass",    start: "2026-08-24", end: "2026-10-21", tentative: false, leads: ["秦徹", "祁煜"] },
  { name: "秦徹猩紅日卡2.0復刻",         type: "rerun",   start: "2026-09-08", end: "2026-09-15", tentative: false, source: "https://www.facebook.com/loveanddeepspace.tw/videos/1651548833246382/", leads: ["秦徹"] },
  { name: "夏以晝主線",                 type: "story",   start: "2026-09-17", end: "2026-09-27", tentative: false, leads: ["夏以晝"] },
  { name: "如若午夜無眠",               type: "mixed",   start: "2026-09-22", end: "2026-10-10", tentative: false, source: "https://www.taptap.cn/moment/850722755258091513?group_id=278979", leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "於深空見證的系列周邊",       type: "merch",   start: "2026-09-25", end: "2026-10-05", tentative: false, leads: [] },
  { name: "祁煜長思入畫復刻",           type: "rerun",   start: "2026-10-03", end: "2026-10-10", tentative: false, leads: ["祁煜"] },
  { name: "沈星回生日＋生日復刻",       type: "birthday",start: "2026-10-11", end: "2026-10-18", tentative: true,  leads: ["沈星回"] },
  { name: "半透明侵占復刻",             type: "rerun",   start: "2026-10-19", end: "2026-10-27", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹"] },
  { name: "新密約（開啟日待確認）",     type: "pass",    start: "2026-10-19", end: "",           tentative: true,  leads: [] },
  { name: "沈星回日卡3.0",              type: "daily",   start: "2026-10-28", end: "2026-11-11", tentative: true,  leads: ["沈星回"] },
  { name: "秦徹熾光淋漓復刻",           type: "rerun",   start: "2026-11-04", end: "2026-11-11", tentative: true,  leads: ["秦徹"] },
  { name: "新混池6",                    type: "mixed",   start: "2026-11-13", end: "2026-12-01", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "秦徹分線",                   type: "story",   start: "2026-11-13", end: "2026-12-01", tentative: true,  leads: ["秦徹"] },
  { name: "黎深脈脈傾音復刻",           type: "rerun",   start: "2026-11-24", end: "2026-12-01", tentative: true,  leads: ["黎深"] },
  { name: "祁煜單人月卡",               type: "monthly", start: "2026-12-03", end: "2026-12-12", tentative: true,  leads: ["祁煜"] },
  { name: "遵命飼養官復刻",             type: "rerun",   start: "2026-12-14", end: "2026-12-22", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹"] },
  { name: "夏以晝沉界日卡2.0復刻",       type: "rerun",   start: "2026-12-22", end: "2026-12-29", tentative: true,  leads: ["夏以晝"] },
  { name: "周年慶混池",                 type: "mixed",   start: "2026-12-31", end: "2027-01-20", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] }
];
