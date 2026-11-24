# 選修物理Ⅰ（力學一）學習筆記

依普通高級中學《選修物理（Ⅰ）》與 108 自然科學領域課綱（第五學習階段 `PEa-Ⅴa-1`、`PEb-Ⅴa-1`–`9`、`PKb-Ⅴa-1`–`4`、`PMb-Ⅴa-1`–`2`）編寫。

## 模組結構

- `index.html`：主頁面與側邊欄（沿用 `../electromag/assets/` 版面與字型及 `../assets/pedagogy.{css,js}` 教學鷹架引擎）
- `data/course.js`：第 1–5 章共 23 節課本導讀、公式與使用條件、範例、頁碼與 108 課綱條文
- `data/pedagogy.js`：每節之 Pre-Lab 生活暖身、普物式拉線標註方程式解剖卡、綠字依據×藍字列式雙欄解題器、負遷移排雷、同儕討論、結尾收束與 MIT 式深度追問
- `data/concept-practice.js`：23 節 × 2 概念 × 2 題 = 92 題觀念選擇題（含不破梗 GRR 提示）
- `data/exams.js`：第 1–5 章逐章練習卷，每卷 12 題共 100 分（含 5 張 SVG 試題圖）
- `assets/physics-models.js`：12 個與 DOM 解耦的純數值力學模型
- `assets/labs.js`：12 組互動 SVG 模擬實驗與練習卷幾何圖
- `assets/site.js`：SPA 路由、互動控制與第一次作答 IRT 同步紀錄（`GPRecord("pi", ...)`）
- `scripts/check_physics_models.js`：自動化驗證全部 12 個模型、23 節課程與教學資料、92 題觀念題與 5 份練習卷

## 本機驗證

```bash
node physics-i/scripts/check_physics_models.js
```
