// 離屏畫布快取與互動實驗共用框架
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* =====================================================================
         * 離屏畫布快取（確保 High-DPI / Retina / 縮放螢幕下像素對齊不跑版）
         * ===================================================================*/
        const sharedOffscreen = {};
        function getOffscreen(w, h, surface = sharedOffscreen) {
            if (!surface.canvas) {
                surface.canvas = document.createElement('canvas');
                surface.ctx = surface.canvas.getContext('2d');
            }
            if (surface.canvas.width !== w || surface.canvas.height !== h) {
                surface.canvas.width = w;
                surface.canvas.height = h;
            }
            return surface;
        }

        /* =====================================================================
         * 互動實驗：共用框架
         * ---------------------------------------------------------------------
         * 每個實驗宣告 controls（滑桿）、modes（切換鈕）、draw（繪圖）與
         * readouts（即時讀數）。框架負責建立 DOM、綁定事件、跑固定步長時鐘，
         * 並在離開檢視時由 activeDisposers 一次清除。
         * ===================================================================*/
        const C = {
            ink: '#12313a', muted: '#7d949c', grid: 'rgba(18,49,58,0.10)',
            blue: '#0b6f92', cyan: '#0e8b93', rose: '#c2264a',
            violet: '#6b46c1', orange: '#c9750f', green: '#12805c',
            soft: 'rgba(11,111,146,0.12)'
        };

        function axis(ctx, x0, y0, x1, y1) {
            ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        function label(ctx, text, x, y, color, size, align) {
            ctx.fillStyle = color || C.muted;
            ctx.font = `${size || 11}px Outfit, "Noto Sans TC", sans-serif`;
            ctx.textAlign = align || 'left';
            ctx.fillText(text, x, y);
            ctx.textAlign = 'left';
        }
        function arrow(ctx, x1, y1, x2, y2, color, width) {
            ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width || 1.6;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            const a = Math.atan2(y2 - y1, x2 - x1); const s = 6;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4));
            ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4));
            ctx.closePath(); ctx.fill();
        }
        /* 畫布文字排版：把「這行放不放得下」交給程式算，而不是為每個標籤各猜一個常數（守則 §3）。
         *   maxW   可用寬度，超過就逐級縮字，縮到 min 仍放不下則截斷加省略號
         *   clampW 畫布寬度，給定時會把文字方塊夾在 [2, clampW-2] 之內，避免跑出畫面
         *   plate  在文字底下鋪一層半透明白底，讓壓在波場或圖樣上的文字仍讀得到
         * 回傳實際佔用的寬度與字級，呼叫端可據此排下一個元素。 */
        function labelFit(ctx, text, x, y, color, size, align, opts) {
            const o = opts || {};
            const maxW = o.maxW || Infinity;
            const minSize = o.min || 8;
            const setF = (px) => { ctx.font = `${px}px Outfit, "Noto Sans TC", sans-serif`; };
            let sz = size || 11;
            let txt = String(text);
            setF(sz);
            while (ctx.measureText(txt).width > maxW && sz > minSize) { sz -= 0.5; setF(sz); }
            if (ctx.measureText(txt).width > maxW) {
                while (txt.length > 1 && ctx.measureText(txt + '…').width > maxW) txt = txt.slice(0, -1);
                txt += '…';
            }
            const tw = ctx.measureText(txt).width;
            let lx = x;
            if (align === 'center') lx = x - tw / 2;
            else if (align === 'right') lx = x - tw;
            if (o.clampW) lx = Math.max(2, Math.min(lx, o.clampW - tw - 2));
            if (o.plate) {
                ctx.fillStyle = typeof o.plate === 'string' ? o.plate : 'rgba(255,255,255,0.86)';
                ctx.fillRect(lx - 3, y - sz - 1, tw + 6, sz + 5);
            }
            ctx.fillStyle = color || C.muted;
            ctx.textAlign = 'left';
            ctx.fillText(txt, lx, y);
            return { w: tw, size: sz, x: lx };
        }

        /* 一段長說明：優先在指定的分隔符（預設全形空白）斷句換行，斷不開才逐字換行。
         * 回傳實際畫了幾行，呼叫端據此推進 y。比直接截斷好，因為不會掉字。 */
        function labelWrap(ctx, text, x, y, color, size, lineH, maxW, sep) {
            const setF = () => { ctx.font = `${size}px Outfit, "Noto Sans TC", sans-serif`; };
            setF();
            if (ctx.measureText(text).width <= maxW) {
                label(ctx, text, x, y, color, size);
                return 1;
            }
            const chunks = String(text).split(sep || '　').filter(Boolean);
            const lines = [];
            let cur = '';
            const push = () => { if (cur) { lines.push(cur); cur = ''; } };
            chunks.forEach((ch) => {
                const trial = cur ? cur + (sep || '　') + ch : ch;
                if (ctx.measureText(trial).width <= maxW) { cur = trial; return; }
                push();
                if (ctx.measureText(ch).width <= maxW) { cur = ch; return; }
                /* 單一段落本身就超寬 → 逐「詞」斷。
                 * 中日韓字元可以單獨換行，但英數、小數點與運算子必須整組保留，
                 * 否則 "0.680 m" 會被切成 "0.6" 和 "80 m" 這種假數字。 */
                const tokens = ch.match(/[0-9A-Za-z.,:=+\-/×·°%]+|\s+|[^]/g) || [ch];
                let buf = '';
                tokens.forEach((tk) => {
                    if (!buf) { buf = tk; return; }
                    if (ctx.measureText(buf + tk).width > maxW) { lines.push(buf); buf = tk.trim() ? tk : ''; }
                    else buf += tk;
                });
                cur = buf;
            });
            push();
            lines.forEach((ln, i) => label(ctx, ln, x, y + i * lineH, color, size));
            return lines.length;
        }

        /* 一列上放左右兩段文字：同一行放得下就左右對齊，放不下就自動拆成上下兩行。
         * 回傳實際用掉的行數，呼叫端據此決定下一列的 y。 */
        function labelRow(ctx, xL, xR, y, lineH, left, right) {
            const measure = (o) => {
                ctx.font = `${o.size || 11}px Outfit, "Noto Sans TC", sans-serif`;
                return ctx.measureText(o.text).width;
            };
            const wL = measure(left), wR = measure(right);
            if (wL + wR + 16 <= xR - xL) {
                label(ctx, left.text, xL, y, left.color, left.size || 11);
                label(ctx, right.text, xR, y, right.color, right.size || 11, 'right');
                return 1;
            }
            labelFit(ctx, left.text, xL, y, left.color, left.size || 11, 'left', { maxW: xR - xL });
            labelFit(ctx, right.text, xL, y + lineH, right.color, right.size || 11, 'left', { maxW: xR - xL });
            return 2;
        }

        function dashed(ctx, x1, y1, x2, y2, color) {
            ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = color || C.muted; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
        }
        const deg = (r) => r * 180 / Math.PI;
        const rad = (d) => d * Math.PI / 180;

        function labShellHtml(id, prefix = '') {
            const lab = LABS[id];
            if (!lab) return '';
            const controlHtml = (c) => {
                if (c.type === 'checkbox') {
                    return `
                        <div class="lab-control lab-check" id="${prefix}${id}-${c.key}-wrap">
                            <label for="${prefix}${id}-${c.key}"><input type="checkbox" id="${prefix}${id}-${c.key}" ${c.value ? 'checked' : ''}><span>${c.label}</span></label>
                        </div>`;
                }
                if (c.options) {
                    const opts = c.options.map((o) => `<option value="${o.value}" ${String(o.value) === String(c.value) ? 'selected' : ''}>${o.label}</option>`).join('');
                    return `
                        <div class="lab-control" id="${prefix}${id}-${c.key}-wrap">
                            <label for="${prefix}${id}-${c.key}">${c.label}<b id="${prefix}${id}-${c.key}-out"></b></label>
                            <select id="${prefix}${id}-${c.key}" class="lab-select">${opts}</select>
                        </div>`;
                }
                /* 滑桿右邊的 ▲▼：一次只動一格（按住會連續調整），範圍很大的滑桿也能精準設定 */
                return `
                    <div class="lab-control" id="${prefix}${id}-${c.key}-wrap">
                        <label for="${prefix}${id}-${c.key}">${c.label}<b id="${prefix}${id}-${c.key}-out"></b></label>
                        <div class="lab-range-row">
                            <input type="range" id="${prefix}${id}-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}">
                            <span class="lab-stepper">
                                <button type="button" class="lab-step" data-step-for="${prefix}${id}-${c.key}" data-dir="1" aria-label="${c.label}：增加一格">▲</button>
                                <button type="button" class="lab-step" data-step-for="${prefix}${id}-${c.key}" data-dir="-1" aria-label="${c.label}：減少一格">▼</button>
                            </span>
                        </div>
                    </div>`;
            };
            const controls = (lab.controls || []).map(controlHtml).join('');
            const modes = (lab.modes || []).map((m, i) =>
                `<button type="button" class="lab-btn ${i === 0 ? 'is-active' : ''}" data-mode="${m.key}">${m.label}</button>`
            ).join('');
            const scrub = lab.cycle ? `
                    <div class="lab-scrub">
                        <span class="scrub-label">⏱ 時間軸</span>
                        <button type="button" class="scrub-btn" data-role="step-back" aria-label="退一格">⏴</button>
                        <input type="range" id="${prefix}${id}-scrub" min="0" max="1000" step="1" value="0" aria-label="拖曳以慢慢看過程">
                        <button type="button" class="scrub-btn" data-role="step-fwd" aria-label="進一格">⏵</button>
                        <b id="${prefix}${id}-scrub-out">0.00 s</b>
                        <div class="lab-speed">
                            <label for="${prefix}${id}-speed">播放速度</label>
                            <span class="speed-limit">0.1×</span>
                            <input type="range" id="${prefix}${id}-speed" min="0.1" max="1.5" step="0.1" value="1" aria-label="播放速度，0.1 倍到 1.5 倍">
                            <span class="speed-limit">1.5×</span>
                            <span class="speed-current">目前 <b id="${prefix}${id}-speed-out">1.0×</b></span>
                        </div>
                    </div>` : '';
            const extraBtns = (lab.extraButtons || []).map((b) =>
                `<button type="button" class="lab-btn ${b.className || ''}" data-action="${b.action}">${b.label}</button>`
            ).join('');
            if (id === 'water_interference') {
                const waterControls = keys => keys.map(key => controlHtml(lab.controls.find(c => c.key === key))).join('');
                const waterButtons = actions => (lab.extraButtons || []).filter(b => actions.includes(b.action)).map(b =>
                    `<button type="button" class="lab-btn ${b.className || ''}" data-action="${b.action}">${b.label}</button>`
                ).join('');
                const presetActions = [1,1.5,2,2.5,3,3.5,4].map(mult => `snap_${String(mult).replace('.','_')}_lambda`);
                return `
                    <div class="lab-shell lab-water" id="${prefix}lab-${id}">
                        <div class="water-stage-toolbar">
                            <div class="lab-buttons" data-role="modes">${modes}</div>
                            <div class="lab-buttons water-playback">
                                <button type="button" class="lab-btn" data-role="toggle">⏸ 暫停</button>
                                <button type="button" class="lab-btn" data-role="reset">↺ 回到預設值</button>
                            </div>
                        </div>
                        <div class="lab-stage"><canvas id="${prefix}${id}-canvas"></canvas></div>
                        <p class="water-stage-caption">點水面放置或拖曳測量點 P；三維模式可拖曳畫面旋轉視角。</p>
                        ${scrub}
                        <div class="water-control-cards">
                            <section class="water-control-card" aria-labelledby="${prefix}${id}-distance-title">
                                <h5 id="${prefix}${id}-distance-title">波源間距與長度顯示</h5>
                                ${waterControls(['d'])}
                                <p class="water-control-hint">λ 是一個波長。改變間距，觀察腹線與節線如何改變。</p>
                                ${waterControls(['dlabel'])}
                                <div class="lab-buttons water-presets" aria-label="精確設定波源間距">${waterButtons(presetActions)}</div>
                                <div class="lab-buttons">${waterButtons(['snap_degen_int','snap_degen_half'])}</div>
                            </section>
                            <section class="water-control-card" aria-labelledby="${prefix}${id}-display-title">
                                <h5 id="${prefix}${id}-display-title">水波與圖示</h5>
                                ${waterControls(['freq','phase','decay','shade','lines','yaw'])}
                                <div class="lab-buttons">${waterButtons(['random_quiz'])}</div>
                            </section>
                        </div>
                        <div class="water-measure-toolbar"><h5>測量與判讀</h5><div class="lab-buttons">${waterButtons(['clear_p'])}</div></div>
                        <div class="lab-readout" id="${prefix}${id}-readout"></div>
                        <p class="water-credit">原始探究設計：成德高中 陳家騏老師。</p>
                        <details class="water-guide"><summary>第一次操作：凍結、測量、核對</summary><div class="lab-hint">${lab.hint}</div></details>
                        ${lab.note ? `<div class="lab-note"><details><summary>觀察後的補充說明</summary>${lab.note}</details></div>` : ''}
                    </div>`;
            }
            if (lab.floating) {
                /* 必歐式版面：畫布占滿整塊舞台，說明／讀值／控制做成可收合的浮動面板 */
                const fold = (open) => `<button type="button" class="lf-fold" aria-expanded="${open}" aria-label="${open ? '收合' : '展開'}">${open ? '▾' : '▸'}</button>`;
                return `
                <div class="lab-shell lab-float" id="${prefix}lab-${id}">
                    <div class="lab-title"><h4>${lab.name}</h4><span class="lab-tag">${lab.tag}</span></div>
                    <div class="lf-wrap">
                        <div class="lab-stage"><canvas id="${prefix}${id}-canvas"></canvas></div>
                        <div class="lf-left">
                            <section class="lf-panel lf-info is-folded">
                                <header><strong>說明</strong><span>怎麼看這個模擬</span>${fold(false)}</header>
                                <div class="lf-body">
                                    <div class="lab-hint">${lab.hint}</div>
                                    ${lab.note ? `<div class="lab-note"><details><summary>觀察後的補充說明</summary>${lab.note}</details></div>` : ''}
                                </div>
                            </section>
                            <section class="lf-panel lf-read is-folded">
                                <header><strong>即時讀值</strong>${fold(false)}</header>
                                <div class="lf-body"><div class="lab-readout" id="${prefix}${id}-readout"></div></div>
                            </section>
                        </div>
                        <section class="lf-panel lf-ctrl">
                            <header><strong>控制</strong><button type="button" class="lf-full" data-role="full">⛶ 全螢幕</button>${fold(true)}</header>
                            <div class="lf-body">
                                ${modes ? `<div class="lab-buttons" data-role="modes">${modes}</div>` : ''}
                                ${scrub}
                                <div class="lab-controls">${controls}</div>
                                <div class="lab-buttons">
                                    <button type="button" class="lab-btn" data-role="toggle">⏸ 暫停</button>
                                    <button type="button" class="lab-btn" data-role="reset">↺ 回到預設值</button>
                                    ${extraBtns}
                                </div>
                            </div>
                        </section>
                    </div>
                    ${lab.teach ? `<section class="lab-teach">${lab.teach}</section>` : ''}
                </div>`;
            }
            return `
                <div class="lab-shell" id="${prefix}lab-${id}">
                    <div class="lab-title"><h4>${lab.name}</h4><span class="lab-tag">${lab.tag}</span></div>
                    <div class="lab-hint">${lab.hint}</div>
                    ${modes ? `<div class="lab-buttons" data-role="modes">${modes}</div>` : ''}
                    <div class="lab-stage"><canvas id="${prefix}${id}-canvas"></canvas></div>
                    ${scrub}
                    <div class="lab-controls">${controls}</div>
                    <div class="lab-buttons">
                        <button type="button" class="lab-btn" data-role="toggle">⏸ 暫停</button>
                        <button type="button" class="lab-btn" data-role="reset">↺ 回到預設值</button>
                        ${extraBtns}
                    </div>
                    <div class="lab-readout" id="${prefix}${id}-readout"></div>
                    ${lab.note ? `<div class="lab-note"><details><summary>觀察後的補充說明</summary>${lab.note}</details></div>` : ''}
                    ${lab.teach ? `<section class="lab-teach">${lab.teach}</section>` : ''}
                </div>`;
        }

        function mountLab(id, initialMode, prefix = '', customDisposers = null, initialParams = null) {
            const lab = LABS[id];
            const host = document.getElementById(prefix ? `${prefix}lab-${id}` : `lab-${id}`);
            const canvas = document.getElementById(prefix ? `${prefix}${id}-canvas` : `${id}-canvas`);
            if (!lab || !host || !canvas) return;

            const disposers = customDisposers || activeDisposers;

            if (lab.wide) document.getElementById('main-content').classList.add('lab-wide');

            const params = {};
            const initialValue = c => initialParams && Object.hasOwn(initialParams,c.key) ? initialParams[c.key] : c.value;
            /* 勾選框的值是布林；其餘控制項（滑桿、選單）可轉成數字就轉成數字 */
            const parseValue = (c, v) => c.type === 'checkbox' ? !!v : (isNaN(Number(v)) ? v : Number(v));
            const writeInput = (input, c, v) => { if (c.type === 'checkbox') input.checked = !!v; else input.value = v; };
            (lab.controls || []).forEach((c) => {
                const value = initialValue(c);
                params[c.key] = parseValue(c, value);
                const input = document.getElementById(`${prefix}${id}-${c.key}`);
                if (input) writeInput(input, c, value);
            });
            const modeKeys = lab.modes ? lab.modes.map((m) => m.key) : [];
            params.mode = lab.modes
                ? (modeKeys.includes(initialMode) ? initialMode : lab.modes[0].key)
                : null;
            if (lab.modes) {
                host.querySelectorAll('[data-mode]').forEach((b) => {
                    b.classList.toggle('is-active', b.dataset.mode === params.mode);
                });
            }

            let running = !WaveRuntime.prefersReducedMotion();
            let simTime = 0;
            let playbackRate = 1;
            /* lab.height 可為數字，或依模式與畫布寬度決定的函式 (params, cssWidth) => px */
            const floatWrap = host.querySelector('.lf-wrap');
            const floatWide = () => !!floatWrap && window.matchMedia('(min-width: 761px)').matches;
            const labHeight = () => {
                if (floatWide()) return Math.max(320, floatWrap.clientHeight);
                if (typeof lab.height !== 'function') return lab.height || 320;
                const cw = canvas.clientWidth || canvas.parentElement?.clientWidth || 640;
                return lab.height(params, cw);
            };
            /* lab.hintFor / lab.noteFor：同一實驗的不同模式各自給提示與補充說明 */
            const syncModeText = () => {
                if (typeof lab.hintFor === 'function') {
                    const el = host.querySelector('.lab-hint');
                    if (el) el.innerHTML = lab.hintFor(params);
                }
                if (typeof lab.noteFor === 'function') {
                    const el = host.querySelector('.lab-note details');
                    if (el) el.innerHTML = `<summary>觀察後的補充說明</summary>${lab.noteFor(params)}`;
                }
            };
            syncModeText();
            let geom = WaveRuntime.fitCanvas(canvas, labHeight());

            const syncOutputs = () => {
                (lab.controls || []).forEach((c) => {
                    const out = document.getElementById(prefix ? `${prefix}${id}-${c.key}-out` : `${id}-${c.key}-out`);
                    if (out) out.textContent = c.fmt ? c.fmt(params[c.key], params) : params[c.key];
                    // 參數被別的控制項改掉時（onChange），讓滑桿位置跟上
                    const inp = document.getElementById(prefix ? `${prefix}${id}-${c.key}` : `${id}-${c.key}`);
                    if (inp && inp.type === 'range' && Number(inp.value) !== Number(params[c.key])) inp.value = params[c.key];
                    const wrap = document.getElementById(prefix ? `${prefix}${id}-${c.key}-wrap` : `${id}-${c.key}-wrap`);
                    if (wrap && (c.only || c.showIf)) {
                        const vis = (!c.only || c.only.includes(params.mode)) && (!c.showIf || c.showIf(params));
                        wrap.style.display = vis ? '' : 'none';
                    }
                });
                const ro = document.getElementById(prefix ? `${prefix}${id}-readout` : `${id}-readout`);
                if (ro && lab.readouts) {
                    ro.innerHTML = lab.readouts(params).map((r) => `<div><span>${r.label}</span><strong>${r.value}</strong></div>`).join('');
                }
            };

            /* 浮動版面：控制面板展開時，圖畫在它左邊的區域，不被面板蓋住 */
            const drawWidth = () => {
                if (!floatWide()) return geom.width;
                const ctrl = host.querySelector('.lf-ctrl');
                if (!ctrl || ctrl.classList.contains('is-folded')) return geom.width;
                return Math.max(320, geom.width - ctrl.offsetWidth - 20);
            };
            const paint = () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, geom.width, geom.height);
                const dw = drawWidth();
                if (dw < geom.width) {
                    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, dw, geom.height); ctx.clip();
                    lab.draw(ctx, dw, geom.height, params, simTime);
                    ctx.restore();
                } else lab.draw(ctx, geom.width, geom.height, params, simTime);
            };

            (lab.controls || []).forEach((c) => {
                const input = document.getElementById(prefix ? `${prefix}${id}-${c.key}` : `${id}-${c.key}`);
                if (input) {
                    const evt = (input.tagName === 'SELECT' || c.type === 'checkbox') ? 'change' : 'input';
                    disposers.addEventListener(input, evt, () => {
                        params[c.key] = c.type === 'checkbox' ? input.checked : parseValue(c, input.value);
                        if (c.onChange) c.onChange(params[c.key], params);
                        syncOutputs(); paint();
                    });
                }
            });

            /* ▲▼ 微調：點一下動一格；按住 0.4 秒後連續調整、愈按愈快 */
            host.querySelectorAll('.lab-step[data-step-for]').forEach((btn) => {
                const input = document.getElementById(btn.dataset.stepFor);
                if (!input) return;
                const dir = Number(btn.dataset.dir) || 1;
                const bump = () => {
                    const step = Number(input.step) || 1, min = Number(input.min), max = Number(input.max);
                    const dec = (String(input.step).split('.')[1] || '').length;
                    const next = Math.min(max, Math.max(min, Number(input.value) + dir * step));
                    if (next === Number(input.value)) return false;
                    input.value = next.toFixed(dec);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    return true;
                };
                let timer = null, hold = false;
                const stop = () => { if (timer) clearTimeout(timer); timer = null; };
                disposers.add(stop);
                disposers.addEventListener(btn, 'pointerdown', (e) => {
                    if (e.button !== undefined && e.button !== 0) return;
                    hold = false; stop();
                    let delay = 400;
                    const tick = () => { hold = true; if (!bump()) { stop(); return; } delay = Math.max(35, delay * 0.82); timer = setTimeout(tick, delay); };
                    timer = setTimeout(tick, delay);
                });
                ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => disposers.addEventListener(btn, ev, stop));
                // 一般點擊（含鍵盤 Enter／空白鍵）：若剛才是按住連續調整就不再多加一格
                disposers.addEventListener(btn, 'click', () => { if (!hold) bump(); hold = false; });
            });

            (lab.extraButtons || []).forEach((b) => {
                const btn = host.querySelector(`[data-action="${b.action}"]`);
                if (btn && b.onClick) {
                    disposers.addEventListener(btn, 'click', () => {
                        b.onClick(params, { syncOutputs, paint, host });
                    });
                }
            });

            host.querySelectorAll('[data-mode]').forEach((btn) => {
                disposers.addEventListener(btn, 'click', () => {
                    host.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    params.mode = btn.dataset.mode;
                    if (lab.onMode) lab.onMode(params);
                    syncModeText();
                    if (typeof lab.height === 'function') geom = WaveRuntime.fitCanvas(canvas, labHeight());
                    syncOutputs(); paint();
                });
            });

            const toggleBtn = host.querySelector('[data-role="toggle"]');
            if (toggleBtn) {
                disposers.addEventListener(toggleBtn, 'click', () => {
                    running = !running;
                    toggleBtn.textContent = running ? '⏸ 暫停' : '▶ 播放';
                });
                if (!running) toggleBtn.textContent = '▶ 播放';
            }

            /* 時間軸：拖曳或逐格前後時自動暫停，讓學生慢慢看疊加、反射的過程 */
            const scrubInput = lab.cycle ? document.getElementById(prefix ? `${prefix}${id}-scrub` : `${id}-scrub`) : null;
            const scrubOut = lab.cycle ? document.getElementById(prefix ? `${prefix}${id}-scrub-out` : `${id}-scrub-out`) : null;
            const speedInput = lab.cycle ? document.getElementById(prefix ? `${prefix}${id}-speed` : `${id}-speed`) : null;
            const speedOut = lab.cycle ? document.getElementById(prefix ? `${prefix}${id}-speed-out` : `${id}-speed-out`) : null;
            const cycleOf = () => {
                const c = (typeof lab.cycle === 'function') ? lab.cycle(params) : lab.cycle;
                return (Number.isFinite(c) && c > 0.02) ? c : 2;
            };
            const showScrub = () => {
                if (!scrubInput) return;
                const cyc = cycleOf();
                const phase = ((simTime % cyc) + cyc) % cyc;
                scrubInput.value = String(Math.round(phase / cyc * 1000));
                if (scrubOut) scrubOut.textContent = `${phase.toFixed(2)} s`;
            };
            const pausePlayback = () => {
                if (!running) return;
                running = false;
                if (toggleBtn) toggleBtn.textContent = '▶ 播放';
            };
            if (scrubInput) {
                disposers.addEventListener(scrubInput, 'input', () => {
                    pausePlayback();
                    simTime = Number(scrubInput.value) / 1000 * cycleOf();
                    if (scrubOut) scrubOut.textContent = `${simTime.toFixed(2)} s`;
                    syncOutputs(); paint();
                });
                const stepBy = (frac) => {
                    pausePlayback();
                    const cyc = cycleOf();
                    simTime = (((simTime + frac * cyc) % cyc) + cyc) % cyc;
                    showScrub(); paint();
                };
                const backBtn = host.querySelector('[data-role="step-back"]');
                const fwdBtn = host.querySelector('[data-role="step-fwd"]');
                if (backBtn) disposers.addEventListener(backBtn, 'click', () => stepBy(-1 / 48));
                if (fwdBtn) disposers.addEventListener(fwdBtn, 'click', () => stepBy(1 / 48));
                showScrub();
            }
            if (speedInput) {
                disposers.addEventListener(speedInput, 'input', () => {
                    playbackRate = Math.max(0.1, Math.min(1.5, Number(speedInput.value) || 1));
                    if (speedOut) speedOut.textContent = `${playbackRate.toFixed(1)}×`;
                });
            }

            const resetBtn = host.querySelector('[data-role="reset"]');
            if (resetBtn) {
                disposers.addEventListener(resetBtn, 'click', () => {
                    (lab.controls || []).forEach((c) => {
                        const value = initialValue(c);
                        params[c.key] = parseValue(c, value);
                        const input = document.getElementById(prefix ? `${prefix}${id}-${c.key}` : `${id}-${c.key}`);
                        if (input) writeInput(input, c, value);
                    });
                    if (lab.onReset) lab.onReset(params);
                    simTime = 0;
                    playbackRate = 1;
                    if (speedInput) speedInput.value = '1';
                    if (speedOut) speedOut.textContent = '1.0×';
                    showScrub();
                    syncOutputs(); paint();
                });
            }

            disposers.addEventListener(window, 'resize', () => {
                geom = WaveRuntime.fitCanvas(canvas, labHeight());
                paint();
            });

            let scrubTick = 0;
            disposers.runLoop((dt) => {
                if (running) {
                    simTime += dt * playbackRate;
                    if (scrubInput && (scrubTick = (scrubTick + 1) % 6) === 0) showScrub();
                }
                paint();
            });

            if (typeof lab.setup === 'function') {
                lab.setup({
                    host,
                    canvas,
                    params,
                    disposers,
                    syncOutputs,
                    paint,
                    getGeom: () => Object.assign({}, geom, { drawWidth: drawWidth() }),
                    isPaused: () => !running,
                    pause: pausePlayback
                });
            }

            if (floatWrap) {
                // setup 插在舞台前的控制列，在浮動版面裡移進「控制」面板
                const ctrlBody = host.querySelector('.lf-ctrl .lf-body');
                const firstControls = ctrlBody.querySelector('.lab-controls');
                floatWrap.querySelectorAll(':scope > .lab-controls').forEach((row) => ctrlBody.insertBefore(row, firstControls));
                const refit = () => { geom = WaveRuntime.fitCanvas(canvas, labHeight()); paint(); };
                host.querySelectorAll('.lf-fold').forEach((b) => {
                    disposers.addEventListener(b, 'click', () => {
                        const panel = b.closest('.lf-panel');
                        const folded = panel.classList.toggle('is-folded');
                        b.textContent = folded ? '▸' : '▾';
                        b.setAttribute('aria-expanded', String(!folded));
                        b.setAttribute('aria-label', folded ? '展開' : '收合');
                        if (panel.classList.contains('lf-ctrl')) paint();
                    });
                });
                const fullBtn = host.querySelector('[data-role="full"]');
                const setFull = (on) => {
                    host.classList.toggle('is-full', on);
                    document.documentElement.classList.toggle('lab-full-open', on);
                    if (fullBtn) fullBtn.textContent = on ? '✕ 結束全螢幕' : '⛶ 全螢幕';
                    requestAnimationFrame(refit);
                };
                if (fullBtn) disposers.addEventListener(fullBtn, 'click', () => {
                    const on = !host.classList.contains('is-full');
                    setFull(on);
                    try {
                        if (on && host.requestFullscreen) host.requestFullscreen().catch(() => {});
                        else if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    } catch (_) { /* 不支援全螢幕 API 時，仍以占滿視窗呈現 */ }
                });
                disposers.addEventListener(document, 'fullscreenchange', () => {
                    if (!document.fullscreenElement && host.classList.contains('is-full')) setFull(false);
                });
                disposers.addEventListener(document, 'keydown', (e) => {
                    if (e.key === 'Escape' && host.classList.contains('is-full') && !document.fullscreenElement) setFull(false);
                });
                disposers.add(() => document.documentElement.classList.remove('lab-full-open'));
                if (window.ResizeObserver) {
                    const ro = new ResizeObserver(() => { if (Math.abs(floatWrap.clientHeight - geom.height) > 1 || Math.abs(canvas.clientWidth - geom.width) > 1) refit(); });
                    ro.observe(floatWrap);
                    disposers.add(() => ro.disconnect());
                }
                refit();
            }

            syncOutputs();
            paint();
        }

