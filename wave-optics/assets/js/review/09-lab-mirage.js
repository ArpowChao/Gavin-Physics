// 互動實驗：折射率連續變化（海市蜃樓、聲道）
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 12. 折射率連續變化：海市蜃樓、夜間聲音、深海聲道 ------------------------
         * 介質只隨高度 y 變化：n = n(y)。光線（或聲線）以弧長 s 為參數積分
         *   dx/ds = cosθ，dy/ds = sinθ，dθ/ds = cosθ · (dn/dy) / n
         * 光線一路往折射率大的一側彎，入射角漸增到 90° 就「轉彎回頭」，這就是連續介質中的全反射。
         * 聲波用 n = c0 / c(y)：聲速小的地方相當於折射率大。 */
        const MIRAGE_R = 6.371e6;                               // 地球半徑（m）
        const MIRAGE_K = 2.93e-4 * 288.15;                      // 空氣 n − 1 ≈ 2.93×10⁻⁴ × (288 K / T)
        /* 炎熱路面：貼近地面的空氣很熱（指數遞減，特徵高度 0.25 m） */
        function mirageRoadN(dT) {
            const Ta = 303.15, H = 0.25;
            return (y) => {
                const e = Math.exp(-Math.max(0, y) / H), T = Ta + dT * e, dTdy = y < 0 ? 0 : -dT / H * e;
                return [1 + MIRAGE_K / T, -MIRAGE_K / (T * T) * dTdy, T];
            };
        }
        /* 冷海面上的逆溫層（約 12 m 高處溫度快速升高）＋一般大氣遞減率；
         * 地球曲率用「修正折射率」n(1 + h/R) 換算成平面問題 */
        function mirageSeaN(dT, layered) {
            const Ts = 278.15, hI = 20, wd = 3, lapse = 0.0065, a = layered ? 0.4 * dT : dT, b = layered ? 0.6 * dT : 0;
            return (h) => {
                const hh = Math.max(0, h), e = Math.exp(-hh / 40), s = 1 / (1 + Math.exp(-(hh - hI) / wd));
                const T = Ts + a * (1 - e) + b * s - lapse * hh;
                const dTdh = a / 40 * e + b * s * (1 - s) / wd - lapse, n = 1 + MIRAGE_K / T, dn = -MIRAGE_K / (T * T) * dTdh;
                return [n * (1 + h / MIRAGE_R), dn * (1 + h / MIRAGE_R) + n / MIRAGE_R, T, n, dn];
            };
        }
        /* 夜間逆溫（地面冷、上方暖）或白天（地面熱）時的聲速分布 */
        function soundAirN(dT, night) {
            const Tg = 288.15, c0 = 340;
            return (y) => {
                const hh = Math.max(0, y);
                let T, dTdh;
                if (night) { const e = Math.exp(-hh / 80); T = Tg + dT * (1 - e); dTdh = dT / 80 * e; }
                else { const e = Math.exp(-hh / 40); T = Tg + dT * e; dTdh = -dT / 40 * e; }
                const c = 331.3 * Math.sqrt(T / 273.15), dc = 331.3 * 0.5 / Math.sqrt(T * 273.15) * dTdh;
                return [c0 / c, -c0 / (c * c) * dc, T, c];
            };
        }
        /* 深海聲速剖面（Munk 標準剖面）：約 1300 m 深處聲速最小；y = −深度 */
        function sofarN() {
            const c0 = 1500, eps = 0.00737, z1 = 1300, B = 1300;
            return (y) => {
                const z = -y, eta = 2 * (z - z1) / B, c = c0 * (1 + eps * (eta - 1 + Math.exp(-eta)));
                const dcdz = c0 * eps * (1 - Math.exp(-eta)) * 2 / B;
                return [c0 / c, c0 / (c * c) * dcdz, 2 + 22 * Math.exp(-z / 450), c];
            };
        }
        /* RK4 追蹤；o = { xMax, yMin, yMax, ds, bottom/top: 'stop' | 'reflect', every }。
         * tau 累積 ∫n ds（聲波時 tau / c0 就是傳播時間） */
        function gradTrace(nf, x0, y0, th0, o) {
            let x = x0, y = y0, th = th0, tau = 0, end = 'far';
            const pts = [{ x, y, tau }], hits = [];
            const d = (yy, tt) => { const r = nf(yy); return [Math.cos(tt), Math.sin(tt), Math.cos(tt) * r[1] / r[0], r[0]]; };
            const hs = o.ds, N = Math.ceil(o.xMax * 4 / hs), every = o.every || 1;
            for (let i = 1; i <= N; i++) {
                const k1 = d(y, th), k2 = d(y + hs / 2 * k1[1], th + hs / 2 * k1[2]);
                const k3 = d(y + hs / 2 * k2[1], th + hs / 2 * k2[2]), k4 = d(y + hs * k3[1], th + hs * k3[2]);
                const px = x, py = y;
                x += hs / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
                y += hs / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
                th += hs / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
                tau += hs * k1[3];
                if (y < o.yMin) {
                    const f = (py - o.yMin) / (py - y), hx = px + (x - px) * f;
                    pts.push({ x: hx, y: o.yMin, tau });
                    if (o.bottom === 'reflect') { y = 2 * o.yMin - y; th = -th; hits.push(hx); }
                    else { end = 'bottom'; break; }
                } else if (y > o.yMax) {
                    const f = (o.yMax - py) / (y - py), hx = px + (x - px) * f;
                    pts.push({ x: hx, y: o.yMax, tau });
                    if (o.top === 'reflect') { y = 2 * o.yMax - y; th = -th; }
                    else { end = 'top'; break; }
                }
                if (x >= o.xMax) {
                    const f = (o.xMax - px) / (x - px);
                    pts.push({ x: o.xMax, y: py + (y - py) * f, tau }); end = 'far'; break;
                }
                if (Math.cos(th) < 0.02) { pts.push({ x, y, tau }); end = 'back'; break; }
                if (i % every === 0) pts.push({ x, y, tau });
                if (i === N) end = 'stuck';
            }
            const last = pts[pts.length - 1];
            return { pts, end, hits, yEnd: end === 'far' ? last.y : null };
        }
        /* 由一排發射角 al 與到達高度 ys（null 表示途中打到地面），找出到達高度 = target 的所有發射角（大到小） */
        function mirageSolve(al, ys, target) {
            const out = [];
            for (let i = 0; i + 1 < al.length; i++) {
                const a = ys[i], b = ys[i + 1];
                if (a === null || b === null) continue;
                if ((a - target) * (b - target) <= 0 && a !== b) out.push(al[i] + (al[i + 1] - al[i]) * (target - a) / (b - a));
                else if (a === target) out.push(al[i]);
            }
            return out.sort((p, q) => q - p).filter((v, i, arr) => i === 0 || Math.abs(v - arr[i - 1]) > 1e-9);
        }
        /* 物體的水平切片：u = 高度 / 物體高（0～1），回傳 [左, 右, 顏色]（以半寬為單位） */
        function mirageSlice(kind, u) {
            const out = [];
            if (kind === 'car') {
                if (u < 0.22) { [-0.62, 0.62].forEach((c) => { const v = (u - 0.11) / 0.11; if (Math.abs(v) <= 1) { const hw = 0.17 * Math.sqrt(1 - v * v); out.push([c - hw, c + hw, '#22272b']); } }); }
                if (u >= 0.14 && u < 0.52) out.push([-1, 1, '#c8323c']);
                if (u >= 0.52 && u < 0.95) { const t = (u - 0.52) / 0.43, l = -0.55 + 0.15 * t, r = 0.45 - 0.25 * t; out.push([l, r, '#c8323c']); if (u < 0.88) out.push([l + 0.08, r - 0.08, '#bfe3f2']); }
            } else if (kind === 'tree') {
                if (u < 0.5) out.push([-0.12, 0.12, '#8a6a45']);
                const v = (u - 0.7) / 0.3; if (Math.abs(v) <= 1) { const hw = Math.sqrt(1 - v * v); out.push([-hw, hw, '#4f9a5a']); }
            } else {
                if (u < 0.24) { const t = u / 0.24; out.push([-(0.82 + 0.18 * t), 0.70 + 0.30 * t, '#3c4f5c']); }
                else if (u < 0.52) out.push([-0.45, 0.25, '#dfe6ea']);
                else if (u < 0.72) out.push([-0.15, 0.02, '#c2452d']);
                if (u >= 0.24) out.push([0.38, 0.42, '#3c4f5c']);
            }
            return out;
        }
        /* 用切片畫出所有的像：每一片高度求出所有發射角（可能有正立、倒立好幾個），
         * 與上一片最接近的解配對，畫成一條橫帶；toY(α) 把角度換成畫布 y */
        function mirageImages(ctx, kind, cx, halfW, H, solveAt, toY, S, tol, alpha) {
            const bnd = Array.from({ length: S + 1 }, (_, j) => solveAt(H * j / S));
            ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
            for (let j = 0; j < S; j++) {
                const segs = mirageSlice(kind, (j + 0.5) / S);
                if (!segs.length) continue;
                bnd[j].forEach((a0) => {
                    let best = null;
                    bnd[j + 1].forEach((a1) => { if (best === null || Math.abs(a1 - a0) < Math.abs(best - a0)) best = a1; });
                    if (best === null || Math.abs(best - a0) > tol) return;
                    const y0 = toY(a0), y1 = toY(best), top = Math.min(y0, y1), hg = Math.max(1, Math.abs(y1 - y0)) + (alpha == null || alpha >= 1 ? 0.6 : 0.1);
                    segs.forEach(([l, r, col]) => { ctx.fillStyle = col; ctx.fillRect(cx + l * halfW, top, (r - l) * halfW, hg); });
                });
            }
            ctx.restore();
        }
        /* 物體畫法：mapY(yo) 回傳畫布 y（或 null＝這一段看不到）；halfW 為半寬 px */
        function mirageObject(ctx, kind, xc, mapY, H, halfW, st) {
            ctx.save();
            ctx.globalAlpha = st.alpha == null ? 1 : st.alpha;
            if (st.dash) ctx.setLineDash([4, 3]);
            ctx.lineWidth = 1.3; ctx.strokeStyle = st.stroke || '#2f3e46';
            const poly = (pts, fill) => {
                const q = pts.map(([dx, yo]) => { const py = mapY(yo); return py === null ? null : [xc + dx, py]; });
                // 只畫看得到的連續片段
                let run = [];
                const flush = () => {
                    if (run.length > 2) { ctx.beginPath(); ctx.moveTo(...run[0]); run.forEach((r) => ctx.lineTo(...r)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); }
                    run = [];
                };
                q.forEach((r) => (r ? run.push(r) : flush())); flush();
            };
            const strip = (x0, x1, y0, y1, fill) => {
                const n = 10, left = [], right = [];
                for (let i = 0; i <= n; i++) { const yo = y0 + (y1 - y0) * i / n; left.push([x0, yo]); right.unshift([x1, yo]); }
                poly(left.concat(right), fill);
            };
            if (kind === 'tree') {
                strip(-halfW * 0.12, halfW * 0.12, 0, H * 0.5, st.trunk || '#8a6a45');
                const pts = [];
                for (let i = 0; i < 28; i++) { const t = i / 28 * Math.PI * 2; pts.push([Math.cos(t) * halfW, H * 0.7 + Math.sin(t) * H * 0.3]); }
                poly(pts, st.crown || '#4f9a5a');
            } else {
                // 船：船身、船艙、煙囪與桅桿
                const hull = [], n = 8;
                for (let i = 0; i <= n; i++) hull.push([-halfW * (0.82 + 0.18 * i / n), H * 0.24 * i / n]);
                for (let i = n; i >= 0; i--) hull.push([halfW * (0.70 + 0.30 * i / n), H * 0.24 * i / n]);
                poly(hull, st.hull || '#3c4f5c');
                strip(-halfW * 0.45, halfW * 0.25, H * 0.24, H * 0.52, st.cabin || '#e9eef0');
                strip(-halfW * 0.15, halfW * 0.02, H * 0.52, H * 0.72, st.funnel || '#c2452d');
                strip(halfW * 0.38, halfW * 0.42, H * 0.24, H, st.hull || '#3c4f5c');
            }
            ctx.restore();
        }

        LABS.mirage = {
            name: '海市蜃樓與聲道：溫度造成的連續折射與「全反射」',
            tag: 'N15',
            wide: true,
            hint: '空氣或海水的溫度隨高度改變，折射率（或聲速）也跟著連續改變，光或聲音就一路彎曲。',
            hintFor: (p) => ({
                road: '夏天柏油路面很燙，貼近路面的空氣很熱、密度小、折射率小。從遠方車子斜斜往下的光，越靠近路面，入射角越大，到了「掠射」時就轉彎往上（相當於全反射），進入你的眼睛。你沿著這條光線的反方向看，會在路面上看到倒立的車子和一片「天空」，像一灘水；車子的輪子反而看不到。右上角是眼睛真正看到的畫面（沒有放大）。',
                superior: '海面很冷（或晚上地面輻射冷卻），上方空氣反而比較暖，叫「逆溫」。這時下層折射率大、上層小，光往下彎，可以繞過地球的弧面：本來被地平線擋住的船看起來浮在海面上，有時還會出現倒立的像。右上角是眼睛真正看到的畫面。',
                nightSound: '聲速 v ∝ √T：溫度高的地方聲音跑得快。晚上地面冷、上方暖，往上斜傳的聲音會彎回地面，所以遠處也聽得到；白天地面熱、上方冷，聲音往上彎，遠處出現聽不清楚的「聲影區」。切換白天／晚上比較；「聲線」選「一條聲線」可以自己調仰角，看它在哪個高度轉彎、多遠回到地面。',
                sofar: '海水上層溫度高、聲速大；深處壓力大，聲速也大；中間約 1000～1300 m 深的地方聲速最小，形成「深海聲道」。聲音往上或往下傳，都會彎回聲速最小的深度，被困在聲道裡傳到數千公里外，就像漸變折射率光纖。<br>預設只畫一條聲線：調整「射出角度」，看橘色虛線（上、下轉折深度）怎麼變；角度太大時聲線會碰到海面或海底。也可以切換成「全部聲線一起看」。'
            })[p.mode] || '',
            note: '連續變化的介質中，光線往折射率大的一側彎曲。',
            noteFor: (p) => ({
                road: '把空氣想成很多水平薄層：由上往下，每一層的 n 都比上一層小一點，所以光從上往下斜射時，每過一層入射角就變大一點（n sinθ 不變）。當入射角增加到 90°，光就轉為向上，這和全反射的條件相同：要「由折射率大射向折射率小」。<br>能被「反射」上來的光，掠射角（光與地面的夾角）非常小：cos θ = n地面／n上方，溫差 25 °C 時只有約 0.4°。所以蜃景只出現在遠處、而且要從很低的角度看。<br>簡化：只考慮溫度造成的折射率變化（氣壓固定），垂直方向放大很多倍才畫得出光線的彎曲。',
                superior: '上現蜃景常出現在冷海面、冰面或晚上輻射冷卻的地面上方。逆溫層中 n 隨高度減少得夠快時（每公尺減少超過 1/R ≈ 1.57×10⁻⁷），光線彎曲得比地球表面還彎，光就沿著海面傳得很遠，稱為大氣波導；遠方的船、島甚至城市都可能被「抬」到地平線上，或拉長、倒立、層層疊疊，即「海市蜃樓」（Fata Morgana）。<br>圖中已把地球曲率畫出來，垂直方向放大很多倍；右上角的小圖則是眼睛實際看到的角度（水平、垂直比例相同）。',
                nightSound: '聲波由聲速 v₁ 的區域進入 v₂ 的區域時 sinθ₁／v₁ = sinθ₂／v₂（θ 是與鉛直方向的夾角）。晚上越往上 v 越大，往上斜傳的聲音入射角越來越大，到 90° 就轉回地面，相當於全反射；仰角小於 cos⁻¹(v地面／v上方) 的聲音都會回到地面。<br>回到地面的聲音還會被地面反射、再彎回來，一跳一跳傳到遠處。所以晚上常聽得到遠處的火車、廟會或工地聲。<br>白天則相反：聲音往上彎，在某個距離之外，地面附近幾乎收不到直接傳來的聲音（聲影區）。',
                sofar: '深海聲道（SOFAR channel）：上層主要受溫度影響（越深越冷、聲速變小），深層主要受壓力影響（越深壓力越大、聲速變大），聲速最小處就是聲道軸。從聲道軸附近發出、傾角不大的聲音，往上會因為聲速變大而彎回、往下也會彎回，不碰到海面或海底，能量損失很小。<br><b>轉折深度怎麼算</b>：把海水想成很多水平薄層，聲波折射時 cos θ ÷ c 保持不變（θ 為聲線與水平的夾角）。聲線往上走，聲速越來越大，cos θ 也越來越大，到 cos θ = 1（變成水平）時就轉彎；所以轉折處的聲速 c = c源 ÷ cos θ₀。射出角度越大，需要的聲速越大，轉折點離聲道軸越遠；如果海面（或海底）的聲速還不夠大，聲音就會碰到海面反射（或被海底吸收）。<br>走大波浪的聲線路徑較長，但經過聲速較大的區域，所以抵達時間和沿聲道軸前進的聲音差不多，這和漸變折射率光纖的道理相同。<br>應用：二戰時用來定位落海的飛行員（在聲道深度引爆小炸彈）、監測海底地震與核試爆、研究鯨魚的長距離叫聲。圖中的溫度曲線為示意。'
            })[p.mode] || '',
            modes: [
                { key: 'road', label: '下現蜃景：炎熱路面' },
                { key: 'superior', label: '上現蜃景：冷海面／晚上（光）' },
                { key: 'nightSound', label: '晚上聲音傳得遠（聲）' },
                { key: 'sofar', label: '深海聲道 SOFAR（聲）' }
            ],
            height: (p, cw) => cw < 640 ? 740 : 470,          // 窄螢幕：分布圖放在場景下方
            cycle: 5,
            controls: [
                { key: 'dT', label: '路面比上方空氣熱 ΔT', min: 0, max: 40, step: 1, value: 25, fmt: (v) => `${v} °C`, only: ['road'] },
                { key: 'eyeH', label: '眼睛高度', min: 0.5, max: 2.0, step: 0.1, value: 1.2, fmt: (v) => `${v.toFixed(1)} m`, only: ['road'] },
                { key: 'objD', label: '車子的距離', min: 250, max: 500, step: 10, value: 450, fmt: (v) => `${v} m`, only: ['road'] },
                { key: 'invT', label: '逆溫：上方比海面暖 ΔT', min: 0, max: 15, step: 1, value: 10, fmt: (v) => `${v} °C`, only: ['superior'] },
                { key: 'layer', label: '逆溫的型態', value: 'smooth', only: ['superior'],
                  options: [{ value: 'smooth', label: '平滑逆溫：船被抬高、浮起來' }, { value: 'layered', label: '強烈的薄逆溫層：多重、倒立的像' }], fmt: () => '' },
                { key: 'eyeS', label: '眼睛高度（海面上）', min: 2, max: 30, step: 1, value: 8, fmt: (v) => `${v} m`, only: ['superior'] },
                { key: 'shipD', label: '船的距離', min: 10, max: 38, step: 1, value: 26, fmt: (v) => `${v} km`, only: ['superior'] },
                { key: 'time', label: '時間', value: 'night', only: ['nightSound'],
                  options: [{ value: 'night', label: '晚上（地面冷、上方暖）' }, { value: 'day', label: '白天（地面熱、上方冷）' }], fmt: () => '' },
                { key: 'dTs', label: '地面與上空的溫差', min: 0, max: 15, step: 1, value: 8, fmt: (v) => `${v} °C`, only: ['nightSound'] },
                { key: 'nRays', label: '聲線', value: 'fan', only: ['nightSound'], fmt: () => '',
                  options: [{ value: 'fan', label: '全部聲線一起看' }, { value: 'one', label: '一條聲線（調整仰角）' }] },
                { key: 'nAng', label: '仰角', min: -4, max: 20, step: 0.5, value: 4, fmt: (v) => `${v}°`, only: ['nightSound'], showIf: (p) => p.nRays === 'one' },
                { key: 'srcZ', label: '聲源深度', min: 100, max: 3000, step: 50, value: 1300, fmt: (v) => `${v} m`, only: ['sofar'] },
                { key: 'sRays', label: '聲線', value: 'one', only: ['sofar'], fmt: () => '',
                  options: [{ value: 'one', label: '一條聲線（調整射出角度）' }, { value: 'fan', label: '全部聲線一起看' }] },
                { key: 'sAng', label: '射出角度（向上為正）', min: -25, max: 25, step: 1, value: 8, fmt: (v) => `${v > 0 ? '+' : ''}${v}°`, only: ['sofar'], showIf: (p) => p.sRays === 'one' },
                { key: 'spread', label: '聲音射出的角度範圍', min: 2, max: 25, step: 1, value: 16, fmt: (v) => `±${v}°`, only: ['sofar'], showIf: (p) => p.sRays !== 'one' }
            ],

            /* ---- 共用：版面、折射率（溫度、聲速）分布圖、物理計算的快取 ---- */
            layout: (w, h) => {
                if (w < 640) {                                      // 窄螢幕：場景佔滿寬度，分布圖移到下方（自己的縱軸）
                    const bot = 430;
                    return { narrow: true, panel: { x: 8, w: w - 16, top: bot + 78, h: h - bot - 78 - 62 }, scene: { x0: 8, x1: w - 8, top: 34, bot } };
                }
                return { narrow: false, panel: { x: 6, w: 184 }, scene: { x0: 200, x1: w - 8, top: 34, bot: h - 44 } };
            },
            /* 分布圖：每一欄一個量，縱軸和場景同高度（Y 為同一個換算） */
            drawPanel: (ctx, lay, Ys, vLo, vHi, cols, w, unitY) => {
                const pn = lay.panel, mL = 30, gap = 6, cw = (pn.w - mL - gap * (cols.length - 1)) / cols.length;
                const Y = lay.narrow ? (v) => pn.top + (vHi - v) / (vHi - vLo) * pn.h : Ys;
                const top = Y(vHi), bot = Y(vLo);
                lay.pBot = bot;
                if (lay.narrow) { ctx.fillStyle = '#f4f8fa'; ctx.fillRect(0, lay.scene.bot + 34, w, ctx.canvas.height); }
                ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fillRect(pn.x, top - 30, pn.w, bot - top + 52);
                ctx.strokeStyle = 'rgba(18,49,58,0.2)'; ctx.lineWidth = 1; ctx.strokeRect(pn.x + 0.5, top - 29.5, pn.w - 1, bot - top + 51);
                // 高度刻度
                unitY.ticks.forEach((v) => {
                    const yy = Y(v);
                    ctx.strokeStyle = 'rgba(18,49,58,0.12)'; ctx.beginPath(); ctx.moveTo(pn.x + mL - 2, yy); ctx.lineTo(pn.x + pn.w - 4, yy); ctx.stroke();
                    labelFit(ctx, unitY.fmt(v), pn.x + mL - 4, yy + 3, C.muted, 9, 'right', { clampW: w });
                });
                cols.forEach((c, i) => {
                    const x0 = pn.x + mL + i * (cw + gap), x1 = x0 + cw;
                    const Xv = (v) => x0 + 3 + (Math.max(c.lo, Math.min(c.hi, v)) - c.lo) / (c.hi - c.lo) * (cw - 6);
                    ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, bot); ctx.lineTo(x1, bot); ctx.stroke();
                    ctx.strokeStyle = c.color; ctx.lineWidth = 2; ctx.beginPath();
                    for (let k = 0; k <= 160; k++) { const v = vLo + (vHi - vLo) * k / 160, X = Xv(c.f(v)); if (k) ctx.lineTo(X, Y(v)); else ctx.moveTo(X, Y(v)); }
                    ctx.stroke();
                    if (c.mark != null && c.mark >= c.lo && c.mark <= c.hi) {   // 例如轉折處的聲速：垂直虛線和曲線的交點就是轉折深度
                        dashed(ctx, Xv(c.mark), top, Xv(c.mark), bot, c.markColor || C.orange);
                        if (c.markLabel) labelFit(ctx, c.markLabel, Xv(c.mark), bot + 34, c.markColor || C.orange, 8, 'center', { clampW: w });
                    }
                    labelFit(ctx, c.name, x0, top - 16, c.color, 10, 'left', { maxW: cw + gap, clampW: w });
                    labelFit(ctx, c.fmt(c.lo), x0, bot + 12, C.muted, 8, 'left', { clampW: w });
                    labelFit(ctx, `${c.fmt(c.hi)} →`, x1, bot + 22, C.muted, 8, 'right', { clampW: w });
                });
                labelFit(ctx, unitY.name, pn.x + 4, top - 16, C.muted, 9, 'left', { clampW: w });
            },
            /* 右上角的「眼睛看到的畫面」：橫、縱同比例（角度） */
            drawView: (ctx, box, aLo, aHi, draw, w) => {
                ctx.save();
                ctx.fillStyle = '#ffffff'; ctx.fillRect(box.x - 2, box.y - 18, box.w + 4, box.h + 22);
                ctx.strokeStyle = 'rgba(18,49,58,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(box.x - 1.5, box.y - 17.5, box.w + 3, box.h + 21);
                labelFit(ctx, '眼睛看到的畫面（不放大）', box.x + 2, box.y - 5, C.ink, 10, 'left', { maxW: box.w, clampW: w });
                ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
                const ppd = box.h / (aHi - aLo);                    // 每度幾 px
                const A = (aDeg) => box.y + (aHi - aDeg) * ppd;
                draw(A, ppd);
                ctx.restore();
            },
            cache: {},
            data: (p) => {
                const L = LABS.mirage, key = JSON.stringify([p.mode, p.dT, p.eyeH, p.objD, p.invT, p.layer, p.eyeS, p.shipD, p.time, p.dTs, p.srcZ, p.spread, p.sRays, p.sAng, p.nRays, p.nAng]);
                if (L.cache.key !== key) { L.cache = { key, d: L['calc_' + p.mode](p) }; }
                return L.cache.d;
            },
            readouts: (p) => {
                const L = LABS.mirage, d = L.data(p);
                if (p.mode === 'road') {
                    const nf = mirageRoadN(p.dT), g = nf(0), top = nf(7), grazing = deg(Math.acos(Math.min(1, g[0] / top[0])));
                    return [
                        { label: '路面／2 m 高處的氣溫', value: `${(30 + p.dT).toFixed(0)} °C／${(nf(2)[2] - 273.15).toFixed(0)} °C` },
                        { label: '折射率 n（路面 → 上方）', value: `${g[0].toFixed(6)} → ${top[0].toFixed(6)}` },
                        { label: '能被「反射」上來的最大掠射角', value: p.dT > 0 ? `約 ${grazing.toFixed(2)}°` : '沒有（溫度均勻）' },
                        { label: '路面「積水」看起來從', value: d.puddle ? `約 ${Math.round(d.puddle)} m 開始` : '看不到' },
                        { label: '車子的倒立像', value: d.twin ? `看得到：離地 ${d.twin.lo.toFixed(1)}～${d.twin.hi.toFixed(1)} m 這一段被「反射」` : '看不到' },
                        { label: '車子離地多高以下看不到', value: d.hidden > 0.02 ? `約 ${d.hidden.toFixed(1)} m（輪子「消失」）` : '整台都看得到' }
                    ];
                }
                if (p.mode === 'superior') {
                    const dip = Math.sqrt(2 * p.eyeS / MIRAGE_R), horizon = Math.sqrt(2 * MIRAGE_R * p.eyeS) / 1000;
                    return [
                        { label: '幾何地平線距離', value: `約 ${horizon.toFixed(1)} km（地平線低於水平 ${deg(dip).toFixed(2)}°）` },
                        { label: '逆溫層中 n 隨高度的減少率（最大）', value: `${(d.maxGrad * 1e7).toFixed(1)} ×10⁻⁷ /m` },
                        { label: '和地球曲率 1/R = 1.57 ×10⁻⁷ /m 比較', value: d.maxGrad > 1 / MIRAGE_R ? '光比地球表面還彎 → 光沿海面傳得遠' : '光彎得比地球表面少' },
                        { label: `${p.shipD} km 外的船`, value: d.status }
                    ];
                }
                if (p.mode === 'nightSound') {
                    const nf = soundAirN(p.dTs, p.time === 'night'), cg = nf(0)[3], ct = nf(250)[3];
                    if (d.one) return [
                        { label: '地面聲速／250 m 高處', value: `${cg.toFixed(1)} m/s／${ct.toFixed(1)} m/s` },
                        { label: '轉折處的聲速 = c源 ÷ cos θ₀', value: d.turn ? `${d.turn.cT.toFixed(1)} m/s` : '—（仰角 ≤ 0，直接往地面）' },
                        { label: '轉折高度', value: d.turn ? (d.turn.y !== null ? `約 ${Math.round(d.turn.y)} m` : '沒有：上方聲速不夠大，聲音一直往上') : '—' },
                        { label: '第一次回到地面', value: d.back !== null ? `約 ${Math.round(d.back)} m 外` : '回不到地面' }
                    ];
                    return [
                        { label: '地面聲速／250 m 高處', value: `${cg.toFixed(1)} m/s／${ct.toFixed(1)} m/s` },
                        { label: '能彎回地面的最大仰角', value: p.time === 'night' && ct > cg ? `約 ${deg(Math.acos(cg / ct)).toFixed(1)}°（cos θ = v地面／v上方）` : '沒有（聲音往上彎）' },
                        { label: '聲音到得了的地面範圍', value: d.reachTxt },
                        { label: '2 km 外的人', value: d.listener }
                    ];
                }
                const nf = sofarN(), cs = nf(0)[3], cb = nf(-5000)[3], c1 = nf(-p.srcZ)[3];
                const lim = Math.min(cs, cb);
                if (d.one) return [
                    { label: '聲源處聲速', value: `${c1.toFixed(1)} m/s` },
                    { label: '轉折處的聲速 = c源 ÷ cos θ₀', value: `${d.cT.toFixed(1)} m/s` },
                    { label: '上轉折深度', value: d.zUp !== null ? `約 ${Math.round(d.zUp)} m` : `沒有（海面聲速 ${d.cS.toFixed(1)} m/s 還不夠大）` },
                    { label: '下轉折深度', value: d.zDn !== null ? `約 ${Math.round(d.zDn)} m` : `沒有（海底聲速 ${d.cB.toFixed(1)} m/s 還不夠大）` },
                    { label: '結果', value: d.bottom ? '打到海底，能量被吸收' : d.surface ? '在海面反射後繼續前進，每次反射都損失能量' : '被困在聲道裡，不碰海面、海底，傳得很遠' },
                    { label: '一個波浪的水平長度', value: d.period ? `約 ${(d.period / 1000).toFixed(0)} km` : '—' }
                ];
                return [
                    { label: '聲道軸（聲速最小）', value: `約 1300 m 深，${nf(-1300)[3].toFixed(0)} m/s` },
                    { label: '海面／海底（5000 m）聲速', value: `${cs.toFixed(0)}／${cb.toFixed(0)} m/s` },
                    { label: '從聲源出發、不碰海面海底的最大傾角', value: c1 < lim ? `約 ±${deg(Math.acos(c1 / lim)).toFixed(1)}°` : '沒有' },
                    { label: '被困在聲道內的聲線', value: `${d.trapped} / ${d.rays.length} 條` }
                ];
            },

            /* ---- 物理計算（只和參數有關，結果快取） ---- */
            calc_road: (p) => {
                const nf = mirageRoadN(p.dT), eye = p.eyeH, D = p.objD, H = 1.5, xMax = 520;
                const aLo = -rad(1.2), aHi = Math.atan((H - eye) / D) + rad(0.25), M = 320, al = [], ys = [];
                for (let i = 0; i < M; i++) {
                    const a = aLo + (aHi - aLo) * i / (M - 1);
                    al.push(a); ys.push(gradTrace(nf, 0, eye, a, { xMax: D, yMin: 0, yMax: 60, ds: 0.5, every: 1e9 }).yEnd);
                }
                const solve = (yo) => mirageSolve(al, ys, yo);
                const inverted = Array.from({ length: 40 }, (_, j) => H * j / 39).some((yo) => solve(yo).length > 1);
                const full = { xMax, yMin: 0, yMax: 60, ds: 0.5, every: 6 };
                // 最低仍能轉上去（不打到路面）的視線 → 「積水」起點
                let lo = aLo, hi = 0;
                if (gradTrace(nf, 0, eye, -1e-6, full).end === 'bottom') hi = lo;
                for (let k = 0; k < 22 && hi > lo; k++) { const m = (lo + hi) / 2; if (gradTrace(nf, 0, eye, m, full).end === 'bottom') lo = m; else hi = m; }
                const aT = hi, puddle = aT < -1e-5 ? eye / Math.tan(-aT) : null;
                const fan = Array.from({ length: 17 }, (_, i) => -rad(0.9) + rad(1.05) * i / 16).map((a) => gradTrace(nf, 0, eye, a, full));
                const lowY = (() => { let best = null; for (let j = 0; j <= 60; j++) { const yo = H * j / 60; if (solve(yo).length > 1) { best = yo; break; } } return best; })();
                const twin = (() => { if (lowY === null) return null; let hiY = lowY; for (let yo = lowY; yo < H; yo += 0.02) if (solve(yo).length > 1) hiY = yo; else break; return { lo: lowY, hi: hiY }; })();
                const tgt = twin ? (twin.lo + twin.hi) / 2 : H * 0.7;
                const hl = (twin ? solve(tgt).slice(0, 2) : solve(tgt).slice(0, 1)).map((a) => ({ a, r: gradTrace(nf, 0, eye, a, { ...full, xMax: D }) }));
                let hidden = 0; for (let j = 0; j <= 60; j++) { const yo = H * j / 60; if (solve(yo).length) break; hidden = yo; }
                return { solve, inverted, twin, tgt, hidden, puddle: puddle && puddle < xMax ? puddle : null, aT, fan, hl, H };
            },
            calc_superior: (p) => {
                const nf = mirageSeaN(p.invT, p.layer === 'layered'), eye = p.eyeS, D = p.shipD * 1000, H = 25, xMax = 40000;
                const aLo = -rad(0.4), aHi = rad(0.5), M = 640, al = [], ys = [];
                for (let i = 0; i < M; i++) {
                    const a = aLo + (aHi - aLo) * i / (M - 1);
                    al.push(a); ys.push(gradTrace(nf, 0, eye, a, { xMax: D, yMin: 0, yMax: 3000, ds: 40, every: 1e9 }).yEnd);
                }
                const solve = (yo) => mirageSolve(al, ys, yo);
                const full = { xMax, yMin: 0, yMax: 3000, ds: 25, every: 8 };
                const fan = Array.from({ length: 19 }, (_, i) => -rad(0.24) + rad(0.36) * i / 18).map((a) => gradTrace(nf, 0, eye, a, full));
                const hl = mirageSolve(al, ys, H * 0.6).slice(0, 3).map((a) => ({ a, r: gradTrace(nf, 0, eye, a, { ...full, xMax: D }) }));
                let maxGrad = 0;
                for (let h = 0; h <= 60; h += 0.25) maxGrad = Math.max(maxGrad, -nf(h)[4]);
                let maxCount = 0, seen = 0, minA = Infinity;
                for (let j = 0; j <= 50; j++) { const s = solve(H * j / 50); maxCount = Math.max(maxCount, s.length); if (s.length) { seen++; minA = Math.min(minA, ...s); } }
                const dip = Math.sqrt(2 * eye / MIRAGE_R);
                const status = !seen ? '在地平線以下，看不到'
                    : maxCount > 1 ? `最多同時看到 ${maxCount} 個像（正立、倒立上下疊在一起）`
                    : seen < 46 ? `只看得到上面約 ${Math.round(seen / 51 * 100)}%（船身被地平線擋住）`
                    : minA > -dip * 0.5 ? '整艘船都看得到，而且浮在地平線上方' : '整艘船都看得到';
                return { solve, fan, hl, maxGrad, status, H };
            },
            calc_nightSound: (p) => {
                const night = p.time === 'night', nf = soundAirN(p.dTs, night), xMax = 3000;
                const o = { xMax, yMin: 0, yMax: 250, ds: 2, bottom: 'reflect', top: 'stop', every: 5 };
                const one = p.nRays === 'one';
                const rays = (one ? [rad(p.nAng)] : Array.from({ length: 17 }, (_, i) => rad(-4 + 1.25 * i))).map((a) => gradTrace(nf, 0, 1.5, a, o));
                // 一條聲線：轉折高度（c = c源 ÷ cos θ₀）與第一次回到地面的距離
                let turn = null;
                if (one && p.nAng > 0) {
                    const c = (y) => nf(y)[3], cT = c(1.5) / Math.cos(rad(p.nAng));
                    if (night && c(250) >= cT) { let lo = 1.5, hi = 250; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (c(m) < cT) lo = m; else hi = m; } turn = { y: (lo + hi) / 2, cT }; }
                    else turn = { y: null, cT };
                }
                // 地面附近收到聲音的距離（每 100 m 一格）
                const bins = new Array(30).fill(0);
                rays.forEach((r) => {
                    r.hits.forEach((x) => { const b = Math.floor(x / 100); if (b >= 0 && b < 30) bins[b] += 1; });
                    for (let i = 1; i < r.pts.length; i++) {        // 貼地（2 m 內）經過的也算
                        const q = r.pts[i]; if (q.y < 2) { const b = Math.floor(q.x / 100); if (b >= 0 && b < 30) bins[b] += 0.5; }
                    }
                });
                let last = -1; for (let b = 0; b < 30; b++) if (bins[b] > 0) last = b; else if (b > 2) break;
                const reach = (last + 1) * 100;
                const lb = bins[20] + bins[19];
                return {
                    rays, bins, one, turn, back: one && rays[0].hits.length ? rays[0].hits[0] : null,
                    reachTxt: reach >= 3000 ? '一直到 3 km 外' : `約 ${reach} m 內，之後是聲影區`,
                    listener: lb > 0 ? '聽得到（有聲音彎回地面）' : '在聲影區，幾乎聽不到'
                };
            },
            calc_sofar: (p) => {
                const nf = sofarN(), o = { xMax: 120000, yMin: -5000, yMax: 0, ds: 60, bottom: 'stop', top: 'reflect', every: 6 };
                const one = p.sRays === 'one';
                const angs = one ? [rad(p.sAng)] : Array.from({ length: 15 }, (_, i) => rad(-p.spread + 2 * p.spread * i / 14));
                const rays = angs.map((a) => gradTrace(nf, 0, -p.srcZ, a, o));
                const trapped = rays.filter((r) => r.end === 'far' && r.pts.every((q) => q.y < -0.5)).length;
                if (!one) return { rays, trapped, one };
                /* 轉折深度：聲線變成水平之處，cos θ ÷ c 不變 → c(z) = c源 ÷ cos θ₀ */
                const c = (z) => nf(-z)[3], cT = c(p.srcZ) / Math.cos(rad(p.sAng));
                const solve = (lo, hi) => { for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if ((c(m) - cT) * (c(lo) - cT) > 0) lo = m; else hi = m; } return (lo + hi) / 2; };
                const zUp = c(0) >= cT ? solve(0, 1300) : null, zDn = c(5000) >= cT ? solve(1300, 5000) : null;
                // 一個波浪的水平長度：相鄰兩個最高點的距離
                const r = rays[0], tops = [];
                for (let i = 1; i + 1 < r.pts.length; i++) if (r.pts[i].y >= r.pts[i - 1].y && r.pts[i].y > r.pts[i + 1].y) tops.push(r.pts[i].x);
                const period = tops.length > 1 ? tops[1] - tops[0] : null;
                const surface = r.pts.some((q) => q.y > -0.5);
                return { rays, trapped, one, cT, zUp, zDn, period, surface, bottom: r.end === 'bottom', cS: c(0), cB: c(5000) };
            },

            /* 下方參考資料：依模式顯示（目前只有深海聲道） */
            teach: `
                <div data-teach="sofar">
                    <h4>深海聲道：真實資料與鯨魚的長距離通訊</h4>
                    <figure class="teach-fig">
                        <img src="assets/images/real/sofar-sound-speed-profile.jpg" alt="海洋中聲速、溫度、鹽度隨深度的變化：(a) 聲速在約 1000 m 深處最小；(b) 溫度在上層快速下降、深處幾乎不變，鹽度變化很小" loading="lazy">
                        <figcaption>(a) 聲速隨深度的變化：表層約 1500 m/s，往下先變慢，約 1000 m 深處最小（約 1480 m/s），再往下又變快。(b) 溫度與鹽度：上層溫度隨深度快速下降（溫躍層），所以聲速變小；約 1000 m 以下溫度幾乎不變，但壓力隨深度持續增加，聲速又變大。鹽度的變化很小，影響不大。<small>參考圖：海洋學教科書（出處待補）。上方模擬使用 Munk 標準聲速剖面，聲速最小處約在 1300 m，與此圖的海域略有不同；實際深度依海域與季節而異。</small></figcaption>
                    </figure>
                    <h5>鯨魚：遠距離交流專家</h5>
                    <p>利用深海聲道把聲音傳得很遠，海軍不是第一個。鬚鯨（例如藍鯨、長鬚鯨）會發出頻率很低的叫聲，長鬚鯨的叫聲約 20 Hz，低頻聲音在海水中被吸收得少；如果聲音進入深海聲道，往上、往下都會被「彎回來」，不必碰到海面和海底，能量損失很小，可以傳到很遠的地方。據報導，長鬚鯨的叫聲在海面附近只能傳約 250 公里，透過深海聲道卻可能傳到數千公里外。</p>
                    <p>美國海軍在冷戰時期沿著海底布設水下聽音器陣列（SOSUS），原本是為了追蹤潛艇。冷戰後，康乃爾大學的克拉克（Christopher Clark）教授用這套系統追蹤北大西洋的藍鯨、長鬚鯨、座頭鯨與小鬚鯨。他說，從同一個地點，他可以同時聽到百慕達外海與紐芬蘭外海的鯨魚。</p>
                    <h5>海洋裡最響的動物</h5>
                    <p>金氏世界紀錄中，最響的動物聲音是抹香鯨的「喀答」聲，可達 236 分貝。不過水中的分貝和空氣中的分貝不能直接比較：水中以 1 μPa 為參考壓力（空氣是 20 μPa），而且水和空氣的聲阻抗不同；換算成相同的聲強，水中的分貝數約要減去 62 才能和空氣中的數字比較。即使如此，約 174 分貝仍然非常驚人。</p>
                    <p>人類製造的噪音（船隻、探勘）也在深海聲道裡傳得很遠，壓縮了鯨魚能夠彼此聽見的範圍，這是海洋保育關心的問題。</p>
                    <p class="teach-src">資料來源：<a href="https://news.cornell.edu/node/282662" target="_blank" rel="noopener">Cornell Chronicle（2005）</a>、<a href="https://www.guinnessworldrecords.com/world-records/70669-loudest-animal-sound" target="_blank" rel="noopener">Guinness World Records：Loudest animal sound</a>、<a href="https://oceanexplorer.noaa.gov/explorations/lewis_clark01/background/hydroacoustics/media/sup2_finwhale_sound.html" target="_blank" rel="noopener">NOAA Ocean Explorer：長鬚鯨叫聲</a>、<a href="https://dosits.org/science/movement/sofar-channel/sound-speed-minimum" target="_blank" rel="noopener">DOSITS：SOFAR channel</a>。</p>
                </div>`,
            setup: ({ host, params, disposers }) => {
                const sec = host.querySelector('.lab-teach');
                const sync = () => {
                    if (!sec) return;
                    let any = false;
                    sec.querySelectorAll('[data-teach]').forEach((el) => { const on = el.dataset.teach === params.mode; el.style.display = on ? '' : 'none'; any = any || on; });
                    sec.style.display = any ? '' : 'none';
                };
                host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', sync));
                sync();
            },
            draw: (ctx, w, h, p, t) => LABS.mirage['draw_' + p.mode](ctx, w, h, p, t || 0),
            /* 動畫：光點沿光線前進（依光程或聲音傳播時間） */
            dots: (ctx, rays, map, u, color, byTime) => {
                const tMax = Math.max(...rays.map((r) => r.pts[r.pts.length - 1][byTime ? 'tau' : 'x']));
                const tt = u * tMax * 1.05;
                rays.forEach((r) => {
                    const pts = r.pts, key = byTime ? 'tau' : 'x';
                    if (tt > pts[pts.length - 1][key]) return;
                    let k = 1; while (k < pts.length && pts[k][key] < tt) k++;
                    if (k >= pts.length) return;
                    const A = pts[k - 1], B = pts[k], f = (tt - A[key]) / Math.max(1e-9, B[key] - A[key]);
                    const [X, Y] = map(A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f);
                    ctx.fillStyle = '#fff'; ctx.strokeStyle = color; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(X, Y, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                });
            },
            path: (ctx, r, map, color, width, alpha, dash) => {
                ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
                ctx.beginPath(); r.pts.forEach((q, i) => { const [X, Y] = map(q.x, q.y); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke();
                ctx.restore();
            },
            phase: (t) => (((t % 5) + 5) % 5) / 5,

            /* 深色背景上的標籤用深色底 */
            tag: (ctx, placed, text, x, y, color, w, align, dark) => depthLabel(ctx, placed, text, x, y, color, w, align, dark ? 'rgba(12,28,40,0.74)' : undefined),
            viewBox: (sc, frac, mid) => {
                const narrow = sc.x0 < 20, vw = Math.min(240, (sc.x1 - sc.x0) * (narrow ? 0.56 : 0.44));
                return { x: mid && !narrow ? sc.x0 + (sc.x1 - sc.x0 - vw) * 0.55 : sc.x1 - vw - 6, y: sc.top + (narrow ? 62 : 18), w: vw, h: Math.min(narrow ? 96 : 124, (sc.bot - sc.top) * frac) };
            },
            /* 圖例：窄螢幕拆成兩行 */
            legend: (ctx, placed, sc, w) => {
                const L = LABS.mirage;
                if (sc.x0 < 20) {
                    L.tag(ctx, placed, '橘線：真正的光路', sc.x0 + 6, sc.top + 4, FIBER_RAY, w, 'left');
                    L.tag(ctx, placed, '紫虛線：眼睛以為光走直線', sc.x0 + 6, sc.top + 20, C.violet, w, 'left');
                } else L.tag(ctx, placed, '橘線：真正的光路　紫虛線：眼睛以為光走直線', sc.x0 + 6, sc.top + 4, C.violet, w, 'left');
            },

            /* ---------- 下現蜃景：炎熱路面 ---------- */
            draw_road: (ctx, w, h, p, t) => {
                const L = LABS.mirage, lay = L.layout(w, h), sc = lay.scene, d = L.data(p);
                const xMax = 520, vTop = 6, vBot = -2.4;
                const X = (x) => sc.x0 + 22 + x / xMax * (sc.x1 - sc.x0 - 30), Y = (v) => sc.top + (vTop - v) / (vTop - vBot) * (sc.bot - sc.top);
                const map = (x, y) => [X(x), Y(y)], gy = Y(0);
                const exag = ((sc.bot - sc.top) / (vTop - vBot)) / ((sc.x1 - sc.x0 - 30) / xMax);
                const D = p.objD, eye = p.eyeH, H = d.H, ox = X(D);
                // 天空、熱空氣、路面；路面以下是「虛像」所在的區域
                const sky = ctx.createLinearGradient(0, sc.top, 0, gy);
                sky.addColorStop(0, '#d7ecf7'); sky.addColorStop(1, '#f4fafc');
                ctx.fillStyle = sky; ctx.fillRect(sc.x0, sc.top - 30, sc.x1 - sc.x0, gy - sc.top + 30);
                if (p.dT > 0) {
                    const hot = ctx.createLinearGradient(0, Y(1.0), 0, gy);
                    hot.addColorStop(0, 'rgba(240,120,40,0)'); hot.addColorStop(1, `rgba(240,120,40,${0.08 + p.dT / 40 * 0.3})`);
                    ctx.fillStyle = hot; ctx.fillRect(sc.x0, Y(1.0), sc.x1 - sc.x0, gy - Y(1.0));
                }
                ctx.fillStyle = '#ece6da'; ctx.fillRect(sc.x0, gy, sc.x1 - sc.x0, h - gy);
                ctx.fillStyle = '#5f6468'; ctx.fillRect(sc.x0, gy, sc.x1 - sc.x0, 7);
                if (d.puddle) { ctx.fillStyle = 'rgba(140,200,240,0.95)'; ctx.fillRect(X(d.puddle), gy, sc.x1 - X(d.puddle), 7); }
                // 背景光線（由眼睛反推；光實際由物體射向眼睛）
                d.fan.forEach((r) => L.path(ctx, r, map, '#8a9aa3', 1, r.end === 'bottom' ? 0.35 : 0.6));
                const slab = (yo) => [yo];                          // 真實物體：高度就是自己
                mirageImages(ctx, 'car', ox, 22, H, slab, (v) => Y(v), 60, 1, 1);
                // 像：沿著進入眼睛的方向直直看回去，在車子的位置看到的（倒立的像在路面以下）
                if (d.inverted) mirageImages(ctx, 'car', ox, 22, H, (yo) => d.solve(yo).slice(1), (a) => Y(eye + D * Math.tan(a)), 90, rad(0.2), 0.5);
                d.hl.forEach((s) => {
                    L.path(ctx, s.r, map, FIBER_RAY, 2.2, 1);
                    L.path(ctx, { pts: [{ x: 0, y: eye }, { x: D, y: eye + D * Math.tan(s.a) }] }, map, C.violet, 1.4, 0.9, [5, 4]);
                });
                L.dots(ctx, d.hl.map((s) => s.r), map, L.phase(t), FIBER_RAY, false);
                ctx.fillStyle = '#1d2b33'; ctx.beginPath(); ctx.arc(X(0), Y(eye), 4.5, 0, Math.PI * 2); ctx.fill();
                const placed = []; placed.hMax = h;
                L.tag(ctx, placed, `垂直方向放大約 ${Math.round(exag)} 倍`, sc.x0 + 6, sc.top - 12, C.muted, w, 'left');
                L.legend(ctx, placed, sc, w);
                L.tag(ctx, placed, '眼睛', X(0) + 2, Y(eye) - 10, C.ink, w, 'left');
                L.tag(ctx, placed, '遠方的車', ox + 26, Y(H * 0.8), '#9b1f2a', w, 'left');
                if (d.twin) L.tag(ctx, placed, '倒立的像（虛像，看起來在路面下）', ox - 16, Y(eye + D * Math.tan(d.solve(d.tgt)[1])) + 4, C.violet, w, 'right');
                if (d.puddle) L.tag(ctx, placed, `約 ${Math.round(d.puddle)} m 外看起來像積水（其實是天空的像）`, Math.max(sc.x0 + 6, X(d.puddle) - 40), gy + 22, '#1f5f86', w, 'left');
                L.tag(ctx, placed, '路面以下：虛像的位置', sc.x0 + 6, sc.bot + 2, C.muted, w, 'left');
                // 分布圖
                const nf = mirageRoadN(p.dT);
                L.drawPanel(ctx, lay, Y, 0, vTop, [
                    { name: '溫度', lo: 25, hi: 75, f: (v) => nf(v)[2] - 273.15, color: C.rose, fmt: (v) => `${v}°C` },
                    { name: '折射率', lo: 1.000245, hi: 1.000285, f: (v) => nf(v)[0], color: C.blue, fmt: (v) => `${((v - 1) * 1e6).toFixed(0)}` }
                ], w, { name: '高度', ticks: [0, 2, 4, 6], fmt: (v) => `${v} m` });
                labelFit(ctx, '折射率以 (n − 1)×10⁶ 標示', lay.panel.x + 4, lay.pBot + 36, C.muted, 9, 'left', { maxW: lay.panel.w, clampW: w });
                labelFit(ctx, '越靠近路面：越熱、n 越小', lay.panel.x + 4, lay.pBot + 50, C.rose, 9, 'left', { maxW: lay.panel.w, clampW: w });
                // 眼睛看到的畫面
                const box = L.viewBox(sc, 0.36, true);
                L.drawView(ctx, box, -0.45, 0.65, (A, ppd) => {
                    ctx.fillStyle = '#d7ecf7'; ctx.fillRect(box.x, box.y, box.w, A(0) - box.y);
                    ctx.fillStyle = '#6b6f73'; ctx.fillRect(box.x, A(0), box.w, box.y + box.h - A(0));
                    if (d.puddle) { ctx.fillStyle = 'rgba(170,215,242,1)'; ctx.fillRect(box.x, A(0), box.w, A(deg(d.aT)) - A(0)); }
                    mirageImages(ctx, 'car', box.x + box.w / 2, deg(2.25 / D) * ppd, H, d.solve, (a) => A(deg(a)), 100, rad(0.2), 1);
                }, w);
            },

            /* ---------- 上現蜃景：冷海面上的逆溫 ---------- */
            draw_superior: (ctx, w, h, p, t) => {
                const L = LABS.mirage, lay = L.layout(w, h), sc = lay.scene, d = L.data(p);
                const xMax = 40000, vTop = 90, vBot = -130;
                const X = (x) => sc.x0 + 22 + x / xMax * (sc.x1 - sc.x0 - 30), Y = (v) => sc.top + (vTop - v) / (vTop - vBot) * (sc.bot - sc.top);
                const drop = (x) => x * x / (2 * MIRAGE_R);
                const map = (x, hh) => [X(x), Y(hh - drop(x))];
                const exag = ((sc.bot - sc.top) / (vTop - vBot)) / ((sc.x1 - sc.x0 - 30) / xMax);
                const D = p.shipD * 1000, eye = p.eyeS, H = d.H, layered = p.layer === 'layered';
                const sky = ctx.createLinearGradient(0, sc.top, 0, sc.bot);
                sky.addColorStop(0, '#dcecf5'); sky.addColorStop(1, '#f6fafc');
                ctx.fillStyle = sky; ctx.fillRect(sc.x0, sc.top - 30, sc.x1 - sc.x0, h - sc.top + 30);
                // 暖空氣（逆溫）
                if (p.invT > 0) {
                    const band = (h0, h1, alpha) => {
                        ctx.fillStyle = `rgba(240,140,60,${alpha})`; ctx.beginPath();
                        for (let i = 0; i <= 60; i++) { const [a, b] = map(xMax * i / 60, h0); if (i) ctx.lineTo(a, b); else ctx.moveTo(a, b); }
                        for (let i = 60; i >= 0; i--) ctx.lineTo(...map(xMax * i / 60, h1));
                        ctx.closePath(); ctx.fill();
                    };
                    band(0, 60, 0.04 + p.invT / 15 * 0.08);
                    if (layered) band(15, 25, 0.06 + p.invT / 15 * 0.14);
                }
                // 海面（地球是弧面）
                ctx.fillStyle = '#2f6f8f'; ctx.beginPath(); ctx.moveTo(sc.x0, h);
                ctx.lineTo(sc.x0, map(0, 0)[1]);
                for (let i = 0; i <= 80; i++) ctx.lineTo(...map(xMax * i / 80, 0));
                ctx.lineTo(sc.x1, h); ctx.closePath(); ctx.fill();
                d.fan.forEach((r) => L.path(ctx, r, map, '#7c8c95', 1, r.end === 'bottom' ? 0.35 : 0.6));
                const [sx, sy] = map(D, 0);
                mirageObject(ctx, 'ship', sx, (yo) => map(D, yo)[1], H, 22, {});
                d.hl.forEach((s) => {
                    L.path(ctx, s.r, map, FIBER_RAY, 2, 1);
                    const pts = [];
                    for (let i = 0; i <= 20; i++) { const x = D * i / 20; pts.push({ x, y: eye + x * Math.tan(s.a) + drop(x) }); }
                    L.path(ctx, { pts }, map, C.violet, 1.3, 0.9, [5, 4]);
                });
                L.dots(ctx, d.hl.map((s) => s.r), map, L.phase(t), FIBER_RAY, false);
                ctx.fillStyle = '#1d2b33'; ctx.beginPath(); ctx.arc(...map(0, eye), 4.5, 0, Math.PI * 2); ctx.fill();
                const placed = []; placed.hMax = h;
                L.tag(ctx, placed, `垂直方向放大約 ${Math.round(exag)} 倍`, sc.x0 + 6, sc.top - 12, C.muted, w, 'left');
                L.legend(ctx, placed, sc, w);
                L.tag(ctx, placed, '眼睛', X(0) + 2, Y(eye) - 10, C.ink, w, 'left');
                L.tag(ctx, placed, '船', sx + 28, sy - 8, '#ffffff', w, 'left', true);
                L.tag(ctx, placed, '冷海面（地球表面是弧形）', X(xMax * 0.06), map(xMax * 0.06, 0)[1] + 24, '#ffffff', w, 'left', true);
                if (p.invT > 0) { const fx = lay.narrow ? 0.06 : 0.28; L.tag(ctx, placed, layered ? '逆溫層：約 20 m 高處溫度突然升高' : '逆溫：越往上越暖', X(xMax * fx), map(xMax * fx, lay.narrow ? 70 : 52)[1], '#b5541c', w, 'left'); }
                const nf = mirageSeaN(p.invT, layered);
                L.drawPanel(ctx, lay, Y, 0, vTop, [
                    { name: '溫度', lo: 0, hi: 25, f: (v) => nf(v)[2] - 273.15, color: C.rose, fmt: (v) => `${v}°C` },
                    { name: '折射率', lo: 1.000284, hi: 1.000306, f: (v) => nf(v)[3], color: C.blue, fmt: (v) => `${((v - 1) * 1e6).toFixed(0)}` }
                ], w, { name: '高度', ticks: [0, 30, 60, 90], fmt: (v) => `${v} m` });
                labelFit(ctx, '折射率以 (n − 1)×10⁶ 標示', lay.panel.x + 4, lay.pBot + 36, C.muted, 9, 'left', { maxW: lay.panel.w, clampW: w });
                labelFit(ctx, '越往上：越暖、n 越小', lay.panel.x + 4, lay.pBot + 50, C.rose, 9, 'left', { maxW: lay.panel.w, clampW: w });
                const box = L.viewBox(sc, 0.34), dip = deg(Math.sqrt(2 * eye / MIRAGE_R));
                L.drawView(ctx, box, -0.2, 0.08, (A, ppd) => {
                    ctx.fillStyle = '#dcecf5'; ctx.fillRect(box.x, box.y, box.w, box.h);
                    ctx.fillStyle = '#2f6f8f'; ctx.fillRect(box.x, A(-dip), box.w, box.y + box.h - A(-dip));
                    mirageImages(ctx, 'ship', box.x + box.w / 2, deg(30 / D) * ppd, H, d.solve, (a) => A(deg(a)), 140, rad(0.02), 1);
                    dashed(ctx, box.x, A(0), box.x + box.w, A(0), 'rgba(18,49,58,0.45)');
                }, w);
                labelFit(ctx, '虛線：水平方向　海面：沒有折射時的地平線', box.x, box.y + box.h + 15, C.muted, 9, 'left', { maxW: box.w, clampW: w });
            },

            /* ---------- 晚上聲音傳得遠 ---------- */
            draw_nightSound: (ctx, w, h, p, t) => {
                const L = LABS.mirage, lay = L.layout(w, h), sc = lay.scene, d = L.data(p), night = p.time === 'night';
                const xMax = 3000, vTop = 250, gy = sc.bot - 4;
                const X = (x) => sc.x0 + 22 + x / xMax * (sc.x1 - sc.x0 - 30), Y = (v) => sc.top + (vTop - v) / vTop * (gy - sc.top);
                const map = (x, y) => [X(x), Y(y)];
                const sky = ctx.createLinearGradient(0, sc.top, 0, gy);
                if (night) { sky.addColorStop(0, '#26324f'); sky.addColorStop(1, '#4b5a78'); } else { sky.addColorStop(0, '#cfe7f5'); sky.addColorStop(1, '#f1f8fb'); }
                ctx.fillStyle = sky; ctx.fillRect(sc.x0, sc.top - 30, sc.x1 - sc.x0, gy - sc.top + 30);
                ctx.fillStyle = night ? '#3f4a35' : '#8fae6a'; ctx.fillRect(sc.x0, gy, sc.x1 - sc.x0, h - gy);
                if (!d.one) d.bins.forEach((b, i) => {
                    ctx.fillStyle = b > 0 ? 'rgba(80,220,140,0.95)' : 'rgba(170,170,170,0.7)';
                    ctx.fillRect(X(i * 100) + 1, gy + 4, X((i + 1) * 100) - X(i * 100) - 2, 7);
                });
                const col = night ? '#a9cdff' : '#2b6cb0';
                if (d.one && d.turn && d.turn.y !== null) dashed(ctx, sc.x0, Y(d.turn.y), sc.x1, Y(d.turn.y), 'rgba(255,170,90,0.95)');
                d.rays.forEach((r) => L.path(ctx, r, map, col, d.one ? 2.6 : 1.4, r.end === 'top' ? (d.one ? 0.85 : 0.45) : 0.95));
                ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.arc(X(0), Y(1.5), 5, 0, Math.PI * 2); ctx.fill();
                drawPerson(ctx, X(2000), gy, 28, { color: night ? '#e8eef2' : '#1d2b33' });
                const placed = []; placed.hMax = h;
                const ex = Math.round(((gy - sc.top) / vTop) / ((sc.x1 - sc.x0 - 30) / xMax));
                L.tag(ctx, placed, `垂直方向放大約 ${ex} 倍`, sc.x0 + 6, sc.top - 12, C.muted, w, 'left');
                L.tag(ctx, placed, night ? '晚上：越往上越暖，聲音往下彎回地面' : '白天：越往上越冷，聲音往上彎', sc.x0 + 6, sc.top + 4, night ? '#ffe39a' : '#9a4a0c', w, 'left', night);
                L.tag(ctx, placed, '聲源', X(0) + 6, gy - 14, '#ffd27a', w, 'left', true);
                L.tag(ctx, placed, '2 km 外的人', X(2000) + 12, gy - 34, night ? '#ffffff' : C.ink, w, 'left', night);
                if (d.one && d.turn && d.turn.y !== null) L.tag(ctx, placed, `轉折高度 約 ${Math.round(d.turn.y)} m：聲速 = ${d.turn.cT.toFixed(1)} m/s，聲線變水平後往下彎`, sc.x0 + 6, Y(d.turn.y) - 6, '#ffc58a', w, 'left', night);
                if (!d.one) L.tag(ctx, placed, '地面：綠色＝聲音到得了　灰色＝聲影區', sc.x1 - 4, gy + 26, C.ink, w, 'right');
                else if (d.back !== null) L.tag(ctx, placed, `約 ${Math.round(d.back)} m 外回到地面（被地面反射後再往上）`, X(d.back), gy + 26, C.ink, w, 'center');
                const nf = soundAirN(p.dTs, night);
                L.drawPanel(ctx, lay, Y, 0, vTop, [
                    { name: '溫度', lo: 10, hi: 35, f: (v) => nf(v)[2] - 273.15, color: C.rose, fmt: (v) => `${v}°C` },
                    { name: '聲速', lo: 336, hi: 352, f: (v) => nf(v)[3], color: C.blue, fmt: (v) => `${v}`, mark: d.one && d.turn ? d.turn.cT : null, markColor: '#d9822b' }
                ], w, { name: '高度', ticks: [0, 100, 200], fmt: (v) => `${v} m` });
                labelFit(ctx, '聲速單位 m/s；v ∝ √T', lay.panel.x + 4, lay.pBot + 36, C.muted, 9, 'left', { maxW: lay.panel.w, clampW: w });
            },

            /* ---------- 深海聲道 ---------- */
            draw_sofar: (ctx, w, h, p, t) => {
                const L = LABS.mirage, lay = L.layout(w, h), sc = lay.scene, d = L.data(p);
                const xMax = 120000, vTop = 250, vBot = -5000;
                const X = (x) => sc.x0 + 22 + x / xMax * (sc.x1 - sc.x0 - 30), Y = (v) => sc.top + (vTop - v) / (vTop - vBot) * (sc.bot - sc.top);
                const map = (x, y) => [X(x), Y(y)];
                ctx.fillStyle = '#e9f3f8'; ctx.fillRect(sc.x0, sc.top - 30, sc.x1 - sc.x0, Y(0) - sc.top + 30);
                const sea = ctx.createLinearGradient(0, Y(0), 0, Y(vBot));
                sea.addColorStop(0, '#2b7fa3'); sea.addColorStop(1, '#0b2f45');
                ctx.fillStyle = sea; ctx.fillRect(sc.x0, Y(0), sc.x1 - sc.x0, Y(vBot) - Y(0));
                ctx.fillStyle = '#5b4a3a'; ctx.fillRect(sc.x0, Y(vBot), sc.x1 - sc.x0, h - Y(vBot));
                dashed(ctx, sc.x0, Y(-1300), sc.x1, Y(-1300), 'rgba(255,230,120,0.95)');
                if (d.one) {
                    [[d.zUp, '上'], [d.zDn, '下']].forEach(([z, nm]) => { if (z !== null) dashed(ctx, sc.x0, Y(-z), sc.x1, Y(-z), 'rgba(255,170,90,0.95)'); });
                }
                d.rays.forEach((r) => L.path(ctx, r, map, d.one ? '#bfeaff' : '#9fe0ff', d.one ? 2.6 : 1.4, r.end === 'bottom' ? (d.one ? 0.8 : 0.35) : 0.95));
                d.rays.filter((r) => r.end === 'bottom').forEach((r) => {
                    const q = r.pts[r.pts.length - 1], [a, b] = map(q.x, q.y);
                    ctx.strokeStyle = '#ff9a7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a - 4, b - 4); ctx.lineTo(a + 4, b + 4); ctx.moveTo(a + 4, b - 4); ctx.lineTo(a - 4, b + 4); ctx.stroke();
                });
                ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(...map(0, -p.srcZ), 5, 0, Math.PI * 2); ctx.fill();
                const placed = []; placed.hMax = h;
                const ex = Math.round(((sc.bot - sc.top) / (vTop - vBot)) / ((sc.x1 - sc.x0 - 30) / xMax));
                L.tag(ctx, placed, `水平 120 km，垂直方向放大約 ${ex} 倍`, sc.x0 + 6, sc.top - 12, C.muted, w, 'left');
                L.tag(ctx, placed, '聲源', X(0) + 10, Y(-p.srcZ) - 10, '#ffd166', w, 'left', true);
                L.tag(ctx, placed, '聲道軸：聲速最小（約 1300 m 深）', sc.x1 - 6, Y(-1300) - 8, '#ffe58a', w, 'right', true);
                if (d.rays.some((r) => r.end === 'bottom')) L.tag(ctx, placed, '× 碰到海底，能量被吸收', sc.x1 - 6, Y(vBot) - 10, '#ffc2ad', w, 'right', true);
                if (d.one) {
                    L.tag(ctx, placed, `射出角度 ${p.sAng > 0 ? '+' : ''}${p.sAng}°`, X(0) + 10, Y(-p.srcZ) + 20, '#ffd166', w, 'left', true);
                    if (d.zUp !== null) L.tag(ctx, placed, `上轉折 約 ${Math.round(d.zUp)} m：聲速 = ${d.cT.toFixed(1)} m/s，聲線變水平後往下彎`, sc.x0 + 6, Y(-d.zUp) - 6, '#ffc58a', w, 'left', true);
                    else L.tag(ctx, placed, '聲速不夠大就到海面：在海面反射', sc.x0 + 6, Y(0) + 18, '#ffc58a', w, 'left', true);
                    if (d.zDn !== null) L.tag(ctx, placed, `下轉折 約 ${Math.round(d.zDn)} m：聲速又是 ${d.cT.toFixed(1)} m/s，往上彎回`, sc.x0 + 6, Y(-d.zDn) + 16, '#ffc58a', w, 'left', true);
                }
                const nf = sofarN();
                L.drawPanel(ctx, lay, Y, vBot, 0, [
                    { name: '溫度(示意)', lo: 0, hi: 26, f: (v) => nf(v)[2], color: C.rose, fmt: (v) => `${v}°C` },
                    { name: '聲速 m/s', lo: 1495, hi: 1560, f: (v) => nf(v)[3], color: C.blue, fmt: (v) => `${v}`, mark: d.one ? d.cT : null, markColor: '#d9822b' }
                ], w, { name: '深度', ticks: [0, -1000, -2000, -3000, -4000, -5000], fmt: (v) => `${-v / 1000} km` });
                if (d.one) labelFit(ctx, '橘虛線與聲速曲線交點＝轉折深度', lay.panel.x + 4, lay.pBot + 36, '#b8691f', 9, 'left', { maxW: lay.panel.w, clampW: w });
            }
        };

