# 高中物理教材

把原本分開的網站與教材整併在同一個 repo，各自放在子資料夾，根目錄 `index.html` 是總入口。

| 資料夾 | 內容 | 原 repo |
| --- | --- | --- |
| [`gsat/`](gsat/) | 學測物理 SOIL 核心複習系統（108 課綱必修） | ArpowChao/phy-senior |
| [`wave-optics/`](wave-optics/) | 波動與光學・學習筆記（選修物理 III） | ArpowChao/phy-wave-optics |
| [`apps/`](apps/) | 互動物理實驗室：30 個模擬與課堂工具 | ArpowChao/arpowchao.github.io（`apps/`） |
| [`physics-lecture/`](physics-lecture/) | 線上講義：量子現象 | ArpowChao/arpowchao.github.io |
| [`textbooks/`](textbooks/) | 第五章能量、第六章量子現象課本 PDF | ArpowChao/arpowchao.github.io |
| [`embark-6th/`](embark-6th/) | Embark 啟程｜三民高中專題成果展 | ArpowChao/Embark-6th |

`assets/` 放 `apps/` 會用到的圖片與手稿。各子網站內部都用相對路徑，可以單獨開啟，也可以從根目錄進入。

## 本機預覽

```bash
python -m http.server 8000
```

瀏覽 `http://localhost:8000/`。

## 線上發布

在 GitHub repo 的 Settings → Pages 選擇 `main` 分支、根目錄 `/`。根目錄已放 `.nojekyll`，檔案會原樣發布。

各子專案的詳細說明見各自資料夾內的 README。
