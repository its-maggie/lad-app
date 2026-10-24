# Google Analytics 4

2026-10-24 安裝；由 `maggie@tenten.co` 建立及管理。

- 帳戶、資源：深空省省
- 帳戶 ID：413314064
- 資源 ID：560589561
- 網頁串流 ID：16195019710
- 評估 ID：`G-MGM1BK0TZD`（公開識別碼，非密鑰）
- 網址：<https://lad-pocket.vercel.app/>
- 報表時區：Asia/Taipei；貨幣：TWD
- 報表入口：<https://analytics.google.com/analytics/web/?authuser=maggie%40tenten.co#/a413314064p560589561/reports/intelligenthome>

## 如何看數據

- 網站瀏覽：GA 的使用者、工作階段、瀏覽次數與流量來源報表。
- 分頁瀏覽：`feature_view` 事件的使用者數，依 `feature` 區分排期、換算與錢包。初次顯示排期會送出一次；同一分頁重複點擊不重送。
- 實際操作：`app_use` 事件的「使用者總數」代表執行過下列操作的瀏覽器使用者；「事件計數」是操作次數，不能當人數。
- `feature`：`calendar`、`converter`、`wallet`。
- `action`：`month_change`、`date_select`、`filter_change`、`calculate`、`pack_quantity`、`pack_recommendation`、`pack_record_prefill`、`budget_save`、`expense_add`、`expense_edit`。

換算輸入停止 800 毫秒後才送出操作，初始化及還原既存資料不算使用。禮包帶入記帳只計預填操作，成功儲存後才計 `expense_add`。閱讀排期但沒有操作的訪客會有分頁瀏覽，沒有 `app_use`。

GA 依瀏覽器及 Cookie 等訊號統計，並非真實身分精確去重；跨裝置、封鎖追蹤或刪除 Cookie 都會影響結果。安裝前的造訪無法回填，Threads 貼文瀏覽與按讚也不等於網站流量。

Threads 個人檔案可改用：

<https://lad-pocket.vercel.app/?utm_source=threads&utm_medium=social&utm_campaign=profile>

不同貼文可換成不同 `utm_campaign`，使用英數、底線或連字號，不放姓名、Email 或個人資料。GA 正式報表需等待處理；驗證新事件先查看即時報表。

## 維護

`analytics.js` 僅在 `lad-pocket.vercel.app` 載入 GA，排除本機、file 和 Vercel 預覽網址。沒有金額、備註、抽數、角色偏好或自訂使用者識別碼；只送出固定功能與操作標籤。網址只保留安全格式的 UTM 參數，參照來源只保留 origin。停用 Google 信號、廣告個人化及加強型評估的站內搜尋、表單、影片與下載；保留網頁瀏覽、捲動與外連點擊。

網站頁尾連到 `privacy.html`。GA 被封鎖時，排期、換算和本機記帳仍可使用。變更後執行 `node --test scripts/*.test.mjs`，並確認正式站的 `g/collect` 請求使用正確評估 ID。
