// 互動實驗：視深
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 9b. 視深：岸上看水中、斜看、水中看岸上、多層介質 ------------------- */
        /* 所有像點都由「真實折射光線的反向延長線交點」求得，不是直接代公式畫上去：
         *   兩條從物體出發、進入眼睛的相鄰光線，各自依司乃耳定律折射，
         *   在觀察者所在介質中反向延長，交點就是眼睛看到的像。
         * 近乎正上方時交點與 h' = h·n'/n 一致；斜看時交點才會偏離公式。 */
        const DEPTH_MEDIA = { '1.33': '水', '1.5': '玻璃', '2.42': '鑽石' };
        const depthMedium = (n) => DEPTH_MEDIA[String(n)] || '介質';
        const depthWindow = (p) => p.tank === 'home' ? '玻璃' : p.tank === 'custom' ? (p.ng >= 1.505 ? '玻璃' : '壓克力') : '壓克力';
        function depthFish(ctx, x, y, size, dir, ghost) {
            ctx.save();
            ctx.translate(x, y); ctx.scale(dir, 1);
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.48, 0, 0, Math.PI * 2);
            ctx.moveTo(-size * 0.85, 0);
            ctx.lineTo(-size * 1.55, -size * 0.5); ctx.lineTo(-size * 1.55, size * 0.5); ctx.closePath();
            if (ghost) {
                ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(194,38,74,0.85)'; ctx.lineWidth = 1.5;
                ctx.fillStyle = 'rgba(194,38,74,0.10)'; ctx.fill(); ctx.stroke();
            } else {
                ctx.fillStyle = '#f08a24'; ctx.fill();
                ctx.strokeStyle = '#a4540a'; ctx.lineWidth = 1.2; ctx.stroke();
                ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(size * 0.55, -size * 0.1, size * 0.12, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }
        function depthBird(ctx, x, y, size, ghost) {
            ctx.save();
            ctx.lineWidth = ghost ? 1.6 : 2.6; ctx.lineCap = 'round';
            ctx.strokeStyle = ghost ? 'rgba(194,38,74,0.85)' : '#3a2f7a';
            if (ghost) ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(x - size, y - size * 0.45);
            ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.6, x, y);
            ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.6, x + size, y - size * 0.45);
            ctx.stroke();
            ctx.restore();
        }
        function depthEye(ctx, x, y, look) {
            // look: 'down' | 'up' | 'right' —— 瞳孔偏向觀看方向
            const dx = look === 'right' ? 2.5 : 0, dy = look === 'down' ? 1.8 : look === 'up' ? -1.8 : 0;
            ctx.save();
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.ellipse(x, y, 11, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + dx, y + dy, 3.4, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        /* 在單調函數上二分求根（f(lo) 與 f(hi) 異號） */
        function depthSolve(f, lo, hi) {
            let flo = f(lo);
            for (let i = 0; i < 60; i++) {
                const mid = (lo + hi) / 2, fm = f(mid);
                if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
            }
            return (lo + hi) / 2;
        }
        /* 兩條直線 P1 + t·d1 與 P2 + u·d2 的交點 */
        function depthIntersect(p1, d1, p2, d2) {
            const den = d1[0] * d2[1] - d1[1] * d2[0];
            if (Math.abs(den) < 1e-12) return null;
            const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den;
            return [p1[0] + d1[0] * t, p1[1] + d1[1] * t];
        }
        /* 垂直尺寸線：左右各一條短橫線，中間文字放在 labelX */
        function depthBracket(ctx, x, y1, y2, color, dash) {
            ctx.save();
            if (dash) ctx.setLineDash([4, 3]);
            ctx.strokeStyle = color; ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y1); ctx.lineTo(x, y2);
            ctx.moveTo(x - 5, y1); ctx.lineTo(x + 5, y1);
            ctx.moveTo(x - 5, y2); ctx.lineTo(x + 5, y2);
            ctx.stroke();
            ctx.restore();
        }

        /* ---- 光束（兩條光線）求解：座標以公尺計，y 向上為正，水面為 y = 0 ----
         * 物點 O 發出的光進入眼睛 E 的瞳孔上、下兩緣 P±（垂直於視線、相距 2a）。
         * 每條光線都是真實光路；把眼睛端的那一段反向延長，兩線交點就是看到的像。 */
        function depthCross(O, nO, P, nP) {
            // O、P 在水面兩側：求折射點 S=(xs,0)，滿足 nO·sinθO = nP·sinθP
            if (Math.abs(O[0] - P[0]) < 1e-9) return O[0];
            const f = (xs) => nO * (xs - O[0]) / Math.hypot(xs - O[0], O[1]) - nP * (P[0] - xs) / Math.hypot(P[0] - xs, P[1]);
            let lo = Math.min(O[0], P[0]), hi = Math.max(O[0], P[0]);
            for (let i = 0; i < 64; i++) {
                const mid = (lo + hi) / 2;
                if (f(mid) > 0) hi = mid; else lo = mid;
            }
            return (lo + hi) / 2;
        }
        const depthNorm = (v) => { const L = Math.hypot(v[0], v[1]) || 1; return [v[0] / L, v[1] / L]; };
        function depthPencil(O, E, nWater, a, kind) {
            // kind: 'auto'（直接或折射）或 'mirror'（水面反射）
            const nOf = (pt) => (pt[1] < 0 ? nWater : 1);
            const nO = nOf(O), nE = nOf(E);
            const edges = (dir) => {
                const u = [-dir[1], dir[0]];
                return [[E[0] + u[0] * a, E[1] + u[1] * a], [E[0] - u[0] * a, E[1] - u[1] * a]];
            };
            if (kind === 'mirror') {
                const Om = [O[0], -O[1]];                     // 平面鏡的虛像
                const hit = (P) => { const k = Om[1] / (Om[1] - P[1]); return [Om[0] + (P[0] - Om[0]) * k, 0]; };
                const S0 = hit(E);
                const rays = edges(depthNorm([E[0] - S0[0], E[1] - S0[1]])).map((P) => ({ pts: [O, hit(P), P], S: hit(P), P }));
                const cosi = Math.abs(E[1]) / Math.hypot(E[0] - S0[0], E[1]);
                return { type: 'mirror', rays, img: Om, S0, cosi, R: fresnelR(nE, nE === 1 ? nWater : 1, cosi) };
            }
            if ((O[1] < 0) === (E[1] < 0)) {
                const rays = edges(depthNorm([E[0] - O[0], E[1] - O[1]])).map((P) => ({ pts: [O, P], P }));
                return { type: 'direct', rays, img: O };
            }
            const S0 = [depthCross(O, nO, E, nE), 0];
            const rays = edges(depthNorm([E[0] - S0[0], E[1] - S0[1]])).map((P) => {
                const S = [depthCross(O, nO, P, nE), 0];
                return { pts: [O, S, P], S, P };
            });
            const d1 = depthNorm([rays[0].S[0] - rays[0].P[0], rays[0].S[1] - rays[0].P[1]]);
            const d2 = depthNorm([rays[1].S[0] - rays[1].P[0], rays[1].S[1] - rays[1].P[1]]);
            const img = depthIntersect(rays[0].S, d1, rays[1].S, d2) || O;
            return { type: 'refract', rays, img, S0 };
        }
        /* 畫布標籤避讓：已放的標籤外框記在 placed，重疊就往下挪 */
        function depthLabel(ctx, placed, text, x, y, color, w, align, plate) {
            ctx.font = '11px Outfit, "Noto Sans TC", sans-serif';
            const tw = ctx.measureText(text).width;
            let left = align === 'right' ? x - tw : align === 'center' ? x - tw / 2 : x;
            left = Math.max(2, Math.min(left, w - tw - 2));
            const hMax = placed.hMax || Infinity;
            const hits = (yv) => placed.some((b) => left < b.x + b.w + 3 && left + tw + 3 > b.x && yv - 12 < b.y + 3 && yv + 3 > b.y - 12);
            // 依序嘗試 y、y+15、y−15、y+30…，並保持在畫布內
            let yy = Math.max(14, Math.min(y, hMax - 4));
            for (let k = 1; k <= 48 && hits(yy); k++) {
                const cand = y + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 14;
                if (cand >= 14 && cand <= hMax - 4) yy = cand;
            }
            placed.push({ x: left, y: yy, w: tw });
            labelFit(ctx, text, left, yy, color, 11, 'left', { clampW: w, plate: plate || 'rgba(255,255,255,0.88)' });
        }

        /* ---- 視深評估練習：湖邊玩水 ----
         * 身體部位高度採常用人體比例（以身高 H 為 1）：膝 0.285、胯 0.47、肚臍 0.60、胸 0.72、肩 0.82、下巴 0.87、口鼻約 0.90。
         * 分區以這些位置為界；出題時避開分界 ±0.02，避免答案模稜兩可。 */
        const BODY_MARKS = [
            { key: 'knee', label: '膝', f: 0.285 }, { key: 'crotch', label: '胯', f: 0.47 }, { key: 'waist', label: '肚臍', f: 0.60 },
            { key: 'chest', label: '胸', f: 0.72 }, { key: 'shoulder', label: '肩', f: 0.82 }, { key: 'mouth', label: '口鼻', f: 0.90 }
        ];
        const BODY_ZONES = [
            { key: 'z0', label: '小腿（膝蓋以下）', max: 0.285 },
            { key: 'z1', label: '大腿（膝蓋到胯下）', max: 0.47 },
            { key: 'z2', label: '腰腹（胯下以上、胸口以下）', max: 0.66 },
            { key: 'z3', label: '胸口（肩膀以下）', max: 0.80 },
            { key: 'z4', label: '肩頸（肩膀到下巴）', max: 0.88 },
            { key: 'z5', label: '淹過口鼻（有溺水危險）', max: Infinity }
        ];
        const bodyZone = (r) => BODY_ZONES.find((z) => r < z.max);
        const LAKE_N = 4 / 3;
        function lakeQuestion() {
            const heights = [150, 160, 170, 180];
            // 先平均挑一個身體分區，再找符合的身高與視深，讓各種情況出現的機會相近
            const target = BODY_ZONES[Math.floor(Math.random() * BODY_ZONES.length)];
            for (let tries = 0; tries < 2000; tries++) {
                const H = heights[Math.floor(Math.random() * heights.length)];
                const hp = 3 * (10 + Math.floor(Math.random() * 41));          // 看起來的深度：30–150 cm，3 的倍數
                const real = hp * LAKE_N;
                const r = real / H, rp = hp / H;
                if (r > 1.15) continue;
                const near = BODY_ZONES.slice(0, -1).some((z) => Math.abs(r - z.max) < 0.02);
                if (near || (tries < 1500 && bodyZone(r) !== target)) continue;
                // 多數題目刻意讓「以為的位置」與「實際位置」落在不同區，凸顯錯覺
                if (target.key !== 'z0' && bodyZone(r) === bodyZone(rp) && Math.random() < 0.75) continue;
                return numQ({ H, hp, real, r, rp });
            }
            return numQ({ H: 160, hp: 90, real: 120, r: 0.75, rp: 0.5625 });
        }
        function numQ(q) {
            const zone = bodyZone(q.r), illusion = bodyZone(q.rp);
            return Object.assign(q, { kind: 'num', zone, illusion, answerKey: zone.key, choices: BODY_ZONES,
                realLabel: zone.label, appLabel: illusion.label });
        }
        /* 用生活物品估：一般人是拿熟悉的東西比高度，例如「湖水看起來大概有一張課桌那麼深」。
         * 物品高度為常見的大約值；實際水位依身高而不同，出題時避開身體分區交界 ±0.02。 */
        const LAKE_OBJECTS = [
            { key: 'shoe', label: '一隻運動鞋', cm: 12 },
            { key: 'bottle', label: '一瓶 1.5 公升寶特瓶', cm: 30 },
            { key: 'stool', label: '椅子的座面', cm: 45 },
            { key: 'desk', label: '一張課桌', cm: 75 },
            { key: 'counter', label: '廚房流理台', cm: 85 },
            { key: 'washer', label: '一台直立式洗衣機', cm: 100 },
            { key: 'fridge', label: '一台雙門冰箱', cm: 150 }
        ];
        const lakeObjectWidth = (key, hpx) => ({ shoe: Math.max(18, hpx * 2.4), bottle: hpx * 0.3, stool: hpx * 0.9, desk: hpx * 1.0,
            counter: hpx * 0.9, washer: hpx * 0.68, fridge: hpx * 0.48 })[key] || hpx * 0.5;
        function objQuestion() {
            const heights = [150, 160, 170, 180];
            for (let tries = 0; tries < 500; tries++) {
                const obj = LAKE_OBJECTS[Math.floor(Math.random() * LAKE_OBJECTS.length)];
                const H = heights[Math.floor(Math.random() * heights.length)];
                const hp = obj.cm, real = hp * LAKE_N, r = real / H, rp = hp / H;
                if (BODY_ZONES.slice(0, -1).some((z) => Math.abs(r - z.max) < 0.02)) continue;
                const zone = bodyZone(r), illusion = bodyZone(rp);
                return { kind: 'obj', obj, H, hp, real, r, rp, zone, illusion, answerKey: zone.key, choices: BODY_ZONES,
                    realLabel: zone.label, appLabel: obj.label };
            }
            const obj = LAKE_OBJECTS[3];
            return { kind: 'obj', obj, H: 160, hp: 75, real: 100, r: 0.625, rp: 75 / 160, zone: bodyZone(0.625), illusion: bodyZone(75 / 160),
                answerKey: bodyZone(0.625).key, choices: BODY_ZONES, realLabel: bodyZone(0.625).label, appLabel: obj.label };
        }
        /* 生活物品的簡圖：底部中心在 (x, yB)，高度 hpx */
        function drawLakeObject(ctx, key, x, yB, hpx, style) {
            const st = style || {};
            ctx.save();
            ctx.strokeStyle = st.color || '#5a4632'; ctx.fillStyle = st.fill || 'rgba(160,120,80,0.35)'; ctx.lineWidth = 1.6;
            if (st.dash) ctx.setLineDash([4, 3]);
            const yT = yB - hpx;
            if (key === 'shoe') {
                const w = Math.max(18, hpx * 2.4);
                ctx.beginPath(); ctx.moveTo(x - w / 2, yB); ctx.lineTo(x + w / 2, yB); ctx.lineTo(x + w / 2, yB - hpx * 0.45);
                ctx.quadraticCurveTo(x + w * 0.2, yB - hpx * 0.5, x, yT); ctx.lineTo(x - w / 2, yT); ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (key === 'bottle') {
                const w = hpx * 0.3;
                ctx.beginPath(); ctx.moveTo(x - w / 2, yB); ctx.lineTo(x - w / 2, yB - hpx * 0.72); ctx.lineTo(x - w * 0.18, yB - hpx * 0.9);
                ctx.lineTo(x - w * 0.18, yT); ctx.lineTo(x + w * 0.18, yT); ctx.lineTo(x + w * 0.18, yB - hpx * 0.9); ctx.lineTo(x + w / 2, yB - hpx * 0.72);
                ctx.lineTo(x + w / 2, yB); ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (key === 'stool' || key === 'desk') {
                const w = lakeObjectWidth(key, hpx), t = Math.max(3, hpx * 0.07);
                ctx.fillRect(x - w / 2, yT, w, t); ctx.strokeRect(x - w / 2, yT, w, t);
                ctx.beginPath(); ctx.moveTo(x - w / 2 + 4, yT + t); ctx.lineTo(x - w / 2 + 4, yB); ctx.moveTo(x + w / 2 - 4, yT + t); ctx.lineTo(x + w / 2 - 4, yB); ctx.stroke();
            } else if (key === 'counter') {
                const w = hpx * 0.9;
                ctx.fillRect(x - w / 2, yT, w, hpx); ctx.strokeRect(x - w / 2, yT, w, hpx);
                ctx.beginPath(); ctx.moveTo(x, yT + hpx * 0.08); ctx.lineTo(x, yB); ctx.moveTo(x - w / 2, yT + hpx * 0.08); ctx.lineTo(x + w / 2, yT + hpx * 0.08); ctx.stroke();
            } else if (key === 'fridge') {
                const w = lakeObjectWidth(key, hpx);
                ctx.fillRect(x - w / 2, yT, w, hpx); ctx.strokeRect(x - w / 2, yT, w, hpx);
                ctx.beginPath(); ctx.moveTo(x - w / 2, yT + hpx * 0.32); ctx.lineTo(x + w / 2, yT + hpx * 0.32);
                ctx.moveTo(x + w / 2 - 6, yT + hpx * 0.12); ctx.lineTo(x + w / 2 - 6, yT + hpx * 0.24);
                ctx.moveTo(x + w / 2 - 6, yT + hpx * 0.40); ctx.lineTo(x + w / 2 - 6, yT + hpx * 0.58); ctx.stroke();
            } else if (key === 'washer') {
                const w = lakeObjectWidth(key, hpx);
                ctx.fillRect(x - w / 2, yT, w, hpx); ctx.strokeRect(x - w / 2, yT, w, hpx);
                ctx.beginPath(); ctx.arc(x, yT + hpx * 0.55, w * 0.3, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x - w / 2, yT + hpx * 0.18); ctx.lineTo(x + w / 2, yT + hpx * 0.18); ctx.stroke();
            } else {
                ctx.restore(); drawPerson(ctx, x, yB, hpx, { color: st.color || '#5a4632', fill: st.fill, dash: st.dash }); return;
            }
            ctx.restore();
        }
        /* 「水到胸口」／「淹過口鼻」：後者本身已有動詞，不再加「水到」 */
        const toWhere = (label) => label.startsWith('淹') ? label : `水到${label}`;
        const newLakeQuestion = (style) => style === 'number' ? lakeQuestion() : objQuestion();
        /* 簡化的人形：腳底在 (x, yFeet)，身高 Hpx；ghost 時畫成虛線 */
        function drawPerson(ctx, x, yFeet, Hpx, style) {
            const st = style || {};
            const y = (f) => yFeet - f * Hpx;
            ctx.save();
            ctx.strokeStyle = st.color || '#2b3a42'; ctx.fillStyle = st.fill || 'rgba(43,58,66,0.12)';
            ctx.lineWidth = st.width || Math.max(2, Hpx * 0.035); ctx.lineCap = 'round';
            if (st.dash) ctx.setLineDash([4, 3]);
            if (st.alpha) ctx.globalAlpha = st.alpha;
            const sw = Hpx * 0.13, hw = Hpx * 0.075;
            ctx.beginPath(); ctx.arc(x, y(0.935), Hpx * 0.065, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y(0.87)); ctx.lineTo(x, y(0.47));                         // 軀幹
            ctx.moveTo(x - sw, y(0.82)); ctx.lineTo(x + sw, y(0.82));               // 肩
            ctx.moveTo(x - sw, y(0.82)); ctx.lineTo(x - sw * 1.1, y(0.47));         // 手臂
            ctx.moveTo(x + sw, y(0.82)); ctx.lineTo(x + sw * 1.1, y(0.47));
            ctx.moveTo(x - hw, y(0.47)); ctx.lineTo(x + hw, y(0.47));               // 骨盆
            ctx.moveTo(x - hw, y(0.47)); ctx.lineTo(x - hw, y(0));                  // 腿
            ctx.moveTo(x + hw, y(0.47)); ctx.lineTo(x + hw, y(0));
            ctx.stroke();
            ctx.restore();
        }

        LABS.apparent_depth = {
            name: '視深：從不同位置與介質看物體',
            tag: 'N14',
            wide: true,            /* 寬螢幕時撐出正文欄寬，見 #main-content.lab-wide */
            hint: '眼睛只能看到「進入眼睛的光線」，並把它們沿直線反向延長，交點就是看到的像。',
            hintFor: (p) => ({
                scene: '拖曳眼睛到水面上或水面下，用勾選框決定要看魚、看鳥，或兩者一起比較。魚在水中游、鳥在空中飛；每個物體各有兩條光線進入瞳孔的上、下緣，把它們反向延長（虛線），兩線交點就是眼睛看到的像。眼睛在水面下時，入射角超過臨界角的地方水面像鏡子，可以看到魚的全反射倒影。',
                above: '站在岸上幾乎正上方看水中的魚：魚發出的光從水進入空氣時偏離法線。把進入眼睛的兩條光線反向延長（虛線），交點就是看到的魚，位置比實際淺。改變深度與介質，比較 h′ 與 h·(1/n)。',
                oblique: '站在池邊斜看池底的硬幣：視線越斜，像越往上浮、也越靠近自己。紅色曲線是整片池底「看起來的位置」——遠處的池底看起來特別淺。虛線是只在正上方才成立的 h/n。',
                below: '潛在水中往上看岸上的鳥：光從空氣進入水中偏向法線。反向延長進入眼睛的光線，交點比鳥實際的位置高，H′ ≈ n·H。',
                practice: '評估練習：一般人估水深是拿熟悉的東西比，例如「看起來大概有一張課桌那麼深」。從岸上幾乎正上方看清澈的湖，湖底「看起來」比實際淺；判斷走進去站直時，水面實際會到身體哪裡。作答後畫面會揭曉。也可切換成用公分數字作答。',
                stack: '先選情境。「全反射判斷」：光由最上層往下入射，調整 θ₁，看光在哪個界面全反射；右側標出每個界面是否可能全反射與所需角度。「視深」：物體在最底層，觀察者在上方空氣中。每一層的厚度與折射率都能調整；光在每個界面依司乃耳定律折射（n·sinθ 在平行界面間守恆）。空氣中的光線反向延長後交會成像，比較近軸像 Σt/n；把光線張角調大，看邊緣光線的像如何偏離。',
                layers: '先找橘色真魚，再沿空氣中的光線向右反推：粉紅色虛像比真魚靠近窗面。光實際往左走，依序經過「水 → 窗材 → 空氣」；實線是光路，粉紅虛線只是反向延長線。'
            })[p.mode] || '',
            note: '視深公式 h′/h = n′/n 只在「觀察者幾乎在正上方」時成立。',
            noteFor: (p) => ({
                scene: '同一介質中光沿直線前進，看到的就是物體本身；光跨過水面才會偏折，像的位置才會改變：在空氣中看水中物體 → 變淺、靠近；在水中看空中物體 → 變高。斜看時像偏離 h/n 越多。<br>水面反射：眼睛在空氣中時，水面只反射約 2%（垂直）到接近 100%（掠射）的光，像一面暗淡的鏡子；眼睛在水下且入射角大於 θ_c 時發生全反射，水面像完美的鏡子（對照泳池水下影片）。<br>圖中瞳孔刻意畫大，方便看出兩條光線如何會聚；讀數中的像位置則以極細光束計算。',
                above: '近軸（幾乎垂直）光線：h′ = h·n′/n，空氣看水中 h′ = 3h/4。像只在<b>鉛直方向</b>被壓縮，水平位置不變，所以插在水中的筷子看起來被折彎。<br>魚其實沒有移動；改變的是光的路徑。',
                oblique: '斜看時，兩條相鄰光線的反向延長線交點不再落在 h/n，而是更淺，並往觀察者方向移動；視線越接近水平，像越貼近水面。這就是游泳池遠處看起來比腳下淺、容易誤判水深的原因。<br>圖中為兩條同平面相鄰光線的交點（子午像）；雙眼左右並排觀看時，大腦判斷的深度會略有不同，但「越斜越淺」的趨勢相同。',
                below: '空氣中的物體從水中看，H′ = H·n′/n = n·H（水約 1.33 倍），看起來變高、變遠。<br>同理，水中的人看岸上的人或鳥，會覺得對方比較高；斜看時這個效果更大。',
                practice: '物品高度為常見的大約值：運動鞋約 12 cm、1.5 公升寶特瓶約 30 cm、椅子座面約 45 cm、課桌約 75 cm、廚房流理台約 85 cm、直立式洗衣機約 100 cm、雙門冰箱約 150 cm。<br>題目假設人站在岸邊、幾乎正上方看腳前方的水；圖中他身上標的公分數依常用人體比例估算。<br>近乎正上方觀看時 h′ = h·n′/n。眼睛在空氣（n′ = 1）、湖底在水中（n = 4/3），所以 h′ = 3h/4，實際深度 h = 4h′/3，比看起來深三分之一。<br>身體部位約略高度（以身高為 100%）：膝 28%、胯 47%、肚臍 60%、胸 72%、肩 82%、下巴 87%、口鼻約 90%。實際比例因人而異，題目答案避開了分界附近的情況。<br>在岸邊斜看遠處時，湖底看起來更淺（見「斜看池底」），實際深度往往比 4/3 倍還深；再加上湖底可能突然變深、有淤泥或水流，判斷水深不能只靠眼睛。<br><b>湖水有雜質，n 會變嗎？</b>溶解的鹽、糖、礦物質會讓 n 稍微變大（純水約 1.333，海水約 1.34），但只差不到 0.5%：看起來 90 cm 的湖，實際深度只多約 0.6 cm，不影響判斷。泥沙、藻類等懸浮物主要讓光散射、水變混濁而看不清湖底，幾乎不改變 n——看不到湖底時，根本無從估計深度。',
                stack: '<b>全反射判斷</b>：平行界面間 n·sinθ 守恆，等於 n₁sinθ₁。光要到達某界面，n₁sinθ₁ 必須小於上方每一層的 n；在該界面全反射則要 n₁sinθ₁ ≥ 下方的 n。所以界面「可能」全反射 ⇔ 下方的 n 小於上方所有層 n 的最小值。以類題為例：(A) 1.5 < 1.7 可能；(B) 1.3 < 1.5 可能；(C) 1.6 比上方大，不可能；(D) 1.4 雖小於 1.6，但光要到 (D) 必須先通過 n = 1.3 的層，n₁sinθ₁ < 1.3 < 1.4，不可能；(E) 1.0 < 1.3 可能。<br><b>視深</b>：近乎正上方觀看時，多層平行介質的視深 = Σ（各層厚度 ÷ 該層折射率），與層的順序無關；把兩層對調，近軸像位置不變。<br>紫色「第 j 層看」標出逐層成像：眼睛若位在第 j 層中看到的像：每經過一個界面，前一次的像成為下一個界面的物。<br>光線張角大時，各對光線的反向延長線交在不同深度，像會模糊；某一層的折射率比下方小很多時，斜的光可能在界面全反射，到不了觀察者。',
                layers: '<b>先看最後的虛像：</b>主圖用兩條對稱光線的反向延長線求交點；它們是求像用的光束，不是同一瞳孔的上下緣。圖中距離使用這組光線的實際交點，與讀數一致。<br><b>接近正視時：</b>近軸視距 ≈ t/n_g + d/n_w。光束角度變大時，圖中的交點會偏離此近似值；不能用同一個近軸像點代表所有斜光線。<br><b>逐面成像（進階）：</b>第一面（水→窗）的近軸像距為 d·n_g/n_w，從內壁量起；第二面（窗→空氣）再把它當作物，得到 (t + d·n_g/n_w)/n_g。第一面的中間像只供計算，不代表窗外的人同時看到兩隻魚。<br><b>為什麼折角很小？</b>水（n = 1.33）和玻璃或壓克力（約 1.5）的折射率接近，光束角度小時偏折尤其不明顯。局部圖保持真實角度，可對照原方向的灰色虛線。家用薄玻璃在主圖中可能很窄，可展開局部圖分別看兩個界面。'
            })[p.mode] || '',
            modes: [
                { key: 'scene', label: '拖曳眼睛：看魚也看鳥' },
                { key: 'above', label: '岸上看水中' },
                { key: 'oblique', label: '斜看池底' },
                { key: 'below', label: '水中看岸上' },
                { key: 'layers', label: '水族箱：空氣—玻璃—水' },
                { key: 'stack', label: '多層視深（2–6 層）' },
                { key: 'practice', label: '評估練習：湖邊玩水' }
            ],
            height: (p, w) => p.mode === 'layers' ? (w >= 900 ? 440 : 360) : p.mode === 'stack' ? 440 : p.mode === 'practice' ? 440
                : p.mode === 'oblique' ? Math.min(380, Math.max(260, Math.round(58 + 4.6 * (w - 20) / 9.5)))
                : p.mode === 'scene' ? Math.min(460, Math.max(300, Math.round(30 + 6.2 * (w - 20) / 10))) : 380,
            cycle: (p) => p.mode === 'scene' ? 14 : 3.2,
            onReset: (p) => { p.eyeX = 2.2; p.eyeY = 1.6; },
            /* 拖曳眼睛（只在「看魚也看鳥」模式）；讀數隨魚與鳥移動更新 */
            setup: ({ canvas, host, params, disposers, paint, syncOutputs }) => {
                const L = LABS.apparent_depth;
                L._sync = syncOutputs;
                const sync = () => {
                    const on = params.mode === 'scene';
                    canvas.style.touchAction = on ? 'none' : '';
                    canvas.style.cursor = on ? 'grab' : '';
                };
                host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', sync));
                sync();
                let dragging = false;
                const move = (e) => {
                    const m = L._map; if (!m) return;
                    const r = canvas.getBoundingClientRect();
                    const x = (e.clientX - r.left - m.ox) / m.s, y = (m.ys - (e.clientY - r.top)) / m.s;
                    let yy = Math.max(-2.9, Math.min(2.9, y));
                    if (Math.abs(yy) < 0.18) yy = yy >= 0 ? 0.18 : -0.18;
                    params.eyeX = Math.max(0.2, Math.min(9.8, x)); params.eyeY = yy;
                    paint(); syncOutputs();
                };
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    if (params.mode !== 'scene') return;
                    dragging = true; canvas.style.cursor = 'grabbing';
                    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* 不支援時略過 */ }
                    move(e);
                });
                disposers.addEventListener(canvas, 'pointermove', (e) => { if (dragging) move(e); });
                const end = () => { if (dragging) { dragging = false; sync(); } };
                disposers.addEventListener(canvas, 'pointerup', end);
                disposers.addEventListener(canvas, 'pointercancel', end);
                // 評估練習：作答面板（只在「評估練習」模式顯示）
                const roAnchor = host.querySelector('.lab-stage');
                L.setupAquarium({ host, params, disposers });
                if (roAnchor && !host.querySelector('.depth-practice')) {
                    roAnchor.insertAdjacentHTML('afterend', `
                        <section class="depth-practice" hidden>
                            <div class="dp-head">
                                <h5>評估練習：湖邊玩水</h5>
                                <div class="dp-head-tools">
                                    <label class="dp-style">出題方式
                                        <select class="lab-select dp-style-sel">
                                            <option value="obj">用生活物品估（一般人的估法）</option>
                                            <option value="number">用公分數字（進階）</option>
                                        </select>
                                    </label>
                                    <button type="button" class="lab-btn dp-new" data-dp="next">🎲 重新出題</button>
                                </div>
                            </div>
                            <p class="dp-q"></p>
                            <label class="dp-depth">① 湖水實際深度約為 <input type="number" inputmode="decimal" min="0" step="1" class="dp-input" aria-label="實際深度（公分）"> cm</label>
                            <div class="dp-zone"><span class="dp-ask"></span><div class="dp-choices"></div></div>
                            <div class="lab-buttons">
                                <button type="button" class="lab-btn" data-dp="check">檢查答案</button>
                                <button type="button" class="lab-btn" data-dp="hint">提示</button>
                            </div>
                            <div class="dp-feedback" aria-live="polite"></div>
                        </section>`);
                    const panel = host.querySelector('.depth-practice');
                    const fb = panel.querySelector('.dp-feedback'), inp = panel.querySelector('.dp-input');
                    const depthRow = panel.querySelector('.dp-depth'), styleSel = panel.querySelector('.dp-style-sel');
                    const fill = () => {
                        const q = L.lakeQ(params);
                        const name = `dp-zone-${host.id}`;
                        depthRow.style.display = '';
                        let prompt, ask;
                        if (q.kind === 'num') {
                            prompt = `身高 <b>${q.H} cm</b> 的同學在湖邊，從幾乎正上方往下看，覺得清澈的湖底「看起來」約 <b>${q.hp} cm</b> 深。水的折射率取 4/3。`;
                            ask = '② 走進去站直時，水面大約會到身體哪裡？';
                        } else {
                            prompt = `身高 <b>${q.H} cm</b> 的同學站在清澈的湖邊，從幾乎正上方往下看，覺得湖水大概有「<b>${q.obj.label}</b>」那麼深（約 ${q.hp} cm）。`;
                            ask = '② 走進去站直時，水面實際會到身體哪裡？（可對照圖中他身上標的公分數）';
                        }
                        panel.querySelector('.dp-q').innerHTML = prompt;
                        panel.querySelector('.dp-ask').textContent = ask;
                        panel.querySelector('.dp-choices').innerHTML = q.choices.map((c) =>
                            `<label class="dp-choice"><input type="radio" name="${name}" value="${c.key}"><span>${c.label}</span></label>`).join('');
                    };
                    const scrub = host.querySelector('.lab-scrub');
                    const playRow = host.querySelector('[data-role="toggle"]')?.closest('.lab-buttons');
                    const showPanel = () => {
                        const on = params.mode === 'practice';
                        panel.hidden = !on;
                        if (scrub) scrub.style.display = on ? 'none' : '';
                        if (playRow) playRow.style.display = on ? 'none' : '';
                        if (on) fill();
                    };
                    host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', showPanel));
                    showPanel();
                    const ok = (b) => b ? '<b class="dp-ok">✔</b>' : '<b class="dp-no">✘</b>';
                    const rule = (q) => q.kind === 'obj'
                        ? `<p class="dp-rule">規則：從岸上幾乎正上方看，湖水實際比看起來深 1/3（× 4/3）。看起來「${q.obj.label}」深，實際約 ${Math.round(q.real)} cm，等於 4/3 個${q.obj.label.replace(/^一(隻|瓶|張|台)/, '')}。</p>`
                        : '<p class="dp-rule">規則：從岸上幾乎正上方看，湖水實際比看起來深 1/3（× 4/3）。</p>';
                    const depthCheck = (q, val) => {
                        const dOK = Math.abs(val - q.real) <= 2;
                        let note = '';
                        if (!dOK && Math.abs(val - q.hp * 0.75) <= 2) note = '（你乘了 3/4，方向反了：實際比看起來<b>深</b>）';
                        else if (!dOK && Math.abs(val - q.hp) <= 2) note = '（這是看起來的深度，還沒換算）';
                        return { dOK, note };
                    };
                    const safety = (r, appLabel) => r >= 0.88 ? `<p class="dp-warn">水會淹過口鼻，有溺水危險！看起來只到${appLabel}，千萬不要貿然下水。</p>`
                        : r >= 0.78 ? '<p class="dp-warn">水到肩膀附近，很難站穩，也容易被水流帶走。</p>' : '';
                    const newQuestion = () => {
                        // 只換題目，不重新載入頁面，模式與畫面都留在原地
                        params._lake = newLakeQuestion(params._lakeStyle || 'obj'); params._lakeChecked = false;
                        inp.value = ''; fb.innerHTML = ''; fill(); paint(); syncOutputs();
                    };
                    disposers.addEventListener(styleSel, 'change', () => { params._lakeStyle = styleSel.value; newQuestion(); });
                    disposers.addEventListener(panel.querySelector('[data-dp="check"]'), 'click', () => {
                        const q = L.lakeQ(params);
                        const pick = panel.querySelector('input[type="radio"]:checked');
                        const val = Number(inp.value);
                        if (!pick || !inp.value || !Number.isFinite(val)) {
                            fb.innerHTML = '請先填寫實際深度，並選擇水面會到的部位。';
                            return;
                        }
                        params._lakeChecked = true;
                        const pickLabel = q.choices.find((c) => c.key === pick.value)?.label;
                        const good = pick.value === q.answerKey;
                        const cmApp = Math.round(q.hp), cmReal = Math.round(q.real);
                        if (q.kind === 'obj') {
                            const d = depthCheck(q, val);
                            const naive = !good && pick.value === q.illusion.key && q.illusion !== q.zone ? '（這是把看起來的深度當成實際深度的結果）' : '';
                            fb.innerHTML = `
                                <p>${ok(d.dOK)} ① 看起來約${q.obj.label}深（約 ${cmApp} cm），實際深度 = 4/3 × ${cmApp} ≈ <b>${cmReal} cm</b>；你的答案 ${val} cm ${d.note}</p>
                                <p>${ok(good)} ② ${cmReal} cm 對照他身上的刻度（${cmReal} ÷ ${q.H} ≈ ${Math.round(q.r * 100)}%）→ <b>${toWhere(q.zone.label)}</b>。你選：${pickLabel} ${naive}</p>
                                <p>錯覺：${q.obj.label}的高度在他身上只到「${q.illusion.label}」一帶，實際卻多了約 ${cmReal - cmApp} cm。</p>
                                ${rule(q)}${safety(q.r, q.illusion.label)}`;
                        } else {
                            const { dOK, note: dNote } = depthCheck(q, val);
                            const zNote = !good && pick.value === q.illusion.key && q.illusion !== q.zone ? '（這是用「看起來的深度」判斷的結果）' : '';
                            fb.innerHTML = `
                                <p>${ok(dOK)} ① 實際深度 h = (4/3) × ${q.hp} = <b>${q.real.toFixed(0)} cm</b>；你的答案 ${val} cm ${dNote}</p>
                                <p>${ok(good)} ② ${q.real.toFixed(0)} ÷ ${q.H} ≈ <b>${Math.round(q.r * 100)}%</b> 身高 → <b>${toWhere(q.zone.label)}</b> ${zNote}</p>
                                <p>錯覺：只看視深，${q.hp} ÷ ${q.H} ≈ ${Math.round(q.rp * 100)}%，會以為只到${q.illusion.label}；實際多了 ${(q.real - q.hp).toFixed(0)} cm。</p>
                                ${rule(q)}${safety(q.r, q.illusion.label)}`;
                        }
                        fb.innerHTML += '<p class="dp-ext">延伸：若站在岸邊斜看遠處，湖底看起來更淺，實際可能比 4/3 倍還深（見「斜看池底」）。</p>';
                        paint(); syncOutputs();
                    });
                    disposers.addEventListener(panel.querySelector('[data-dp="hint"]'), 'click', () => {
                        const q = L.lakeQ(params);
                        fb.innerHTML = q.kind === 'num'
                            ? '<p>提示：近乎正上方看時 h′ = h × 3/4，所以實際深度 h = h′ × 4/3。再算「實際深度 ÷ 身高」，對照：膝 28%、胯 47%、肚臍 60%、胸 72%、肩 82%、口鼻約 90%。</p>'
                            : `<p>提示：${q.obj.label}約 ${q.hp} cm。從空氣看水中，實際深度是看起來的 4/3 倍；算出來後，和圖中他身上標的公分數比一比。</p>`;
                    });
                    disposers.addEventListener(panel.querySelector('[data-dp="next"]'), 'click', () => { newQuestion(); inp.focus({ preventScroll: true }); });
                }
                // 多層類題：一次帶入題目的折射率，切到全反射判斷
                const dirSel = host.querySelector('[id$="apparent_depth-stackDir"]');
                if (dirSel) disposers.addEventListener(dirSel, 'change', () => {
                    if (dirSel.value !== 'quiz') return;
                    const vals = { layers: 6, n1: 1.7, n2: 1.5, n3: 1.3, n4: 1.6, n5: 1.4, n6: 1.0, t1: 5, t2: 5, t3: 5, t4: 5, t5: 5, t6: 5, th1s: 55 };
                    Object.entries(vals).forEach(([k, v]) => {
                        const el = host.querySelector(`[id$="apparent_depth-${k}"]`);
                        if (el) { el.value = String(v); el.dispatchEvent(new Event('input')); }
                    });
                    dirSel.value = 'tir'; dirSel.dispatchEvent(new Event('change'));
                });
                // 水族箱情境：一次帶入實際的厚度、材質與距離
                const tank = host.querySelector('[id$="apparent_depth-tank"]');
                const presets = {
                    home: { t: 1, ng: 1.52, d: 30 },
                    public: { t: 25, ng: 1.49, d: 200 },
                    kuroshio: { t: 60, ng: 1.49, d: 400 }
                };
                let applying = false;
                const setInput = (k, v) => {
                    const el = host.querySelector(`[id$="apparent_depth-${k}"]`);
                    if (!el) return;
                    el.value = String(v); el.dispatchEvent(new Event('input'));
                };
                if (tank) {
                    disposers.addEventListener(tank, 'change', () => {
                        const pr = presets[tank.value]; if (!pr) return;
                        applying = true; Object.entries(pr).forEach(([k, v]) => setInput(k, v)); applying = false;
                    });
                    ['t', 'ng'].forEach((k) => {
                        const el = host.querySelector(`[id$="apparent_depth-${k}"]`);
                        if (el) disposers.addEventListener(el, 'input', () => {
                            if (applying || tank.value === 'custom') return;
                            tank.value = 'custom'; params.tank = 'custom';
                        });
                    });
                }
            },
            /* 動畫：① 光脈衝沿真實光路從物體走到眼睛；② 再由眼睛沿進入方向直線反推到像。
             * fwd / back 是折線陣列（每條為 [[x,y],...]），cap 為說明文字的位置。 */
            animate: (ctx, w, t, fwd, back, cap) => {
                const T = 3.2, u = (((t % T) + T) % T) / T;
                const len = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
                const trace = (pts, f, color, glow) => {
                    const total = len(pts); let left = total * Math.max(0, Math.min(1, f));
                    ctx.save(); ctx.lineCap = 'round';
                    ctx.strokeStyle = glow; ctx.lineWidth = 6; ctx.globalAlpha = 0.55;
                    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
                    let tip = pts[0];
                    for (let i = 1; i < pts.length && left > 0; i++) {
                        const a = pts[i - 1], b = pts[i], sl = Math.hypot(b[0] - a[0], b[1] - a[1]);
                        const k = Math.min(1, left / (sl || 1));
                        tip = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
                        ctx.lineTo(tip[0], tip[1]); left -= sl;
                    }
                    ctx.stroke(); ctx.restore();
                    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = color; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(tip[0], tip[1], 4.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                };
                const plate = 'rgba(255,255,255,0.9)';
                if (u < 0.6) {
                    fwd.forEach((pts) => trace(pts, u / 0.6, '#d48a00', 'rgba(255,214,90,0.9)'));
                    labelFit(ctx, cap[3] || '① 光從物體出發，折射後進入眼睛', cap[0], cap[1], '#8a5a00', 11, cap[2], { clampW: w, plate });
                } else {
                    back.forEach((pts) => trace(pts, (u - 0.6) / 0.4, C.rose, 'rgba(194,38,74,0.35)'));
                    labelFit(ctx, cap[4] || '② 眼睛沿進入的方向直線反推 → 看到像', cap[0], cap[1], C.rose, 11, cap[2], { clampW: w, plate });
                }
            },
            controls: [
                { key: 'nw', label: '水中介質', value: '1.33', only: ['scene', 'above', 'below'],
                  options: [{ value: '1.33', label: '水 n = 1.33' }, { value: '1.5', label: '玻璃 n = 1.50' }, { value: '2.42', label: '鑽石 n = 2.42' }],
                  fmt: () => '' },
                { key: 'showFish', type: 'checkbox', label: '顯示魚（水中）', value: true, only: ['scene'] },
                { key: 'showBird', type: 'checkbox', label: '顯示鳥（空中）', value: true, only: ['scene'] },
                { key: 'fishD', label: '魚的深度', min: 0.3, max: 2.6, step: 0.1, value: 1.2, fmt: (v) => `${v.toFixed(1)} m`, only: ['scene'] },
                { key: 'birdH', label: '鳥的高度', min: 0.4, max: 2.6, step: 0.1, value: 1.8, fmt: (v) => `${v.toFixed(1)} m`, only: ['scene'] },
                { key: 'refl', label: '水面反射', value: 'on', only: ['scene'],
                  options: [{ value: 'on', label: '顯示倒影（反射像）' }, { value: 'off', label: '只看折射與直射' }],
                  fmt: () => '' },
                { key: 'h', label: '魚的實際深度 h', min: 10, max: 100, step: 1, value: 60, fmt: (v) => `${v} cm`, only: ['above'] },
                { key: 'hb', label: '鳥在水面上的高度 H', min: 10, max: 100, step: 1, value: 50, fmt: (v) => `${v} cm`, only: ['below'] },
                { key: 'X', label: '硬幣與池邊的水平距離', min: 0, max: 8, step: 0.1, value: 3, fmt: (v) => `${v.toFixed(1)} m`, only: ['oblique'] },
                { key: 'D', label: '池水深度', min: 0.5, max: 3, step: 0.1, value: 2, fmt: (v) => `${v.toFixed(1)} m`, only: ['oblique'] },
                { key: 'eyeH', label: '眼睛高出水面', min: 0.3, max: 3, step: 0.1, value: 1.6, fmt: (v) => `${v.toFixed(1)} m`, only: ['oblique'] },
                { key: 'stackDir', label: '情境', value: 'depth', only: ['stack'],
                  options: [{ value: 'depth', label: '視深：物體在底層，從上方空氣看' }, { value: 'tir', label: '全反射判斷：光由最上層往下入射' },
                            { value: 'quiz', label: '載入類題：1.7／1.5／1.3／1.6／1.4／1.0' }], fmt: () => '' },
                { key: 'tirHints', type: 'checkbox', label: '顯示各界面判斷（答案提示）', value: false, only: ['stack'], showIf: (p) => p.stackDir !== 'depth' },
                { key: 'th1s', label: '最上層入射角 θ₁', min: 0, max: 89, step: 0.5, value: 55, fmt: (v) => `${v}°`, only: ['stack'], showIf: (p) => p.stackDir !== 'depth' },
                { key: 'layers', label: '層數', min: 2, max: 6, step: 1, value: 3, fmt: (v) => `${v} 層`, only: ['stack'] },
                ...[1.33, 1.50, 1.80, 1.20, 2.00, 1.60].map((nv, i) => ({ key: 'n' + (i + 1), label: `第 ${i + 1} 層折射率 n${'₁₂₃₄₅₆'[i]}`,
                    min: 1, max: 2.5, step: 0.01, value: nv, fmt: (v) => v.toFixed(2), only: ['stack'], showIf: (p) => p.layers >= i + 1 })),
                ...[10, 6, 8, 5, 7, 6].map((tv, i) => ({ key: 't' + (i + 1), label: `第 ${i + 1} 層厚度`,
                    min: 2, max: 20, step: 1, value: tv, fmt: (v) => `${v} cm`, only: ['stack'], showIf: (p) => p.layers >= i + 1 })),
                { key: 'spread', label: '光線張角（底層中）', min: 2, max: 89, step: 1, value: 12, fmt: (v) => `±${v}°`, only: ['stack'], showIf: (p) => p.stackDir === 'depth' },
                { key: 'stackSteps', label: '成像顯示', value: 'final', only: ['stack'], showIf: (p) => p.stackDir === 'depth',
                  options: [{ value: 'final', label: '只看最終像' }, { value: 'steps', label: '逐層成像（中間像）' }], fmt: () => '' },
                { key: 'tank', label: '情境', value: 'public', only: ['layers'],
                  options: [{ value: 'home', label: '家用魚缸：玻璃 1 cm' }, { value: 'public', label: '大型水族館：壓克力 25 cm' },
                            { value: 'kuroshio', label: '超大展示窗：壓克力 60 cm（美ら海）' }, { value: 'custom', label: '自訂' }],
                  fmt: () => '' },
                { key: 'beam', label: '光束張角（水中）', min: 1, max: 70, step: 1, value: 10, fmt: (v) => `±${v}°`, only: ['layers'] },
                { key: 'd', label: '魚到窗內壁的距離 d', min: 10, max: 800, step: 5, value: 200, fmt: (v) => v >= 100 ? `${(v / 100).toFixed(2)} m` : `${v} cm`, only: ['layers'] },
                { key: 't', label: '窗的厚度 t', min: 0.5, max: 70, step: 0.5, value: 25, fmt: (v) => `${v} cm`, only: ['layers'] },
                { key: 'ng', label: '窗材折射率 n_g（玻璃 1.52／壓克力 1.49）', min: 1.4, max: 1.6, step: 0.01, value: 1.49, fmt: (v) => v.toFixed(2), only: ['layers'] },
                { key: 'steps', label: '成像顯示', value: 'final', only: ['layers'],
                  options: [{ value: 'final', label: '只看最後的虛像' }, { value: 'steps', label: '進階：加入第一面的中間像' }],
                  fmt: () => '' }
            ],

            /* ---- 物理：每個模式回傳畫圖與讀數共用的幾何量 ---- */
            above: (p, eyeHalfCm, eyeUpCm) => {
                const n = Number(p.nw), h = p.h;
                // 兩條邊緣光線的水中角 α：恰好打到眼睛（寬 2·eyeHalf）的左右緣
                const reach = (a) => h * Math.tan(a) + eyeUpCm * Math.tan(Math.asin(n * Math.sin(a))) - eyeHalfCm;
                const a = depthSolve(reach, 0, Math.asin(1 / n) - 1e-4);
                const th = Math.asin(n * Math.sin(a));
                const xs = h * Math.tan(a);
                const hImg = xs / Math.tan(th);            // 反向延長線與鉛直線的交點深度
                return { n, h, a, th, xs, hImg, hFormula: h / n };
            },
            below: (p, eyeHalfCm, eyeDownCm) => {
                const n = Number(p.nw), H = p.hb;
                const reach = (th) => H * Math.tan(th) + eyeDownCm * Math.tan(Math.asin(Math.sin(th) / n)) - eyeHalfCm;
                const th = depthSolve(reach, 0, Math.PI / 2 - 1e-3);
                const a = Math.asin(Math.sin(th) / n);
                const xs = H * Math.tan(th);
                const HImg = xs / Math.tan(a);
                return { n, H, th, a, xs, HImg, HFormula: n * H };
            },
            /* 斜看：池邊眼睛在 (0, eyeH)，池底物體在 (X, −D)；回傳真實光路與像點 */
            obliqueTrace: (X, D, eyeH, n) => {
                if (X < 1e-3) return { xs: 0, a: 0, th: 0, img: [0, -D / n] };
                const f = (xs) => n * (X - xs) / Math.hypot(X - xs, D) - xs / Math.hypot(xs, eyeH);
                const xs = depthSolve(f, 0, X);
                const a = Math.atan((X - xs) / D), th = Math.asin(Math.min(1, n * Math.sin(a)));
                // 相鄰光線：水中角 a + δ，從同一個物點出發
                const ray = (aa) => {
                    const x0 = X - D * Math.tan(aa), tt = Math.asin(Math.min(0.999999, n * Math.sin(aa)));
                    return { p: [x0, 0], d: [Math.sin(tt), -Math.cos(tt)] };   // 反向延長（往水下）
                };
                const da = 1e-4, r1 = ray(a), r2 = ray(a + da);
                const img = depthIntersect(r1.p, r1.d, r2.p, r2.d) || [xs, -D / n];
                return { xs, a, th, img };
            },
            obliqueN: 1.33,
            /* 水族箱：水中角 a 的光線依序經 水 → 窗 → 空氣；n_w·sin a ≥ 1 時在外壁全反射 */
            layers: (p, a) => {
                const nw = 1.33, ng = p.ng, t = p.t, d = p.d;
                const b = Math.asin(nw * Math.sin(a) / ng);
                const sAir = nw * Math.sin(a);
                const tir = sAir >= 1;
                const g = tir ? null : Math.asin(sAir);
                const y1 = d * Math.tan(a), y0 = y1 + t * Math.tan(b);
                return { nw, ng, t, d, a, b, g, y1, y0, tir,
                    imgGlass: y1 / Math.tan(b),                   // 第一面成像：距內壁（在窗材中看）
                    imgAir: tir ? null : y0 / Math.tan(g),        // 最終像：距外壁
                    fGlass: d * ng / nw, fAir: t / ng + d / nw };
            },

            readouts: (p) => {
                const L = LABS.apparent_depth;
                if (p.mode === 'scene') {
                    const S = p._scene;
                    if (!S) return [{ label: '眼睛', value: '拖曳畫面中的眼睛' }];
                    const eyeTxt = S.E[1] >= 0 ? `水面上 ${S.E[1].toFixed(1)} m` : `水面下 ${(-S.E[1]).toFixed(1)} m`;
                    const fishTxt = !S.fineF ? '未顯示' : S.fineF.type === 'direct' ? '同在水中：直接看到實際位置'
                        : `像深 ${(-S.fineF.img[1]).toFixed(2)} m（實際 ${(-S.fish[1]).toFixed(2)} m）`;
                    const birdTxt = !S.fineB ? '未顯示' : S.fineB.type === 'direct' ? '同在空氣中：直接看到實際位置'
                        : `像高 ${S.fineB.img[1].toFixed(2)} m（實際 ${S.bird[1].toFixed(2)} m）${S.fineB.img[1] > 3 * S.bird[1] ? '：接近窗緣，像被拉得很高' : ''}`;
                    let mirTxt = p.refl === 'off' ? '已關閉' : (S.E[1] < 0 ? '需要顯示魚' : '需要顯示鳥');
                    if (S.mir) {
                        const ang = deg(Math.acos(Math.min(1, S.mir.cosi)));
                        mirTxt = S.E[1] < 0
                            ? (S.mirTIR ? `魚：全反射（入射 ${ang.toFixed(0)}° > θc ${deg(S.thc).toFixed(1)}°）` : `魚：部分反射 R≈${Math.round(S.mir.R * 100)}%（入射 ${ang.toFixed(0)}°）`)
                            : `鳥：部分反射 R≈${Math.round(S.mir.R * 100)}%（入射 ${ang.toFixed(0)}°）`;
                    }
                    return [
                        { label: '眼睛位置', value: eyeTxt },
                        { label: '看魚', value: fishTxt },
                        { label: '看鳥', value: birdTxt },
                        { label: '水面倒影', value: mirTxt }
                    ];
                }
                if (p.mode === 'above') {
                    const n = Number(p.nw);
                    return [
                        { label: '實際深度 h', value: `${p.h} cm` },
                        { label: '視深 h′ = h·(1/n)', value: `${(p.h / n).toFixed(1)} cm` },
                        { label: '看起來淺了', value: `${(p.h - p.h / n).toFixed(1)} cm（${Math.round((1 - 1 / n) * 100)}%）` },
                        { label: '比值 h′/h = n′/n', value: `${(1 / n).toFixed(3)}` }
                    ];
                }
                if (p.mode === 'below') {
                    const n = Number(p.nw);
                    return [
                        { label: '實際高度 H', value: `${p.hb} cm` },
                        { label: '看起來的高度 H′ = n·H', value: `${(p.hb * n).toFixed(1)} cm` },
                        { label: '看起來高了', value: `${(p.hb * (n - 1)).toFixed(1)} cm` },
                        { label: '比值 H′/H = n′/n', value: `${n.toFixed(2)}` }
                    ];
                }
                if (p.mode === 'oblique') {
                    const n = L.obliqueN, tr = L.obliqueTrace(p.X, p.D, p.eyeH, n);
                    const app = -tr.img[1];
                    return [
                        { label: '視線與鉛直線夾角', value: `${deg(tr.th).toFixed(1)}°` },
                        { label: '正上方公式 D/n', value: `${(p.D / n).toFixed(2)} m` },
                        { label: '斜看時的視深', value: `${app.toFixed(2)} m（${Math.round(app / p.D * 100)}%）` },
                        { label: '像往觀察者移近', value: `${Math.max(0, p.X - tr.img[0]).toFixed(2)} m` }
                    ];
                }
                if (p.mode === 'practice') {
                    const q = L.lakeQ(p), shown = p._lakeChecked === true;
                    if (q.kind === 'obj') return [
                        { label: '身高', value: `${q.H} cm` },
                        { label: '看起來的深度', value: `約${q.obj.label}（約 ${q.hp} cm）` },
                        { label: '實際深度', value: shown ? `約 ${Math.round(q.real)} cm（再深 1/3）` : '作答後揭曉' },
                        { label: '水面在身高的', value: shown ? `${Math.round(q.r * 100)}%：${toWhere(q.realLabel)}` : '作答後揭曉' }
                    ];
                    return [
                        { label: '身高', value: `${q.H} cm` },
                        { label: '看起來的深度 h′', value: `${q.hp} cm` },
                        { label: '實際深度 h', value: shown ? `${q.real.toFixed(0)} cm` : '作答後揭曉' },
                        { label: '水面在身高的', value: shown ? `${Math.round(q.r * 100)}%：${toWhere(q.zone.label)}` : '作答後揭曉' }
                    ];
                }
                if (p.mode === 'stack' && p.stackDir !== 'depth') {
                    const ns = L.stackNs(p), ts = L.stackTs(p), info = L.stackTirInfo(ns);
                    const tr = L.stackTirTrace(ns, ts, rad(p.th1s));
                    const poss = info.map((it, j) => it.possible ? '(' + 'ABCDE'[j] + ')' : null).filter(Boolean);
                    return [
                        { label: '守恆量 n₁·sinθ₁', value: tr.k.toFixed(3) },
                        { label: '這條光線', value: tr.tirAt === null ? '穿過所有界面，從最下層射出' : `在 (${'ABCDE'[tr.tirAt]}) 全反射，回到最上層` },
                        { label: '可能全反射的界面', value: p.tirHints === true ? (poss.length ? poss.join('、') : '沒有') : '勾選「顯示各界面判斷」後顯示' },
                        { label: '判斷法', value: p.tirHints === true ? '下方的 n 小於上方「每一層」的 n' : '先調 θ₁ 自己找找看' }
                    ];
                }
                if (p.mode === 'stack') {
                    const ns = L.stackNs(p), ts = L.stackTs(p);
                    const total = ts.reduce((a, v) => a + v, 0), app = ns.reduce((a, n, i) => a + ts[i] / n, 0);
                    const edge = L.stackTrace(ns, ts, rad(p.spread));
                    const edgeTxt = edge.tir !== null ? (edge.tir === -1 ? '在頂面全反射，到不了空氣' : `在第 ${edge.tir + 1} 層下方界面全反射`)
                        : `${edge.imgDepth.toFixed(1)} cm（與近軸差 ${(app - edge.imgDepth).toFixed(1)} cm）`;
                    return [
                        { label: '實際深度 Σt', value: `${total.toFixed(0)} cm` },
                        { label: '近軸視深 Σt/n', value: `${app.toFixed(1)} cm` },
                        { label: '各層貢獻 t/n', value: ns.map((n, i) => (ts[i] / n).toFixed(1)).join(' + ') },
                        { label: `最斜光線（±${p.spread}°）的像`, value: edgeTxt }
                    ];
                }
                const g = L.layers(p, rad(p.beam));
                return [
                    { label: '魚到外壁的實際距離 t + d', value: `${(p.t + p.d).toFixed(1)} cm` },
                    { label: `圖中光束（±${p.beam}°）的虛像距外壁`, value: g.tir ? '外壁全反射，沒有透射像' : `${g.imgAir.toFixed(1)} cm` },
                    { label: '接近正視的近似值 t/n_g + d/n_w', value: `${g.fAir.toFixed(1)} cm` },
                    { label: '圖中虛像比真魚靠近窗面', value: g.tir ? '這組光線無法射入空氣' : `${(p.t + p.d - g.imgAir).toFixed(1)} cm` }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                const L = LABS.apparent_depth;
                if (p.mode === 'scene') return L.drawScene(ctx, w, h, p, t || 0);
                if (p.mode === 'oblique') return L.drawOblique(ctx, w, h, p, t || 0);
                if (p.mode === 'below') return L.drawBelow(ctx, w, h, p, t || 0);
                if (p.mode === 'layers') return L.drawLayers(ctx, w, h, p, t || 0);
                if (p.mode === 'practice') return L.drawPractice(ctx, w, h, p);
                if (p.mode === 'stack') return p.stackDir === 'tir' ? L.drawStackTir(ctx, w, h, p) : L.drawStack(ctx, w, h, p);
                return L.drawAbove(ctx, w, h, p, t || 0);
            },

            /* ---------- 拖曳眼睛：同時看魚與鳥 ---------- */
            sceneEye: (p) => [Number.isFinite(p.eyeX) ? p.eyeX : 2.2, Number.isFinite(p.eyeY) ? p.eyeY : 1.6],
            scenePos: (p, t) => {
                const fx = 5 + 3.4 * Math.sin(2 * Math.PI * t / 14);
                const fdir = Math.cos(2 * Math.PI * t / 14) >= 0 ? 1 : -1;
                const bx = 5 + 3.6 * Math.sin(2 * Math.PI * t / 7 + 1.3);
                return { fish: [fx, -p.fishD], fdir, bird: [bx, p.birdH] };
            },
            drawScene: (ctx, w, h, p, t) => {
                const L = LABS.apparent_depth, n = Number(p.nw), thc = Math.asin(1 / n);
                const s = Math.min((w - 20) / 10, (h - 30) / 6.2);
                const ox = (w - 10 * s) / 2, ys = 15 + 3.1 * s;
                L._map = { s, ox, ys };
                const X = (x) => ox + x * s, Y = (y) => ys - y * s, P = (pt) => [X(pt[0]), Y(pt[1])];
                const E = L.sceneEye(p), pos = L.scenePos(p, t);
                const eyeInWater = E[1] < 0;
                const a = 11 / s;                                      // 瞳孔半徑（誇大，方便看出兩線會聚）

                // 背景：空氣、水
                const sky = ctx.createLinearGradient(0, 0, 0, ys);
                sky.addColorStop(0, '#e3f1f8'); sky.addColorStop(1, '#f6fbfd');
                ctx.fillStyle = sky; ctx.fillRect(0, 0, w, ys);
                const wg = ctx.createLinearGradient(0, ys, 0, h);
                wg.addColorStop(0, `rgba(60,160,190,${0.22 + (n - 1) * 0.15})`); wg.addColorStop(1, `rgba(20,90,120,${0.34 + (n - 1) * 0.15})`);
                ctx.fillStyle = wg; ctx.fillRect(0, ys, w, h - ys);
                ctx.strokeStyle = 'rgba(18,49,58,0.55)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(0, ys); ctx.lineTo(w, ys); ctx.stroke();

                // 眼睛在水下：斯涅爾窗（看得到水面上方的範圍）
                if (eyeInWater) {
                    const r = -E[1] * Math.tan(thc);
                    ctx.fillStyle = 'rgba(255,226,120,0.20)';
                    ctx.beginPath(); ctx.moveTo(...P(E)); ctx.lineTo(X(E[0] - r), ys); ctx.lineTo(X(E[0] + r), ys); ctx.closePath(); ctx.fill();
                    dashed(ctx, ...P(E), X(E[0] - r), ys, 'rgba(107,70,193,0.6)');
                    dashed(ctx, ...P(E), X(E[0] + r), ys, 'rgba(107,70,193,0.6)');
                }

                const hasFish = p.showFish !== false, hasBird = p.showBird !== false;
                const fishPen = hasFish ? depthPencil(pos.fish, E, n, a, 'auto') : null;
                const birdPen = hasBird ? depthPencil(pos.bird, E, n, a, 'auto') : null;
                // 倒影：眼睛在水下看魚（可能全反射），眼睛在空中看鳥（部分反射）
                const mirObj = eyeInWater ? (hasFish ? pos.fish : null) : (hasBird ? pos.bird : null);
                const mirPen = p.refl !== 'off' && mirObj ? depthPencil(mirObj, E, n, a, 'mirror') : null;
                const mirTIR = mirPen && eyeInWater && n * Math.sqrt(1 - mirPen.cosi * mirPen.cosi) > 1;

                const drawPencil = (pen, color, alpha) => {
                    ctx.save(); ctx.globalAlpha = alpha;
                    pen.rays.forEach((r) => {
                        ctx.strokeStyle = color; ctx.lineWidth = 1.8;
                        ctx.beginPath(); ctx.moveTo(...P(r.pts[0]));
                        for (let i = 1; i < r.pts.length; i++) ctx.lineTo(...P(r.pts[i]));
                        ctx.stroke();
                        const k = r.pts.length - 1, A = P(r.pts[k - 1]), B = P(r.pts[k]);
                        arrow(ctx, A[0], A[1], A[0] + (B[0] - A[0]) * 0.55, A[1] + (B[1] - A[1]) * 0.55, color, 1.8);
                        if (pen.type !== 'direct') dashed(ctx, ...P(r.S), ...P(pen.img), color);
                    });
                    ctx.restore();
                };
                if (mirPen) drawPencil(mirPen, C.rose, mirTIR ? 0.95 : Math.max(0.25, Math.min(0.8, mirPen.R * 6)));
                if (fishPen) drawPencil(fishPen, '#c9650a', 1);
                if (birdPen) drawPencil(birdPen, '#5b3fb5', 1);

                // 物體與像
                if (hasFish) depthFish(ctx, ...P(pos.fish), 13, pos.fdir, false);
                if (hasBird) depthBird(ctx, ...P(pos.bird), 14, false);
                const inView = (pt) => { const q = P(pt); return q[0] > 4 && q[0] < w - 4 && q[1] > 16 && q[1] < h - 6; };
                if (fishPen && fishPen.type === 'refract' && inView(fishPen.img)) depthFish(ctx, ...P(fishPen.img), 13, pos.fdir, true);
                if (birdPen && birdPen.type === 'refract' && inView(birdPen.img)) depthBird(ctx, ...P(birdPen.img), 14, true);
                if (mirPen) {
                    ctx.save(); ctx.globalAlpha = mirTIR ? 1 : 0.6;
                    if (eyeInWater) depthFish(ctx, ...P(mirPen.img), 13, pos.fdir, true);
                    else depthBird(ctx, ...P(mirPen.img), 14, true);
                    ctx.restore();
                }
                depthEye(ctx, ...P(E), eyeInWater ? 'up' : 'down');

                // 標籤（避免互相覆蓋）
                const placed = [];
                placed.hMax = h;
                const ee = P(E);
                depthLabel(ctx, placed, '空氣 n = 1.00', 8, ys - 7, C.ink, w, 'left');
                depthLabel(ctx, placed, `${depthMedium(n)} n = ${n.toFixed(2)}`, 8, ys + 15, C.blue, w, 'left');
                if (eyeInWater) depthLabel(ctx, placed, `斯涅爾窗（±${deg(thc).toFixed(1)}°）`, X(E[0]), ys + 15, C.violet, w, 'center');
                depthLabel(ctx, placed, '眼睛（可拖曳）', ee[0] + 14, ee[1] - 10, C.ink, w, 'left');
                if (!hasFish && !hasBird) depthLabel(ctx, placed, '勾選「顯示魚」或「顯示鳥」', w / 2, ys - 40, C.muted, w, 'center');
                if (fishPen && fishPen.type === 'refract') { const q = P(fishPen.img); depthLabel(ctx, placed, '看到的魚（像）', q[0] + 16, q[1] - 8, '#a4540a', w, 'left'); }
                else if (fishPen) { const q = P(pos.fish); depthLabel(ctx, placed, '魚：直接看到', q[0] + 18, q[1] - 8, '#a4540a', w, 'left'); }
                if (!birdPen) { /* 未顯示鳥 */ }
                else if (birdPen.type === 'refract' && inView(birdPen.img)) { const q = P(birdPen.img); depthLabel(ctx, placed, '看到的鳥（像）', q[0] + 18, q[1] - 6, '#3a2f7a', w, 'left'); }
                else if (birdPen.type === 'refract') {
                    // 接近斯涅爾窗邊緣：像被拉得極高，落在畫面外；標籤放在虛線離開畫面處
                    const S0 = P(birdPen.rays[0].S), q = P(birdPen.img);
                    const k = Math.max(0, Math.min(1, (S0[1] - 24) / Math.max(1e-6, S0[1] - q[1])));
                    depthLabel(ctx, placed, '鳥的像在畫面上方（接近窗緣，被拉得很高）', S0[0] + (q[0] - S0[0]) * k, 24, '#3a2f7a', w, 'center');
                }
                else { const q = P(pos.bird); depthLabel(ctx, placed, '鳥：直接看到', q[0] + 18, q[1] - 6, '#3a2f7a', w, 'left'); }

                if (mirPen) {
                    const q = P(mirPen.img);
                    const txt = eyeInWater ? (mirTIR ? '魚的倒影（全反射）' : `魚的倒影（部分反射 ${Math.round(mirPen.R * 100)}%）`)
                        : `鳥的倒影（反射 ${Math.round(mirPen.R * 100)}%）`;
                    depthLabel(ctx, placed, txt, q[0] + 18, q[1] + 18, C.rose, w, 'left');
                }

                // 讀數用的資料（像的位置以極細光束求，避免瞳孔誇大造成誤差）
                const fineF = hasFish ? depthPencil(pos.fish, E, n, 1e-4, 'auto') : null;
                const fineB = hasBird ? depthPencil(pos.bird, E, n, 1e-4, 'auto') : null;
                p._scene = { E, fish: pos.fish, bird: pos.bird, fineF, fineB, mir: mirPen, mirTIR, thc };
                const now = performance.now();
                if (L._sync && (!L._lastSync || now - L._lastSync > 300)) { L._lastSync = now; L._sync(); }
            },

            /* ---------- 岸上看水中 ---------- */
            drawAbove: (ctx, w, h, p, t) => {
                const n = Number(p.nw);
                const ys = Math.round(h * 0.34), cx = Math.round(w * 0.42);
                const s = (h - ys - 34) / 104;                  // px / cm
                const eyeY = 34, eyeHalf = 22;
                const g = LABS.apparent_depth.above(p, eyeHalf / s, (ys - eyeY) / s);
                ctx.fillStyle = 'rgba(11,111,146,0.04)'; ctx.fillRect(0, 0, w, ys);
                ctx.fillStyle = `rgba(11,111,146,${0.08 + (n - 1) * 0.12})`; ctx.fillRect(0, ys, w, h - ys);
                ctx.strokeStyle = 'rgba(18,49,58,0.5)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(0, ys); ctx.lineTo(w, ys); ctx.stroke();
                dashed(ctx, cx, eyeY + 10, cx, h - 16, 'rgba(18,49,58,0.28)');

                const fy = ys + g.h * s, iy = ys + g.hImg * s;
                const fwd = [], back = [];
                // 兩條邊緣光線 + 中央光線：水中實線，空氣中實線，反向延長虛線
                [-1, 0, 1].forEach((sg) => {
                    const xs = cx + sg * g.xs * s;
                    const ex = xs + sg * Math.tan(g.th) * (ys - eyeY) * 1;
                    if (sg !== 0) { fwd.push([[cx, fy], [xs, ys], [ex, eyeY + 8]]); back.push([[ex, eyeY + 8], [xs, ys], [cx, iy]]); }
                    ctx.strokeStyle = C.blue; ctx.lineWidth = sg === 0 ? 1.3 : 2;
                    ctx.globalAlpha = sg === 0 ? 0.5 : 1;
                    ctx.beginPath(); ctx.moveTo(cx, fy); ctx.lineTo(xs, ys); ctx.stroke();
                    ctx.globalAlpha = 1;
                    if (sg !== 0) {
                        arrow(ctx, xs, ys, xs + (ex - xs) * 0.55, ys + (eyeY + 8 - ys) * 0.55, C.blue, 2);
                        ctx.strokeStyle = C.blue; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(xs + (ex - xs) * 0.55, ys + (eyeY + 8 - ys) * 0.55); ctx.lineTo(ex, eyeY + 8); ctx.stroke();
                        dashed(ctx, xs, ys, cx, iy, 'rgba(194,38,74,0.9)');
                    }
                });
                depthFish(ctx, cx, fy, 15, 1, false);
                depthFish(ctx, cx, iy, 15, 1, true);
                depthEye(ctx, cx, eyeY, 'down');
                LABS.apparent_depth.animate(ctx, w, t, fwd, back, [w - 8, 18, 'right']);

                // 右側尺寸：實深與視深
                const bx1 = Math.min(w - 120, cx + 70), bx2 = bx1 + 26;
                depthBracket(ctx, bx1, ys, fy, '#a4540a', false);
                depthBracket(ctx, bx2, ys, iy, C.rose, true);
                const plate = 'rgba(255,255,255,0.86)';
                labelFit(ctx, `實深 h = ${p.h} cm`, bx2 + 10, fy + 4, '#a4540a', 11, 'left', { clampW: w, plate });
                labelFit(ctx, `視深 h′ = ${g.hFormula.toFixed(1)} cm`, bx2 + 10, Math.min(iy + 4, fy - 18), C.rose, 11, 'left', { clampW: w, plate });
                labelFit(ctx, '空氣 n′ = 1.00', 10, ys - 8, C.ink, 11, 'left', { clampW: w, plate });
                labelFit(ctx, `${depthMedium(n)} n = ${n.toFixed(2)}`, 10, ys + 18, C.blue, 11, 'left', { clampW: w, plate });
                labelFit(ctx, '眼睛（幾乎正上方）', cx + 18, eyeY + 4, C.ink, 11, 'left', { clampW: w });
                labelFit(ctx, '虛線：折射光的反向延長線，交於像', 10, h - 10, C.rose, 10, 'left', { clampW: w, maxW: w - 20 });
            },

            /* ---------- 水中看岸上 ---------- */
            drawBelow: (ctx, w, h, p, t) => {
                const n = Number(p.nw);
                const ys = Math.round(h * 0.70), cx = Math.round(w * 0.42);
                const s = (ys - 30) / (n * 104);                // 讓 n·H 的像也放得下
                const eyeY = h - 30, eyeHalf = 22;
                const g = LABS.apparent_depth.below(p, eyeHalf / s, (eyeY - ys) / s);
                ctx.fillStyle = 'rgba(11,111,146,0.03)'; ctx.fillRect(0, 0, w, ys);
                ctx.fillStyle = `rgba(11,111,146,${0.08 + (n - 1) * 0.12})`; ctx.fillRect(0, ys, w, h - ys);
                ctx.strokeStyle = 'rgba(18,49,58,0.5)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(0, ys); ctx.lineTo(w, ys); ctx.stroke();
                dashed(ctx, cx, 10, cx, eyeY - 10, 'rgba(18,49,58,0.28)');

                const by = ys - g.H * s, iy = ys - g.HImg * s;
                const fwd = [], back = [];
                [-1, 0, 1].forEach((sg) => {
                    const xs = cx + sg * g.xs * s;
                    const ex = xs + sg * Math.tan(g.a) * (eyeY - ys);
                    if (sg !== 0) { fwd.push([[cx, by], [xs, ys], [ex, eyeY - 8]]); back.push([[ex, eyeY - 8], [xs, ys], [cx, iy]]); }
                    ctx.strokeStyle = C.orange; ctx.lineWidth = sg === 0 ? 1.3 : 2;
                    ctx.globalAlpha = sg === 0 ? 0.5 : 1;
                    ctx.beginPath(); ctx.moveTo(cx, by); ctx.lineTo(xs, ys); ctx.stroke();
                    ctx.globalAlpha = 1;
                    if (sg !== 0) {
                        arrow(ctx, xs, ys, xs + (ex - xs) * 0.55, ys + (eyeY - 8 - ys) * 0.55, C.orange, 2);
                        ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(xs + (ex - xs) * 0.55, ys + (eyeY - 8 - ys) * 0.55); ctx.lineTo(ex, eyeY - 8); ctx.stroke();
                        dashed(ctx, xs, ys, cx, iy, 'rgba(194,38,74,0.9)');
                    }
                });
                depthBird(ctx, cx, by, 16, false);
                depthBird(ctx, cx, iy, 16, true);
                depthEye(ctx, cx, eyeY, 'up');
                LABS.apparent_depth.animate(ctx, w, t, fwd, back, [w - 8, 18, 'right']);

                const bx1 = Math.min(w - 120, cx + 70), bx2 = bx1 + 26;
                depthBracket(ctx, bx1, ys, by, '#3a2f7a', false);
                depthBracket(ctx, bx2, ys, iy, C.rose, true);
                const plate = 'rgba(255,255,255,0.86)';
                labelFit(ctx, `實際高度 H = ${p.hb} cm`, bx2 + 10, by + 4, '#3a2f7a', 11, 'left', { clampW: w, plate });
                labelFit(ctx, `看起來 H′ = ${g.HFormula.toFixed(1)} cm`, bx2 + 10, Math.min(iy + 4, by - 18), C.rose, 11, 'left', { clampW: w, plate });
                labelFit(ctx, '空氣 n = 1.00', 10, ys - 8, C.ink, 11, 'left', { clampW: w, plate });
                labelFit(ctx, `${depthMedium(n)} n′ = ${n.toFixed(2)}`, 10, ys + 18, C.blue, 11, 'left', { clampW: w, plate });
                labelFit(ctx, '潛水者的眼睛', cx + 18, eyeY + 4, C.ink, 11, 'left', { clampW: w });
            },

            /* ---------- 斜看池底 ---------- */
            drawOblique: (ctx, w, h, p, t) => {
                const L = LABS.apparent_depth, n = L.obliqueN;
                const xL = -0.9, xR = 8.6;
                const s = Math.min((w - 20) / (xR - xL), (h - 58) / (p.D + p.eyeH + 0.5));
                const ox = 10 - xL * s + ((w - 20) - (xR - xL) * s) / 2;
                const ys = 22 + (p.eyeH + 0.25) * s;
                const X = (x) => ox + x * s, Y = (y) => ys - y * s;
                const yF = Y(-p.D);
                // 池岸、池水、池底
                ctx.fillStyle = 'rgba(11,111,146,0.03)'; ctx.fillRect(0, 0, w, ys);
                ctx.fillStyle = 'rgba(11,111,146,0.16)'; ctx.fillRect(X(0), ys, w - X(0), yF - ys);
                ctx.fillStyle = '#d9d2c3'; ctx.fillRect(0, ys, X(0), h - ys);
                ctx.fillStyle = '#e7e2d6'; ctx.fillRect(X(0), yF, w - X(0), h - yF);
                ctx.strokeStyle = 'rgba(18,49,58,0.5)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(X(0), ys); ctx.lineTo(w, ys); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(X(0), ys); ctx.lineTo(X(0), yF); ctx.lineTo(w, yF); ctx.stroke();
                // 正上方公式的位置（只在正下方成立）
                dashed(ctx, X(0), Y(-p.D / n), w, Y(-p.D / n), 'rgba(107,70,193,0.7)');
                // 看起來的池底：每個池底點的像
                ctx.strokeStyle = C.rose; ctx.lineWidth = 2.2; ctx.beginPath();
                let first = true;
                for (let x = 0; x <= xR + 0.01; x += 0.05) {
                    const tr = L.obliqueTrace(x, p.D, p.eyeH, n);
                    const px = X(tr.img[0]), py = Y(tr.img[1]);
                    if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
                }
                ctx.stroke();

                // 選定的硬幣：兩條光線分別進入瞳孔上、下緣；虛線是它們的直線延長，交點即像
                const ex = X(0), ey = Y(p.eyeH);
                const pen = depthPencil([p.X, -p.D], [0, p.eyeH], n, 9 / s, 'auto');
                const PP = (pt) => [X(pt[0]), Y(pt[1])];
                const ip = PP(pen.img);
                pen.rays.forEach((r) => {
                    const o = PP(r.pts[0]), sp = PP(r.S), pe = PP(r.P);
                    ctx.strokeStyle = C.blue; ctx.lineWidth = 1.8;
                    ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(sp[0], sp[1]); ctx.lineTo(pe[0], pe[1]); ctx.stroke();
                    arrow(ctx, sp[0], sp[1], sp[0] + (pe[0] - sp[0]) * 0.5, sp[1] + (pe[1] - sp[1]) * 0.5, C.blue, 1.8);
                    dashed(ctx, sp[0], sp[1], ip[0], ip[1], 'rgba(194,38,74,0.9)');
                });
                const cxp = X(p.X), cyp = yF;
                // 硬幣與它的像
                ctx.fillStyle = '#d9a514'; ctx.strokeStyle = '#8a6400'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.ellipse(cxp, cyp - 3, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.save(); ctx.setLineDash([3, 2]); ctx.strokeStyle = C.rose; ctx.fillStyle = 'rgba(194,38,74,0.15)';
                ctx.beginPath(); ctx.ellipse(ip[0], ip[1], 9, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
                depthEye(ctx, ex, ey, 'right');
                LABS.apparent_depth.animate(ctx, w, t,
                    pen.rays.map((r) => r.pts.map(PP)),
                    pen.rays.map((r) => [PP(r.P), PP(r.S), ip]), [w - 8, 16, 'right']);
                // 人（簡化）：從腳到眼
                ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(ex - 10, ey + 8); ctx.lineTo(ex - 10, ys); ctx.stroke();

                const plate = 'rgba(255,255,255,0.86)';
                labelFit(ctx, `正上方公式 D/n = ${(p.D / n).toFixed(2)} m`, w - 8, Y(-p.D / n) - 5, C.violet, 10, 'right', { clampW: w, plate });
                labelFit(ctx, '紅線：看起來的池底', w - 8, yF + 29, C.rose, 10, 'right', { clampW: w, plate });
                labelFit(ctx, `實際池底 D = ${p.D.toFixed(1)} m`, w - 8, yF + 15, '#6b5a2e', 10, 'right', { clampW: w, plate });
                labelFit(ctx, '空氣', X(0) + 6, ys - 6, C.ink, 10, 'left', { clampW: w, plate });
                labelFit(ctx, `水 n = ${n.toFixed(2)}`, X(0) + 6, yF - 6, C.blue, 10, 'left', { clampW: w, plate });
            },

            /* ---------- 多層視深：純光線模擬（2–6 層） ---------- */
            stackNs: (p) => Array.from({ length: p.layers }, (_, i) => p['n' + (i + 1)]),
            stackTs: (p) => Array.from({ length: p.layers }, (_, i) => p['t' + (i + 1)]),
            /* 從底層物點以角度 θ（底層中，與鉛直線夾角）往上追蹤，回傳經過的點與結果 */
            stackTrace: (ns, ts, theta) => {
                const N = ns.length, k = ns[N - 1] * Math.sin(theta);      // n·sinθ 在平行界面間守恆
                let x = 0, y = 0;                                          // y 從底部往上量（cm）
                const pts = [[0, 0]];
                for (let i = N - 1; i >= 0; i--) {
                    const si = k / ns[i];
                    if (si >= 1) return { pts, tir: i, k };                // 進不了第 i 層：在其下方界面全反射
                    x += ts[i] * si / Math.sqrt(1 - si * si); y += ts[i];
                    pts.push([x, y]);
                }
                if (k >= 1) return { pts, tir: -1, k };                    // 進不了空氣：頂面全反射
                const ta = k / Math.sqrt(1 - k * k);                        // 空氣中 tanθ
                return { pts, tir: null, k, exitX: x, tanAir: ta, imgDepth: ta > 1e-9 ? x / ta : null };
            },
            drawStack: (ctx, w, h, p) => {
                const L = LABS.apparent_depth, ns = L.stackNs(p), ts = L.stackTs(p), N = ns.length;
                const airH = 70, bot = h - 34;
                const total = ts.reduce((a, v) => a + v, 0);
                const tops = ts.map((_, i) => ts.slice(0, i).reduce((a, v) => a + v, 0));   // 各層頂面深度
                const cx = Math.round(w * 0.40);
                // 比例尺固定：只由各層厚度決定，不隨張角改變；很斜的光直接出畫面
                const s = (bot - airH) / total;   // px / cm
                const yTop = airH, yOf = (depthCm) => yTop + depthCm * s;   // 由頂面往下量
                // 背景：空氣與各層
                ctx.fillStyle = 'rgba(11,111,146,0.03)'; ctx.fillRect(0, 0, w, airH);
                ns.forEach((n, i) => {
                    ctx.fillStyle = `rgba(11,111,146,${Math.min(0.5, 0.05 + (n - 1) * 0.22)})`;
                    ctx.fillRect(0, yOf(tops[i]), w, ts[i] * s);
                });
                ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1.2;
                [...tops, total].forEach((d) => { ctx.beginPath(); ctx.moveTo(0, yOf(d)); ctx.lineTo(w, yOf(d)); ctx.stroke(); });
                dashed(ctx, cx, 12, cx, bot + 8, 'rgba(18,49,58,0.25)');

                // 光線：底層物點往上，對稱的 ±θ 各數條
                const thMax = rad(p.spread), oy = yOf(total);
                const fan = [];
                for (let j = 1; j <= 3; j++) fan.push(thMax * j / 3);
                const colors = ['#d48a00', '#2c8f6e', '#5b3fb5'];
                const imgs = [];
                let anyTir = null;
                fan.forEach((th, j) => {
                    const tr = L.stackTrace(ns, ts, th);
                    [-1, 1].forEach((sg) => {
                        const path = tr.pts.map(([x, y]) => [cx + sg * x * s, oy - y * s]);
                        ctx.strokeStyle = colors[j]; ctx.lineWidth = 1.8;
                        ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
                        path.slice(1).forEach((q) => ctx.lineTo(q[0], q[1]));
                        if (tr.tir === null) {
                            // 空氣中：往上畫到畫布頂端；反向延長（虛線）到中心軸
                            const ex = path[path.length - 1];
                            const up = ex[1] - 8, dx = sg * tr.tanAir * (up);
                            ctx.lineTo(ex[0] + dx, 8); ctx.stroke();
                            arrow(ctx, ex[0], ex[1], ex[0] + dx * 0.5, ex[1] - up * 0.5, colors[j], 1.8);
                            if (tr.imgDepth !== null) dashed(ctx, ex[0], ex[1], cx, yOf(tr.imgDepth), colors[j]);
                        } else {
                            // 全反射：最後一點就在界面上，鏡射前一段，畫出折返的光
                            ctx.stroke();
                            const last = path[path.length - 1], prev = path[path.length - 2] || path[0];
                            ctx.save(); ctx.strokeStyle = C.rose; ctx.lineWidth = 1.8;
                            ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(last[0] + (last[0] - prev[0]), prev[1]); ctx.stroke(); ctx.restore();
                            anyTir = tr.tir;
                        }
                    });
                    if (tr.tir === null && tr.imgDepth !== null) imgs.push(tr.imgDepth);
                });

                // 物體、近軸像、逐層中間像
                const paraxial = ns.reduce((a, n, i) => a + ts[i] / n, 0);
                ctx.fillStyle = '#f08a24'; ctx.strokeStyle = '#a4540a'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(cx, oy - 4, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.save(); ctx.setLineDash([3, 2]); ctx.strokeStyle = C.rose; ctx.fillStyle = 'rgba(194,38,74,0.15)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(cx, yOf(paraxial), 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
                const placed = []; placed.hMax = h;
                const rx = cx + 18;
                // 先放固定位置的標籤，再放隨參數移動的像
                depthLabel(ctx, placed, '空氣 n = 1.00（觀察者在正上方）', 8, airH - 8, C.ink, w, 'left');
                ns.forEach((n, i) => depthLabel(ctx, placed, `第 ${i + 1} 層 n${'₁₂₃₄₅₆'[i]} = ${n.toFixed(2)}，厚 ${ts[i]} cm`, 8, yOf(tops[i]) + Math.min(16, ts[i] * s - 3), C.blue, w, 'left'));
                depthLabel(ctx, placed, `物體：實際深 ${total.toFixed(0)} cm`, rx, oy - 2, '#a4540a', w, 'left');
                if (p.stackSteps === 'steps') {
                    // 從第 j 層看（j = N…1）：像在第 j 層底面以下 n_j·Σ_{k>j} t/n_k
                    for (let j = N - 1; j >= 1; j--) {
                        let sum = 0; for (let k = j; k < N; k++) sum += ts[k] / ns[k];
                        const yImg = yOf(tops[j]) + ns[j - 1] * sum * s;
                        ctx.save(); ctx.setLineDash([2, 2]); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.3;
                        ctx.beginPath(); ctx.arc(cx, yImg, 4, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
                        depthLabel(ctx, placed, `第 ${j} 層看`, cx - 14, yImg + 4, C.violet, w, 'right');
                    }
                }
                depthLabel(ctx, placed, `近軸像：Σt/n = ${paraxial.toFixed(1)} cm`, rx, yOf(paraxial) + 4, C.rose, w, 'left');
                if (anyTir !== null) depthLabel(ctx, placed, anyTir === -1 ? '最斜的光在頂面全反射' : `最斜的光在第 ${anyTir + 1} 層下方界面全反射`, w - 8, 18, C.rose, w, 'right');
                depthEye(ctx, cx, 24, 'down');
            },

            /* ---------- 多層：光由最上層入射，判斷哪些界面可能全反射 ---------- */
            /* 光由第 1 層頂面往下，以 θ₁ 入射；n·sinθ 守恆。到達界面 j（第 j 與 j+1 層之間）
             * 的條件是 n₁sinθ₁ 小於第 1…j 層的每一個 n；在 j 發生全反射的條件是 n₁sinθ₁ ≥ n_{j+1}。
             * 因此界面 j「可能」全反射 ⇔ n_{j+1} < min(n₁…n_j)，所需 θ₁ 介於 asin(n_{j+1}/n₁) 與 asin(min/n₁)。 */
            stackTirInfo: (ns) => ns.slice(0, -1).map((_, j) => {
                const minAbove = Math.min(...ns.slice(0, j + 1)), below = ns[j + 1];
                const possible = below < minAbove - 1e-9;
                return { possible, below, minAbove,
                    thLo: possible ? deg(Math.asin(below / ns[0])) : null,
                    thHi: possible ? (minAbove >= ns[0] ? 90 : deg(Math.asin(minAbove / ns[0]))) : null };
            }),
            stackTirTrace: (ns, ts, th1) => {
                const k = ns[0] * Math.sin(th1), N = ns.length;
                const pts = [[0, 0]];
                let x = 0, y = 0, tirAt = null, i = 0;
                for (; i < N; i++) {
                    const si = k / ns[i];
                    x += ts[i] * si / Math.sqrt(1 - si * si); y += ts[i];
                    pts.push([x, y]);
                    if (i < N - 1 && k >= ns[i + 1]) { tirAt = i; break; }
                }
                if (tirAt !== null) {
                    for (let j = tirAt; j >= 0; j--) {          // 全反射後往上走回第 1 層頂面
                        const si = k / ns[j];
                        x += ts[j] * si / Math.sqrt(1 - si * si); y -= ts[j];
                        pts.push([x, y]);
                    }
                }
                return { pts, tirAt, k };
            },
            drawStackTir: (ctx, w, h, p) => {
                const L = LABS.apparent_depth, ns = L.stackNs(p), ts = L.stackTs(p), N = ns.length;
                const info = L.stackTirInfo(ns);
                const top = 24, bot = h - 18;
                const total = ts.reduce((a, v) => a + v, 0);
                const tops = ts.map((_, i) => ts.slice(0, i).reduce((a, v) => a + v, 0));
                const th1 = rad(p.th1s);
                const tr = L.stackTirTrace(ns, ts, th1);
                const x0 = Math.round(Math.max(40, w * 0.10));
                const s = (bot - top) / total;   // 比例尺固定：只由各層厚度決定，不隨入射角改變
                const yOf = (d) => top + d * s;
                ns.forEach((n, i) => {
                    ctx.fillStyle = `rgba(11,111,146,${Math.min(0.5, 0.05 + (n - 1) * 0.22)})`;
                    ctx.fillRect(0, yOf(tops[i]), w, ts[i] * s);
                });
                ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1.2;
                [...tops, total].forEach((d) => { ctx.beginPath(); ctx.moveTo(0, yOf(d)); ctx.lineTo(w, yOf(d)); ctx.stroke(); });
                // 界面：可能全反射的畫成較粗的紫色（勾選「顯示各界面判斷」時）
                const hints = p.tirHints === true;
                info.forEach((it, j) => {
                    if (!hints || !it.possible) return;
                    ctx.strokeStyle = 'rgba(107,70,193,0.75)'; ctx.lineWidth = 2.6;
                    ctx.beginPath(); ctx.moveTo(w * 0.64, yOf(tops[j + 1])); ctx.lineTo(w, yOf(tops[j + 1])); ctx.stroke();
                });

                // 入射光：從第 1 層頂面的上方射入（示意箭頭），再追蹤整條光路
                const P = (q) => [x0 + q[0] * s, yOf(q[1])];
                const start = P(tr.pts[0]);
                dashed(ctx, start[0], start[1] - 2, start[0], Math.min(bot, start[1] + 70), 'rgba(18,49,58,0.35)');
                ctx.strokeStyle = '#d48a00'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(...start);
                tr.pts.slice(1).forEach((q) => ctx.lineTo(...P(q)));
                ctx.stroke(); ctx.lineCap = 'butt';
                for (let i = 1; i < tr.pts.length; i++) {
                    const a = P(tr.pts[i - 1]), b = P(tr.pts[i]);
                    if (b[0] < w - 4) arrow(ctx, a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, '#d48a00', 2);
                }
                ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(start[0], start[1], 30, Math.PI / 2 - th1, Math.PI / 2); ctx.stroke();
                if (tr.tirAt !== null) {
                    const q = P(tr.pts[tr.tirAt + 1]);
                    ctx.strokeStyle = C.rose; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(q[0], q[1], 7, 0, Math.PI * 2); ctx.stroke();
                }

                // 標籤：左側各層 n、右側各界面判斷
                const placed = []; placed.hMax = h;
                depthLabel(ctx, placed, `θ₁ = ${p.th1s}°`, start[0] + 8, start[1] + 46, C.ink, w, 'left');
                ns.forEach((n, i) => depthLabel(ctx, placed, `n${'₁₂₃₄₅₆'[i]} = ${n.toFixed(2)}`, 6, yOf(tops[i]) + Math.min(15, ts[i] * s - 2), C.blue, w, 'left'));
                info.forEach((it, j) => {
                    const tag = '(' + 'ABCDE'[j] + ')';
                    if (!hints) { depthLabel(ctx, placed, tag, w - 6, yOf(tops[j + 1]) - 4, C.ink, w, 'right'); return; }
                    const txt = it.possible
                        ? (it.thHi >= 90 ? `${tag} 可能：θ₁ > ${it.thLo.toFixed(1)}°` : `${tag} 可能：${it.thLo.toFixed(1)}° < θ₁ < ${it.thHi.toFixed(1)}°`)
                        : `${tag} 不可能（${it.below >= ns[j] ? 'n 變大' : '光先在上方全反射'}）`;
                    depthLabel(ctx, placed, txt, w - 6, yOf(tops[j + 1]) - 4, it.possible ? C.violet : C.muted, w, 'right');
                });
                if (tr.tirAt !== null) {
                    const q = P(tr.pts[tr.tirAt + 1]);
                    // 全反射點在畫面外時，標籤改寫明「在畫面右側」
                    if (q[0] < w - 20) depthLabel(ctx, placed, `在 (${'ABCDE'[tr.tirAt]}) 全反射`, q[0] + 10, q[1] + 16, C.rose, w, 'left');
                    else depthLabel(ctx, placed, `在 (${'ABCDE'[tr.tirAt]}) 全反射（畫面右側外）`, w * 0.6, q[1] + 16, C.rose, w, 'right');
                }
            },

            /* ---------- 評估練習：湖邊玩水 ----------
             * 版面：人站在岸邊、低頭看腳前方的水（符合「幾乎正上方」的假設）；
             * 生活物品放在岸上當比例尺；水中只畫兩支量尺：看起來的深度（1 個物品高）與實際深度（4/3 個）。
             * 岸上的人身上標出各部位的公分數，學生算出實際深度後可直接比對。 */
            lakeQ: (p) => { if (!p._lake) p._lake = newLakeQuestion(p._lakeStyle || 'obj'); return p._lake; },
            drawPractice: (ctx, w, h, p) => {
                const q = LABS.apparent_depth.lakeQ(p), shown = p._lakeChecked === true;
                const top = 14, bot = h - 14;
                const s = (bot - top) / (192 + 205);                 // px / cm：上方放得下 180 cm 的人，下方放得下 200 cm 的湖
                const ys = Math.round(top + 192 * s);
                const shoreX = Math.round(Math.max(150, w * 0.30));
                const lakeW = w - shoreX;
                const yA = ys + q.hp * s, yR = ys + q.real * s;
                // 天空、岸、湖
                const sky = ctx.createLinearGradient(0, 0, 0, ys);
                sky.addColorStop(0, '#e2f1f8'); sky.addColorStop(1, '#f7fbfd');
                ctx.fillStyle = sky; ctx.fillRect(0, 0, w, ys);
                ctx.fillStyle = '#d8ccb0'; ctx.fillRect(0, ys, shoreX, h - ys);
                const lake = ctx.createLinearGradient(0, ys, 0, h);
                lake.addColorStop(0, 'rgba(70,170,195,0.30)'); lake.addColorStop(1, 'rgba(25,95,125,0.48)');
                ctx.fillStyle = lake; ctx.fillRect(shoreX, ys, lakeW, (shown ? yR : bot) - ys);
                if (shown) { ctx.fillStyle = '#b9a77f'; ctx.fillRect(shoreX, yR, lakeW, h - yR); }
                ctx.strokeStyle = 'rgba(18,49,58,0.55)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(shoreX, ys); ctx.lineTo(w, ys); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(shoreX, ys); ctx.lineTo(shoreX, shown ? yR : bot); ctx.stroke();
                // 看起來的湖底（虛線）與實際湖底（揭曉後）
                ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(shoreX, yA); ctx.lineTo(w, yA); ctx.stroke(); ctx.restore();
                if (shown) { ctx.strokeStyle = '#7a6338'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(shoreX, yR); ctx.lineTo(w, yR); ctx.stroke(); }

                const placed = []; placed.hMax = h;
                // 岸邊的人：站在湖邊，低頭看腳前方的水
                const Hpx = q.H * s, px = shoreX - Hpx * 0.16 - 4;
                drawPerson(ctx, px, ys, Hpx, {});
                const eye = [px + Hpx * 0.03, ys - 0.935 * Hpx];
                const spotX = shoreX + Math.max(18, lakeW * 0.07);
                dashed(ctx, eye[0], eye[1], spotX, yA, 'rgba(18,49,58,0.45)');
                // 身上各部位的公分數
                ctx.strokeStyle = 'rgba(18,49,58,0.6)'; ctx.lineWidth = 1;
                const tickX = px + Hpx * 0.17;
                BODY_MARKS.forEach((m) => { const yy = ys - m.f * Hpx; ctx.beginPath(); ctx.moveTo(tickX, yy); ctx.lineTo(tickX + 6, yy); ctx.stroke(); });
                depthLabel(ctx, placed, `身高 ${q.H} cm`, px, Math.max(14, ys - Hpx - 6), C.ink, w, 'center');
                BODY_MARKS.forEach((m) => depthLabel(ctx, placed, `${m.label} ${Math.round(m.f * q.H)}`, tickX + 9, ys - m.f * Hpx + 4, C.ink, w, 'left'));
                // 岸上的生活物品（比例尺）
                if (q.kind === 'obj') {
                    const ow = lakeObjectWidth(q.obj.key, q.hp * s);
                    const ox = Math.max(ow / 2 + 4, px - Hpx * 0.2 - ow / 2 - 6);
                    drawLakeObject(ctx, q.obj.key, ox, ys, q.hp * s, {});
                    depthLabel(ctx, placed, `${q.obj.label}（約 ${q.hp} cm）`, Math.max(4, ox - ow / 2), ys + 16, '#5a4632', w, 'left');
                }
                // 水中量尺
                const bar = (x, y1, y2, color, dash) => {
                    ctx.save(); if (dash) ctx.setLineDash([5, 3]);
                    ctx.strokeStyle = color; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2);
                    ctx.moveTo(x - 6, y1); ctx.lineTo(x + 6, y1); ctx.moveTo(x - 6, y2); ctx.lineTo(x + 6, y2); ctx.stroke();
                    ctx.restore();
                };
                const barX = spotX + 10;
                bar(barX, ys, yA, C.violet, true);
                depthLabel(ctx, placed, q.kind === 'obj' ? `看起來：${q.obj.label}深` : `看起來：${q.hp} cm`, barX + 10, (ys + yA) / 2 + 4, C.violet, w, 'left');
                if (!shown) {
                    depthLabel(ctx, placed, '走進去，水實際會到哪裡？', shoreX + lakeW * 0.62, Math.min(bot - 10, yA + 34), C.ink, w, 'center');
                    return;
                }
                bar(barX + 16, ys, yR, C.rose, false);
                depthLabel(ctx, placed, q.kind === 'obj' ? `實際：4/3 個，約 ${Math.round(q.real)} cm` : `實際：${Math.round(q.real)} cm`, barX + 26, (yA + yR) / 2 + 4, C.rose, w, 'left');
                // 揭曉：站在實際湖底的人，與「以為」站在看起來湖底的人
                const xReal = shoreX + lakeW * 0.52, xGhost = shoreX + lakeW * 0.80;
                drawPerson(ctx, xGhost, yA, Hpx, { dash: true, color: C.violet, fill: 'rgba(107,70,193,0.08)', alpha: 0.85 });
                drawPerson(ctx, xReal, yR, Hpx, { color: '#1d2b33', fill: 'rgba(240,138,36,0.35)' });
                const wl = (x, color) => { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - Hpx * 0.2, ys); ctx.lineTo(x + Hpx * 0.2, ys); ctx.stroke(); };
                wl(xReal, C.rose); wl(xGhost, C.violet);
                depthLabel(ctx, placed, `實際：${toWhere(q.zone.label)}（${Math.round(q.r * 100)}%）`, xReal, ys - 10, C.rose, w, 'center');
                depthLabel(ctx, placed, `以為：只到${q.illusion.label}（${Math.round(q.rp * 100)}%）`, xGhost, ys - 26, C.violet, w, 'center');
            },
            /* 水族箱的角度讀數與局部圖：沿用主圖的 Snell 計算，不放大折角。 */
            setupAquarium: ({ host, params, disposers }) => {
                const stage = host.querySelector('.lab-stage');
                if (!stage || host.querySelector('.aquarium-guide')) return;
                stage.insertAdjacentHTML('afterend', `
                    <section class="aquarium-guide" hidden aria-label="水族箱折射判讀">
                        <h5>兩次折射，分開看</h5>
                        <div class="aquarium-angles">
                            <div class="aquarium-angle" style="--ray-color:#0b6f92"><span>① 水中</span><strong data-angle="water"></strong><small>n = 1.33</small></div>
                            <div class="aquarium-angle" style="--ray-color:#6b46c1"><span>② 窗材中</span><strong data-angle="window"></strong><small data-angle="window-note"></small></div>
                            <div class="aquarium-angle" style="--ray-color:#a4540a"><span>③ 空氣中</span><strong data-angle="air"></strong><small data-angle="air-note"></small></div>
                        </div>
                        <p class="aquarium-explain"></p>
                        <details><summary>看兩個界面的局部光路</summary>
                            <p>所有角度都從水平法線量起。局部圖保持真實角度；灰色虛線是原方向的延續，用來比較偏折。</p>
                            <div class="aquarium-zooms"></div>
                        </details>
                    </section>`);
                const panel = host.querySelector('.aquarium-guide');
                const controls = host.querySelector('.lab-controls');
                const advanced = document.createElement('details');
                advanced.className = 'aquarium-settings';
                advanced.innerHTML = '<summary>進階：光束角度、窗材與逐面成像</summary><div class="aquarium-settings-grid"></div><p>第一面的中間像只供逐面計算，並非窗外的人同時看到另一條魚。主圖以對稱光束求像，未表示同一瞳孔的大小。</p>';
                controls.appendChild(advanced);
                ['beam', 't', 'ng', 'steps'].forEach((key) => {
                    const wrap = host.querySelector(`[id$="apparent_depth-${key}-wrap"]`);
                    if (wrap) advanced.querySelector('.aquarium-settings-grid').appendChild(wrap);
                });
                const zoom = (title, right, left, incoming, outgoing, tir) => {
                    const length = Math.min(120, 48 / Math.max(Math.sin(incoming), Math.sin(outgoing || 0), 0.01));
                    const point = (angle, sign, flipY = false) => `${160 + sign * length * Math.cos(angle)},${78 + (flipY ? -1 : sign) * length * Math.sin(angle)}`;
                    const end = tir ? point(incoming, 1, true) : point(outgoing, -1);
                    return `<figure><figcaption>${title}</figcaption><svg viewBox="0 0 320 150" role="img" aria-label="${title}${tir ? '：外壁全反射' : '：角度依司乃耳定律計算'}">
                        <rect width="160" height="150" fill="${left.fill}"/><rect x="160" width="160" height="150" fill="${right.fill}"/>
                        <path d="M160 0V150" stroke="#8099a2"/><path d="M10 78H310" stroke="#8099a2" stroke-dasharray="4 4"/>
                        <path d="M${point(incoming, 1)}L160 78L${point(incoming, -1)}" fill="none" stroke="#9baab0" stroke-dasharray="4 4"/>
                        <path d="M${point(incoming, 1)}L160 78" fill="none" stroke="${right.color}" stroke-width="3"/>
                        <path d="M160 78L${end}" fill="none" stroke="${tir ? '#c2264a' : left.color}" stroke-width="3"/>
                        <circle cx="160" cy="78" r="4" fill="white" stroke="#12313a"/>
                        <text x="10" y="20" font-size="12" fill="${left.color}">${left.name}</text><text x="310" y="20" text-anchor="end" font-size="12" fill="${right.color}">${right.name}</text>
                        <text x="10" y="142" font-size="11" fill="#516e78">← 光從右往左行進；水平虛線為法線</text>
                    </svg><p class="aquarium-zoom-note">${tir ? '窗內入射角超過臨界角，光反射回窗內。' : `${deg(incoming).toFixed(1)}° → ${deg(outgoing).toFixed(1)}°，${outgoing < incoming ? '偏向' : '偏離'}法線 ${Math.abs(deg(incoming - outgoing)).toFixed(1)}°`}</p></figure>`;
                };
                const update = () => {
                    const on = params.mode === 'layers';
                    panel.hidden = advanced.hidden = !on;
                    if (!on) return;
                    const g = LABS.apparent_depth.layers(params, rad(params.beam));
                    const set = (key, text) => { panel.querySelector(`[data-angle="${key}"]`).textContent = text; };
                    set('water', `${deg(g.a).toFixed(1)}°`);
                    set('window', `${deg(g.b).toFixed(1)}°`);
                    set('window-note', `偏向法線 ${deg(g.a - g.b).toFixed(1)}°`);
                    set('air', g.tir ? '全反射' : `${deg(g.g).toFixed(1)}°`);
                    set('air-note', g.tir ? '這組光線無法射出' : `偏離法線 ${deg(g.g - g.b).toFixed(1)}°`);
                    panel.querySelector('.aquarium-explain').textContent = g.tir
                        ? '這組光線在窗與空氣的界面全反射，因此不畫穿入空氣的光線或虛像。把進階設定中的光束角度調小，可再次看到透射光。'
                        : `水和${depthWindow(params)}的折射率接近（1.33 與 ${g.ng.toFixed(2)}），這次只偏折 ${deg(g.a - g.b).toFixed(1)}°，所以折角較不明顯。折射一直有發生；角度較小時尤其不易看出。`;
                    const water = { name: '水', color: '#0b6f92', fill: '#e5f3f7' };
                    const glass = { name: depthWindow(params), color: '#6b46c1', fill: '#f0eafa' };
                    const air = { name: '空氣', color: '#a4540a', fill: '#fff8ec' };
                    panel.querySelector('.aquarium-zooms').innerHTML = zoom('① 水 → 窗材', water, glass, g.a, g.b, false)
                        + zoom('② 窗材 → 空氣', glass, air, g.b, g.g, g.tir);
                };
                ['input', 'change', 'click'].forEach((event) => disposers.addEventListener(host, event, update));
                update();
            },
            /* ---------- 水族箱：空氣—玻璃—水 ---------- */
            drawLayers: (ctx, w, h, p, t) => {
                const L = LABS.apparent_depth, g = L.layers(p, rad(p.beam));
                const steps = p.steps === 'steps';
                const plate = 'rgba(255,255,255,0.94)';
                const airColor = '#a4540a', glassColor = C.violet;
                const lineH = 24, chartTop = 66, chartBottom = h - 124;
                const ay = (chartTop + chartBottom) / 2;
                const reach = steps ? Math.max(p.t + p.d, p.t + g.imgGlass) : p.t + p.d;
                const airRun = Math.min(30, (p.t + p.d) * 0.14);
                const airRise = g.tir ? g.y0 + p.t * Math.tan(g.b) + p.d * 0.25 * Math.tan(g.a)
                    : g.y0 + airRun * Math.tan(g.g);
                // Both axes use the same scale. Even steep/TIR rays must fit inside the chart.
                const scale = Math.min((w - 72) / (reach + airRun), (chartBottom - chartTop) / (2 * Math.max(airRise, 1)));
                const chartWidth = (reach + airRun) * scale;
                const x0 = (w - chartWidth) / 2 + airRun * scale;
                const X = (cm) => x0 + cm * scale;
                const xi = X(p.t), fx = X(p.t + p.d);
                const imageX = g.tir ? null : X(g.imgAir);
                ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, x0, chartBottom + 12);
                ctx.fillStyle = '#eee9f7'; ctx.fillRect(x0, 0, xi - x0, chartBottom + 12);
                ctx.fillStyle = '#e6f3f7'; ctx.fillRect(xi, 0, w - xi, chartBottom + 12);
                ctx.strokeStyle = '#829ca6'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(x0, 44); ctx.lineTo(x0, chartBottom + 12);
                ctx.moveTo(xi, 44); ctx.lineTo(xi, chartBottom + 12); ctx.stroke();
                dashed(ctx, 12, ay, w - 12, ay, '#a6bac2');
                // Separate rows keep medium labels legible even with a 1 cm window.
                labelFit(ctx, '空氣 n = 1.00', 10, 20, airColor, 11, 'left', { clampW: w });
                labelFit(ctx, '水 n = 1.33', w - 10, 20, C.blue, 11, 'right', { clampW: w });
                labelFit(ctx, `${depthWindow(p)} n = ${g.ng.toFixed(2)} · 厚 ${p.t} cm`, w / 2, 41, glassColor, 11, 'center', { clampW: w, maxW: w - 20 });
                const fwd = [], back = [];
                const segment = (a, b, color, withArrow) => {
                    ctx.strokeStyle = color; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
                    if (withArrow && Math.hypot(b[0] - a[0], b[1] - a[1]) > 20) {
                        const at = (u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
                        arrow(ctx, ...at(0.45), ...at(0.58), color, 2);
                    }
                };
                [-1, 1].forEach((sign) => {
                    const fish = [fx, ay], inner = [xi, ay - sign * g.y1 * scale];
                    const outer = [x0, ay - sign * g.y0 * scale];
                    segment(fish, inner, C.blue, true);
                    segment(inner, outer, glassColor, true);
                    if (steps) dashed(ctx, ...inner, X(p.t + g.imgGlass), ay, 'rgba(107,70,193,0.55)');
                    if (g.tir) {
                        const reflected = [xi, outer[1] - sign * p.t * Math.tan(g.b) * scale];
                        const end = [xi + p.d * 0.25 * scale, reflected[1] - sign * p.d * 0.25 * Math.tan(g.a) * scale];
                        segment(outer, reflected, C.rose, false); segment(reflected, end, C.rose, true);
                        fwd.push([fish, inner, outer, reflected, end]);
                    } else {
                        const end = [X(-airRun), ay - sign * airRise * scale];
                        segment(outer, end, airColor, true);
                        dashed(ctx, ...outer, imageX, ay, C.rose);
                        fwd.push([fish, inner, outer, end]); back.push([end, outer, [imageX, ay]]);
                    }
                    [inner, outer].forEach(([x, y]) => {
                        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#516e78'; ctx.lineWidth = 1.2;
                        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    });
                });
                depthFish(ctx, fx, ay, 12, -1, false);
                labelFit(ctx, '真魚', fx, ay - 18, '#a4540a', 11, 'center', { clampW: w, plate });
                if (!g.tir) {
                    if (fx - imageX >= 32) depthFish(ctx, imageX, ay, 12, -1, true);
                    else { ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(imageX, ay, 4, 0, Math.PI * 2); ctx.fill(); }
                    labelFit(ctx, '最後的虛像', imageX, ay + 25, C.rose, 11, 'center', { clampW: w, plate });
                }
                if (steps) {
                    const midX = X(p.t + g.imgGlass);
                    ctx.strokeStyle = glassColor; ctx.setLineDash([3, 3]);
                    ctx.beginPath(); ctx.arc(midX, ay, 5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
                    labelFit(ctx, '第一面中間像', midX, ay + 49, glassColor, 10, 'center', { clampW: w, plate });
                }
                const bar = (row, end, text, color, dash) => {
                    const y = h - 92 + row * lineH;
                    ctx.save(); if (dash) ctx.setLineDash([4, 3]);
                    ctx.strokeStyle = color; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(end, y);
                    ctx.moveTo(x0, y - 4); ctx.lineTo(x0, y + 4); ctx.moveTo(end, y - 4); ctx.lineTo(end, y + 4); ctx.stroke(); ctx.restore();
                    labelFit(ctx, text, 10, y + 4, color, 11, 'left', { clampW: w, maxW: w - 20, plate });
                };
                bar(0, fx, `實際距外壁 ${(p.t + p.d).toFixed(1)} cm`, '#a4540a', false);
                if (!g.tir) bar(1, imageX, `這組光束的虛像 ${g.imgAir.toFixed(1)} cm`, C.rose, true);
                else labelFit(ctx, '外壁全反射：這組光線無法射入空氣', 10, h - 64, C.rose, 11, 'left', { clampW: w, maxW: w - 20 });
                if (steps) labelFit(ctx, '紫色：僅供逐面計算的中間像', 10, h - 40, glassColor, 10, 'left', { clampW: w });
                if (!g.tir) L.animate(ctx, w, t, fwd, back, [10, h - 16, 'left',
                    '① 實線：光從魚往空氣側傳播 ←', '② 粉紅虛線：沿出射方向反推到虛像']);
            }
        };

