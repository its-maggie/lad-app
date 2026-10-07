# 深空省省

這是原生 HTML / CSS / JavaScript 靜態網站，GitHub `main` 透過既有 GitHub Actions 部署至 Vercel。

## 專案位置與檔案

- Git、GitHub Actions 與 Vercel 設定位於本資料夾，執行 Git 或部署命令時以此為工作目錄。
- 根目錄保留目前使用的網站程式與背景圖片；`docs/` 放文件，`scripts/` 放維護腳本與測試。
- `references/`、`data/`、`promo/` 放參考圖片、原始資料與推廣素材；`archive/` 保留舊版 HTML 和 Dropbox 衝突副本。整理時保留原始內容。
- 本機素材由 `.gitignore` 排除；原本已追蹤的歷史檔案仍保留版本控制。`.vercelignore` 排除全部參考與封存資料。

## 發布更新

- 更新官方排期時，同步修改 `schedule.js` 的日期、`tentative` 與 `SCHEDULE_META.updated`。
- 排期公告依使用者提供的更新內容撰寫，忠實區分官方確認與預測；使用者指定不公告的排期不可自行加入。
- 功能公告只有在使用者明確要求公告該功能時才發布。UI、樣式、文案和一般功能調整都不自動產生公告。
- `updates.js` 的 `window.SITE_UPDATES` 只保留最近一次公告，不累積舊公告，也不提供過往更新入口。每筆包含 `id`、台北日期 `date` 與 `items`。
- `items` 每筆使用 `type: "schedule"` 或明確獲准的 `"feature"`、`title`、`body`。文字描述實際變更，勿把未確認排期寫成官方資訊。
- 發布實質新消息時使用新的唯一 id，同一天再發布也要換 id。單純刪減公告、修整 UI 或移除未獲准內容時，保留所留下公告的原 id，避免已讀訪客再次收到相同消息；不要公告這類維護操作。
- 官方同步腳本會自動新增排期公告；不要為同一批同步重複新增。
- 發布前執行 `node --test scripts/*.test.mjs`，檢查 JavaScript 語法，並確認更新通知位於所有功能分頁之外。
