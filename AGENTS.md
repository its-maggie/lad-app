# 深空省省

這是原生 HTML / CSS / JavaScript 靜態網站，GitHub `main` 透過既有 GitHub Actions 部署至 Vercel。

## 發布更新

- 更新官方排期時，同步修改 `schedule.js` 的日期、`tentative` 與 `SCHEDULE_META.updated`。
- 每次發布排期或功能變更，必須在 `updates.js` 的 `window.SITE_UPDATES` 最前方新增一筆公告，包含唯一且不重用的 `id`、台北日期 `date` 與 `items`。同一天再發布也使用新的 id。
- `items` 每筆使用 `type: "schedule"` 或 `"feature"`、`title`、`body`。文字描述實際變更，勿把未確認排期寫成官方資訊。保留舊公告供訪客查看。
- 已發布公告需修正內容時，另發新 id 的更正公告，讓已讀訪客再次收到提醒。
- 官方同步腳本會自動新增排期公告；不要為同一批同步重複新增。
- 發布前執行 `node --test scripts/*.test.mjs`，檢查 JavaScript 語法，並確認更新通知位於所有功能分頁之外。
