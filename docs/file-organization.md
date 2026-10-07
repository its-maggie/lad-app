# 2026/10/7 專案整理

網站檔案原本已移至「深空省省」，但 Git 和部署設定仍在外層。本次將既有 Git、GitHub Actions、Vercel 連結及本機設定移回網站資料夾，並保留原有版本歷史，讓 `main` 與 GitHub 對齊。

共分類移動 39 個檔案，每個檔案都以 SHA-256 確認移動前後內容一致。

| 原位置 | 新位置 |
| --- | --- |
| 根目錄的 `0804.html`、`0813.html`、`1007.html` | `archive/versions/` |
| 根目錄的四張排期預測圖 | `references/schedules/` |
| Tulimond 設計參考圖 | `references/designs/` |
| 三份原始 CSV | `data/` |
| `threads-intro/` | `promo/threads/` |
| 13 份 Dropbox 衝突副本 | `archive/dropbox-conflicts/日期/原路徑` |

目前網站使用的背景圖片、圖示與程式檔保留在根目錄，原有引用路徑繼續有效。`docs/` 與 `scripts/` 只保留現行文件、維護腳本及測試。

Git 排除本機素材與衝突副本；原本已追蹤的歷史檔案繼續保存。Vercel 排除參考資料、封存資料、推廣素材與內部文件。外層的 AO3 專案維持原有內容。

後續收到的四張港幣／馬幣禮包截圖由「不同幣值」移至 `references/prices/`，逐檔確認 SHA-256 一致。價格比較與推估紀錄放在 `data/禮包地區價格比較.csv`，來源與維護說明放在 `docs/regional-prices.md`。
