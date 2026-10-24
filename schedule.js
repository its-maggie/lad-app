/* =============================================================
   深空省省 · 官方公告與排期預測整理（含 2027 年）
   預測來源：排期預測1007.jpg，並納入 2026-10-24 最新排期推算。
   未確認排期參考圖片與後續調整；10/11–10/18 沈星回生日與生日復刻已確認。
   10/19–10/27 半透明侵占復刻、10/21–12/18 夏以晝／沈星回新密約已確認。
   11/13–12/1 混池與秦徹分線分列，保留類型與角色篩選。
   10/28 起改排祁煜單人月卡、12/3 起改排沈星回日卡3.0，均屬預測。
   2027 年日卡、月卡、混池、生日與復刻日期皆為預測，整理至 7/26。
   生日池預測修正為祁煜 3/1–3/7、秦徹 4/13–4/19、夏以晝 6/8–6/14。
   注意：tentative 為 true 的項目屬預測資料，日期及內容皆可能變動。
   ============================================================= */

window.SCHEDULE_META = {
  updated: "2026-10-24",
  label: "排期整理",
  forecastSource: "排期預測1007.jpg、2026-10-24 排期推算（至 2027-07）"
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
  { name: "沈星回生日＋生日復刻",       type: "birthday",start: "2026-10-11", end: "2026-10-18", tentative: false, leads: ["沈星回"] },
  { name: "半透明侵占復刻",             type: "rerun",   start: "2026-10-19", end: "2026-10-27", tentative: false, leads: ["沈星回", "黎深", "祁煜", "秦徹"] },
  { name: "新密約・夏以晝／沈星回",     type: "pass",    start: "2026-10-21", end: "2026-12-18", tentative: false, leads: ["夏以晝", "沈星回"] },
  { name: "祁煜單人月卡",               type: "monthly", start: "2026-10-28", end: "2026-11-06", tentative: true,  leads: ["祁煜"] },
  { name: "秦徹熾光淋漓復刻",           type: "rerun",   start: "2026-11-04", end: "2026-11-11", tentative: true,  leads: ["秦徹"] },
  { name: "新混池6",                    type: "mixed",   start: "2026-11-13", end: "2026-12-01", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "秦徹分線",                   type: "story",   start: "2026-11-13", end: "2026-12-01", tentative: true,  leads: ["秦徹"] },
  { name: "黎深脈脈傾音復刻",           type: "rerun",   start: "2026-11-24", end: "2026-12-01", tentative: true,  leads: ["黎深"] },
  { name: "沈星回日卡3.0",              type: "daily",   start: "2026-12-03", end: "2026-12-17", tentative: true,  leads: ["沈星回"] },
  { name: "遵命飼養官復刻",             type: "rerun",   start: "2026-12-14", end: "2026-12-22", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹"] },
  { name: "夏以晝沈冥日卡2.0復刻",       type: "rerun",   start: "2026-12-22", end: "2026-12-29", tentative: true,  leads: ["夏以晝"] },
  { name: "周年慶混池",                 type: "mixed",   start: "2026-12-31", end: "2027-01-20", tentative: true,  leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "沈星回銀瀑奏鳴復刻（月卡）", type: "rerun", start: "2027-01-21", end: "2027-01-28", tentative: true, leads: ["沈星回"] },
  { name: "黎深單人月卡（新一輪）", type: "monthly", start: "2027-01-29", end: "2027-02-07", tentative: true, leads: ["黎深"] },
  { name: "新混池2／情人節混池", type: "mixed", start: "2027-02-10", end: "2027-02-26", tentative: true, leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "祁煜生日", type: "birthday", start: "2027-03-01", end: "2027-03-07", tentative: true, leads: ["祁煜"] },
  { name: "黎深新日卡3.0", type: "daily", start: "2027-03-08", end: "2027-03-22", tentative: true, leads: ["黎深"] },
  { name: "奔湧至昨夜盡頭復刻（混池）", type: "rerun", start: "2027-03-21", end: "2027-03-27", tentative: true, leads: ["沈星回", "黎深", "祁煜", "秦徹"] },
  { name: "單人月卡（新一輪・角色待定）", type: "monthly", start: "2027-03-29", end: "2027-04-05", tentative: true, leads: [] },
  { name: "秦徹生日", type: "birthday", start: "2027-04-13", end: "2027-04-19", tentative: true, leads: ["秦徹"] },
  { name: "夏以晝觸痛訊號復刻（月卡）", type: "rerun", start: "2027-04-20", end: "2027-04-28", tentative: true, leads: ["夏以晝"] },
  { name: "新混池3", type: "mixed", start: "2027-04-30", end: "2027-05-17", tentative: true, leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "明日無處可逃復刻（混池）", type: "rerun", start: "2027-05-12", end: "2027-05-18", tentative: true, leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  { name: "秦徹新日卡3.0", type: "daily", start: "2027-05-19", end: "2027-06-05", tentative: true, leads: ["秦徹"] },
  { name: "夏以晝生日", type: "birthday", start: "2027-06-08", end: "2027-06-14", tentative: true, leads: ["夏以晝"] },
  { name: "黎深願緣長復刻（月卡）", type: "rerun", start: "2027-06-17", end: "2027-06-23", tentative: true, leads: ["黎深"] },
  { name: "單人月卡（新一輪・角色待定）", type: "monthly", start: "2027-06-26", end: "2027-07-04", tentative: true, leads: [] },
  { name: "夏以晝新日卡3.0", type: "daily", start: "2027-07-09", end: "2027-07-26", tentative: true, leads: ["夏以晝"] }
];
