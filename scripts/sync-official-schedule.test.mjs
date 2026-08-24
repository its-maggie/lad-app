import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { classifyPost, extractDateRanges, matchScheduleEvent, runSync } from "./sync-official-schedule.mjs";

test("extracts an official Chinese event date range", () => {
  const message = "秦徹・不設防禁區限時復刻\n活動時間：8月24日更新後～8月31日上午4:59";
  const ranges = extractDateRanges(message, new Date("2026-08-24T03:00:00Z"));
  assert.deepEqual(
    { start: ranges[0].start, end: ranges[0].end },
    { start: "2026-08-24", end: "2026-08-31" },
  );
  assert.equal(ranges[0].score, 11);
});

test("extracts a cross-month promise date range", () => {
  const message = "全新密約開啟，秦徹、祁煜與你相伴。活動時間：8月24日5:00至10月21日4:59";
  const ranges = extractDateRanges(message, new Date("2026-08-24T03:00:00Z"));
  assert.deepEqual(
    { start: ranges[0].start, end: ranges[0].end },
    { start: "2026-08-24", end: "2026-10-21" },
  );
});

test("classifies type and featured characters", () => {
  assert.deepEqual(
    classifyPost("全新密約開啟，秦徹、祁煜與你相伴"),
    { type: "pass", leads: ["祁煜", "秦徹"] },
  );
});

test("matches a rerun by event name, type, character and date", () => {
  const events = [
    { name: "秦徹不設防禁區復刻", type: "rerun", start: "2026-08-24", end: "2026-08-31", tentative: true, leads: ["秦徹"] },
    { name: "秦徹熾光淋漓復刻", type: "rerun", start: "2026-09-25", end: "2026-10-02", tentative: true, leads: ["秦徹"] },
  ];
  const signal = {
    ...classifyPost("秦徹・不設防禁區限時復刻"),
    message: "秦徹・不設防禁區限時復刻",
    range: { start: "2026-08-24", end: "2026-08-31" },
  };
  const result = matchScheduleEvent(events, signal);
  assert.equal(result.match.event.name, "秦徹不設防禁區復刻");
});

test("refuses an ambiguous update", () => {
  const events = [
    { name: "新混池", type: "mixed", start: "2026-09-07", end: "2026-09-22", tentative: true, leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
    { name: "另一個新混池", type: "mixed", start: "2026-09-07", end: "2026-09-22", tentative: true, leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
  ];
  const signal = {
    type: "mixed",
    leads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"],
    message: "全員混池活動時間公開",
    range: { start: "2026-09-07", end: "2026-09-22" },
  };
  const result = matchScheduleEvent(events, signal);
  assert.equal(result.match, null);
});

test("updates schedule.js end to end from a Facebook fixture", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lad-schedule-test-"));
  const scheduleFile = path.join(directory, "schedule.js");
  const postsFile = path.join(directory, "posts.json");
  fs.writeFileSync(scheduleFile, `window.SCHEDULE_META = {\n  updated: "2026-08-13",\n  label: "排期整理"\n};\nwindow.SCHEDULE = [\n  { name: "秦徹不設防禁區復刻", type: "rerun", start: "2026-08-20", end: "2026-08-27", tentative: true, leads: ["秦徹"] }\n];\n`);
  fs.writeFileSync(postsFile, JSON.stringify([
    {
      id: "102920706051241_123",
      message: "秦徹・不設防禁區限時復刻\n活動時間：8月24日更新後～8月31日上午4:59",
      created_time: "2026-08-24T03:00:00+0000",
      permalink_url: "https://www.facebook.com/loveanddeepspace.tw/posts/123",
    },
  ]));
  const previousFixture = process.env.META_POSTS_FILE;
  process.env.META_POSTS_FILE = postsFile;
  try {
    const result = await runSync({ scheduleFile, now: new Date("2026-08-24T03:35:00Z") });
    assert.equal(result.changes.length, 1);
    const updated = fs.readFileSync(scheduleFile, "utf8");
    assert.match(updated, /updated: "2026-08-24"/);
    assert.match(updated, /start: "2026-08-24"/);
    assert.match(updated, /end: "2026-08-31"/);
    assert.match(updated, /tentative: false/);
    assert.match(updated, /source: "https:\/\/www\.facebook\.com\/loveanddeepspace\.tw\/posts\/123"/);
  } finally {
    if (previousFixture === undefined) delete process.env.META_POSTS_FILE;
    else process.env.META_POSTS_FILE = previousFixture;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
