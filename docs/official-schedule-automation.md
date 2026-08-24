# 官方排程自動更新

此專案每天在台北時間 11:35 檢查《戀與深空》台港澳官方 Facebook 粉絲專頁。

## 安全規則

- 只讀取官方粉絲專頁 `loveanddeepspace.tw`（Page ID `102920706051241`）。
- 只處理含有明確開始日與結束日的貼文。
- 只有在活動類型、角色、名稱和預測日期足以唯一對應現有排程時，才自動修改 `schedule.js`。
- 自動確認的項目會保留官方貼文網址於 `source` 欄位。
- 無法唯一判定時不修改網站，改在 GitHub 建立「排程待確認」Issue。

## 執行時間

GitHub Actions cron 使用 UTC，因此排程設定為 `35 3 * * *`，即全年固定的台北時間 11:35。

## 必要設定

GitHub repository secret：

- `META_APP_ACCESS_TOKEN`：具有 Facebook Page Public Content Access 的 Meta App access token。
- `VERCEL_TOKEN`：可部署 `lad-pocket` 的 Vercel access token。

GitHub repository variables：

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

GitHub Actions 內建的 `GITHUB_TOKEN` 用來提交 `schedule.js` 及建立待確認 Issue，不需另建 Personal Access Token。

## 手動測試

在 GitHub 的 Actions 頁面選擇 **Sync official schedule**，按 **Run workflow**。第一次建議勾選 `dry_run`，確認摘要正常後再執行正式同步。

本機測試解析器：

```bash
node --test scripts/sync-official-schedule.test.mjs
```

使用本機 JSON fixture 測試完整流程：

```bash
META_POSTS_FILE=/path/to/posts.json node scripts/sync-official-schedule.mjs --dry-run
```
