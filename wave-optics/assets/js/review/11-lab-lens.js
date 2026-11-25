// 互動實驗：薄透鏡成像作圖
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 10. 薄透鏡成像作圖 ----------------------------------------------- */
        LABS.lens = {
            name: '薄透鏡成像作圖',
            tag: 'N16 / N17',
            hint: '',
            hintFor: (p) => p.mode === 'dof'
                ? '相機鏡頭前有三個物體：近的花、中間的人、遠的樹。感光元件放在「對焦距離」成像的位置。改變光圈：大光圈（f 數小）光錐很粗，沒對焦的物體在感光元件上散成大模糊圈，照片只有對焦的地方清楚（景深淺）；縮小光圈，光錐變細，前後的物體都比較清楚（景深深）。右邊是依模糊圈大小算出來的照片。<br>光圈只是一片有孔的擋板：它只擋掉孔外的光，不會讓光轉彎；光只在透鏡處偏折。下方的放大圖說明<b>為什麼光圈會影響景深</b>：比較目前光圈（實線）和另一個光圈（虛線）的光錐與模糊圈。'
                : p.mode === 'thick'
                ? '可以選六種透鏡（雙凸、平凸、凹凸、雙凹、平凹、凸凹），分別調整前、後表面的曲率半徑，先用造鏡者公式 1/f = (n − 1)(1/R₁ − 1/R₂) 自己算焦距，再對答案。真正的透鏡有厚度，兩面都是球面：光在前、後兩個表面各折射一次（不是在中間一次彎折），每一條都照司乃耳定律精確計算。藍色是近軸光、紅色是遠軸光：用「看哪些光」分開看，比較兩者交在哪裡（球面像差）。「表面形狀」可以改成拋物面，或把球面和拋物面疊在一起比較。勾「薄透鏡公式的光路」對照理想情況。'
                : p.mode === 'double'
                ? '兩個透鏡排成一組：透鏡 1 成的像 I₁，再當作透鏡 2 的物體。先勾光線，看三條光線穿過兩個透鏡後交在哪裡；再勾「中間像 I₁」，看透鏡 1 單獨成的像在哪，想想它和最後的像有什麼關係。I₁ 跑到透鏡 2 後面時，透鏡 2 的物就成了「虛物」。'
                : p.mode === 'conj'
                ? '物體和屏幕固定不動，兩者相距 L。拖動透鏡的位置，看屏幕上的像什麼時候最清楚；清楚時按「記錄這個位置」。試著找出所有能成清晰像的位置，再比較它們的物距和像距。'
                : '先自己作圖：勾選下方的光線，一條一條畫出來，找出它們（或它們的反向延長線）交在哪裡；想好了再勾「顯示像與讀數」對答案。拖動物距時，透鏡和焦點都不會動，只有物體在移動。',
            noteFor: (p) => p.mode === 'dof'
                ? '<b>光圈在哪裡</b>：光圈是一片孔徑可以調整的擋板（由好幾片金屬葉片圍成），裝在鏡頭裡、透鏡的前面或後面，不是透鏡本身；它決定能進入透鏡的光錐有多粗。<br><b>模糊圈</b>：物體的像點不在感光元件上時，光錐在感光元件上截出一個圓；光圈在透鏡上時直徑 c = D·|v − s| ÷ v（D 為光圈孔徑、v 為像距、s 為感光元件到透鏡的距離），這裡依實際的光圈位置追跡光線計算。<br><b>f 數</b>：N = f ÷ D。f 數愈小，口徑愈大，光錐愈粗，模糊圈也愈大，所以<b>大光圈景深淺</b>，適合拍人像把背景拍糊；小光圈景深深，適合拍風景，但進光量少，要曝光比較久。<br><b>景深</b>：模糊圈小到看不出來（這裡取感光元件寬度的 1/150）的物距範圍。<br>光圈縮到非常小時，光的繞射會讓整張照片變糊，所以也不能無限縮小。'
                : p.mode === 'thick'
                ? '<b>造鏡者公式</b>：1/f = (n − 1)(1/R₁ − 1/R₂)。光由左往右，曲率中心在表面右邊時 R 取正、在左邊取負，平面 R = ∞。雙凸、平凸、凹凸（中央厚、邊緣薄）都是會聚的凸透鏡；雙凹、平凹、凸凹（中央薄、邊緣厚）都是發散的凹透鏡。<br><b>薄透鏡是理想化</b>：薄透鏡公式假設透鏡無限薄、光只在中間彎折一次，而且只看靠近主軸的光（近軸近似）。<br><b>厚度的影響</b>：光在兩個表面各折射一次，等效的彎折位置（主平面）不在透鏡中心，焦距也和 (n − 1)(1/R₁ − 1/R₂) 算出來的不同：厚透鏡焦距 1/f = (n − 1)[1/R₁ − 1/R₂ + (n − 1)t ÷ (n R₁ R₂)]。<br><b>球面像差</b>：球面對離軸遠的光偏折太多，遠軸光比近軸光更早交會，所以平行光聚不成一個點。<br><b>球面 vs 拋物面</b>：兩者在中心的彎曲程度（頂點曲率）相同，所以近軸光的焦點幾乎一樣；但球面愈往邊緣愈彎，拋物面比較平緩，遠軸光偏折得比較少，像差就變小。注意：雙凸的拋物面透鏡也不是完美的，要讓平行光精確聚成一點，透鏡表面要做成特定的非球面（例如雙曲面）；相機鏡頭就是用非球面或多片透鏡來修正。<br>這裡沒有考慮色散，所有光線都用同一個折射率。'
                : p.mode === 'double'
                ? '<b>逐次成像</b>：先用透鏡 1 求出中間像 I₁（1/p₁ + 1/q₁ = 1/f₁），I₁ 就是透鏡 2 的物，物距 p₂ = d − q₁；再由 1/p₂ + 1/q₂ = 1/f₂ 求出最後的像。<br><b>虛物</b>：若 I₁ 落在透鏡 2 後面（q₁ > d），p₂ 為負，光在還沒會聚成 I₁ 之前就被透鏡 2 攔下。<br><b>總放大率</b>：m = m₁ × m₂。<br>圖中的光線是真的光：每條光線在兩個透鏡各折射一次，最後交在（或反向延長交在）最終的像上。'
                : p.mode === 'conj'
                ? '<b>共軛成像</b>：物屏距離 L 固定時，透鏡在兩個位置都能在屏幕上成清晰的實像，一個放大、一個縮小。兩個位置的物距和像距正好互換（p₁ = q₂、q₁ = p₂），所以兩次的放大率互為倒數（m₁·m₂ = 1）。<br><b>什麼時候找得到</b>：L 要大於 4f 才有兩個位置；L = 4f 時兩個位置合成一個（p = q = 2f，等大倒立）；L 小於 4f 時怎麼移都不清楚。<br><b>測焦距（貝索法）</b>：量出兩個位置的距離 d，焦距 f = (L² − d²) ÷ 4L。'
                : '本實驗採實物：凸透鏡物距大於焦距時成倒立實像、小於焦距時成正立放大虛像；物在焦點時出射平行光。凹透鏡成正立縮小虛像。<br><b>虛像怎麼找</b>：折射後的光不會真的交在一起，把每一條折射光往回延長（虛線），延長線交在同一點，就是虛像。<br><b>三條光線</b>：① 平行主軸入射 → 凸透鏡折射後通過另一側焦點；凹透鏡折射後好像從同側焦點發出。② 通過鏡心，方向不變。③ 凸透鏡：通過（或來自）同側焦點方向的光，折射後平行主軸；凹透鏡：瞄準另一側焦點的光，折射後平行主軸。<br>符號法則：凸透鏡 f 取正、凹透鏡 f 取負；q > 0 為鏡後實像、q < 0 為鏡前虛像；m = −q/p，m > 0 正立、m < 0 倒立。',
            // 景深模式在窄螢幕上下排光路圖與照片，畫布要高一些
            height: (p, w) => p.mode === 'dof' ? (w < 640 ? 1190 : 600) : p.mode === 'conj' ? 500 : 420,
            modes: [
                { key: 'convex', label: '凸透鏡（f > 0）' },
                { key: 'concave', label: '凹透鏡（f < 0）' },
                { key: 'conj', label: '共軛成像：移動透鏡找清晰的像' },
                { key: 'double', label: '雙透鏡組' },
                { key: 'thick', label: '厚透鏡：實際光路' },
                { key: 'dof', label: '光圈與景深' }
            ],
            controls: [
                { key: 'p', label: '物距 p (cm)', min: 4, max: 60, step: 1, value: 30, only: ['convex', 'concave', 'double', 'thick'], showIf: (p) => p.mode !== 'thick' || p.src === 'object', fmt: (v, p) => `${v} cm${p.mode === 'double' ? '（到透鏡 1）' : p.mode === 'thick' ? '（到透鏡中心）' : ''}` },
                { key: 'lt', label: '透鏡形狀', value: 'convex', only: ['thick'], fmt: () => '', options: [
                    { value: 'convex', label: '雙凸（凸透鏡）' }, { value: 'pconvex', label: '平凸（凸透鏡）' }, { value: 'mconvex', label: '凹凸（凸透鏡，中央厚）' },
                    { value: 'concave', label: '雙凹（凹透鏡）' }, { value: 'pconcave', label: '平凹（凹透鏡）' }, { value: 'mconcave', label: '凸凹（凹透鏡，邊緣厚）' }] },
                { key: 'src', label: '光源', value: 'object', only: ['thick'], fmt: () => '', options: [{ value: 'object', label: '物體（看成像）' }, { value: 'parallel', label: '遠處的平行光（看焦點）' }] },
                { key: 'tt', label: '中心厚度 t (cm)', min: 1, max: 10, step: 0.5, value: 4, only: ['thick'], fmt: (v) => `${v} cm` },
                { key: 'rr', label: '前表面曲率半徑 |R₁| (cm)', min: 8, max: 40, step: 1, value: 12, only: ['thick'], fmt: (v) => `${v} cm` },
                { key: 'rr2', label: '後表面曲率半徑 |R₂| (cm)', min: 8, max: 40, step: 1, value: 24, only: ['thick'], showIf: (p) => p.lt !== 'pconvex' && p.lt !== 'pconcave', fmt: (v) => `${v} cm` },
                { key: 'nl', label: '透鏡折射率 n', min: 1.3, max: 1.9, step: 0.01, value: 1.5, only: ['thick'], fmt: (v) => Number(v).toFixed(2) },
                { key: 'nr', label: '光線數', min: 3, max: 21, step: 2, value: 11, only: ['thick'], fmt: (v) => `${v} 條` },
                { key: 'surf', label: '表面形狀', value: 'sphere', only: ['thick'], fmt: () => '', options: [{ value: 'sphere', label: '球面（圓）' }, { value: 'parabola', label: '拋物面' }, { value: 'both', label: '球面 vs 拋物面（疊在一起比較）' }] },
                { key: 'zone', label: '看哪些光', value: 'all', only: ['thick'], fmt: () => '', options: [{ value: 'all', label: '全部' }, { value: 'near', label: '只看近軸光（靠近主軸）' }, { value: 'far', label: '只看遠軸光（靠近邊緣）' }] },
                { key: 'ideal', label: '薄透鏡公式的光路（對照）', type: 'checkbox', value: false, only: ['thick'] },
                { key: 'fn', label: '光圈（f 數）', value: 2.8, only: ['dof'], fmt: () => '', options: [1.4, 2, 2.8, 4, 5.6, 8, 11, 16].map((v) => ({ value: v, label: `f/${v}${v <= 2 ? '（大光圈）' : v >= 11 ? '（小光圈）' : ''}` })) },
                { key: 'fd', label: '對焦距離 (cm)', min: 15, max: 150, step: 1, value: 45, only: ['dof'], fmt: (v) => `${v} cm` },
                { key: 'sp', label: '光圈位置', value: 'front', only: ['dof'], fmt: () => '', options: [{ value: 'front', label: '透鏡前' }, { value: 'back', label: '透鏡後' }] },
                { key: 'l1', label: '透鏡 1', value: 'convex', only: ['double'], fmt: () => '', options: [{ value: 'convex', label: '凸透鏡' }, { value: 'concave', label: '凹透鏡' }] },
                { key: 'l2', label: '透鏡 2', value: 'convex', only: ['double'], fmt: () => '', options: [{ value: 'convex', label: '凸透鏡' }, { value: 'concave', label: '凹透鏡' }] },
                { key: 'f2', label: '透鏡 2 焦距 |f₂| (cm)', min: 5, max: 20, step: 1, value: 10, only: ['double'], fmt: (v) => `${v} cm` },
                { key: 'dd', label: '兩透鏡間距 d (cm)', min: 8, max: 50, step: 1, value: 40, only: ['double'], fmt: (v) => `${v} cm` },
                { key: 'L', label: '物體到屏幕的距離 L (cm)', min: 30, max: 100, step: 1, value: 70, only: ['conj'], fmt: (v) => `${v} cm` },
                { key: 'x', label: '透鏡位置＝物距 p (cm)', min: 2, max: 98, step: 0.1, value: 20, only: ['conj'], fmt: (v, p) => `${+Math.min(Number(v), p.L - 2).toFixed(1)} cm` },
                { key: 'f', label: '焦距 |f| (cm)', min: 5, max: 20, step: 1, value: 12, only: ['convex', 'concave', 'conj', 'double'], fmt: (v, p) => `${v} cm${p.mode === 'double' ? '（透鏡 1）' : ''}` },
                { key: 'ho', label: '物高 (cm)', min: 2, max: 10, step: 1, value: 6, only: ['convex', 'concave', 'conj', 'double', 'thick'], showIf: (p) => p.mode !== 'thick' || p.src === 'object', fmt: (v) => `${v} cm` },
                { key: 'r1', label: '光線①：平行主軸入射', type: 'checkbox', value: false, only: ['convex', 'concave', 'conj', 'double'] },
                { key: 'r2', label: '光線②：通過鏡心', type: 'checkbox', value: false, only: ['convex', 'concave', 'conj', 'double'] },
                { key: 'r3', label: '光線③：通過焦點方向', type: 'checkbox', value: false, only: ['convex', 'concave', 'conj', 'double'] },
                { key: 'mid', label: '中間像 I₁（透鏡 1 成的像）', type: 'checkbox', value: false, only: ['double'] },
                { key: 'ext', label: '反向延長線（找虛像用）', type: 'checkbox', value: false, only: ['convex', 'concave', 'double'] },
                { key: 'show', label: '顯示像與讀數（對答案）', type: 'checkbox', value: false, only: ['convex', 'concave', 'conj', 'double', 'thick'] }
            ],
            extraButtons: [
                { action: 'record', label: '📍 記錄這個位置', onClick: (p, api) => { LABS.lens.record(p); api.syncOutputs(); api.paint(); } },
                { action: 'clearRec', label: '清除記錄', onClick: (p, api) => { p._rec = []; p._recMsg = ''; api.syncOutputs(); api.paint(); } }
            ],
            setup: ({ host, params, disposers, syncOutputs, paint }) => {
                const btns = ['record', 'clearRec'].map((a) => host.querySelector(`[data-action="${a}"]`));
                const sync = () => btns.forEach((b) => { if (b) b.style.display = params.mode === 'conj' ? '' : 'none'; });
                host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', sync));
                sync();
                /* 透鏡位置的滑桿最大值跟著 L 走（透鏡不能超過屏幕），滑桿拉到底就是貼近屏幕，不會有拉了卻不動的一段 */
                const xIn = host.querySelector('input[type="range"][id$="-x"]'), lIn = host.querySelector('input[type="range"][id$="-L"]');
                const fitX = () => {
                    if (!xIn) return;
                    const max = Number(params.L) - 2;
                    xIn.max = max;
                    if (Number(params.x) > max) { params.x = max; xIn.value = max; if (syncOutputs) syncOutputs(); if (paint) paint(); }
                };
                if (lIn) disposers.addEventListener(lIn, 'input', fitX);
                disposers.addEventListener(host, 'click', () => setTimeout(fitX, 0));   // 回到預設值、切換模式後也重新套用
                fitX();
            },
            /* 共軛成像的幾何：物在 0、屏幕在 L、透鏡在 x；像距 q 由 1/p + 1/q = 1/f */
            conj: (p) => {
                const L = Number(p.L), x = Math.min(Number(p.x), L - 2), f = Number(p.f);
                const q = Math.abs(x - f) < 1e-6 ? Infinity : 1 / (1 / f - 1 / x);
                const s = L - x;
                // 用失焦程度 |1/q − 1/s| 判斷清不清楚：透鏡靠近物體時像距變化很快，用像距差會太嚴格
                /* 清晰的條件：透鏡離「精確的共軛位置」（x² − Lx + Lf = 0 的根）不到 0.15 cm。
                 * 用透鏡位置判斷，兩個位置的容許範圍一樣寬，滑桿每格 0.1 cm 一定找得到；
                 * 記錄下來的 p₁、q₂（以及 q₁、p₂）也就真的幾乎相等。 */
                const disc = L * L - 4 * L * f;
                const roots = disc >= 0 ? [(L - Math.sqrt(disc)) / 2, (L + Math.sqrt(disc)) / 2] : [];
                const near = roots.length ? Math.min(...roots.map((r) => Math.abs(x - r))) : Infinity;
                if (q > 0 && near <= 0.15) {
                    /* 對準了：把透鏡吸到精確的共軛位置，p、q 正好滿足 1/p + 1/q = 1/f 且 p + q = L。
                     * 否則透鏡很靠近焦點時，差 0.1 cm 像距就差好幾十公分，讀數會和「清晰」對不起來。 */
                    const xr = roots.reduce((m, r) => (Math.abs(x - r) < Math.abs(x - m) ? r : m), roots[0]);
                    return { L, x: xr, xSet: x, f, q: L - xr, s: L - xr, roots, sharp: true, m: -(L - xr) / xr };
                }
                return { L, x, xSet: x, f, q, s, roots, sharp: false, m: -q / x };
            },
            record: (p) => {
                const g = LABS.lens.conj(p);
                p._rec = p._rec || [];
                if (!g.sharp) { p._recMsg = '屏幕上的像還不清楚，再微調透鏡位置'; return; }
                if (p._rec.some((r) => Math.abs(r.x - g.x) < 1.5)) { p._recMsg = '這個位置已經記錄過了'; return; }
                // 記下屏幕上實際成像的 p、q（q 就是透鏡到屏幕的距離），放大率也用這兩個數算，數字才對得起來
                p._rec.push({ x: g.x, q: g.s, m: -g.s / g.x, L: g.L, f: g.f });
                p._recMsg = p._rec.length === 1 ? '找到一個！還有其他位置也能成清晰的像嗎？' : '找到兩個位置了，比較它們的物距與像距';
            },
            readouts: (p) => {
                const show = !!p.show;
                if (p.mode === 'conj') {
                    const g = LABS.lens.conj(p), rec = (p._rec || []).filter((r) => r.L === g.L && r.f === g.f);
                    const state = !isFinite(g.q) ? '物在焦點上，折射光平行，屏幕上一片模糊'
                        : g.q < 0 ? '成虛像，屏幕上接不到'
                        : g.sharp ? '清晰！像剛好落在屏幕上'
                        : g.L < 4 * g.f ? '模糊：L < 4f，透鏡放哪裡都不會清楚'
                        : g.q < g.s ? '模糊：像在屏幕前面' : '模糊：像在屏幕後面';
                    const out = [
                        { label: '物距 p（物體到透鏡）', value: g.sharp ? `${g.x.toFixed(2)} cm（已對準）` : `${+g.x.toFixed(1)} cm` },
                        { label: '透鏡到屏幕 L − p', value: `${g.s.toFixed(g.sharp ? 2 : 1)} cm` },
                        { label: '屏幕上的像', value: state },
                        { label: '像距 q（由 1/p + 1/q = 1/f 算）', value: show ? (isFinite(g.q) ? `${g.q.toFixed(g.sharp ? 2 : 1)} cm${g.sharp ? '（≈ L − p，所以像落在屏幕上）' : g.q > 0 ? `（和 L − p 差 ${Math.abs(g.q - g.s).toFixed(1)} cm）` : ''}` : '無窮遠') : '？勾「顯示像與讀數」' }
                    ];
                    rec.forEach((r, i) => out.push({ label: `記錄 ${i + 1}`, value: `p = ${r.x.toFixed(2)} cm、q = ${r.q.toFixed(2)} cm、m = ${r.m.toFixed(2)}` }));
                    if (rec.length >= 2) {
                        const [a, b] = rec;
                        out.push({ label: '比較兩個位置', value: `p₁ = ${a.x.toFixed(2)} 與 q₂ = ${b.q.toFixed(2)}；q₁ = ${a.q.toFixed(2)} 與 p₂ = ${b.x.toFixed(2)}；m₁ × m₂ = ${(a.m * b.m).toFixed(2)}` });
                    }
                    if (p._recMsg) out.push({ label: '記錄', value: p._recMsg });
                    return out;
                }
                if (p.mode === 'dof') {
                    const g = LABS.lens.dof(p), mm = (c) => `${(c * 10).toFixed(2)} mm`;
                    const fmtU = (u) => isFinite(u) ? `${u.toFixed(0)} cm` : '無限遠';
                    return [
                        { label: '光圈', value: `f/${g.N}，口徑 D = ${g.D.toFixed(2)} cm（焦距 ${g.f} cm）` },
                        ...g.objs.map((o) => ({ label: `${o.name}（${o.u} cm）的模糊圈`, value: `${mm(o.c)}${o.c <= g.c0 ? '（清楚）' : '（模糊）'}` })),
                        { label: '景深（看起來清楚的範圍）', value: `${fmtU(g.near)} ～ ${fmtU(g.far)}` }
                    ];
                }
                if (p.mode === 'thick') {
                    const L = LABS.lens, n = Number(p.nl), k0 = L.thickLens(p, 'sphere');
                    const fThin = 1 / ((n - 1) * (1 / k0.R1 - 1 / k0.R2));
                    const fThick = 1 / ((n - 1) * (1 / k0.R1 - 1 / k0.R2 + (n - 1) * k0.t / (n * k0.R1 * k0.R2)));
                    const rTxt = (R) => isFinite(R) ? `${R > 0 ? '+' : '−'}${Math.abs(R)}` : '∞';
                    const inv = (R) => isFinite(R) ? `1/(${rTxt(R)})` : '1/∞';
                    const head = [{ label: `${L.shapeName(p)}透鏡的曲率半徑`, value: `R₁ = ${rTxt(k0.R1)}${isFinite(k0.R1) ? ' cm' : '（平面）'}、R₂ = ${rTxt(k0.R2)}${isFinite(k0.R2) ? ' cm' : '（平面）'}（曲率中心在右邊為正）` }];
                    if (!show) return head.concat([{ label: '造鏡者公式算出的焦距', value: '？自己代入 1/f = (n − 1)(1/R₁ − 1/R₂)，再勾「顯示像與讀數」' }]);
                    head.push({ label: '造鏡者公式（薄透鏡）', value: `1/f = (${(n - 1).toFixed(2)})[${inv(k0.R1)} − ${inv(k0.R2)}] → f = ${isFinite(fThin) ? fThin.toFixed(2) + ' cm' : '∞'}（${fThin > 0 ? '會聚' : '發散'}）` });
                    const shapes = p.surf === 'both' ? ['sphere', 'parabola'] : [p.surf === 'parabola' ? 'parabola' : 'sphere'];
                    const name = { sphere: '球面', parabola: '拋物面' }, out = [];
                    if (p.src === 'object') {
                        const pp = Math.max(Number(p.p), k0.t / 2 + 1), ho = Number(p.ho), qT = 1 / (1 / fThin - 1 / pp), mT = -qT / pp;
                        const where = (x) => `透鏡中心${x >= 0 ? '後' : '前'} ${Math.abs(x).toFixed(1)} cm`;
                        out.push({ label: '薄透鏡公式的像', value: `${where(qT)}，像高 ${(mT * ho).toFixed(2)} cm` });
                        shapes.forEach((sh) => {
                            const S = L.thickSummary(p, sh), im = S.im;
                            out.push({ label: `${name[sh]}：近軸光的像`, value: im ? `${where(im.x)}，像高 ${im.y.toFixed(2)} cm（${im.virtual ? '虛像' : '實像'}）` : '光線射不出透鏡' });
                            out.push({ label: `${name[sh]}：遠軸光交在`, value: im && im.edge ? `近軸像${im.edge.x < im.x ? '之前' : '之後'} ${Math.abs(im.edge.x - im.x).toFixed(2)} cm` : '—' });
                        });
                    } else {
                        const fmtX = (c) => c === 'tir' ? '在透鏡內全反射，射不出來' : c === null ? '射出後平行主軸' :
                            `透鏡後表面${c.x - k0.t / 2 >= 0 ? '後' : '前'} ${Math.abs(c.x - k0.t / 2).toFixed(2)} cm${c.virtual ? '（反向延長）' : ''}`;
                        shapes.forEach((sh) => {
                            const S = L.thickSummary(p, sh);
                            out.push({ label: `${name[sh]}：近軸焦點`, value: fmtX(S.par) });
                            out.push({ label: `${name[sh]}：遠軸交點`, value: fmtX(S.mar) });
                            out.push({ label: `${name[sh]}：球面像差（相差）`, value: S.sa != null ? `${S.sa.toFixed(2)} cm` : '—' });
                        });
                    }
                    out.push({ label: '加上厚度修正項 (n−1)²t ÷ (n R₁R₂) 的焦距', value: `${fThick.toFixed(2)} cm` });
                    return head.concat(out);
                }
                if (p.mode === 'double') {
                    const g = LABS.lens.double(p);
                    if (!show) return [{ label: '中間像 I₁', value: '？' }, { label: '最後的像', value: '？' }, { label: '總放大率', value: '先作圖，再勾「顯示像與讀數」對答案' }];
                    if (!g.ok) return [{ label: '成像', value: g.why }];
                    return [
                        { label: '中間像 I₁', value: `透鏡 1 ${g.q1 > 0 ? '後' : '前'} ${Math.abs(g.q1).toFixed(1)} cm（m₁ = ${g.m1.toFixed(2)}）` },
                        { label: '透鏡 2 的物距 p₂ = d − q₁', value: `${g.p2.toFixed(1)} cm${g.p2 < 0 ? '（虛物）' : ''}` },
                        { label: '最後的像', value: `透鏡 2 ${g.q2 > 0 ? '後' : '前'} ${Math.abs(g.q2).toFixed(1)} cm（${g.q2 > 0 ? '實像' : '虛像'}）` },
                        { label: '總放大率 m = m₁ × m₂', value: `${g.m.toFixed(2)}（${g.m > 0 ? '正立' : '倒立'}${Math.abs(g.m) > 1 ? '放大' : '縮小'}）` }
                    ];
                }
                const f = p.mode === 'concave' ? -p.f : p.f;
                if (!show) return [{ label: '像距 q', value: '？' }, { label: '放大率 m', value: '？' }, { label: '成像性質', value: '先作圖，再勾「顯示像與讀數」對答案' }];
                if (Math.abs(p.p - f) < 1e-6) return [
                    { label: '像距 q', value: '無窮遠' }, { label: '放大率 m', value: '—' },
                    { label: '成像性質', value: '折射光平行，無法成像' }, { label: '焦距 f', value: `${f} cm` }];
                const q = 1 / (1 / f - 1 / p.p);
                const m = -q / p.p;
                const kind = `${m > 0 ? '正立' : '倒立'}${Math.abs(m) > 1 ? '放大' : (Math.abs(m) < 1 ? '縮小' : '等大')}${q > 0 ? '實像' : '虛像'}`;
                return [
                    { label: '像距 q', value: `${q.toFixed(1)} cm（${q > 0 ? '鏡後' : '鏡前'}）` },
                    { label: '放大率 m', value: m.toFixed(2) },
                    { label: '像高', value: `${(m * p.ho).toFixed(1)} cm` },
                    { label: '成像性質', value: kind }
                ];
            },
            vScaleOf: (axisY, top) => Math.min(8, (axisY - top - 10) / (LABS.lens.controls.find((c) => c.key === 'ho').max * 1.6)),
            // 透鏡畫得比最大物高再高一些，平行主軸入射的光線才一定打在透鏡上
            lensHalf: (axisY, top, vScale) => Math.min(axisY - top - 4, LABS.lens.controls.find((c) => c.key === 'ho').max * vScale * 1.35),
            lensShape: (ctx, x, axisY, H, concave, alpha) => {
                ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = C.blue; ctx.lineWidth = 2.4; ctx.beginPath();
                if (!concave) {
                    ctx.moveTo(x, axisY - H); ctx.quadraticCurveTo(x + 16, axisY, x, axisY + H);
                    ctx.moveTo(x, axisY - H); ctx.quadraticCurveTo(x - 16, axisY, x, axisY + H);
                } else {
                    ctx.moveTo(x - 9, axisY - H); ctx.quadraticCurveTo(x + 5, axisY, x - 9, axisY + H);
                    ctx.moveTo(x + 9, axisY - H); ctx.quadraticCurveTo(x - 5, axisY, x + 9, axisY + H);
                    ctx.moveTo(x - 9, axisY - H); ctx.lineTo(x + 9, axisY - H);
                    ctx.moveTo(x - 9, axisY + H); ctx.lineTo(x + 9, axisY + H);
                }
                ctx.stroke(); ctx.restore();
            },
            /* 雙透鏡：透鏡 1 在 0、透鏡 2 在 d；f 有正負號 */
            double: (p) => {
                const f1 = (p.l1 === 'concave' ? -1 : 1) * Number(p.f), f2 = (p.l2 === 'concave' ? -1 : 1) * Number(p.f2);
                const p1 = Number(p.p), d = Number(p.dd);
                if (Math.abs(p1 - f1) < 1e-6) return { ok: false, f1, f2, d, p1, why: '物在透鏡 1 的焦點上，透鏡 1 射出平行光' };
                const q1 = 1 / (1 / f1 - 1 / p1), m1 = -q1 / p1, p2 = d - q1;
                if (Math.abs(p2 - f2) < 1e-6) return { ok: false, f1, f2, d, p1, q1, m1, p2, why: '中間像在透鏡 2 的焦點上，最後射出平行光' };
                const q2 = 1 / (1 / f2 - 1 / p2), m2 = -q2 / p2;
                return { ok: true, f1, f2, d, p1, q1, m1, p2, q2, m2, m: m1 * m2 };
            },
            /* 厚透鏡：中心在 x = 0，前頂點 −t/2、後頂點 +t/2；R₁、R₂ 帶正負號（曲率中心在頂點右邊為正）。
             * 表面可以是球面，或「頂點曲率相同」的拋物面 x = v + y²/(2R)。
             * 口徑 a 取「球面透鏡邊緣還留 0.3 cm 厚」的高度（兩種表面用同一個口徑，才好比較），並限制在 0.85R 與畫面內。 */
            /* 六種透鏡的 R₁、R₂（光由左往右，曲率中心在表面右邊為正，平面為 ∞）：
             * 雙凸 (+, −)、平凸 (+, ∞)、凹凸 (+, +，前面較彎)、雙凹 (−, +)、平凹 (−, ∞)、凸凹 (+, +，後面較彎) */
            radii: (p) => {
                const r1 = Number(p.rr), r2 = Number(p.rr2), lo = Math.min(r1, r2), hi = Math.max(r1, r2) + (r1 === r2 ? 4 : 0);
                return ({
                    convex: [r1, -r2], pconvex: [r1, Infinity], mconvex: [lo, hi],
                    concave: [-r1, r2], pconcave: [-r1, Infinity], mconcave: [hi, lo]
                })[p.lt] || [r1, -r2];
            },
            thickLens: (p, shape) => {
                const L = LABS.lens, t = Number(p.tt), [R1, R2] = L.radii(p);
                const k = { t, R1, R2, a: 0, v1: -t / 2, v2: t / 2, c1: -t / 2 + R1, c2: t / 2 + R2, shape: 'sphere' };
                // 口徑：用球面算出「邊緣厚度還留 0.3 cm」的最大高度，並限制在 0.85 倍較小半徑、畫面內（兩種表面共用）
                const finite = [R1, R2].filter(isFinite).map(Math.abs);
                let a = Math.min(11, 0.85 * Math.min(...finite));
                while (a > 0.3 && L.surfX({ ...k, a }, 2, a) - L.surfX({ ...k, a }, 1, a) < 0.3) a -= 0.05;
                k.a = Math.max(0.3, a);
                k.shape = shape || (p.surf === 'parabola' ? 'parabola' : 'sphere');
                return k;
            },
            shapeName: (p) => ({ convex: '雙凸', pconvex: '平凸', mconvex: '凹凸', concave: '雙凹', pconcave: '平凹', mconcave: '凸凹' })[p.lt] || '雙凸',
            // 第 i 面（1 前、2 後）在高度 y 的 x 座標
            surfX: (k, i, y) => {
                const v = i === 1 ? k.v1 : k.v2, R = i === 1 ? k.R1 : k.R2, c = i === 1 ? k.c1 : k.c2;
                if (!isFinite(R)) return v;   // 平面
                return k.shape === 'parabola' ? v + y * y / (2 * R) : c - Math.sign(R) * Math.sqrt(Math.max(0, R * R - y * y));
            },
            /* 精確光線追跡：起點 P、方向 d，依序在前、後表面用司乃耳定律折射；回傳折點與出射方向（全反射或打不到則回傳 null） */
            thickTrace: (k, n, P, d) => {
                const L = LABS.lens;
                const hit = (P, d, i) => {
                    const v = i === 1 ? k.v1 : k.v2, R = i === 1 ? k.R1 : k.R2, c = i === 1 ? k.c1 : k.c2;
                    let roots;
                    if (!isFinite(R)) roots = [(v - P[0]) / d[0]];   // 平面 x = v
                    else if (k.shape === 'parabola') {   // P.x + s·dx = v + (P.y + s·dy)² / (2R)
                        const A = d[1] * d[1] / (2 * R), B = P[1] * d[1] / R - d[0], Cc = P[1] * P[1] / (2 * R) + v - P[0];
                        if (Math.abs(A) < 1e-12) roots = [-Cc / B];
                        else { const disc = B * B - 4 * A * Cc; if (disc < 0) return null; roots = [(-B - Math.sqrt(disc)) / (2 * A), (-B + Math.sqrt(disc)) / (2 * A)]; }
                    } else {
                        const ox = P[0] - c, oy = P[1], b = ox * d[0] + oy * d[1], cc = ox * ox + oy * oy - R * R, disc = b * b - cc;
                        if (disc < 0) return null;
                        roots = [-b - Math.sqrt(disc), -b + Math.sqrt(disc)];
                    }
                    const cand = roots.filter((s) => s > 1e-7).sort((x, y) => x - y)
                        .map((s) => [P[0] + s * d[0], P[1] + s * d[1]])
                        .filter((q) => Math.abs(q[1]) <= k.a + 1e-6 && Math.abs(q[0] - L.surfX(k, i, q[1])) < 1e-4 * (1 + (isFinite(R) ? Math.abs(R) : 0)));
                    return cand.length ? cand[0] : null;
                };
                const normal = (q, i) => {
                    const R = i === 1 ? k.R1 : k.R2, c = i === 1 ? k.c1 : k.c2;
                    const N = !isFinite(R) ? [1, 0] : k.shape === 'parabola' ? [1, -q[1] / R] : [q[0] - c, q[1]];
                    const l = Math.hypot(N[0], N[1]); return [N[0] / l, N[1] / l];
                };
                const refract = (d, N, n1, n2) => {
                    if (N[0] * d[0] + N[1] * d[1] > 0) N = [-N[0], -N[1]];
                    const eta = n1 / n2, ci = -(N[0] * d[0] + N[1] * d[1]), kk = 1 - eta * eta * (1 - ci * ci);
                    if (kk < 0) return null;
                    const tt = eta * ci - Math.sqrt(kk);
                    return [eta * d[0] + tt * N[0], eta * d[1] + tt * N[1]];
                };
                const q1 = hit(P, d, 1); if (!q1) return null;
                const d1 = refract(d, normal(q1, 1), 1, n); if (!d1) return null;
                const q2 = hit(q1, d1, 2); if (!q2) return null;
                const d2 = refract(d1, normal(q2, 2), n, 1); if (!d2) return null;
                return { q1, q2, d2 };
            },
            // 入射光：平行光從左邊、高度 y；物體模式從箭頭尖端射向前表面高度 y 的地方
            thickIncoming: (p, k, y) => {
                if (p.src !== 'object') return { P: [-200, y], d: [1, 0] };
                const ox = -Math.max(Number(p.p), k.t / 2 + 1), oy = Number(p.ho), tx = LABS.lens.surfX(k, 1, y);
                const dx = tx - ox, dy = y - oy, l = Math.hypot(dx, dy);
                return { P: [ox, oy], d: [dx / l, dy / l] };
            },
            // 近軸光、遠軸光的範圍（以口徑 a 的比例表示）
            zoneNear: 0.25, zoneFar: 0.6,
            /* 平行光模式：某高度的光線出射後和主軸的交點 { x, virtual }；發散時取反向延長線（virtual）。
             * 全反射射不出來回傳 'tir'，平行主軸射出回傳 null */
            thickCross: (p, k, y) => {
                const L = LABS.lens, inc = L.thickIncoming(p, k, y), tr = L.thickTrace(k, Number(p.nl), inc.P, inc.d);
                if (!tr) return 'tir';
                if (Math.abs(tr.d2[1]) < 1e-12) return null;
                const s = -tr.q2[1] / tr.d2[1];
                return { x: tr.q2[0] + s * tr.d2[0], virtual: s < 0 };
            },
            // 「遠軸光」：從 0.85 倍口徑往內找，第一條射得出來的光
            thickEdge: (p, k) => {
                for (let f = 0.85; f > 0.05; f -= 0.05) { const c = LABS.lens.thickCross(p, k, f * k.a); if (c !== 'tir') return c; }
                return 'tir';
            },
            /* 物體模式：尖端射出、打在前表面中心附近的兩條光線，出射後的交點就是近軸光形成的像；
             * 遠軸光（最外側射得出來的光）和近軸光的交點，看光聚不成一點的程度 */
            thickImage: (p, k) => {
                const L = LABS.lens, n = Number(p.nl), pp = Math.max(Number(p.p), k.t / 2 + 1), ho = Number(p.ho);
                const yc = ho * (k.t / 2) / pp, dy = 0.02 * k.a;
                const exitOf = (y) => { const inc = L.thickIncoming(p, k, y); return L.thickTrace(k, n, inc.P, inc.d); };
                const meet = (A, B) => {
                    const den = A.d2[0] * B.d2[1] - A.d2[1] * B.d2[0];
                    if (Math.abs(den) < 1e-12) return null;
                    const s = ((B.q2[0] - A.q2[0]) * B.d2[1] - (B.q2[1] - A.q2[1]) * B.d2[0]) / den;
                    return { x: A.q2[0] + s * A.d2[0], y: A.q2[1] + s * A.d2[1], virtual: s < 0 };
                };
                const a = exitOf(yc - dy), b = exitOf(yc + dy);
                if (!a || !b) return null;
                const img = meet(a, b);
                if (!img) return null;
                let edge = null;
                for (let f = 0.85; f > 0.1 && !edge; f -= 0.05) { const e = exitOf(f * k.a); if (e) edge = meet(e, a); }
                return { ...img, edge };
            },
            // 某種表面形狀的球面像差摘要（給讀數用）
            thickSummary: (p, shape) => {
                const L = LABS.lens, k = L.thickLens(p, shape);
                if (p.src === 'object') {
                    const im = L.thickImage(p, k);
                    return { k, im, sa: im && im.edge ? Math.abs(im.edge.x - im.x) : null };
                }
                const par = L.thickCross(p, k, 0.002), mar = L.thickEdge(p, k);
                return { k, par, mar, sa: par && par.x !== undefined && mar && mar.x !== undefined ? Math.abs(par.x - mar.x) : null };
            },
            drawThick: (ctx, w, h, p) => {
                const L = LABS.lens, n = Number(p.nl), both = p.surf === 'both';
                const k = L.thickLens(p, both ? 'sphere' : undefined), kp = both ? L.thickLens(p, 'parabola') : null;
                const axisY = h * 0.5, top = 32, bottom = h - 64;
                // 等比例（x、y 同一個比例尺），透鏡形狀才不會變形；左右範圍固定
                const left = p.src === 'object' ? 64 : 30, right = 60;
                const scale = Math.min((w - 28) / (left + right), (bottom - top) / 26);
                const sx = (x) => 14 + (x + left) * scale, sy = (y) => axisY - y * scale;
                axis(ctx, 12, axisY, w - 12, axisY);
                label(ctx, '主軸', w - 40, axisY - 8, C.muted, 10);
                // 透鏡本體
                const outline = (kk, fill, stroke, dash) => {
                    const N = 60; ctx.beginPath();
                    for (let i = 0; i <= N; i++) { const y = -kk.a + 2 * kk.a * i / N, x = L.surfX(kk, 1, y); if (i) ctx.lineTo(sx(x), sy(y)); else ctx.moveTo(sx(x), sy(y)); }
                    for (let i = N; i >= 0; i--) { const y = -kk.a + 2 * kk.a * i / N; ctx.lineTo(sx(L.surfX(kk, 2, y)), sy(y)); }
                    ctx.closePath();
                    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
                    ctx.save(); if (dash) ctx.setLineDash(dash); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
                };
                outline(k, 'rgba(150,205,225,0.35)', C.blue);
                if (both) outline(kp, null, C.green, [5, 3]);
                const clip = (fn) => { ctx.save(); ctx.beginPath(); ctx.rect(6, top, w - 12, bottom - top); ctx.clip(); fn(); ctx.restore(); };
                const fThin = 1 / ((n - 1) * (1 / k.R1 - 1 / k.R2));
                const nr = Number(p.nr), zNear = L.zoneNear * k.a, zFar = L.zoneFar * k.a;
                const inZone = (y) => p.zone === 'near' ? Math.abs(y) <= zNear + 1e-9 : p.zone === 'far' ? Math.abs(y) >= zFar - 1e-9 : true;
                // 光線高度：全部時均勻分布；只看近軸／遠軸時在該範圍內均勻分布
                const ys = (() => {
                    const lo = p.zone === 'far' ? zFar : 0, hi = p.zone === 'near' ? zNear : 0.9 * k.a, half = Math.max(1, Math.floor(nr / 2));
                    const arr = p.zone === 'far' ? [] : [0];
                    for (let i = 1; i <= half; i++) { const y = p.zone === 'far' ? lo + (hi - lo) * (i - 1) / Math.max(1, half - 1) : hi * i / half; arr.push(y, -y); }
                    return arr.filter(inZone);
                })();
                const farX = right + 5, nearX = -left - 5;
                // 對照：薄透鏡公式（光在中心 x = 0 一次彎折，u′ = u − y/f）
                if (p.ideal) clip(() => {
                    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(125,148,156,0.9)';
                    ys.forEach((y) => {
                        const inc = L.thickIncoming(p, k, y), u = inc.d[1] / inc.d[0];
                        const y0 = inc.P[1] + u * (0 - inc.P[0]), u2 = u - y0 / fThin;
                        ctx.beginPath(); ctx.moveTo(sx(0), sy(y0)); ctx.lineTo(sx(farX), sy(y0 + u2 * farX)); ctx.stroke();
                    });
                    ctx.setLineDash([]);
                });
                // 實際光路：近軸光藍色、遠軸光紅色、中間橘色；兩種表面比較時，拋物面的光用綠色虛線
                const colorOf = (y) => Math.abs(y) <= zNear + 1e-9 ? '#1f6fd1' : Math.abs(y) >= zFar - 1e-9 ? '#d0312d' : '#c9750f';
                const drawRays = (kk, colFn, dash, wd) => clip(() => ys.forEach((y) => {
                    const inc = L.thickIncoming(p, kk, y), tr = L.thickTrace(kk, n, inc.P, inc.d);
                    ctx.save(); if (dash) ctx.setLineDash(dash);
                    ctx.strokeStyle = colFn(y); ctx.lineWidth = wd;
                    const start = inc.P[0] < nearX ? [nearX, inc.P[1] + inc.d[1] / inc.d[0] * (nearX - inc.P[0])] : inc.P;
                    if (!tr) { ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.moveTo(sx(start[0]), sy(start[1])); ctx.lineTo(sx(0), sy(start[1] + inc.d[1] / inc.d[0] * (0 - start[0]))); ctx.stroke(); ctx.restore(); return; }
                    ctx.beginPath(); ctx.moveTo(sx(start[0]), sy(start[1])); ctx.lineTo(sx(tr.q1[0]), sy(tr.q1[1]));
                    ctx.lineTo(sx(tr.q2[0]), sy(tr.q2[1]));
                    const sEnd = (farX - tr.q2[0]) / tr.d2[0];
                    ctx.lineTo(sx(farX), sy(tr.q2[1] + tr.d2[1] * sEnd)); ctx.stroke();
                    if (fThin < 0) {   // 發散的光往回延長
                        ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.55; ctx.lineWidth = 1;
                        const sb = (nearX - tr.q2[0]) / tr.d2[0];
                        ctx.beginPath(); ctx.moveTo(sx(tr.q2[0]), sy(tr.q2[1])); ctx.lineTo(sx(nearX), sy(tr.q2[1] + tr.d2[1] * sb)); ctx.stroke();
                    }
                    ctx.restore();
                }));
                drawRays(k, colorOf, null, 1.6);
                if (both) drawRays(kp, () => C.green, [6, 4], 1.3);
                // 物體或平行光標示
                if (p.src === 'object') {
                    const ox = -Math.max(Number(p.p), k.t / 2 + 1);
                    arrow(ctx, sx(ox), axisY, sx(ox), sy(Number(p.ho)), C.green, 2.8);
                    label(ctx, '物', sx(ox) - 16, sy(Number(p.ho)) + 4, C.green, 12);
                } else labelFit(ctx, '平行光 →', sx(-left) + 6, sy(k.a) - 8, '#b8860b', 11, 'left', { clampW: w, plate: 1 });
                // 答案
                if (p.show) {
                    const mark = (c, col, text, dy) => {
                        const x = c && typeof c === 'object' ? c.x : typeof c === 'number' ? c : null;
                        if (x === null || sx(x) < 8 || sx(x) > w - 8) return;
                        ctx.strokeStyle = col; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(sx(x), axisY - 7); ctx.lineTo(sx(x), axisY + 7); ctx.stroke();
                        labelFit(ctx, text, sx(x), axisY + dy, col, 10, 'center', { clampW: w, plate: 1 });
                    };
                    if (p.src === 'object') {
                        const pp = Math.max(Number(p.p), k.t / 2 + 1), ho = Number(p.ho), im = L.thickImage(p, k);
                        const imgArrow = (x, y, col, text, dashed, dy, leftSide) => {
                            if (sx(x) < 8 || sx(x) > w - 8) { labelFit(ctx, `${text}在畫面外`, x < 0 ? 10 : w - 10, axisY + dy, col, 11, x < 0 ? 'left' : 'right', { clampW: w, plate: 1 }); return; }
                            clip(() => { if (dashed) { ctx.setLineDash([4, 3]); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(x), axisY); ctx.lineTo(sx(x), sy(y)); ctx.stroke(); } else arrow(ctx, sx(x), axisY, sx(x), sy(y), col, 2.8); });
                            labelFit(ctx, text, sx(x) + (leftSide ? -8 : 8), Math.max(top + 14, Math.min(bottom - 4, sy(y) + (y > 0 ? -6 : 15))), col, 11, leftSide ? 'right' : 'left', { clampW: w, plate: 1 });
                        };
                        if (p.ideal) { const qT = 1 / (1 / fThin - 1 / pp); imgArrow(qT, -qT / pp * ho, C.muted, '薄透鏡公式的像', true, -12, true); }
                        if (im) {
                            imgArrow(im.x, im.y, im.virtual ? C.violet : C.blue, im.virtual ? '近軸光的虛像' : '近軸光的像', im.virtual, 14);
                            if (im.edge && sx(im.edge.x) > 8 && sx(im.edge.x) < w - 8) {
                                ctx.fillStyle = '#d0312d'; ctx.beginPath(); ctx.arc(sx(im.edge.x), sy(im.edge.y), 4, 0, Math.PI * 2); ctx.fill();
                                labelFit(ctx, '遠軸光交點', sx(im.edge.x), sy(im.edge.y) - 8, '#d0312d', 10, 'center', { clampW: w, plate: 1 });
                            }
                        }
                    } else {
                        mark(L.thickCross(p, k, 0.002), '#1f6fd1', '近軸焦點', 20);
                        mark(L.thickEdge(p, k), '#d0312d', '遠軸交點', -12);
                        if (both) { mark(L.thickCross(p, kp, 0.002), C.green, '拋物面近軸', 34); mark(L.thickEdge(p, kp), C.green, '拋物面遠軸', -26); }
                        if (p.ideal) mark(fThin, C.muted, '薄透鏡公式', 48);
                    }
                }
                labelWrap(ctx, `藍：近軸光　紅：遠軸光　橘：中間${both ? '　綠虛線：拋物面透鏡（頂點曲率相同）的外形與光路' : ''}${p.ideal ? '　灰虛線：薄透鏡公式' : ''}`, 14, h - 30, C.muted, 10, 13, w - 28);
                const rTxt = (R) => isFinite(R) ? `${R > 0 ? '+' : '−'}${Math.abs(R)} cm` : '∞（平面）';
                label(ctx, `${L.shapeName(p)}　R₁ = ${rTxt(k.R1)}　R₂ = ${rTxt(k.R2)}　t = ${k.t} cm　n = ${n.toFixed(2)}　表面：${both ? '球面（實線）vs 拋物面（虛線）' : k.shape === 'parabola' ? '拋物面' : '球面'}`, 14, 22, C.ink, 12);
            },
            /* 光圈與景深：焦距 f = 10 cm 的相機鏡頭（示意比例），近、中、遠三個物體。
             * 光圈（可變的圓孔）不在透鏡上，而是放在透鏡前或後 dofStop 公分處；口徑 D = f / N。
             * 感光元件放在「對焦距離」成像的位置 s；其他物體的光錐在感光元件上截出模糊圈，
             * 模糊圈大小用「穿過光圈上、下緣的兩條光」實際追跡（薄透鏡 u′ = u − y/f）求出。 */
            dofF: 10, dofSensor: 12, dofStop: 2.5,
            dofObjects: [
                { key: 'near', name: '近：花', u: 22, h: 5, col: '#d9822b' },
                { key: 'mid', name: '中：人', u: 45, h: 12, col: '#12805c' },
                { key: 'far', name: '遠：樹', u: 140, h: 30, col: '#0b6f92' }
            ],
            /* 從物點 (−u, h) 出發、穿過光圈高度 a 的光：回傳 [透鏡處高度 yL, 透鏡後斜率 u1]（光圈在 xs，前為負、後為正） */
            dofRay: (u, h, a, xs, f) => {
                if (xs <= 0) {   // 光圈在透鏡前：先穿過光圈，再到透鏡
                    const u0 = (a - h) / (xs + u), yL = a + u0 * (0 - xs);
                    return [yL, u0 - yL / f];
                }
                // 光圈在透鏡後：找一條在透鏡折射後剛好穿過光圈高度 a 的光
                const u0 = (a - h * (1 - xs / f)) / (u + xs - u * xs / f), yL = h + u0 * u;
                return [yL, u0 - yL / f];
            },
            dof: (p) => {
                const L = LABS.lens, f = L.dofF, N = Number(p.fn), D = f / N, fd = Number(p.fd);
                const xs = (p.sp === 'back' ? 1 : -1) * L.dofStop;
                const s = 1 / (1 / f - 1 / fd);
                // 物點在感光元件上的模糊圈：上、下緣兩條光在 x = s 的高度差
                const blur = (u, h) => {
                    const [y1, k1] = L.dofRay(u, h, D / 2, xs, f), [y2, k2] = L.dofRay(u, h, -D / 2, xs, f);
                    return Math.abs((y1 + k1 * s) - (y2 + k2 * s));
                };
                const objs = L.dofObjects.map((o) => ({ ...o, v: 1 / (1 / f - 1 / o.u), c: blur(o.u, o.h) }));
                // 景深：模糊圈不超過 c0（感光元件寬度的 1/150）的物距範圍（主軸上的點，二分法求邊界）
                const c0 = L.dofSensor / 150, bAxis = (u) => blur(u, 0);
                const edge = (lo, hi) => { for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if ((bAxis(m) > c0) === (bAxis(lo) > c0)) lo = m; else hi = m; } return (lo + hi) / 2; };
                const near = bAxis(f * 1.02) > c0 ? edge(f * 1.02, fd) : f;
                const far = bAxis(1e6) > c0 ? edge(fd, 1e6) : Infinity;
                return { f, N, D, fd, s, xs, objs, c0, near, far };
            },
            // 實際光圈（虹膜光圈）示意：葉片圍成的多邊形開口，隨 f 數變大而縮小
            drawIris: (ctx, cx, cy, R, N) => {
                const blades = 7, open = R * 0.86 * Math.min(1, 1.4 / N), rot = (1 - open / R) * 1.2;
                ctx.save();
                ctx.fillStyle = '#1f2528'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
                const poly = Array.from({ length: blades }, (_, i) => { const t = rot + i / blades * Math.PI * 2; return [cx + open * Math.cos(t), cy + open * Math.sin(t)]; });
                // 葉片：從開口每個角沿著邊的方向延伸到外框，畫出一片片重疊的葉片邊緣
                ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 1.5, 0, Math.PI * 2); ctx.clip();
                poly.forEach((a, i) => {
                    const b = poly[(i + 1) % blades], dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1;
                    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
                    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + dx / l * R * 2, a[1] + dy / l * R * 2);
                    ctx.lineTo(b[0] + dx / l * R * 2, b[1] + dy / l * R * 2); ctx.lineTo(b[0], b[1]); ctx.closePath(); ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + dx / l * R * 2, a[1] + dy / l * R * 2); ctx.stroke();
                });
                ctx.restore();
                // 開口：透光的部分
                const gl = ctx.createRadialGradient(cx - open * 0.3, cy - open * 0.3, 1, cx, cy, open);
                gl.addColorStop(0, '#ffffff'); gl.addColorStop(1, '#cfe6f1');
                ctx.fillStyle = gl; ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#5f6b70'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            },
            /* 「為什麼光圈會影響景深」放大圖：透鏡到感光元件之間，最模糊的那個物體（主軸上一點）的光錐，
             * 目前光圈（實線）與另一個光圈（虛線）比較；比例尺固定，換光圈時光錐真的變粗、變細。 */
            drawDofWhy: (ctx, box, g, wide) => {
                const L = LABS.lens, mm = (c) => `${(c * 10).toFixed(2)} mm`;
                ctx.fillStyle = '#ffffff'; ctx.fillRect(box.x, box.y, box.w, box.h);
                ctx.strokeStyle = 'rgba(18,49,58,0.18)'; ctx.lineWidth = 1; ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
                label(ctx, '為什麼光圈會影響景深？（放大：透鏡 → 感光元件）', box.x + 10, box.y + 18, C.ink, 12);
                const o = g.objs.reduce((m, q) => (q.c > m.c ? q : m), g.objs[0]);
                const N2 = g.N <= 8 ? g.N * 2 : g.N / 2, D2 = g.f / N2;
                // 版面：寬螢幕圖在左、文字在右；窄螢幕圖在上、文字在下
                const dx0 = box.x + 14, dx1 = wide ? box.x + box.w * 0.56 : box.x + box.w - 14;
                const dy0 = box.y + 48, dy1 = wide ? box.y + box.h - 14 : box.y + 48 + Math.min(160, box.h * 0.5);
                const xs0 = -3.5, xs1 = 32, kx = (dx1 - dx0) / (xs1 - xs0), ky = (dy1 - dy0) / 2 / 4.2, cyA = (dy0 + dy1) / 2;
                const PX = (x) => dx0 + (x - xs0) * kx, PY = (y) => cyA - y * ky;
                const clipR = wide ? box.x + box.w * 0.6 - 10 : box.x + box.w - 4;
                ctx.save(); ctx.beginPath(); ctx.rect(box.x + 2, dy0 - 18, clipR - box.x - 2, dy1 - dy0 + 30); ctx.clip();
                dashed(ctx, PX(xs0), cyA, PX(xs1), cyA, 'rgba(18,49,58,0.35)');
                // 透鏡、光圈、感光元件
                ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath();
                ctx.moveTo(PX(0), PY(4)); ctx.quadraticCurveTo(PX(0) + 8, cyA, PX(0), PY(-4));
                ctx.moveTo(PX(0), PY(4)); ctx.quadraticCurveTo(PX(0) - 8, cyA, PX(0), PY(-4)); ctx.stroke();
                ctx.fillStyle = '#3d474b';
                ctx.fillRect(PX(g.xs) - 2.5, PY(4.2), 5, PY(g.D / 2) - PY(4.2));
                ctx.fillRect(PX(g.xs) - 2.5, PY(-g.D / 2), 5, PY(-4.2) - PY(-g.D / 2));
                ctx.fillStyle = '#9aa6aa'; ctx.fillRect(PX(g.s) - 2, PY(4.1), 4, PY(-4.1) - PY(4.1));
                // 光錐：主軸上的物點，穿過光圈上、下緣
                const cone = (D, col, width, dash) => {
                    const ys = [];
                    [D / 2, -D / 2].forEach((a) => {
                        const [yL, k] = L.dofRay(o.u, 0, a, g.xs, g.f), xe = Math.max(o.v, g.s) + 1.5;
                        const yA = g.xs < 0 ? a + (yL - a) * (xs0 - g.xs) / (0 - g.xs) : yL; // 透鏡左方的入射段
                        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
                        ctx.beginPath(); ctx.moveTo(PX(xs0), PY(g.xs < 0 ? yA : yL)); ctx.lineTo(PX(0), PY(yL)); ctx.lineTo(PX(xe), PY(yL + k * xe)); ctx.stroke(); ctx.restore();
                        ys.push(yL + k * g.s);
                    });
                    return ys;
                };
                const e2 = cone(D2, 'rgba(90,100,110,0.75)', 1.3, [5, 4]);
                const e1 = cone(g.D, o.col, 2, null);
                const seg = (ys, col, wd, dx) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(PX(g.s) + dx, PY(ys[0])); ctx.lineTo(PX(g.s) + dx, PY(ys[1]) + 0.5); ctx.stroke(); ctx.lineCap = 'butt'; };
                seg(e1, o.col, 6, 0); seg(e2, '#5a646e', 4, 9);
                // 像點
                if (o.v < xs1) { ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(PX(o.v), cyA, 3.5, 0, Math.PI * 2); ctx.fill(); }
                const placed = []; placed.hMax = box.y + box.h;
                depthLabel(ctx, placed, `${o.name} 的像點（v = ${o.v.toFixed(1)} cm）`, Math.min(PX(o.v), dx1 - 4), cyA + 18, o.col, dx1 + 6, o.v > g.s ? 'right' : 'center');
                depthLabel(ctx, placed, `感光元件（s = ${g.s.toFixed(1)} cm）`, PX(g.s), PY(4.1) - 6, C.muted, dx1 + 6, 'center');
                const c2 = Math.abs(e2[0] - e2[1]), t1 = `f/${g.N} 模糊圈 ${mm(o.c)}`, t2 = `f/${N2} 模糊圈 ${mm(c2)}（虛線）`;
                ctx.font = '11px Outfit, "Noto Sans TC", sans-serif';
                const lw = Math.max(ctx.measureText(t1).width, ctx.measureText(t2).width) + 8;
                const onLeft = PX(g.s) + 16 + lw > clipR && PX(g.s) - 10 - lw > box.x + 4;
                const lx = onLeft ? PX(g.s) - 10 : Math.min(PX(g.s) + 16, clipR - lw), la = onLeft ? 'right' : 'left';
                const yTop = Math.max(dy0 + 6, PY(Math.max(...e1)) - 4), yBot = Math.min(dy1 + 4, PY(Math.min(...e1)) + 14);
                depthLabel(ctx, placed, t1, lx, yTop, o.col, clipR, la);
                depthLabel(ctx, placed, t2, lx, Math.max(yBot, yTop + 18), '#5a646e', clipR, la);
                ctx.restore();
                // 說明文字
                const tx = wide ? box.x + box.w * 0.6 : box.x + 12, tw = wide ? box.w * 0.38 : box.w - 24;
                let ty = wide ? box.y + 44 : dy1 + 24;
                const lines = [
                    [`① 沒對焦的物體（這裡是最模糊的「${o.name.split('：')[1] || o.name}」），像點不在感光元件上，光錐在感光元件上截出一段，就是模糊圈。`, C.ink],
                    ['② 相似三角形：模糊圈 c ÷ 光錐寬 D = |v − s| ÷ v，所以 c ∝ D：光圈口徑越大，同一個物體越模糊。', C.ink],
                    [`③ 光圈縮小（f 數變大，口徑 D = f ÷ N 變小）→ 光錐變細 → 模糊圈變小 → 離對焦距離更近或更遠的物體，模糊圈也小到看不出來 → 清楚的範圍（景深）變大。`, '#12805c'],
                    ['反過來，大光圈只有對焦的地方清楚，前後都糊（景深淺），適合拍人像。', C.muted]
                ];
                lines.forEach(([t, col]) => { ty += labelWrap(ctx, t, tx, ty, col, 11, 15, tw) * 15 + 6; });
            },
            drawDof: (ctx, w, h, p) => {
                const L = LABS.lens, g = L.dof(p), wide = w >= 640;
                const aw = wide ? Math.round(w * 0.58) : w, ah = wide ? h : 790;
                const bx = wide ? aw + 10 : 0, by = wide ? 0 : ah + 10, bw = wide ? w - aw - 10 : w, bh = wide ? h : h - ah - 10;
                // ── 左上：光路圖。透鏡左、右兩側各用一個「線性」比例（右側放大，模糊圈才看得清楚）：
                //    同一側的光線一定畫成直線，只在透鏡處偏折；光圈只擋光、不會讓光轉彎。
                const rh = 330, top = 34, rBot = rh - 44, vs = (rBot - top) / 23.5, axisY = top + 15 * vs;
                const lensX = Math.round(aw * 0.52), leftCm = 60, rightCm = 32;
                const k1 = (lensX - 16) / leftCm, k2 = (aw - 16 - lensX) / rightCm, ds = L.dofStop;
                const X = (x) => lensX + x * (x < 0 ? k1 : k2);
                const Y = (y) => axisY - y * vs;
                ctx.fillStyle = '#f4f7f8'; ctx.fillRect(0, 0, aw, ah);
                axis(ctx, 8, axisY, aw - 8, axisY);
                // 透鏡（整片都讓光通過）
                const lensH = 4.6, ap = g.D / 2, sxp = X(g.xs);
                ctx.strokeStyle = C.blue; ctx.lineWidth = 2.2; ctx.beginPath();
                ctx.moveTo(X(0), Y(lensH)); ctx.quadraticCurveTo(X(0) + 12, axisY, X(0), Y(-lensH));
                ctx.moveTo(X(0), Y(lensH)); ctx.quadraticCurveTo(X(0) - 12, axisY, X(0), Y(-lensH)); ctx.stroke();
                labelFit(ctx, '透鏡', X(0), Y(-lensH) + 16, C.blue, 10, 'center', { clampW: aw, plate: 1 });
                // 光圈：透鏡前（或後）的一片有圓孔的擋板
                ctx.fillStyle = '#3d474b';
                ctx.fillRect(sxp - 3, Y(lensH + 1.2), 6, Y(ap) - Y(lensH + 1.2));
                ctx.fillRect(sxp - 3, Y(-ap), 6, Y(-lensH - 1.2) - Y(-ap));
                labelFit(ctx, `光圈 f/${g.N}（孔徑 ${g.D.toFixed(2)} cm，在透鏡${g.xs < 0 ? '前' : '後'} ${ds} cm）`, sxp, Y(-lensH - 1.2) + 30, C.ink, 11, 'center', { clampW: aw, plate: 1 });
                // 感光元件
                const sX = X(g.s);
                ctx.fillStyle = '#9aa6aa'; ctx.fillRect(sX - 2, Y(5.5), 4, Y(-5.5) - Y(5.5));
                labelFit(ctx, '感光元件', sX, Y(-5.5) + 16, C.muted, 10, 'center', { clampW: aw, plate: 1 });
                ctx.save(); ctx.beginPath(); ctx.rect(4, top, aw - 8, rBot - top + 2); ctx.clip();
                g.objs.forEach((o) => {
                    const ox = -o.u;
                    arrow(ctx, X(ox), axisY, X(ox), Y(o.h), o.col, 2.6);
                    // 穿過光圈上緣、中心、下緣的三條光：物 → 光圈 → 透鏡（光圈在後則 物 → 透鏡 → 光圈）→ 像點 → 感光元件
                    const ends = [];
                    [ap, 0, -ap].forEach((a) => {
                        const [yL, k1r] = L.dofRay(o.u, o.h, a, g.xs, g.f);
                        const xEnd = Math.max(o.v, g.s), yEnd = yL + k1r * xEnd;
                        ctx.strokeStyle = o.col; ctx.globalAlpha = a === 0 ? 0.45 : 0.85; ctx.lineWidth = a === 0 ? 1 : 1.4;
                        ctx.beginPath(); ctx.moveTo(X(ox), Y(o.h));
                        ctx.lineTo(X(0), Y(yL));                    // 物到透鏡是一條直線（光圈在前時，這條線剛好通過光圈的孔）
                        ctx.lineTo(X(xEnd), Y(yEnd)); ctx.stroke();
                        ends.push(yL + k1r * g.s);
                    });
                    ctx.globalAlpha = 1;
                    // 感光元件上的模糊圈
                    ctx.strokeStyle = o.col; ctx.lineWidth = 5; ctx.lineCap = 'round';
                    ctx.beginPath(); ctx.moveTo(sX, Y(ends[0])); ctx.lineTo(sX, Y(ends[2]) + (Math.abs(Y(ends[0]) - Y(ends[2])) < 1 ? 1 : 0)); ctx.stroke(); ctx.lineCap = 'butt';
                    if (X(ox) > 8) labelFit(ctx, o.name, X(ox) + 6, Y(o.h) - 6, o.col, 11, 'left', { clampW: aw, plate: 1 });
                });
                ctx.restore();
                // 樹在畫面外（140 cm），光線由左邊進來
                const farO = g.objs.find((o) => X(-o.u) < 8);
                if (farO) labelFit(ctx, `← ${farO.name}（${farO.u} cm，在畫面左方外）`, 10, Y(14.2), farO.col, 11, 'left', { clampW: aw, plate: 1 });
                // 實際光圈的樣子（從正面看）
                const ir = Math.min(34, rh * 0.1), icx = aw - ir - 14, icy = top + ir;
                L.drawIris(ctx, icx, icy, ir, g.N);
                labelFit(ctx, `實際的光圈（正面看）f/${g.N}`, icx, icy + ir + 16, C.ink, 10, 'center', { clampW: aw, plate: 1 });
                labelFit(ctx, '示意圖：透鏡左、右兩側比例不同（右側放大），光線只在透鏡處偏折', 12, rh - 8, C.muted, 10, 'left', { maxW: aw - 24, clampW: aw });
                label(ctx, `光路圖：對焦在 ${g.fd} cm`, 12, 20, C.ink, 12);
                L.drawDofWhy(ctx, { x: 6, y: rh + 6, w: aw - 12, h: ah - rh - 12 }, g, wide);

                // ── 右：相機拍到的照片（依模糊圈大小把物體畫糊）
                const key = `${g.N}|${g.fd}|${Math.round(bw)}x${Math.round(bh)}`;
                if (L._dofKey !== key) {
                    const W = Math.max(1, Math.round(bw)), Hh = Math.max(1, Math.round(bh));
                    const out = L._dofCanvas || (L._dofCanvas = document.createElement('canvas'));
                    out.width = W; out.height = Hh;
                    const c2 = out.getContext('2d');
                    const sky = c2.createLinearGradient(0, 0, 0, Hh);
                    sky.addColorStop(0, '#bfe1f2'); sky.addColorStop(0.62, '#e6f3f8'); sky.addColorStop(0.62, '#b9cf9b'); sky.addColorStop(1, '#8fae6e');
                    // 背景（天空、地面）本身也在遠處：用遠物的模糊程度
                    const layer = (paint) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; paint(cv.getContext('2d')); return cv; };
                    const blurPx = (c) => c / L.dofSensor * W / 2;
                    /* 模糊：瀏覽器支援 canvas filter 時用 blur()；不支援時把圖縮小再平滑放大。
                     * （不用多次半透明疊加：8 位元色彩每次都會四捨五入，疊幾十次顏色就跑掉了） */
                    c2.filter = 'blur(1px)';
                    const canFilter = c2.filter === 'blur(1px)';
                    c2.filter = 'none';
                    const composite = (src, r) => {
                        if (r < 0.6) { c2.drawImage(src, 0, 0); return; }
                        if (canFilter) { c2.filter = `blur(${(r * 0.55).toFixed(2)}px)`; c2.drawImage(src, 0, 0); c2.filter = 'none'; return; }
                        const k = Math.max(1, r / 1.5), sw = Math.max(1, Math.round(W / k)), sh = Math.max(1, Math.round(Hh / k));
                        const small = document.createElement('canvas'); small.width = sw; small.height = sh;
                        const s2 = small.getContext('2d'); s2.imageSmoothingEnabled = true; s2.imageSmoothingQuality = 'high'; s2.drawImage(src, 0, 0, sw, sh);
                        c2.imageSmoothingEnabled = true; c2.imageSmoothingQuality = 'high';
                        c2.drawImage(small, 0, 0, W, Hh);
                    };
                    const [nearO, midO, farO] = g.objs;
                    c2.fillStyle = sky; c2.fillRect(0, 0, W, Hh);   // 先鋪一層，模糊後的邊緣才不會透出白底
                    composite(layer((q) => { q.fillStyle = sky; q.fillRect(-40, -40, W + 80, Hh + 80); }), blurPx(farO.c));
                    composite(layer((q) => {   // 遠：樹
                        const x = W * 0.72, base = Hh * 0.64;
                        q.fillStyle = '#6b4a2b'; q.fillRect(x - W * 0.012, base - Hh * 0.12, W * 0.024, Hh * 0.12);
                        q.fillStyle = farO.col; q.beginPath(); q.ellipse(x, base - Hh * 0.2, W * 0.07, Hh * 0.12, 0, 0, Math.PI * 2); q.fill();
                        q.fillStyle = '#1d8a6a'; q.beginPath(); q.ellipse(x - W * 0.03, base - Hh * 0.17, W * 0.045, Hh * 0.08, 0, 0, Math.PI * 2); q.fill();
                    }), blurPx(farO.c));
                    composite(layer((q) => {   // 中：人
                        const x = W * 0.42, base = Hh * 0.78, s = Hh * 0.0042;
                        q.fillStyle = '#2b3a42'; q.fillRect(x - 9 * s, base - 30 * s, 7 * s, 30 * s); q.fillRect(x + 2 * s, base - 30 * s, 7 * s, 30 * s);
                        q.fillStyle = midO.col; q.fillRect(x - 13 * s, base - 70 * s, 26 * s, 42 * s);
                        q.fillStyle = '#f0c9a0'; q.beginPath(); q.arc(x, base - 80 * s, 10 * s, 0, Math.PI * 2); q.fill();
                        q.fillStyle = '#3b2a1e'; q.beginPath(); q.arc(x, base - 84 * s, 10 * s, Math.PI, 0); q.fill();
                    }), blurPx(midO.c));
                    composite(layer((q) => {   // 近：花
                        const x = W * 0.16, base = Hh * 1.02, s = Hh * 0.006;
                        q.strokeStyle = '#3e7d32'; q.lineWidth = 3 * s; q.beginPath(); q.moveTo(x, base); q.lineTo(x, base - 45 * s); q.stroke();
                        q.fillStyle = '#4c9a3a'; q.beginPath(); q.ellipse(x + 8 * s, base - 22 * s, 9 * s, 4 * s, -0.5, 0, Math.PI * 2); q.fill();
                        q.fillStyle = nearO.col;
                        for (let i = 0; i < 6; i++) { const t = i / 6 * Math.PI * 2; q.beginPath(); q.ellipse(x + Math.cos(t) * 9 * s, base - 50 * s + Math.sin(t) * 9 * s, 7 * s, 4.5 * s, t, 0, Math.PI * 2); q.fill(); }
                        q.fillStyle = '#f2c94c'; q.beginPath(); q.arc(x, base - 50 * s, 5 * s, 0, Math.PI * 2); q.fill();
                    }), blurPx(nearO.c));
                    L._dofKey = key;
                }
                ctx.drawImage(L._dofCanvas, bx, by, bw, bh);
                ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
                labelFit(ctx, '透鏡拍到的照片', bx + 10, by + 20, C.ink, 12, 'left', { plate: 'rgba(255,255,255,0.85)', clampW: bx + bw - 2 });
                labelFit(ctx, `f/${g.N}　對焦 ${g.fd} cm`, bx + 10, by + 40, C.ink, 11, 'left', { plate: 'rgba(255,255,255,0.85)', clampW: bx + bw - 2 });
            },
            drawDouble: (ctx, w, h, p) => {
                const L = LABS.lens, g = L.double(p), ho = Number(p.ho);
                const axisY = h * 0.5, top = 32, bottom = h - 70, vScale = L.vScaleOf(axisY, top);
                const maxOf = (k) => L.controls.find((c) => c.key === k).max;
                // 比例尺固定：左邊放得下最大物距，右邊放得下最大間距再多一段
                const left = maxOf('p') + 4, rightCm = maxOf('dd') + 46, scale = (w - 28) / (left + rightCm);
                const sx = (cm) => 14 + (cm + left) * scale, sy = (cm) => axisY - cm * vScale;
                const x1 = sx(0), x2 = sx(g.d), Ox = sx(-g.p1), Oy = sy(ho);
                /* 近軸光線追跡：在透鏡處高度 y、斜率 u，折射後 u′ = u − y / f */
                const rays = [];
                if (p.r1) rays.push([0, C.orange]);
                if (p.r2) rays.push([-ho / g.p1, C.rose]);
                if (p.r3 && Math.abs(g.p1 - g.f1) > 0.3) rays.push([-ho / (g.p1 - g.f1), C.cyan]);
                const traced = rays.map(([u0, col]) => {
                    const y1 = ho + u0 * g.p1, u1 = u0 - y1 / g.f1, y2 = y1 + u1 * g.d, u2 = u1 - y2 / g.f2;
                    return { col, y1, u1, y2, u2 };
                });
                // 透鏡要夠大，光線才一定打在透鏡上
                const base = L.lensHalf(axisY, top, vScale), cap = axisY - top - 4;
                const H1 = Math.min(cap, Math.max(base, ...traced.map((t) => Math.abs(t.y1) * vScale + 10)));
                const H2 = Math.min(cap, Math.max(base, ...traced.map((t) => Math.abs(t.y2) * vScale + 10)));
                axis(ctx, 12, axisY, w - 12, axisY);
                L.lensShape(ctx, x1, axisY, H1, g.f1 < 0, 1);
                L.lensShape(ctx, x2, axisY, H2, g.f2 < 0, 1);
                labelFit(ctx, '透鏡 1', x1, Math.min(h - 50, axisY + H1 + 16), C.blue, 11, 'center', { clampW: w, plate: 1 });
                labelFit(ctx, '透鏡 2', x2, Math.min(h - 50, axisY + H2 + 16), C.blue, 11, 'center', { clampW: w, plate: 1 });
                const dot = (cm, name, col) => { const X = sx(cm); if (X < 8 || X > w - 8) return; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, axisY, 3.2, 0, Math.PI * 2); ctx.fill(); labelFit(ctx, name, X, axisY + 16, col, 10, 'center', { clampW: w, plate: 1 }); };
                [[-1, 'F₁'], [1, 'F₁']].forEach(([s, n]) => dot(s * Math.abs(g.f1), n, C.violet));
                [[-1, 'F₂'], [1, 'F₂']].forEach(([s, n]) => dot(g.d + s * Math.abs(g.f2), n, '#b4589a'));
                const clip = (fn) => { ctx.save(); ctx.beginPath(); ctx.rect(6, top, w - 12, bottom - top); ctx.clip(); fn(); ctx.restore(); };
                const seg = (a, b, col, dash, wd) => clip(() => { if (dash) ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = wd || 1.7; ctx.beginPath(); ctx.moveTo(sx(a[0]), sy(a[1])); ctx.lineTo(sx(b[0]), sy(b[1])); ctx.stroke(); });
                const far = rightCm + 10, near = -left - 10;
                const fin = g.ok && g.q2 < 0, ext = p.ext && fin;
                traced.forEach(({ col, y1, u1, y2, u2 }) => {
                    seg([-g.p1, ho], [0, y1], col);
                    seg([0, y1], [g.d, y2], col);
                    seg([g.d, y2], [far, y2 + u2 * (far - g.d)], col);
                    if (ext) seg([g.d, y2], [near, y2 + u2 * (near - g.d)], col, [5, 4], 1.2);
                    // 中間像：透鏡 1 折射後的光線延伸到 I₁（不管透鏡 2），淡虛線
                    if (p.mid && g.q1 !== undefined) {
                        const xi = g.q1;
                        if (xi > g.d || xi < 0) seg([0, y1], [xi, y1 + u1 * xi], col, [2, 4], 1);
                    }
                });
                if (!p.r1 && !p.r2 && !p.r3) labelFit(ctx, '勾選下方的光線，一條一條作圖', w / 2, top + 14, C.muted, 12, 'center', { clampW: w, plate: 1 });
                arrow(ctx, Ox, axisY, Ox, Oy, C.green, 2.8);
                label(ctx, '物', Ox - 16, Oy + 4, C.green, 12);
                const imgArrow = (xcm, hcm, col, text, dash) => {
                    const X = sx(xcm), Y = sy(hcm);
                    clip(() => { if (dash) { ctx.setLineDash([4, 3]); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, axisY); ctx.lineTo(X, Y); ctx.stroke(); } else arrow(ctx, X, axisY, X, Y, col, 2.8); });
                    if (X > 8 && X < w - 8) labelFit(ctx, text, X + 8, Math.max(top + 14, Math.min(bottom - 4, Y + (Y < axisY ? -6 : 15))), col, 11, 'left', { clampW: w, plate: 1 });
                    else labelFit(ctx, `${text}在畫面${X >= w - 8 ? '右' : '左'}方之外`, X >= w - 8 ? w - 10 : 10, axisY - 10, col, 11, X >= w - 8 ? 'right' : 'left', { clampW: w, plate: 1 });
                };
                if (p.mid && g.q1 !== undefined) imgArrow(g.q1, g.m1 * ho, '#b4589a', `中間像 I₁${g.q1 > g.d ? '（透鏡 2 的虛物）' : ''}`, true);
                if (p.show) {
                    if (!g.ok) labelFit(ctx, g.why, 14, 22, C.rose, 12, 'left', { clampW: w });
                    else {
                        imgArrow(g.d + g.q2, g.m * ho, g.q2 > 0 ? C.blue : C.violet, g.q2 > 0 ? '最後的實像' : '最後的虛像');
                        label(ctx, `q₁ = ${g.q1.toFixed(1)} cm　p₂ = ${g.p2.toFixed(1)} cm　q₂ = ${g.q2.toFixed(1)} cm　m = ${g.m.toFixed(2)}`, 14, 22, C.ink, 12);
                    }
                }
                labelWrap(ctx, '光線為真實光路：在兩個透鏡各折射一次　粉紫虛線：透鏡 1 單獨成的中間像　虛線：反向延長線', 14, h - 30, C.muted, 10, 13, w - 28);
            },
            draw: (ctx, w, h, p) => {
                if (p.mode === 'double') { LABS.lens.drawDouble(ctx, w, h, p); return; }
                if (p.mode === 'thick') { LABS.lens.drawThick(ctx, w, h, p); return; }
                if (p.mode === 'dof') { LABS.lens.drawDof(ctx, w, h, p); return; }
                const L = LABS.lens, conj = p.mode === 'conj', concave = p.mode === 'concave';
                const fAbs = Number(p.f), f = concave ? -fAbs : fAbs, ho = Number(p.ho);
                const axisY = h * 0.5, top = 32, bottom = h - 70;
                const maxOf = (k) => L.controls.find((c) => c.key === k).max;
                /* 比例尺固定：拖動物距（或透鏡位置）時只有物體（或透鏡）在動，畫面不縮放。
                 * 一般模式：透鏡在正中央，左右各能放下最大物距；共軛模式：物體在左邊、屏幕最遠到最大 L。 */
                const g = conj ? L.conj(p) : null;
                const lensCm = conj ? g.x : 0, objCm = conj ? 0 : -Number(p.p);
                const scale = conj ? (w - 70) / maxOf('L') : (w * 0.5 - 14) / (maxOf('p') + 6);
                const ox = conj ? 40 : w * 0.5;
                /* 共軛模式：放大的那個清晰像（|m| = q₁/p₁）要整個放得進畫面，光線才看得到交在像的尖端。
                 * 垂直比例只由 L、f 決定（以最大物高計算），拖動透鏡或改物高時都不會跟著縮放；
                 * 放大率極大時設下限，物體不會小到看不見（此時像會超出畫面，另有標示）。 */
                const baseV = L.vScaleOf(axisY, top);
                let vScale = baseV, needCm = 0;
                if (conj) {
                    const Lc = g.L, disc = Lc * Lc - 4 * Lc * g.f;
                    if (disc > 0) {
                        const x1 = (Lc - Math.sqrt(disc)) / 2;
                        needCm = maxOf('ho') * (Lc - x1) / x1;            // 最大物高時，放大像的像高
                        vScale = Math.max(baseV / 3.5, Math.min(baseV, (bottom - axisY - 14) / needCm));
                        needCm *= ho / maxOf('ho');
                    }
                }
                const sx = (cm) => ox + cm * scale, sy = (cm) => axisY - cm * vScale;
                const po = lensCm - objCm;                             // 物距
                const q = Math.abs(po - f) < 1e-6 ? null : 1 / (1 / f - 1 / po);
                const m = q === null ? null : -q / po;
                const cx = sx(lensCm), Ox = sx(objCm), Oy = sy(ho);

                axis(ctx, 12, axisY, w - 12, axisY);
                label(ctx, '主軸', w - 40, axisY - 8, C.muted, 10);
                // 透鏡本體（共軛模式另畫記錄過的位置，淡色）
                // 透鏡要比放大像的像高再大一點：光線③（折射後平行主軸、高度＝像高）才打得到透鏡上
                const lensH = Math.min(axisY - top - 4, Math.max(L.lensHalf(axisY, top, vScale), needCm * vScale + 8));
                const lensShape = (x, alpha) => L.lensShape(ctx, x, axisY, lensH, concave, alpha);
                if (conj) (p._rec || []).filter((r) => r.L === g.L && r.f === g.f).forEach((r, i) => {
                    lensShape(sx(r.x), 0.3);
                    labelFit(ctx, `記錄 ${i + 1}`, sx(r.x), axisY + 88, C.blue, 10, 'center', { clampW: w, plate: 1 });
                });
                lensShape(cx, 1);
                // 焦點與兩倍焦距（跟著透鏡）
                [[-fAbs, 'F'], [fAbs, 'F'], [-2 * fAbs, '2F'], [2 * fAbs, '2F']].forEach(([d, name]) => {
                    const X = sx(lensCm + d);
                    if (X < 8 || X > w - 8) return;
                    ctx.fillStyle = C.violet; ctx.beginPath(); ctx.arc(X, axisY, 3.4, 0, Math.PI * 2); ctx.fill();
                    labelFit(ctx, name, X, axisY + 18, C.violet, 10, 'center', { clampW: w, plate: 1 });
                });
                // 屏幕（共軛模式）
                const scrX = conj ? sx(g.L) : null;
                if (conj) {
                    /* 屏幕畫滿整個圖區高度：放大的實像（|m| 大）也落得在屏幕上，不會畫到屏幕外面 */
                    ctx.fillStyle = '#d9dee0'; ctx.fillRect(scrX, top, 6, bottom - top);
                    ctx.strokeStyle = '#7d8c91'; ctx.lineWidth = 1; ctx.strokeRect(scrX, top, 6, bottom - top);
                    labelFit(ctx, '屏幕', scrX + 3, bottom + 14, C.muted, 10, 'center', { clampW: w, plate: 1 });
                }

                // 光線：在圖區內裁切；虛線為反向延長線
                const clip = (fn) => { ctx.save(); ctx.beginPath(); ctx.rect(6, top, w - 12, bottom - top); ctx.clip(); fn(); ctx.restore(); };
                const seg = (x1, y1, x2, y2, color, dash, width) => clip(() => {
                    if (dash) ctx.setLineDash(dash);
                    ctx.strokeStyle = color; ctx.lineWidth = width || 1.7;
                    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                });
                // 從 (x0, y0) 沿方向 (dx, dy) 畫到 xEnd（共軛模式畫到屏幕為止）
                const toX = (x0, y0, dx, dy, xEnd, color, dash) => {
                    if (Math.abs(dx) < 1e-9) return;
                    const k = (xEnd - x0) / dx;
                    seg(x0, y0, x0 + dx * k, y0 + dy * k, color, dash);
                };
                const right = conj ? scrX : w - 6, leftEnd = 6;
                const virtual = q !== null && q < 0, showExt = !conj && p.ext && virtual;
                const extDash = [5, 4];
                const Fb = sx(lensCm + f), Ff = sx(lensCm - f);   // 凸透鏡：Fb 在鏡後、Ff 在鏡前；凹透鏡則相反（虛焦點）

                if (p.r1) {   // ① 平行主軸入射
                    seg(Ox, Oy, cx, Oy, C.orange);
                    // 折射後的方向：凸透鏡朝鏡後焦點；凹透鏡好像從鏡前焦點（f < 0 時 Fb 落在鏡前）發出
                    const dx = concave ? cx - Fb : Fb - cx, dy = concave ? Oy - axisY : axisY - Oy;
                    toX(cx, Oy, dx, dy, right, C.orange);
                    if (concave) seg(cx, Oy, Fb, axisY, C.orange, extDash, 1.2);   // 往回延長到虛焦點
                    if (showExt) toX(cx, Oy, -dx, -dy, leftEnd, C.orange, extDash);
                }
                if (p.r2) {   // ② 通過鏡心，方向不變
                    seg(Ox, Oy, cx, axisY, C.rose);
                    toX(cx, axisY, cx - Ox, axisY - Oy, right, C.rose);
                    if (showExt) toX(Ox, Oy, Ox - cx, Oy - axisY, leftEnd, C.rose, extDash);
                }
                if (p.r3 && (concave || Math.abs(po - fAbs) > 0.5)) {   // ③ 通過焦點方向 → 折射後平行主軸
                    // 凸透鏡：沿「鏡前焦點 → 物尖」方向；凹透鏡：瞄準鏡後的焦點
                    const aimX = concave ? sx(lensCm + fAbs) : sx(lensCm - fAbs);
                    const t = concave ? (cx - Ox) / (aimX - Ox) : (cx - aimX) / (Ox - aimX);
                    const yAt = concave ? Oy + (axisY - Oy) * t : axisY + (Oy - axisY) * t;
                    if (!concave && po < fAbs) seg(aimX, axisY, Ox, Oy, C.cyan, [2, 4], 1.1);      // 好像從鏡前焦點發出
                    seg(Ox, Oy, cx, yAt, C.cyan);
                    if (concave) seg(cx, yAt, aimX, axisY, C.cyan, [2, 4], 1.1);                    // 原本瞄準另一側焦點
                    toX(cx, yAt, 1, 0, right, C.cyan);
                    if (showExt) toX(cx, yAt, -1, 0, leftEnd, C.cyan, extDash);
                }
                if (!p.r1 && !p.r2 && !p.r3) labelFit(ctx, '勾選下方的光線，一條一條作圖', w / 2, top + 14, C.muted, 12, 'center', { clampW: w, plate: 1 });

                // 物
                arrow(ctx, Ox, axisY, Ox, Oy, C.green, 2.8);
                label(ctx, '物', Ox - 16, Oy + 4, C.green, 12);

                // 共軛模式：屏幕上的像（清楚或模糊）
                /* 清楚時只畫一支清楚的像；不清楚時才畫一團模糊的光斑（兩者疊在一起會像抖動的殘影）。
                 * 一律裁切在圖區內，像太大時就像真實的屏幕一樣只看得到一部分。 */
                if (conj && q !== null && q > 0) {
                    const Iy = sy(m * ho), hy = axisY + (Iy - axisY) * (g.s / q);
                    clip(() => {
                        if (g.sharp) { arrow(ctx, scrX + 3, axisY, scrX + 3, hy, C.green, 2.6); return; }
                        const blur = Math.min(40, Math.max(3, Math.abs(q - g.s) / q * 70 * vScale / 6));
                        const grd = ctx.createLinearGradient(0, Math.min(axisY, hy) - blur, 0, Math.max(axisY, hy) + blur);
                        grd.addColorStop(0, 'rgba(18,128,92,0)'); grd.addColorStop(0.5, `rgba(18,128,92,${Math.max(0.15, 0.85 - blur / 50)})`); grd.addColorStop(1, 'rgba(18,128,92,0)');
                        ctx.fillStyle = grd;
                        ctx.fillRect(scrX - 2 - blur * 0.2, Math.min(axisY, hy) - blur, 10 + blur * 0.4, Math.abs(hy - axisY) + 2 * blur);
                    });
                }
                // 像（答案）
                if (p.show) {
                    if (q === null) labelFit(ctx, '物在焦點上：折射光互相平行，無法成像', 14, 22, C.rose, 12, 'left', { clampW: w });
                    else {
                        const Ix = sx(lensCm + q), Iy = sy(m * ho), imgCol = q > 0 ? C.blue : C.violet;
                        // 共軛模式下像剛好落在屏幕上時，屏幕上的像就是答案，不再重疊畫第二支
                        // 屏幕上已經清楚成像時，屏幕上的像就是答案（像距與屏幕距離只差一點點，不再另畫一支）
                        const onScreen = conj && g.sharp;
                        if (!onScreen) clip(() => arrow(ctx, Ix, axisY, Ix, Iy, imgCol, 2.8));
                        const tooTall = Iy < top || Iy > bottom;
                        const lblY = onScreen ? (Iy > axisY ? axisY - 14 : axisY + 34)                       // 標在像的另一側，不壓到焦點標記
                            : Math.max(top + 14, Math.min(bottom - 4, Iy + (Iy < axisY ? -6 : 15)));
                        const lblTxt = (q > 0 ? (onScreen ? (w < 560 ? '清楚的實像' : '實像（清楚成像在屏幕上）') : '實像') : '虛像') + (tooTall ? `，像高 ${Math.abs(m * ho).toFixed(1)} cm 超出畫面` : '');
                        if (Ix > 8 && Ix < w - 8) labelFit(ctx, lblTxt, (onScreen ? scrX + 6 : Ix) + 8, lblY, imgCol, 12, 'left', { clampW: w, plate: 1 });
                        else labelFit(ctx, `${q > 0 ? '實像' : '虛像'}在畫面${Ix >= w - 8 ? '右' : '左'}方之外`, Ix >= w - 8 ? w - 10 : 10, axisY - 10, imgCol, 11, Ix >= w - 8 ? 'right' : 'left', { clampW: w, plate: 1 });
                        label(ctx, `p = ${+po.toFixed(2)} cm　f = ${f} cm　q = ${q.toFixed(conj ? 2 : 1)} cm　m = ${m.toFixed(2)}`, 14, 22, C.ink, 12);
                    }
                }
                labelWrap(ctx, `橘①：平行主軸入射　粉②：通過鏡心　青③：${concave ? '瞄準另一側焦點' : '通過鏡前焦點方向'}　虛線：反向延長線`, 14, h - 30, C.muted, 10, 13, w - 28);
            }
        };

