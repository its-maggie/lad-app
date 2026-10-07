# 深空省省

《戀與深空》的卡池排期、抽卡資源換算、禮包試算與課金記帳工具。

[開啟正式網站](https://lad-pocket.vercel.app) · [GitHub](https://github.com/its-maggie/lad-app)

## 檔案位置

| 位置 | 內容 |
| --- | --- |
| 根目錄 | 目前網站：`index.html`、`schedule.js`、`packs.js`、`updates.js`、`site-updates.js`、背景圖片與圖示 |
| `ux-research.html` | Journey、Persona 與使用者研究紀錄 |
| `docs/` | 官方排期同步、問卷、更新公告與專案整理說明 |
| `scripts/` | 排期同步、公告維護與測試 |
| `references/schedules/` | 排期預測原圖，最新為 `排期預測1007.jpg` |
| `references/designs/` | 視覺設計參考圖 |
| `data/` | 卡池機制、禮包與獲鑽原始 CSV |
| `promo/threads/` | Threads 推廣圖卡與文案，包含原有舊版資料夾 |
| `archive/versions/` | 舊版 HTML 原始快照 |
| `archive/dropbox-conflicts/` | 按衝突日期及原路徑保存的 Dropbox 副本 |

本機參考資料、原始資料、推廣素材及衝突副本由 `.gitignore` 排除。原本已納入 Git 的歷史 HTML 與排期圖仍保留版本控制；以上素材皆不隨 Vercel 發布。

## 預覽與檢查

在此資料夾啟動靜態網站：

```sh
python3 -m http.server 8107 --bind 127.0.0.1
```

瀏覽器開啟 `http://127.0.0.1:8107`。發布前執行：

```sh
node --test scripts/*.test.mjs
```

## 發布

Git 與部署設定已歸回此資料夾。將變更 commit 並 push 至 GitHub `main`，既有 `Deploy to Vercel` 工作流程會先跑測試，再部署正式站。

公告規則見 [AGENTS.md](AGENTS.md) 與 [docs/site-updates.md](docs/site-updates.md)。
