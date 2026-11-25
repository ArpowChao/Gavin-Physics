# Gavin Physics｜高中物理

高中物理互動教材網站：必修學測複習、選修波動與光學、互動實驗室，以及接 Google Apps Script 的線上練習（含 IRT 分析）。

網站：https://arpowchao.github.io/Gavin-Physics/

## 結構

| 資料夾 | 內容 |
| --- | --- |
| `index.html` | 首頁，依課程分區 |
| `assets/site.js` | 全站共用導覽列、練習帳號登入狀態、網頁檢核題作答紀錄、平板全螢幕（整頁與單一動畫） |
| `assets/warm.css` | 全站溫暖主題（色彩、字體、導覽列、全螢幕樣式） |
| `assets/tools/` | `apply_warm.py` 把主題套到每頁；`warm_shift.py` 把學測、波動光學的冷色介面換成暖色 |
| `gsat/` | 學測物理 SOIL 核心複習系統（108 課綱必修，原 phy-senior） |
| `wave-optics/` | 波動與光學・學習筆記（選修物理 III，原 phy-wave-optics） |
| `electromag/` | 電磁學・學習筆記（選修物理Ⅳ，原 physics-iv） |
| `apps/` | 互動實驗（原 arpowchao.github.io 的 apps），由 `assets/topic-labs.js` 放進各課程的知識節點；半導體 4 個在首頁「延伸專題」 |
| `physics-lecture/`、`textbooks/` | 量子現象講義、第五／六章課本 PDF |
| `practice/` | 線上練習：學生端 `index.html`、老師後台 `admin.html` |
| `practice/gas/` | Google Apps Script 後端原始碼（Code.gs、Data.gs、IRT.gs） |
| `practice/tools/` | 合併題庫產生器與題號登記表 |

## 線上練習

- 學生以暱稱＋密碼登入（不收集個資），選題庫（易混淆概念／學測必修複習／波動與光學／電磁學）、題型與概念後隨機抽題，交卷看逐選項詳解；答錯的題目收進錯題本。
- 在學測、波動光學、電磁學頁面裡登入後，節點檢核題的作答也會送到後端記錄。
- 後端每小時（有新作答時）以 Rasch 模型重算：必修（易混淆＋學測）與選修（波動與光學＋電磁學）分開估計。老師後台看題目難度、鑑別度、Infit/Outfit、選項分布、學生能力與概念弱點熱圖。

### 題庫

題庫含答案，**不放在這個公開 repo**，存放在雲端硬碟（`bank_all.json`）。更新題庫：

```bash
node practice/tools/build_bank.js <易混淆 bank_data.json> bank_all.json
```

再把產生的 `bank_all.json` 覆蓋上傳到雲端硬碟，於 Apps Script 執行 `clearCaches`。`practice/tools/id-registry.json` 只記錄題目雜湊鍵與題號，題目重新排序不會改變題號；題幹改寫會成為新題。

### 後端部署

1. 在 Apps Script 建立專案，貼上 `practice/gas/` 的檔案（或貼上單檔 `_combined_for_paste.gs`）。只改 `Data.gs`／`IRT.gs`／`Code.gs`，改完執行 `node practice/tools/build_gas.js` 重新產生合併檔；GitHub Actions 會檢查兩者是否一致。
2. 依序執行 `setup`（建立資料試算表、產生管理金鑰）、`importLegacy`（匯入舊系統帳號與作答）、`installHourlyTrigger`。
3. 部署為網頁應用程式：執行身分「我」、存取權「所有人」，把 `/exec` 網址填入 `practice/config.js`。

## 設計與平板

- 全站採溫暖配色：米白底、陶土橘強調、暖棕文字，標題用 Noto Serif TC。深色模擬改用可可棕深底。
- 每個夠大的動畫（canvas／svg）右上角都有「⛶」，點了會把該動畫放大到全螢幕（舞台模式）；實驗頁導覽列另有整頁「⛶ 全螢幕」。
- iPad 在 Safari「分享 → 加入主畫面」後，從主畫面開啟即為全螢幕（`manifest.webmanifest`）。
- 新增頁面後執行 `python3 assets/tools/apply_warm.py`，並在其中的 `PAGES` 加上該頁的色彩對照。

## 自動檢查

每次推送時 GitHub Actions（`.github/workflows/checks.yml`）會跑：Apps Script 合併檔一致性、搜尋索引是否最新、`gsat/scripts/check.py`，以及 `wave-optics/scripts/` 的內容與實驗稽核。本機可照同樣指令執行。

學測與波動光學兩個主頁的樣式與程式分別放在各自的 `assets/css/review.css` 與 `assets/js/review/`（依檔名順序載入），HTML 只留頁面骨架。

## 本機預覽

```bash
python -m http.server 8000
```

瀏覽 `http://localhost:8000/`。
