"""Convert the 108 natural-science curriculum PDF into searchable Markdown."""

from __future__ import annotations

import argparse
import re
import unicodedata
from datetime import date
from pathlib import Path

from pypdf import PdfReader


def normalize_page_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = (
        text.replace("\u00a0", " ")
        .replace("\uf0b7", "•")
        .replace("\u00ad", "")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\f", "")
    )
    lines: list[str] = []
    blank = False
    for raw_line in text.splitlines():
        line = re.sub(r"[ \t]+", " ", raw_line).strip()
        if not line:
            if lines and not blank:
                lines.append("")
            blank = True
            continue
        lines.append(line)
        blank = False
    return "\n".join(lines).strip()


def printed_page_number(text: str) -> str | None:
    first_line = next((line.strip() for line in text.splitlines() if line.strip()), "")
    return first_line if re.fullmatch(r"\d{1,3}", first_line) else None


def build_markdown(source: Path) -> str:
    reader = PdfReader(str(source))
    metadata_title = str(reader.metadata.title or source.stem)
    lines = [
        "---",
        f'title: "{metadata_title}"',
        f'source_file: "{source.name}"',
        f"pdf_pages: {len(reader.pages)}",
        f"converted_on: {date.today().isoformat()}",
        "---",
        "",
        "# 十二年國民基本教育課程綱要：自然科學領域",
        "",
        "> 本檔由教育部自然科學領域課綱 PDF 逐頁轉為可搜尋 Markdown。",
        "> 文字經 Unicode 相容字正規化；表格仍以 PDF 的文字抽取順序呈現，正式引用請回查原 PDF。",
        "",
        "## 網站內容檢核用的物理必修邊界",
        "",
        "| 課綱代碼／位置 | 必修範圍 | 網站編寫限制 |",
        "|---|---|---|",
        "| PKa-Vc-7（PDF 第 189 頁，原頁碼 185） | 馬克士威由方程式預測電磁波，算得其速率等於光速，因此推論光是電磁波，後來獲得實驗證實。 | 定性呈現「理論預測 → 實驗驗證」，不推導數學公式。 |",
        "| PKc-Vc-3～5（PDF 第 189～190 頁） | 變動磁場產生電場、變動電場產生磁場；馬克士威方程式統整電磁現象並預測電磁波。 | 只需簡要說明電場、磁場交互感應與傳播，不介紹方程式的數學形式。 |",
        "| PKc-Vc-6（PDF 第 190 頁） | 電磁波譜及其日常生活應用。 | 聚焦頻率／波長排序、傳播與應用。 |",
        "| 認識電磁波實驗（PDF 第 203～204 頁，原頁碼 199～200） | 電磁波的發射與接收，以及反射、折射、波長／駐波、偏振。 | 互動實驗應讓學生觀察可測證據，不延伸到大學電磁學推導。 |",
        "",
        "## 轉換說明",
        "",
        f"- 來源檔案：`{source.name}`",
        f"- PDF 頁數：{len(reader.pages)}",
        "- 每個三級標題對應一個 PDF 實體頁面；括號內保留原文件印刷頁碼（可辨識時）。",
        "- 這份 Markdown 是搜尋與內容檢核用背景知識；遇到表格欄位或符號疑義時，以原 PDF 為準。",
        "",
        "## 課綱全文（逐頁文字）",
        "",
    ]

    for index, page in enumerate(reader.pages, start=1):
        text = normalize_page_text(page.extract_text() or "")
        printed = printed_page_number(text)
        suffix = f"（原文件頁碼 {printed}）" if printed else ""
        lines.extend([f"### PDF 第 {index} 頁{suffix}", "", text or "_本頁未抽取到文字。_", ""])

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Source curriculum PDF")
    parser.add_argument("output", type=Path, help="Output Markdown file")
    args = parser.parse_args()

    if not args.source.is_file():
        raise SystemExit(f"Source PDF not found: {args.source}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(build_markdown(args.source), encoding="utf-8", newline="\n")
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
