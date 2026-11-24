# -*- coding: utf-8 -*-
"""
稽核裁切圖是否截斷題目（第四版）。

前三版的共同 bug：題組標題「35-36為題組」與題目行「35.」都被記成編號 35，
於是「35.」那行被誤判成「下一題」，讓腳本以為題目在本頁就結束了。
本版改為：先由 q 欄位求出本題涵蓋的編號範圍，
凡編號落在範圍內的起點一律不算「下一題」。

先以已知被截斷的 108_35 做為 ground truth 自我驗證，通過才輸出全表。
"""
import io, json, re, sys
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import fitz

ROOT = Path('F:/Program/phy-senior')
html = (ROOT / 'gsat_physics_review.html').read_text(encoding='utf-8')
papers = {}
for m in re.finditer(r"'([^']+)':\s*\{[^}]*?crop:\s*'([^']+)'[^}]*?paper:\s*'([^']+)'", html, re.S):
    papers[m.group(1)] = {'crop': m.group(2), 'paper': m.group(3)}
practice = (ROOT / 'data' / 'examPractice.js').read_text(encoding='utf-8')
items = [{'year': m.group(1), 'q': m.group(2), 'page': int(m.group(3))}
         for m in re.finditer(r"year:\s*'([^']+)'\s*,\s*q:\s*'([^']+)'\s*,\s*page:\s*(\d+)", practice)]
seg = html[html.find('const examCropExtra'):html.find('function cropsFor')]
extra = set(re.findall(r"'([^']+)':\s*\[", seg))

OPT = re.compile(r'\(\s*[A-E]\s*\)')
GROUP = re.compile(r'^\s*(\d{1,2})\s*[-–~]\s*(\d{1,2})\s*[題為]')
HEADER = re.compile(r'(年學測|參考試卷|自然考科|第\s*\d+\s*頁|共\s*\d+\s*頁|請記得在答題卷|版權所有)')


def q_range(q):
    m = re.match(r'(\d+)\s*[-–~]\s*(\d+)', q)
    if m:
        return int(m.group(1)), int(m.group(2))
    n = int(re.match(r'(\d+)', q).group(1))
    return n, n


def starts(page):
    out = []
    for b in page.get_text('dict')['blocks']:
        for line in b.get('lines', []):
            if not line['spans']:
                continue
            txt = ''.join(s['text'] for s in line['spans']).strip()
            x0 = line['spans'][0]['bbox'][0]
            y0 = line['bbox'][1]
            g = GROUP.match(txt)
            if g and x0 <= 90:
                out.append((int(g.group(1)), int(g.group(2)), y0))
            elif re.match(r'^\d{1,2}\s*[\.、]', txt) and x0 <= 78:
                n = int(re.match(r'^(\d{1,2})', txt).group(1))
                out.append((n, n, y0))
    return sorted(out, key=lambda t: t[2])


def txt_in(page, y1, y2):
    t = page.get_text('text', clip=fitz.Rect(0, y1, page.rect.width, y2))
    return ' '.join(ln.strip() for ln in t.splitlines()
                    if ln.strip() and not HEADER.search(ln))


def analyse(pk, q, pageno):
    info = papers.get(pk)
    if not info:
        return None
    pdf = ROOT / info['paper']
    if not pdf.exists():
        return None
    lo, hi = q_range(q)
    doc = fitz.open(pdf)
    if pageno > doc.page_count:
        return None
    page = doc[pageno - 1]
    st = starts(page)
    mine = [y for (a, b, y) in st if a == lo]
    if not mine:
        return None
    y0 = min(mine)
    # 「下一題」＝編號超出本題範圍者
    after = [y for (a, b, y) in st if a > hi and y > y0 + 5]
    crop_end = min(after) if after else page.rect.height
    crop_txt = txt_in(page, y0, crop_end)
    spill_txt = ''
    if not after and pageno < doc.page_count:
        nxt = doc[pageno]
        nst = starts(nxt)
        nafter = [y for (a, b, y) in nst if a > hi]
        y_cut = min(nafter) if nafter else nxt.rect.height
        spill_txt = txt_in(nxt, 0, y_cut)
    return {
        'key': f"{info['crop']}_{q}", 'page': pageno,
        'crop_opts': len(set(OPT.findall(crop_txt))),
        'lost_opts': len(set(OPT.findall(spill_txt))),
        'lost_chars': len(spill_txt),
        'handled': f"{info['crop']}_{q}" in extra,
        'sample': spill_txt[:90],
    }


# --- 自我驗證：108_35 已目視確認被截斷，腳本必須抓到 ---
gt = analyse('108', '35', 10)
assert gt and gt['lost_opts'] >= 5, f'ground truth 未通過：{gt}'
print(f"✓ ground truth 通過：108_35 漏掉 {gt['lost_opts']} 個選項\n")

rows = []
for it in items:
    r = analyse(it['year'], it['q'], it['page'])
    if r and (r['lost_opts'] > 0 or r['lost_chars'] > 40):
        rows.append(r)

bad = [r for r in rows if not r['handled']]
print(f'掃描 {len(items)} 題；內容延續到下一頁 {len(rows)} 題，未處理 {len(bad)} 題\n')
for r in sorted(bad, key=lambda x: -x['lost_opts']):
    mark = '★★ 選項被切' if r['lost_opts'] else '   內文被切'
    print(f"{mark} {r['key']:14} p{r['page']:<3} 圖內{r['crop_opts']}選項/漏{r['lost_opts']} 共{r['lost_chars']}字 | {r['sample'][:52]}")
json.dump(rows, open(ROOT / 'crop_audit.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
