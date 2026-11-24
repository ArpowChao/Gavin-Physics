#!/usr/bin/env python3
"""
把全站溫暖主題套到每個頁面（可重複執行）：
  ・<head> 補上 viewport、warm.css、manifest 與平板全螢幕用的 meta
  ・頁尾 <style id="gp-warm">：依頁面把原本的色彩變數換成暖色
  ・site.js 的顯示模式（導覽列或浮動小工具列）
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VER = '20261124h'   # 改版時更新，避免瀏覽器用到舊的快取

L = dict(bg='#f8f1e7', soft='#f2e7d8', card='#fffaf3', card2='#fbf3e8', ink='#3b2c24', muted='#7d6a5c', line='#e7d6c3',
         acc='#c0603a', acc2='#9f4a28', accs='#f7e3d6', honey='#d4962e', sage='#5f8a5c', rose='#b4484d', plum='#86587f', teal='#3b8b86',
         cocoa='#3a2a22')
D = dict(bg='#1e1714', panel='#2a201b', panel2='#33271f', ink='#f3e8dc', muted='#bba693', line='#4a3a30', acc='#e8875a', honey='#f0b45a')

# 學測、波動光學（同一套變數）
STUDY = f"""html:root{{--bg-body:{L['bg']};--bg-sidebar:{L['cocoa']};--bg-card:{L['card']};--text-main:{L['ink']};--text-muted:{L['muted']};--border-color:{L['line']};
--primary-blue:{L['acc']};--primary-blue-light:{L['accs']};--accent-cyan:#b26b2c;--accent-green:{L['sage']};--accent-green-light:#e7f0e2;--accent-orange:#c9841d;--accent-orange-light:#fbefd6;
--accent-rose:{L['rose']};--accent-rose-light:#f8e2e0;--accent-violet:{L['plum']};--accent-violet-light:#f1e4ee;--bg-color:{L['bg']}}}
html body{{background:{L['bg']} !important;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif}}
html{{background:{L['bg']} !important}} body::before{{display:none !important}}
#sidebar{{background:{L['cocoa']} !important}}
.sidebar-brand h1,.content-title,.hero-title,main h1,main h2{{font-family:"Noto Serif TC",serif}}
.view-toolbar{{background:rgba(255,250,243,.9) !important}}"""

LIGHT_A = f"""html:root{{--bg:{L['bg']};--panel:{L['card']};--panel-alt:{L['card2']};--ink:{L['ink']};--muted:{L['muted']};--line:{L['line']};--accent:{L['acc']};
--body:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif}}
html body{{background:{L['bg']}}} h1,h2{{font-family:"Noto Serif TC",serif}}"""

LIGHT_CYAN = f"""html:root{{--bg:{L['bg']};--panel:{L['card']};--ink:{L['ink']};--muted:{L['muted']};--line:{L['line']};--cyan:{L['acc']};--cyan-soft:{L['accs']};
--body:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif}}
html body{{background:{L['bg']}}} h1,h2{{font-family:"Noto Serif TC",serif}}"""

DARK_A = f"""html:root{{--bg:{D['bg']};--panel:{D['panel']};--panel2:{D['panel2']};--panel-alt:{D['panel2']};--ink:{D['ink']};--text:{D['ink']};--muted:{D['muted']};--line:{D['line']};--border:{D['line']};--accent:{D['acc']};--stage:#17110e}}
html body{{background:{D['bg']}}}"""

BB_L = f"--bg:{L['bg']};--panel:{L['card']};--panel2:{L['card2']};--ink:{L['ink']};--muted:{L['muted']};--line:{L['line']};--stage:{L['card']}"
BB_D = f"--bg:{D['bg']};--panel:{D['panel']};--panel2:{D['panel2']};--ink:{D['ink']};--muted:{D['muted']};--line:{D['line']};--accent:{D['acc']};--stage:#17110e;--hudbg:#1f1813e6;--tbbg:#2a201be6;--hudline:#4a3a30;--tbline:#5a4638"
BB = (f"html:root{{{BB_D}}} html:root[data-theme='dark']{{{BB_D}}} html:root[data-theme='light']{{{BB_L}}}"
      f" @media (prefers-color-scheme: light){{html:root:not([data-theme='dark']){{{BB_L}}}}}")

PAGES = {
    'gsat/gsat_physics_review.html': (STUDY, 'bar', ''),
    'wave-optics/wave_optics_review.html': (STUDY + f"\nhtml:root{{--bg-body:{L['bg']}}}", 'bar', ''),
    'electromag/index.html': (f"html:root{{--paper:{L['bg']};--white:{L['card']};--ink:{L['ink']};--muted:{L['muted']};--rule:{L['line']};--accent:{L['acc']};--sidebar:{L['cocoa']}}} html body{{background:{L['bg']}}} #sidebar{{background:{L['cocoa']} !important}}", 'bar', ''),
    'wave-optics/water_interference.html': (f"html:root{{--bg:{L['bg']};--ink:{L['ink']};--muted:{L['muted']};--line:{L['line']};--accent:{L['acc']};--soft:{L['accs']};--rose:{L['rose']}}} h1,h2{{font-family:'Noto Serif TC',serif}}", 'bar', ''),
    'physics-lecture/index.html': (f"html:root{{--primary-color:{L['acc']};--primary-hover:{L['acc2']};--bg-body:{L['bg']};--bg-card:{L['card']};--bg-sidebar:{L['card']};--text-main:{L['ink']};--text-muted:{L['muted']};--text-light:{L['muted']};--border-color:{L['line']};--border-focus:{L['acc']}}} html body{{background:{L['bg']}}} h1,h2{{font-family:'Noto Serif TC',serif}}", 'bar', ''),
    'apps/physics-review/index.html': (f"html:root{{--sunset-blue:{L['acc2']};--bg-primary:{L['bg']};--bg-card:{L['card']};--bg-sidebar:{L['card']};--text-primary:{L['ink']};--text-content:#4a3a30;--text-muted:{L['muted']};--bg-glass:rgba(255,250,243,.88);--border-glass:{L['line']}}} html{{background:{L['bg']} !important}} h1,h2{{font-family:'Noto Serif TC',serif}}", 'bar', ''),
    'apps/barrel-angle/index.html': (LIGHT_A, 'bar', ''),
    'apps/newton-cannon/index.html': (LIGHT_A, 'bar', ''),
    'apps/pitch-spin/index.html': (LIGHT_A, 'bar', ''),
    'apps/pitch-spin/vpython.html': (LIGHT_A, 'bar', ''),
    'apps/transistor-pn/index.html': (LIGHT_A + f"\nhtml:root{{--accent-soft:{L['accs']}}}", 'bar', ''),
    'apps/lid-toss/index.html': (LIGHT_CYAN, 'bar', ''),
    'apps/orbit/index.html': (LIGHT_CYAN, 'bar', ''),
    'apps/doppler/index.html': (f"html:root{{--paper:{L['bg']};--pond:{L['card']};--ink:{L['ink']};--muted:{L['muted']};--line:{L['line']};--teal:{L['acc']};--gold:{L['honey']};--body:'Noto Sans TC','Microsoft JhengHei',sans-serif}} html body{{background:{L['bg']}}}", 'pill', ''),
    'apps/pn-diode/index.html': (f"html:root{{--bg1:#fbeedd;--bg2:#f6e3d3;--ink:{L['ink']};--muted:{L['muted']};--card:rgba(255,250,243,.88);--line:{L['line']}}}", 'pill', ''),
    'apps/water-states.html': (f"html:root{{--bg:{L['bg']};--surface:{L['card']};--surface-2:{L['soft']};--sunken:{L['card2']};--line:{L['line']};--line-soft:#efe2d3;--ink:{L['ink']};--ink-2:#5a4638;--ink-3:{L['muted']}}} h1,h2{{font-family:'Noto Serif TC',serif}}", 'bar', ''),
    'apps/data_analysis_lab.html': (f"html:root{{--primary:{L['acc2']};--secondary:{L['muted']};--accent:{L['honey']};--bg:{L['bg']};--card-bg:rgba(255,250,243,.9);--text:{L['ink']}}} html body{{background:{L['bg']} !important}} h1,h2{{font-family:'Noto Serif TC',serif}}", 'bar', ''),
    'apps/audio-digital-science.html': (f"html:root{{--primary:{L['acc']};--secondary:{L['sage']};--accent:{L['honey']};--bg:{L['bg']};--card-bg:rgba(255,250,243,.96);--text:{L['ink']};--text-dim:{L['muted']};--border:{L['line']}}} html body{{background:{L['bg']} !important}} h1,h2{{font-family:'Noto Serif TC',serif}}", 'bar', ''),
    'apps/inquiry_and_practice.html': (f"html:root{{--primary-color:{L['acc']};--primary-hover-color:{L['acc2']};--bg-color:{L['bg']};--surface-color:{L['card']};--text-primary:{L['ink']};--text-secondary:{L['muted']};--border-color:{L['line']}}} html body{{background:{L['bg']} !important}} h1,h2{{font-family:'Noto Serif TC',serif}}", 'bar', ''),
    'apps/single-slit-diffraction/index.html': (f"html:root{{--primary:{L['ink']};--secondary:{L['acc']};--highlight:{L['honey']};--nav-bg:{L['cocoa']};--nav-text:#fff3e6;--tab-active-bg:#5a4034;--tab-active-text:#ffc9a6;--border-color:#5a4034}} html body{{background:{L['cocoa']} !important}}", 'pill', ''),
    # 深色模擬：改成可可棕的暖色深底
    'apps/baseball-cfd/index.html': (BB, 'bar', ''),
    'apps/charged-spheres/index.html': (f"html:root{{--bg:{D['bg']};--panel:{D['panel']};--panel-alt:{D['panel2']};--text:{D['ink']};--muted:{D['muted']};--border:{D['line']};--accent:{D['honey']}}}\nbody.light{{--bg:{L['bg']};--panel:{L['card']};--panel-alt:{L['card2']};--text:{L['ink']};--muted:{L['muted']};--border:{L['line']};--accent:{L['acc2']}}}", 'bar', ''),
    'apps/semiconductor-process/index.html': (f"html:root{{--bg:{D['bg']};--panel:{D['panel']};--line:{D['line']};--text:{D['ink']};--muted:{D['muted']};--gold:{D['honey']}}} html body{{background:radial-gradient(ellipse at 45% 0,#3a2a20,{D['bg']} 55%) !important}}", 'bar', ''),
    'apps/simulation/index.html': (f"html:root{{--bg-color:{D['bg']};--card-bg:rgba(42,32,27,.8);--card-border:rgba(255,230,200,.08);--text-primary:{D['ink']};--text-secondary:{D['muted']};--grid-color:#3a2d25}} html body:not(.light-theme){{background:{D['bg']} !important}} body.light-theme{{--bg-color:{L['bg']}}}", 'bar', ''),
    'apps/orbit_transfer/index.html': (f"html:root{{--bg-dark:{D['bg']};--card-bg:rgba(42,32,27,.66);--card-border:rgba(240,180,90,.18);--card-border-glow:rgba(240,180,90,.45)}} html body:not(.light-mode){{background:{D['bg']} !important}} body.light-mode{{--bg-dark:{L['bg']}}}", 'pill', ''),
    'apps/orbital_decay/index.html': (f"html:root{{--bg-dark:{D['bg']};--bg-card:rgba(42,32,27,.75);--border-color:rgba(255,230,200,.09);--border-glow:rgba(240,180,90,.2);--text-primary:{D['ink']};--text-secondary:{D['muted']}}} html body:not(.light-mode){{background:{D['bg']} !important}} body.light-mode{{--bg-dark:{L['bg']}}}", 'pill', ''),
    'apps/center-of-mass.html': (f"html:root{{--primary:{D['acc']};--accent:{D['honey']};--bg:{D['bg']};--card-bg:rgba(42,32,27,.92);--text:{D['ink']}}} html body{{background:{D['bg']} !important}}", 'bar', ''),
    # Tailwind／一般頁面
    'apps/alpha.html': ('', 'bar', 'gp-tw'),
    'apps/friction-simulation/index.html': ('', 'bar', 'gp-tw'),
    'apps/phy-olympic-wall-bar-move.html': ('', 'bar', 'gp-tw'),
    'apps/Uncertainty.html': (f".container{{background:{L['card']} !important}}", 'pill', 'gp-plain'),
    'apps/movable_pulley.html': (f".container{{background:{L['card']} !important}}", 'pill', 'gp-plain'),
    'apps/random_sampler.html': (f".container{{background:{L['card']} !important}}", 'pill', 'gp-plain'),
    'apps/semiconductor.html': (f".container{{background:{L['card']} !important}}", 'pill', 'gp-plain'),
    'apps/phy-vpython-baseball.html': ('', 'pill', 'gp-plain'),
}
for k in ['theme1', 'theme2', 'theme3', 'theme4']:
    PAGES[f'apps/single-slit-diffraction/{k}.html'] = (f"html:root{{--primary:{L['ink']};--secondary:{L['acc']};--highlight:{L['honey']};--bg-color:{L['bg']};--panel-bg:{L['card']};--btn-play:{L['sage']};--btn-pause:{L['honey']};--btn-calm:{L['acc']};--btn-reset:#a8978a}} html body{{background:{L['bg']} !important}}", 'pill', '')
# 自己做的首頁、目錄頁、練習頁直接使用 warm.css 的變數
HUBS = ['index.html', 'practice/index.html', 'practice/admin.html']

HEAD_META = '''<meta name="theme-color" content="#3a2a22">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Gavin Physics">'''


def rel(path, target):
    return '../' * path.count('/') + target


def apply(path, css, mode, htmlcls):
    p = os.path.join(ROOT, path); t = open(p, encoding='utf-8').read(); o = t
    # 清掉上一次套用的內容
    t = re.sub(r'\n?<!-- gp-head -->.*?<!-- /gp-head -->', '', t, flags=re.S)
    t = re.sub(r'\n?<style id="gp-warm">.*?</style>', '', t, flags=re.S)
    t = re.sub(r'\n?<script src="[./]*assets/site\.js(\?[^"]*)?"[^>]*></script>', '', t)
    head = '<!-- gp-head -->\n'
    if not re.search(r'<meta[^>]+name=["\']viewport', t, re.I):
        head += '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    head += HEAD_META + '\n'
    head += f'<link rel="manifest" href="{rel(path, "manifest.webmanifest")}">\n<link rel="apple-touch-icon" href="{rel(path, "assets/icon-192.png")}">\n'
    head += f'<link rel="stylesheet" href="{rel(path, "assets/warm.css")}?v={VER}">\n<!-- /gp-head -->'
    # 放在 <head> 最前面（在頁面自己的樣式之前），讓頁面樣式與底下的覆寫都能蓋過基礎樣式
    t = re.sub(r'\n?\s*<meta[^>]+name=["\']theme-color["\'][^>]*>', '', t, flags=re.I)
    m = re.search(r'<meta[^>]+charset[^>]*>', t, re.I) or re.search(r'<head[^>]*>', t, re.I)
    t = t[:m.end()] + '\n' + head + t[m.end():]
    tail = ''
    if css: tail += f'<style id="gp-warm">\n/* 溫暖主題覆寫（assets/tools/apply_warm.py 產生） */\n{css}\n</style>\n'
    tail += f'<script src="{rel(path, "assets/site.js")}?v={VER}"' + (' data-mode="pill"' if mode == 'pill' else '') + ' defer></script>\n'
    m = list(re.finditer(r'</head>', t, re.I))[-1]; t = t[:m.start()] + tail + t[m.start():]
    # <html> 的 class
    t = re.sub(r'(<html\b[^>]*?)\s+data-gp="[^"]*"', r'\1', t, count=1)
    if htmlcls or path in HUBS:
        cls = (htmlcls + ' gp-hub').strip() if path in HUBS else htmlcls
        mm = re.search(r'<html\b([^>]*)>', t, re.I)
        attrs = mm.group(1)
        if 'class=' in attrs:
            attrs2 = re.sub(r'class="([^"]*)"', lambda k: 'class="' + ' '.join(sorted(set(k.group(1).split()) | set(cls.split()))) + '"', attrs, count=1)
        else:
            attrs2 = attrs + f' class="{cls}"'
        t = t[:mm.start()] + f'<html{attrs2}>' + t[mm.end():]
    if t != o: open(p, 'w', encoding='utf-8').write(t)
    return t != o


changed = 0
for path, (css, mode, cls) in PAGES.items():
    if not os.path.exists(os.path.join(ROOT, path)): print('缺少', path); continue
    changed += apply(path, css, mode, cls)
for path in HUBS:
    changed += apply(path, '', 'bar', '')
print('已更新', changed, '頁')
