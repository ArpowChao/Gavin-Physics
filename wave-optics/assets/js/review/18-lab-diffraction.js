// 互動實驗：單狹縫繞射
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 13. 光的繞射實驗（單狹縫） --------------------------------------- */
        LABS.diffraction = {
            floating: true,
            name: '光的繞射實驗（單狹縫）',
            cycle: 1.96,
            tag: 'N20',
            hint: '三段推理：① 縫上排滿點光源，子波互相干涉而擴散（惠更斯原理）；② 最大光程差 Δℓ_AB = a sinθ ≈ a·y/L；③ 把縫等分成偶數區，區與區成對抵消 ⇒ 暗紋。第三個模式就是「為什麼 a sinθ = mλ 是暗紋而不是亮紋」的完整論證。',
            hintFor: (p) => ({
                pathdiff: '保持屏幕範圍不變，改變波長 λ、縫寬 a 或距離 L，觀察中央亮紋寬度和暗紋位置。P 點可用下方滑桿調整；調整光學參數時，P 保持在原來的毫米位置。',
                cancel: 'P 跟隨指定級次的暗紋。保持屏幕範圍不變，改變 λ、a 或 L，看暗紋與 P 一起移動。如果 P 超出畫面，可調大屏幕範圍。',
                phase: '拖動相位差滑桿，看橙色和藍色的波峰怎麼錯開。試試 0：波峰對波峰；再試 π：波峰對波谷，黑色合成波變成一條平線。',
                multi: '<b>為什麼單狹縫長這樣？</b>把寬 a 的狹縫想成 <b>N 條等間距的細縫</b>。往 θ 方向看，相鄰兩縫的光程差 d sinθ，相位差 δ。右邊把每條縫送來的波畫成一根箭頭：長度是振幅、方向是相位，相鄰兩根轉 δ，頭尾相接後的<b>合成箭頭</b>就是總振幅。從 N = 2 開始慢慢加（最多 200 條）：a sinθ = λ 時，N 根箭頭剛好轉一整圈繞回起點 → 暗紋，不管 N 是多少都一樣。N 愈大，藍色曲線愈接近單狹縫（紅虛線）。切到「固定縫距」則是光柵：縫愈多，主亮紋愈細。',
                colors: '<b>不只一種顏色時</b>：每一種波長各自形成一組單狹縫圖案（暗紋 a sinθ = mλ），顏色之間不同調，屏幕上<b>強度相加</b>。選「雙色光」找兩色暗紋重合 m₁λ₁ = m₂λ₂；選「白光」看中央白、邊緣偏紅。保持屏幕範圍不變，比較不同縫寬或距離的條紋。',
                view3d: '<b>3D 立體模擬</b>：拖曳旋轉、滾輪或雙指縮放，「視角」可切到正對屏幕或從上往下看。縫上每一點都發出子波，水平面上看得到它們疊加後向前展開；縫沿上下很長，屏幕上是直條紋。調整 a 看中央亮帶的張角。'
            })[p.mode] || '三段推理：① 縫上排滿點光源，子波互相干涉而擴散（惠更斯原理）；② 最大光程差 Δℓ_AB = a sinθ ≈ a·y/L；③ 把縫等分成偶數區，區與區成對抵消 ⇒ 暗紋。第三個模式就是「為什麼 a sinθ = mλ 是暗紋而不是亮紋」的完整論證。',
            note: '先用「惠更斯子波」的無單位 a/λ 比例模型觀察展開趨勢；右側顯示遠場角度分布的示意，第一暗紋滿足 sinθ₁ = λ/a。再切換「最大光程差」或「成對抵消」，輸入實際 λ、a、L 數值。暗紋方向可將狹縫等分成 2m 區，相鄰對應點差 λ/2 而抵消；遠屏、中央附近的小角近似下，暗紋位置 yₘ ≈ mLλ/a，中央亮紋寬度約 2Lλ/a。',
            noteFor: (p) => ({
                phase: '<b>相位差是週期的錯開量：</b>2π 是一整週期，所以 0 和 2π 一樣同相；π 是半週期，一個波峰剛好碰到另一個波谷。<br><b>先加振幅，再算強度：</b>黑線是每個時刻的 A＋B。若每一波的振幅為 1，合成振幅是 2|cos(Δφ/2)|，相對強度 I/Iₘₐₓ = cos²(Δφ/2)。因此 π/2 和 3π/2 都是 50% 強度。',
                multi: '<b>相量（箭頭）是什麼</b>：同頻率的波可以用一根旋轉的箭頭代表，長度 = 振幅、角度 = 相位；兩個波疊加就是箭頭頭尾相接（和向量相加一樣）。<br><b>N 條縫的強度</b>：I/I_max = [sin(Nδ/2) / (N sin(δ/2))]²。δ = 0、2π… 時箭頭全部同向，是主亮紋；Nδ = 2π 的整數倍（但 δ 不是 2π 的整數倍）時箭頭繞成封閉多邊形，是暗紋。<br><b>固定總寬 a</b>：d = a/N，所以 Nδ = 2π a sinθ / λ。<b>a sinθ = mλ 時一定是暗紋</b>，和 N 無關；N = 2 時這就是「等分成兩區、成對抵消」。N → ∞ 時箭頭變成一段圓弧，強度趨近單狹縫的 sin²β/β²（β = π a sinθ / λ），這就是單狹縫圖案的由來：中央最亮、側亮紋是「箭頭繞了一圈半、兩圈半…」的地方，所以一個比一個暗。<br><b>固定縫距 d</b>（光柵）：主亮紋仍在 d sinθ = nλ，但 N 愈大愈細，兩個主亮紋之間有 N − 1 個暗紋、N − 2 個小亮紋。本模式的每條細縫視為極窄（點波源）。',
                colors: '<b>為什麼是強度相加</b>：不同顏色頻率不同，相位差不斷變化，干涉項的平均為 0，各色的強度直接相加。<br><b>暗紋重合</b>：λ₁ 的第 m₁ 暗紋與 λ₂ 的第 m₂ 暗紋重合 ⇔ m₁λ₁ = m₂λ₂；某一色的暗紋處只剩另一色的光，所以那裡看起來是另一色。<br><b>白光</b>：中央白色，紫光最先變暗（第一暗紋 Lλ/a 最小），中央亮紋邊緣偏紅；側亮紋暗又彼此錯開，看起來是淡淡的彩色。',
                view3d: '<b>比例</b>：「遠看」接近真實比例（L ≫ a），亮度只由方向決定；「近看」把波長放大、L 縮短，看得到縫上各點的子波。λ₀ 表示 550 nm；數值請用實際單位的模式。<br><b>屏幕條紋與水平面一致</b>：屏幕亮度取自縫上同一組子波在屏幕位置的疊加。<br>a 小於 λ 時沒有暗紋，光幾乎向前方半個平面都展開；a 愈大，中央亮帶愈窄、愈接近直線前進。'
            })[p.mode] || '先用「惠更斯子波」的無單位 a/λ 比例模型觀察展開趨勢；右側顯示遠場角度分布的示意，第一暗紋滿足 sinθ₁ = λ/a。再切換「最大光程差」或「成對抵消」，輸入實際 λ、a、L 數值。暗紋方向可將狹縫等分成 2m 區，相鄰對應點差 λ/2 而抵消；遠屏、中央附近的小角近似下，暗紋位置 yₘ ≈ mLλ/a，中央亮紋寬度約 2Lλ/a。',
            teach: `
                <h4>討論：單狹縫的圖案從哪裡來？</h4>
                <h5>1. 把一條寬縫想成許多條細縫</h5>
                <p>依惠更斯原理，縫上每一點都是同相的子波源。把寬 a 的縫切成 N 條等間距的細縫（間距 d = a/N），往 θ 方向看，相鄰兩條細縫的光程差是 d sinθ，相位差 δ = 2π·d sinθ / λ。</p>
                <h5>2. 用箭頭（相量）把 N 個波加起來</h5>
                <p>同頻率的波可以用一根箭頭表示：長度是振幅，方向是相位。疊加兩個波，就像向量相加，把箭頭頭尾相接。每條細縫送來的波振幅相同，只是相鄰兩根要轉 δ：</p>
                <ul>
                    <li><b>θ = 0</b>：δ = 0，N 根箭頭排成一直線，合成最長 → 中央亮紋最亮。</li>
                    <li><b>θ 慢慢變大</b>：箭頭鏈開始彎曲，合成箭頭變短 → 亮度遞減。</li>
                    <li><b>a sinθ = λ</b>：N 根箭頭總共轉了 N·δ = 2π，剛好繞成一圈回到起點，合成為 0 → <b>第一暗紋</b>。這個結果和 N 無關：N = 2 時就是「把縫分成兩半、成對抵消」。</li>
                    <li><b>a sinθ ≈ 1.5λ</b>：箭頭繞了一圈半，合成箭頭約只剩中央的 1/5 → 第一側亮紋，所以只有中央的約 4.5% 亮。</li>
                    <li><b>a sinθ = 2λ</b>：繞兩整圈，又回到起點 → 第二暗紋。</li>
                </ul>
                <p class="teach-tip">N → ∞ 時箭頭鏈變成一段平滑的圓弧，強度就是單狹縫的 sin²β / β²（β = π a sinθ / λ）。「多狹縫 → 單狹縫」模式中，N 加到 10 以上，藍色曲線幾乎就和紅色虛線重合。</p>
                <h5>3. 反過來：固定縫距、增加縫數 → 光柵</h5>
                <p>若縫距 d 固定、縫數 N 增加，主亮紋仍在 d sinθ = nλ（所有箭頭同向），但只要偏離一點點，N 根箭頭就迅速繞成一圈 → 主亮紋變得又細又亮，兩個主亮紋之間有 N − 1 個暗紋。光碟、光譜儀的分光就是靠這個。</p>
                <h5>4. 白光與雙色光</h5>
                <p>不同顏色不同調，各自形成單狹縫圖案，強度相加。中央每一色都最亮 → 白色；紫光的第一暗紋 Lλ/a 最靠近中央，紅光最遠，所以中央亮紋邊緣偏紅。兩色的暗紋重合條件是 m₁λ₁ = m₂λ₂。</p>`,
            height: (p, w) => p.mode === 'phase' ? (w >= 640 ? 510 : 455) : p.mode === 'multi' ? (w >= 640 ? 500 : 640) : p.mode === 'colors' ? (w >= 640 ? 600 : 680) : p.mode === 'view3d' ? (w >= 640 ? 520 : 440) : p.mode === 'huygens' ? 470 : 520,
            modes: [
                { key: 'huygens', label: '惠更斯子波' },
                { key: 'multi', label: '多狹縫 → 單狹縫' },
                { key: 'pathdiff', label: '最大光程差' },
                { key: 'cancel', label: '暗紋：成對抵消' },
                { key: 'phase', label: '兩波相位差動畫' },
                { key: 'colors', label: '多波長疊加' },
                { key: 'view3d', label: '3D 立體模擬' }
            ],
            onReset: (p) => SlitOptics.setView(p, 'oblique'),
            setup: (env) => {
                SlitOptics.bind3D(env, (p) => p.mode === 'view3d');
                const { host, params, disposers } = env;
                const height = host.querySelector('[id$="diffraction-yMm"]');
                const range = host.querySelector('[id$="diffraction-screenMm"]');
                if (!height || !range) return;
                const fitSlider = () => {
                    // 縮放屏幕也保留 P 的實際位置，即使暫時看不到 P。
                    height.max = Math.max(params.screenMm, params.yMm);
                    height.value = params.yMm;
                };
                disposers.addEventListener(range, 'change', fitSlider);
                const reset = host.querySelector('[data-role="reset"]');
                if (reset) disposers.addEventListener(reset, 'click', fitSlider);
                fitSlider();
                const angle = host.querySelector('[id$="diffraction-phaseDeg"]');
                const preset = host.querySelector('[id$="diffraction-phasePreset"]');
                if (angle && preset) {
                    disposers.addEventListener(preset, 'change', () => { angle.value = params.phaseDeg; });
                    disposers.addEventListener(angle, 'input', () => { preset.value = params.phasePreset; });
                    // 把相位滑桿放在圖上方，拖曳時也能看到波形和強度曲線。
                    const row = document.createElement('div');
                    row.className = 'lab-controls';
                    row.style.gridTemplateColumns = 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))';
                    row.append(angle.closest('.lab-control'), preset.closest('.lab-control'));
                    host.querySelector('.lab-stage').before(row);
                    const showPhaseControls = () => { row.style.display = params.mode === 'phase' ? '' : 'none'; };
                    host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', showPhaseControls));
                    showPhaseControls();
                }
            },
            controls: [
                { key: 'mkind', label: '怎麼增加縫數', value: 'fill', only: ['multi'], fmt: () => '', options: [
                    { value: 'fill', label: '固定總寬 a（→ 單狹縫）' }, { value: 'grating', label: '固定縫距 d（→ 光柵）' }] },
                { key: 'mN', label: '縫數 N', min: 1, max: 200, step: 1, value: 2, fmt: (v) => `${v} 條`, only: ['multi'] },
                { key: 'ma', label: '總寬 a（以 λ 為單位）', min: 2, max: 8, step: 0.5, value: 4, fmt: (v) => `a = ${v} λ`, only: ['multi'], showIf: (p) => p.mkind !== 'grating' },
                { key: 'md', label: '縫距 d（以 λ 為單位）', min: 1.5, max: 6, step: 0.5, value: 3, fmt: (v) => `d = ${v} λ`, only: ['multi'], showIf: (p) => p.mkind === 'grating' },
                { key: 'mth', label: '觀察方向 θ', min: -70, max: 70, step: 0.1, value: 14.5, fmt: (v) => `${v.toFixed(1)}°（sinθ = ${Math.sin(v * Math.PI / 180).toFixed(3)}）`, only: ['multi'] },
                { key: 'src', label: '光源', value: 'two', only: ['colors'], fmt: () => '', options: [
                    { value: 'mono', label: '單色光（對照組）' }, { value: 'two', label: '雙色光（λ₁ ＋ λ₂）' }, { value: 'white', label: '白光（400–700 nm）' }] },
                { key: 'src3', label: '光源', value: 'mono', only: ['view3d'], fmt: () => '', options: [
                    { value: 'mono', label: '單色光' }, { value: 'two', label: '雙色光（λ₁ ＋ λ₂）' }, { value: 'white', label: '白光' }] },
                { key: 'lam', label: '波長 λ (nm)', min: 400, max: 700, step: 5, value: 550, fmt: (v) => `${v} nm`, only: ['pathdiff', 'cancel', 'colors', 'view3d'],
                  showIf: (p) => p.mode === 'colors' ? p.src === 'mono' : p.mode === 'view3d' ? p.src3 === 'mono' : true },
                { key: 'layout', label: '顯示方式', value: 'both', only: ['colors'], fmt: () => '', showIf: (p) => p.src !== 'mono', options: [
                    { value: 'both', label: '分開＋合併（並列對照）' }, { value: 'split', label: '只看分開' }, { value: 'merge', label: '只看合併' }] },
                { key: 'comp3', label: '分開／合併', value: 'all', only: ['view3d'], fmt: () => '', showIf: (p) => p.src3 === 'two', options: [
                    { value: 'all', label: '兩色合併' }, { value: 'l1', label: '只看 λ₁' }, { value: 'l2', label: '只看 λ₂' }] },
                { key: 'lam1', label: '波長 λ₁ (nm)', min: 400, max: 700, step: 5, value: 600, fmt: (v) => `${v} nm`, only: ['colors', 'view3d'],
                  showIf: (p) => (p.mode === 'colors' ? p.src : p.src3) === 'two' },
                { key: 'lam2', label: '波長 λ₂ (nm)', min: 400, max: 700, step: 5, value: 400, fmt: (v) => `${v} nm`, only: ['colors', 'view3d'],
                  showIf: (p) => (p.mode === 'colors' ? p.src : p.src3) === 'two' },
                { key: 'phaseDeg', label: '相位差 Δφ（0～2π）', min: 0, max: 360, step: 1, value: 0, only: ['phase'],
                  fmt: (v) => `${SlitOptics.phaseAngle(v)}（${v}°）`, onChange: (v, p) => { p.phasePreset = v % 90 === 0 ? v : 'manual'; } },
                { key: 'phasePreset', label: '快速比較', value: 0, fmt: () => '', only: ['phase'],
                  onChange: (v, p) => { if (v !== 'manual') p.phaseDeg = v; }, options: [
                    { value: 'manual', label: '自訂角度（使用滑桿）' }, { value: 0, label: '0（同相）' },
                    { value: 90, label: 'π/2' }, { value: 180, label: 'π（反相）' },
                    { value: 270, label: '3π/2' }, { value: 360, label: '2π（同相）' }] },
                { key: 'a', label: '狹縫寬度 a (μm)', min: 10, max: 200, step: 2, value: 60, fmt: (v) => `${v} μm`, only: ['pathdiff', 'cancel', 'colors'] },
                { key: 'L', label: '屏幕距離 L (m)', min: 0.3, max: 2.5, step: 0.1, value: 1.2, fmt: (v) => `${v.toFixed(1)} m`, only: ['pathdiff', 'cancel', 'colors'] },
                { key: 'screenMm', label: '屏幕範圍（以中央為 0）', value: 40, fmt: () => '', only: ['pathdiff', 'cancel', 'colors'],
                  options: [5, 10, 20, 40, 80, 160, 320, 640].map((v) => ({ value: v, label: `±${v} mm` })) },
                { key: 'yMm', label: 'P 點高度 y (mm)', min: 0, max: 640, step: 0.1, value: 11, fmt: (v) => `${v.toFixed(1)} mm`, only: ['pathdiff'] },
                { key: 'zones', label: '把狹縫等分成幾區', min: 2, max: 6, step: 2, value: 2, fmt: (v) => `${v} 區（第 ${v / 2} 暗紋）`, only: ['cancel'] },
                { key: 'aw', label: '縫寬／波長 a/λ（無單位比例）', min: 0.5, max: 8, step: 0.25, value: 2.5, fmt: (v) => `a / λ = ${v.toFixed(2)}`, only: ['huygens'] },
                { key: 'cut3', label: '狹縫', value: 'whole', only: ['view3d'], fmt: () => '',
                  onChange: (v, p) => { if (v === 'cut' && p.aw3 < 6) p.aw3 = 8; if (v === 'grat' && p.aw3 > 4) p.aw3 = 2; }, options: [
                    { value: 'whole', label: '一條寬縫（單狹縫）' }, { value: 'cut', label: '切成 N 條細縫（總寬 a 不變）' },
                    { value: 'grat', label: 'N 條縫，固定縫距 d（→ 光柵）' }] },
                { key: 'nc3', label: '縫數 N', min: 2, max: 150, step: 1, value: 2, fmt: (v) => `${v} 條`, only: ['view3d'], showIf: (p) => p.cut3 === 'cut' || p.cut3 === 'grat' },
                { key: 'dd3', label: '縫距 d（λ₀ 的倍數；d 愈大，看得到的級數愈多）', min: 1.5, max: 20, step: 0.5, value: 8, fmt: (v) => `${v} λ₀`, only: ['view3d'], showIf: (p) => p.cut3 === 'grat' },
                { key: 'aw3', label: '縫寬 a（切開時為總寬；光柵時為每條縫的寬；λ₀ 的倍數；調到很寬就幾乎不繞射）', min: 1, max: 100, step: 0.5, value: 3, fmt: (v) => `${v.toFixed(2)} λ₀`, only: ['view3d'] },
                { key: 'L3', label: '屏幕距離 L（示意；愈小，屏幕涵蓋的角度愈大）', min: 6, max: 26, step: 1, value: 10, fmt: (v) => `${v}`, only: ['view3d'] },
                { key: 'gain3', label: '亮度增強（像拍照曝光；上方強度曲線仍是真實比例）', min: 1, max: 60, step: 1, value: 1, fmt: (v) => v === 1 ? '1×（真實比例）' : `${v}×`, only: ['view3d'] },
                { key: 'scale3', label: '比例', value: 'far', only: ['view3d'], fmt: () => '', options: [
                    { value: 'far', label: '遠看：L ≫ d（接近真實比例）' }, { value: 'near', label: '近看：放大看波怎麼疊加' }] },
                { key: 'show3', label: '水平面上顯示', value: 'instant', only: ['view3d'], showIf: (p) => p.scale3 === 'near', fmt: () => '', options: [
                    { value: 'instant', label: '瞬間的波（動畫）' }, { value: 'average', label: '平均亮度（眼睛看到的）' }] },
                { key: 'cam', label: '視角', value: 'oblique', only: ['view3d'], fmt: () => '', onChange: (v, p) => SlitOptics.setView(p, v), options: [
                    { value: 'oblique', label: '斜上方' }, { value: 'top', label: '從上往下看' }, { value: 'screen', label: '正對屏幕' }, { value: 'side', label: '側面' }, { value: 'slits', label: '看狹縫（放大）' }] },
                { key: 'curve', label: '屏幕上方畫強度曲線', type: 'checkbox', value: true, only: ['view3d'] }
            ],
            readouts: (p) => {
                if (p.mode === 'multi') return SlitOptics.multiReadouts(p);
                if (p.mode === 'phase') return SlitOptics.phaseReadouts(p);
                if (p.mode === 'colors') return SlitOptics.singleColorReadouts(p);
                if (p.mode === 'view3d') return SlitOptics.single3DReadouts(p);
                if (p.mode === 'huygens') {
                    const theta = p.aw >= 1 ? deg(Math.asin(1 / p.aw)) : null;
                    return [
                        { label: '縫寬／波長 a/λ', value: `${p.aw.toFixed(2)}（無單位）` },
                        { label: '第一暗紋角度 |θ₁|', value: theta === null ? '無第一暗紋方向' : `${theta.toFixed(1)}°${p.aw === 1 ? '（側向邊界）' : '（左右各一）'}` },
                        { label: '中央亮區的角度範圍', value: theta === null ? '前方 −90° ～ +90° 內無暗紋' : `−${theta.toFixed(1)}° ～ +${theta.toFixed(1)}°` },
                        { label: '觀察趨勢', value: 'a/λ 越小，展開角越大' }
                    ];
                }
                const s = SlitOptics.singleScreen(p);
                const pHeight = `${s.y.toFixed(2)} mm${s.y > s.halfMm ? '（超出屏幕範圍）' : ''}`;
                if (p.mode === 'cancel') {
                    return [
                        { label: '等分區數', value: `${Math.round(p.zones)} 區 ⇒ 兩兩成對抵消` },
                        { label: '最大光程差', value: `Δℓ_AB = ${s.order}λ` },
                        { label: `第 ${s.order} 暗紋位置`, value: pHeight },
                        { label: '中央亮紋寬度', value: `${s.centralWidth.toFixed(2)} mm` }];
                }
                if (p.mode === 'pathdiff') {
                    return [
                        { label: 'Δℓ_AB / λ', value: s.q.toFixed(2) },
                        { label: 'P 點高度 y', value: pHeight },
                        { label: 'P 點相對強度 I/I₀', value: `${(s.intensity * 100).toFixed(1)}%（${s.verdict}）` },
                        { label: '中央亮紋寬度', value: `${s.centralWidth.toFixed(2)} mm` }];
                }
                return [];
            },
            draw: (ctx, w, h, p, t) => {
                if (p.mode === 'multi') { SlitOptics.multiDraw(ctx, w, h, p); return; }
                if (p.mode === 'phase') { SlitOptics.phaseDraw(ctx, w, h, p, t, LABS.diffraction.cycle); return; }
                if (p.mode === 'colors') { SlitOptics.singleColors(ctx, w, h, p); return; }
                if (p.mode === 'view3d') { SlitOptics.single3D(ctx, w, h, p, t, LABS.diffraction); return; }
                const screen = p.mode === 'huygens' ? null : SlitOptics.singleScreen(p);
                const wl = p.mode === 'huygens' ? 550 : p.lam;
                let rgb;
                if (wl < 440) rgb = [130, 0, 200];
                else if (wl < 490) rgb = [0, 90, 235];
                else if (wl < 510) rgb = [0, 180, 190];
                else if (wl < 580) rgb = [70, 200, 60];
                else if (wl < 645) rgb = [235, 160, 0];
                else rgb = [225, 40, 40];
                const col = (al) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${al})`;
                const y0 = screen ? 30 : 8, y1 = h - (screen ? 94 : 74), cy = (y0 + y1) / 2, TH = y1 - y0;
                const xSl = Math.max(60, w * 0.14);
                const xS = Math.max(xSl + 150, w - 148);
                const mmToY = (mm) => cy - mm / screen.halfMm * TH / 2;
                const sinc2 = (q) => {
                    const b = Math.PI * q;
                    if (Math.abs(b) < 1e-7) return 1;
                    const s = Math.sin(b) / b;
                    return s * s;
                };

                /* 螢幕上的條紋帶與強度曲線（三個模式共用；由真實的 sinc² 分布繪製）
                   mapQ 可覆寫「螢幕高度 → Δℓ_AB/λ」的對應，讓條紋與畫面上的繞射場一致。 */
                const drawScreen = (mapQ) => {
                    const yToQ = mapQ || ((py) => screen.qAt((cy - py) / (TH / 2) * screen.halfMm));
                    for (let py = y0; py <= y1; py++) {
                        const I = sinc2(yToQ(py));
                        ctx.fillStyle = `rgb(${Math.round(rgb[0] * I + 12 * (1 - I))},${Math.round(rgb[1] * I + 18 * (1 - I))},${Math.round(rgb[2] * I + 24 * (1 - I))})`;
                        ctx.fillRect(xS, py, 22, 1);
                    }
                    ctx.strokeStyle = 'rgba(18,49,58,0.3)'; ctx.lineWidth = 1;
                    ctx.strokeRect(xS, y0, 22, TH);
                    labelFit(ctx, '屏幕', xS + 11, screen ? y0 - 9 : y0 + 12, screen ? C.ink : '#f4fafb', 10, 'center', { maxW: 22, min: 10, clampW: w });
                    const cw = w - (xS + 30) - (screen ? 45 : 6);
                    if (cw > 30) {
                        ctx.strokeStyle = col(0.95); ctx.lineWidth = 2;
                        ctx.beginPath();
                        for (let py = y0; py <= y1; py++) {
                            const X = xS + 30 + sinc2(yToQ(py)) * cw;
                            py === y0 ? ctx.moveTo(X, py) : ctx.lineTo(X, py);
                        }
                        ctx.stroke();
                        // 暗紋位置標記：沿螢幕掃描，找 |q| 通過整數的位置
                        for (let m = 1; m <= 3; m++) {
                            [-1, 1].forEach((sg) => {
                                let py = screen ? mmToY(sg * screen.darkAt(m)) : null;
                                if (!screen) for (let yy = y0 + 1; yy <= y1; yy++) {
                                    const qa = yToQ(yy), qb = yToQ(yy - 1);
                                    if ((qa - sg * m) * (qb - sg * m) <= 0) { py = yy; break; }
                                }
                                if (py === null || py < y0 + 3 || py > y1 - 3) return;
                                const edge = screen ? xS + 30 + cw : w - 8;
                                dashed(ctx, xS + 24, py, edge, py, 'rgba(18,49,58,0.22)');
                                if (!screen || Math.abs(mmToY(screen.darkAt(1)) - cy) >= 16) label(ctx, `暗${m}`, edge, py - 3, C.muted, 9, 'right');
                            });
                        }
                        label(ctx, '強度', xS + 30, screen ? y0 - 9 : y0 + 12, C.muted, 10);
                    }
                    if (screen) {
                        const axisX = w - 42;
                        labelFit(ctx, 'y (mm)', w - 6, y0 - 9, C.muted, 10, 'right');
                        ctx.fillStyle = C.muted;
                        ctx.fillRect(axisX, y0, 1, TH);
                        for (const tick of [-1, -0.5, 0, 0.5, 1]) {
                            const mm = tick * screen.halfMm, py = mmToY(mm);
                            ctx.fillRect(axisX, py, 4, 1);
                            labelFit(ctx, `${mm}`, axisX + 6, py + 3, C.muted, 10, 'left', { maxW: 32, clampW: w });
                        }
                    }
                    // 只在圖示實際包含 q = ±1 時標示中央亮紋範圍。
                    let pA = null, pB = null;
                    if (screen && screen.darkAt(1) <= screen.halfMm) {
                        pA = mmToY(screen.darkAt(1)); pB = mmToY(-screen.darkAt(1));
                    }
                    if (!screen) for (let yy = y0 + 1; yy <= y1; yy++) {
                        if ((yToQ(yy) - 1) * (yToQ(yy - 1) - 1) <= 0) pA = yy;
                        if ((yToQ(yy) + 1) * (yToQ(yy - 1) + 1) <= 0) pB = yy;
                    }
                    if (pA !== null && pB !== null) {
                        ctx.strokeStyle = C.rose; ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.moveTo(xS - 10, pA); ctx.lineTo(xS - 10, pB);
                        ctx.moveTo(xS - 15, pA); ctx.lineTo(xS - 5, pA);
                        ctx.moveTo(xS - 15, pB); ctx.lineTo(xS - 5, pB);
                        ctx.stroke();
                        if (!screen) label(ctx, '中央亮紋', xS - 18, cy + 4, C.rose, 10, 'right');
                    }
                };

                /* ================= 模式一：惠更斯子波 ================= */
                if (p.mode === 'huygens') {
                    const lamPix = 22;
                    const slitPix = Math.max(8, p.aw * lamPix);
                    const k = 2 * Math.PI / lamPix;
                    const om = 3.2;
                    const NS = Math.max(6, Math.min(22, Math.round(slitPix / 6) + 5));
                    const srcs = [];
                    for (let i = 0; i < NS; i++) srcs.push(cy - slitPix / 2 + slitPix * i / (NS - 1));

                    // 縫前的平面波
                    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, xSl, TH); ctx.clip();
                    ctx.strokeStyle = col(0.55); ctx.lineWidth = 2;
                    for (let n = 0; n < 20; n++) {
                        const X = xSl - lamPix + ((t * 30) % lamPix) - n * lamPix;   // 往右走向狹縫
                        if (X < 0) break;
                        ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke();
                    }
                    ctx.restore();

                    // 縫後：子波疊加
                    const step = 5;
                    const fw = xS - xSl, fh = TH;
                    const iw = Math.ceil(fw / step) * step, ih = Math.ceil(fh / step) * step;
                    const img = ctx.createImageData(iw, ih);
                    for (let yy = 0; yy < ih; yy += step) {
                        for (let xx = 0; xx < iw; xx += step) {
                            const gx = xSl + xx, gy = y0 + yy;
                            let sr = 0, si = 0;
                            for (let i = 0; i < NS; i++) {
                                const r = Math.hypot(gx - xSl, gy - srcs[i]);
                                const ph = k * r - om * t;
                                const amp = 1 / Math.sqrt(Math.max(r, 10));
                                sr += Math.cos(ph) * amp; si += Math.sin(ph) * amp;
                            }
                            const v = Math.max(0, Math.min(1, Math.abs(sr) * (6.4 / Math.sqrt(NS))));
                            for (let ddy = 0; ddy < step; ddy++) {
                                const row = (yy + ddy) * iw;
                                for (let ddx = 0; ddx < step; ddx++) {
                                    const idx = (row + xx + ddx) * 4;
                                    img.data[idx] = rgb[0] * v + 10 * (1 - v);
                                    img.data[idx + 1] = rgb[1] * v + 16 * (1 - v);
                                    img.data[idx + 2] = rgb[2] * v + 22 * (1 - v);
                                    img.data[idx + 3] = 255;
                                }
                            }
                        }
                    }
                    const off = getOffscreen(iw, ih);
                    off.ctx.putImageData(img, 0, 0);
                    ctx.drawImage(off.canvas, 0, 0, iw, ih, xSl, y0, fw, fh);

                    // 遮板與縫上的點光源
                    ctx.fillStyle = '#3b5a66';
                    ctx.fillRect(xSl - 5, y0, 10, cy - slitPix / 2 - y0);
                    ctx.fillRect(xSl - 5, cy + slitPix / 2, 10, y1 - (cy + slitPix / 2));
                    ctx.fillStyle = C.orange;
                    for (let i = 0; i < NS; i++) {
                        ctx.beginPath(); ctx.arc(xSl, srcs[i], 2.6, 0, Math.PI * 2); ctx.fill();
                    }
                    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.moveTo(xSl - 24, cy - slitPix / 2); ctx.lineTo(xSl - 24, cy + slitPix / 2);
                    ctx.moveTo(xSl - 29, cy - slitPix / 2); ctx.lineTo(xSl - 19, cy - slitPix / 2);
                    ctx.moveTo(xSl - 29, cy + slitPix / 2); ctx.lineTo(xSl - 19, cy + slitPix / 2);
                    ctx.stroke();
                    label(ctx, 'a', xSl - 32, cy + 4, C.orange, 12, 'right');
                    // 依圖示角度畫遠場 sinc² 分布；左側有限子波場用來觀察趨勢。
                    const fwPix = xS - xSl;
                    drawScreen((py) => p.aw * Math.sin(Math.atan2(cy - py, Math.max(fwPix, 1))));
                    ctx.fillStyle = 'rgba(255,255,255,0.88)';
                    const fieldNoteW = Math.min(260, xS - xSl - 16);
                    ctx.fillRect(xSl + 8, y0 + 6, fieldNoteW, 36);
                    labelFit(ctx, '縫上各點發出同相子波', xSl + 14, y0 + 21, '#0a2f3a', 11, 'left', { maxW: fieldNoteW - 12, min: 10, clampW: w });
                    labelFit(ctx, `a/λ = ${p.aw.toFixed(2)}（比例示意）`, xSl + 14, y0 + 36, '#0a2f3a', 11, 'left', { maxW: fieldNoteW - 12, min: 10, clampW: w });
                    labelFit(ctx, 'a/λ 越小，展開角越大；本模式不標實際長度', 8, h - 12, C.ink, 12, 'left', { maxW: w - 16, min: 10, clampW: w });
                    return;
                }

                // 光路用放大示意；P 點與強度曲線共用右側的實際毫米刻度。
                const aPix = TH * (0.17 + 0.34 * (p.a - 10) / 190);
                const A = { x: xSl, y: cy - aPix / 2 };
                const B = { x: xSl, y: cy + aPix / 2 };
                const P = { x: xS, y: mmToY(screen.y) };
                const showP = screen.y <= screen.halfMm;
                const drawP = () => {
                    if (!showP) return;
                    ctx.fillStyle = screen.isDark ? '#3a3a3a' : '#ffb347';
                    ctx.beginPath(); ctx.arc(P.x, P.y, 6, 0, Math.PI * 2); ctx.fill();
                    labelFit(ctx, 'P', P.x - 10, Math.max(y0 + 12, P.y - 8), C.orange, 12, 'right', { clampW: w });
                };
                const drawFooter = (lines) => {
                    const bw = Math.min(410, w - 16), lineH = 18;
                    ctx.fillStyle = 'rgba(255,255,255,0.93)';
                    ctx.strokeStyle = 'rgba(18,49,58,0.16)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.rect(8, h - 66, bw, 60); ctx.fill(); ctx.stroke();
                    lines.forEach(([text, color], i) => labelFit(ctx, text, 18, h - 48 + i * lineH, color, 12, 'left', { maxW: bw - 20, min: 9, clampW: w }));
                };
                const drawDistance = () => {
                    const yy = y1 + 8;
                    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(xSl, yy); ctx.lineTo(xS, yy);
                    for (const x of [xSl, xS]) { ctx.moveTo(x, yy - 4); ctx.lineTo(x, yy + 4); }
                    ctx.stroke();
                    labelFit(ctx, `L = ${p.L.toFixed(1)} m`, (xSl + xS) / 2, yy + 14, C.muted, 11, 'center', { clampW: w });
                };
                labelFit(ctx, '光路與狹縫放大示意', 8, y0 - 9, C.muted, 11, 'left', { maxW: xS - 22, clampW: w });

                /* ================= 模式二：最大光程差 ================= */
                if (p.mode === 'pathdiff') {
                    for (let i = 0; i < 6; i++) {
                        const yy = y0 + TH * (i + 0.5) / 6;
                        arrow(ctx, 8, yy, xSl - 14, yy, col(0.7), 1.4);
                    }
                    ctx.fillStyle = '#3b5a66';
                    ctx.fillRect(xSl - 5, y0, 10, A.y - y0);
                    ctx.fillRect(xSl - 5, B.y, 10, y1 - B.y);
                    dashed(ctx, xSl, cy, xS, cy, 'rgba(18,49,58,0.45)');

                    // 縫上多點到 P 的光線
                    if (showP) for (let i = 0; i <= 6; i++) {
                        const yy = A.y + (B.y - A.y) * i / 6;
                        ctx.strokeStyle = col(i === 0 || i === 6 ? 0.95 : 0.4);
                        ctx.lineWidth = (i === 0 || i === 6) ? 2 : 1.1;
                        ctx.beginPath(); ctx.moveTo(xSl, yy); ctx.lineTo(P.x, P.y); ctx.stroke();
                    }
                    // 用遠場共同方向作垂足；P 在中央時 Δℓ 為零。
                    if (showP && screen.y > 0) {
                        const ux = P.x - xSl, uy = P.y - cy;
                        const uLen = Math.hypot(ux, uy);
                        const ex = ux / uLen, ey = uy / uLen;
                        const pj = -aPix * ey;
                        const Cc = { x: B.x + ex * pj, y: B.y + ey * pj };
                        ctx.fillStyle = 'rgba(107,70,193,0.22)';
                        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(Cc.x, Cc.y); ctx.closePath(); ctx.fill();
                        ctx.strokeStyle = C.violet; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(Cc.x, Cc.y); ctx.stroke();
                        dashed(ctx, A.x, A.y, Cc.x, Cc.y, 'rgba(107,70,193,0.85)');
                        ctx.fillStyle = C.violet;
                        ctx.beginPath(); ctx.arc(Cc.x, Cc.y, 3, 0, Math.PI * 2); ctx.fill();
                        labelFit(ctx, 'C', Cc.x + 7, Cc.y + 14, C.violet, 11, 'left', { clampW: w });
                    }

                    [[A, 'A'], [B, 'B']].forEach(([s, nm]) => {
                        ctx.fillStyle = C.orange;
                        ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill();
                        label(ctx, nm, s.x - 9, s.y + 4, C.orange, 12, 'right');
                    });
                    ctx.fillStyle = C.muted;
                    ctx.beginPath(); ctx.arc(xSl, cy, 2.6, 0, Math.PI * 2); ctx.fill();
                    label(ctx, 'O', xSl - 9, cy + 16, C.muted, 11, 'right');
                    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(xSl - 26, A.y); ctx.lineTo(xSl - 26, B.y);
                    ctx.moveTo(xSl - 31, A.y); ctx.lineTo(xSl - 21, A.y);
                    ctx.moveTo(xSl - 31, B.y); ctx.lineTo(xSl - 21, B.y);
                    ctx.stroke();
                    label(ctx, 'a', xSl - 34, cy + 4, C.orange, 12, 'right');

                    ctx.fillStyle = '#c9b79a'; ctx.fillRect(xS, y0, 7, TH);
                    drawScreen();
                    drawP(); drawDistance();
                    drawFooter([
                        [`最大光程差 Δℓ_AB = a sinθ = ${screen.q.toFixed(2)} λ`, C.ink],
                        [`P：y = ${screen.y.toFixed(2)} mm；中央亮紋寬 ${screen.centralWidth.toFixed(2)} mm`, C.muted],
                        [showP ? `P 點：${screen.verdict}（相對強度 ${(screen.intensity * 100).toFixed(1)}%）` : 'P 超出畫面，請調大屏幕範圍', C.rose]
                    ]);
                    return;
                }

                /* ================= 模式三：暗紋的成對抵消 ================= */
                const Z = Math.max(2, Math.round(p.zones / 2) * 2);        // 偶數區
                const zoneCols = ['rgba(11,111,146,0.20)', 'rgba(194,38,74,0.20)', 'rgba(18,128,92,0.20)'];

                for (let i = 0; i < 6; i++) {
                    const yy = y0 + TH * (i + 0.5) / 6;
                    arrow(ctx, 8, yy, xSl - 14, yy, col(0.6), 1.3);
                }
                ctx.fillStyle = '#3b5a66';
                ctx.fillRect(xSl - 5, y0, 10, A.y - y0);
                ctx.fillRect(xSl - 5, B.y, 10, y1 - B.y);
                dashed(ctx, xSl, cy, xS, cy, 'rgba(18,49,58,0.4)');
                ctx.fillStyle = '#c9b79a'; ctx.fillRect(xS, y0, 7, TH);

                // 分區色帶
                const zh = aPix / Z;
                for (let z = 0; z < Z; z++) {
                    ctx.fillStyle = zoneCols[Math.floor(z / 2) % 3];
                    ctx.fillRect(xSl - 5, A.y + z * zh, 10, zh);
                    ctx.strokeStyle = 'rgba(18,49,58,0.35)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(xSl - 7, A.y + z * zh); ctx.lineTo(xSl + 7, A.y + z * zh); ctx.stroke();
                    label(ctx, `${z + 1}`, xSl - 12, A.y + z * zh + zh / 2 + 4, C.muted, 10, 'right');
                }
                ctx.beginPath(); ctx.moveTo(xSl - 7, B.y); ctx.lineTo(xSl + 7, B.y); ctx.stroke();

                // 成對抵消：第 2j 區的每一點，與第 2j+1 區對應點的光程差恰為 λ/2
                const pairPhase = (t * 0.6) % 1;
                if (showP) for (let j = 0; j < Z / 2; j++) {
                    const top = A.y + (2 * j) * zh;
                    const c1 = top + zh * (0.2 + 0.6 * pairPhase);
                    const c2 = c1 + zh;
                    const cc = zoneCols[j % 3].replace('0.20', '0.95');
                    ctx.strokeStyle = cc; ctx.lineWidth = 1.8;
                    ctx.beginPath(); ctx.moveTo(xSl, c1); ctx.lineTo(P.x, P.y); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(xSl, c2); ctx.lineTo(P.x, P.y); ctx.stroke();
                    ctx.fillStyle = cc;
                    ctx.beginPath(); ctx.arc(xSl, c1, 3.4, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(xSl, c2, 3.4, 0, Math.PI * 2); ctx.fill();
                    // λ/2 標記
                    const mx = xSl + (P.x - xSl) * 0.30;
                    const my1 = c1 + (P.y - c1) * 0.30, my2 = c2 + (P.y - c2) * 0.30;
                    ctx.strokeStyle = C.rose; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(mx, my1); ctx.lineTo(mx, my2); ctx.stroke();
                    if (j === 0) labelFit(ctx, 'Δℓ = λ/2 ⇒ 相消', mx + 6, (my1 + my2) / 2 + 4, C.rose, 11, 'left', { maxW: P.x - mx - 12, min: 10, clampW: w });
                }

                [[A, 'A'], [B, 'B']].forEach(([s, nm]) => {
                    ctx.fillStyle = C.orange;
                    ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill();
                    label(ctx, nm, s.x - 16, s.y + 4, C.orange, 12, 'right');
                });
                drawScreen();
                drawP(); drawDistance();
                drawFooter([
                    [`等分 ${Z} 區：相鄰對應點差 λ/2，抵消`, C.ink],
                    [`第 ${screen.order} 暗紋：y = ${screen.y.toFixed(2)} mm`, C.violet],
                    [showP ? `最大光程差 a sinθ = ${screen.order}λ` : '暗紋超出畫面，請調大屏幕範圍', C.rose]
                ]);
            }
        };
