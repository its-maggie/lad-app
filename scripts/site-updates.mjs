import fs from "node:fs";
import vm from "node:vm";
import { createHash } from "node:crypto";

export function recordScheduleUpdate(file, changes, date) {
  const context = { window: {} };
  if (fs.existsSync(file)) vm.runInNewContext(fs.readFileSync(file, "utf8"), context);
  const releases = context.window.SITE_UPDATES || [];
  if (!Array.isArray(releases)) throw new Error("updates.js 公告格式不正確");
  const fingerprint = createHash("sha256").update(JSON.stringify(changes)).digest("hex").slice(0, 12);
  const id = `schedule-${date}-${fingerprint}`;
  if (releases.length === 1 && releases[0].id === id) return;
  const latest = {
    id,
    date,
    items: changes.map(change => ({
      type: "schedule",
      title: `${change.name}｜排期已確認`,
      body: `已依官方公告更新為 ${change.start.replaceAll("-", "/")}–${change.end.replaceAll("-", "/")}，月曆已同步更新。`,
    })),
  };
  fs.writeFileSync(file, `// 只保留最近一次公告；功能消息需由使用者明確要求才發布。\nwindow.SITE_UPDATES = ${JSON.stringify([latest], null, 2)};\n`);
}
