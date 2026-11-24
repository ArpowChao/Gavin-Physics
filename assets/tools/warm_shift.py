#!/usr/bin/env python3
"""
把學測、波動光學頁面 CSS 裡「冷色」（藍、青、灰藍）的介面顏色換成暖色。
只改 background／border／color／box-shadow／outline 這類介面屬性，不動 SVG 的 fill／stroke 與 JS 繪圖顏色，
避免把代表物理意義的顏色（水波、光線、電場）也換掉。可重複執行（已是暖色的不會再變）。
"""
import colorsys, re, sys, os

PROPS = re.compile(r'(?P<prop>(?:background(?:-color|-image)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|color|box-shadow|outline(?:-color)?|text-decoration-color|caret-color|accent-color|--[\w-]+))\s*:\s*(?P<val>[^;{}]+)')
COLOR = re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)|hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(?:,\s*[\d.]+\s*)?\)')
SKIP_VARS = re.compile(r'--(?:wave|ray|light|water|field|elec|hole|ice|vapor)')


def parse(c):
    c = c.strip()
    if c.startswith('#'):
        h = c[1:]; h = ''.join(x * 2 for x in h) if len(h) == 3 else h
        return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], None
    nums = [float(x) for x in re.findall(r'[\d.]+', c)]
    if c.startswith('rgb'):
        return [n / 255 for n in nums[:3]], (nums[3] if len(nums) > 3 else None)
    h, s, l = nums[0] / 360, nums[1] / 100, nums[2] / 100
    return list(colorsys.hls_to_rgb(h, l, s)), (nums[3] if len(nums) > 3 else None)


def fmt(rgb, a, orig):
    r, g, b = [max(0, min(255, round(x * 255))) for x in rgb]
    if a is not None: return f'rgba({r}, {g}, {b}, {a:g})'
    return '#%02x%02x%02x' % (r, g, b)


def warm(c):
    rgb, a = parse(c)
    h, l, s = colorsys.rgb_to_hls(*rgb)
    deg = h * 360
    if not (150 <= deg <= 275) or s < 0.04: return c
    if l > 0.88:   nh, ns = 32, min(s, 0.55)          # 淡色底 → 米白／杏色
    elif l < 0.22: nh, ns = 20, min(s, 0.30)          # 深藍 → 可可棕
    elif s < 0.25: nh, ns = 25, s                     # 灰藍 → 暖灰
    else:          nh, ns = 17, min(max(s, 0.45), 0.62)  # 強調色 → 陶土橘
    return fmt(colorsys.hls_to_rgb(nh / 360, l, ns), a, c)


def shift_css(css):
    def decl(m):
        if SKIP_VARS.match(m.group('prop')): return m.group(0)
        return m.group('prop') + ': ' + COLOR.sub(lambda k: warm(k.group(0)), m.group('val'))
    return PROPS.sub(decl, css)


def process(path):
    t = open(path, encoding='utf-8').read(); o = t
    if path.endswith('.css'): t = shift_css(t)
    else: t = re.sub(r'(<style[^>]*>)(.*?)(</style>)', lambda m: m.group(1) + shift_css(m.group(2)) + m.group(3), t, flags=re.S)
    if t != o: open(path, 'w', encoding='utf-8').write(t)
    return t != o


if __name__ == '__main__':
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    files = sys.argv[1:] or ['gsat/gsat_physics_review.html', 'gsat/assets/css/interaction-runtime.css',
                             'wave-optics/wave_optics_review.html', 'wave-optics/assets/css/learner.css', 'wave-optics/assets/css/interaction-runtime.css',
                             'wave-optics/water_interference.html', 'wave-optics/assets/css/aquarium.css', 'wave-optics/assets/css/swing-work.css']
    for f in files:
        print(f, '已更新' if process(os.path.join(root, f)) else '無變更')
