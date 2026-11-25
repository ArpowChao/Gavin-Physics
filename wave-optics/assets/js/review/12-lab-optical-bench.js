// 互動實驗：多元件光學工作臺
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 10b. 多元件光學工作臺 ------------------------------------------- */
        const OPTICAL_BENCH_NAMES = {
            convex: '凸透鏡',
            concave: '凹透鏡',
            mirror: '反射鏡',
            splitter: '分光鏡',
            aperture: '可調光圈',
            screen: '屏幕'
        };

        function resetOpticalBench(params) {
            params.elements = [
                { id: 'oe-1', type: 'convex', x: 35, z: 0, rot: 90, f: 18 },
                { id: 'oe-2', type: 'splitter', x: 58, z: 0, rot: 45 },
                { id: 'oe-3', type: 'screen', x: 88, z: 0, rot: 90 },
                { id: 'oe-4', type: 'screen', x: 58, z: 28, rot: 0 }
            ];
            params.selectedId = 'oe-1';
            params.nextElementId = 5;
            params.viewYaw = 20;
            params.viewPitch = 32;
            params.viewZoom = 1;
            params.benchNotice = '預設配置：雷射經凸透鏡後，由分光鏡送往兩面屏幕。';
        }

        function opticalBenchGap(elements) {
            const xs = [14, ...elements.map((el) => el.x).sort((a, b) => a - b), 96];
            let bestX = 55, bestGap = -1;
            for (let i = 0; i < xs.length - 1; i++) {
                const gap = xs[i + 1] - xs[i];
                if (gap > bestGap) {
                    bestGap = gap;
                    bestX = (xs[i] + xs[i + 1]) / 2;
                }
            }
            return Math.round(bestX * 2) / 2;
        }

        function opticalBenchSelected(params) {
            return (params.elements || []).find((el) => el.id === params.selectedId) || null;
        }

        function opticalTableLayout(w, h, params = {}) {
            const compact = w < 760;
            const paletteW = compact ? 0 : Math.min(158, w * 0.18);
            const analysisW = compact ? 0 : Math.min(176, w * 0.20);
            const centerL = paletteW + 10;
            const centerR = w - analysisW - 10;
            const centerW = Math.max(centerR - centerL, 280);
            const yaw = rad(Number.isFinite(params.viewYaw) ? params.viewYaw : 20);
            const pitch = rad(Math.max(18, Math.min(62,
                Number.isFinite(params.viewPitch) ? params.viewPitch : 32)));
            const zoom = Math.max(0.72, Math.min(1.55,
                Number.isFinite(params.viewZoom) ? params.viewZoom : 1));
            const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
            const sinPitch = Math.sin(pitch);
            const projectedW = 100 * Math.abs(cosYaw) + 70 * Math.abs(sinYaw);
            const projectedH = (100 * Math.abs(sinYaw) + 70 * Math.abs(cosYaw)) * sinPitch;
            const fitScale = Math.min((centerW - 24) / Math.max(projectedW, 1),
                                      (h - 135) / Math.max(projectedH, 1));
            const scale = Math.max(1.6, fitScale) * zoom;
            const center = { x: (centerL + centerR) / 2, y: 100 + (h - 145) / 2 };
            const project = (x, z, height = 0) => ({
                x: center.x + (((x - 50) * cosYaw - z * sinYaw) * scale),
                y: center.y + (((x - 50) * sinYaw + z * cosYaw) * scale * sinPitch) - height
            });
            const unproject = (px, py) => {
                const screenX = (px - center.x) / scale;
                const depth = (py - center.y) / (scale * sinPitch);
                return {
                    x: Math.max(4, Math.min(96, 50 + screenX * cosYaw + depth * sinYaw)),
                    z: Math.max(-32, Math.min(32, -screenX * sinYaw + depth * cosYaw))
                };
            };
            return { compact, paletteW, analysisW, centerL, centerR, center, scale, project, unproject };
        }

        function traceOpticalTable(elements) {
            const halfLength = (el) => el.type === 'screen' ? 15 : (el.type === 'aperture' ? 14 : 10);
            const cross = (ax, az, bx, bz) => ax * bz - az * bx;
            const edgePoint = (ray) => {
                const dx = Math.cos(ray.angle), dz = Math.sin(ray.angle);
                const ts = [];
                if (Math.abs(dx) > 1e-6) {
                    ts.push((0 - ray.x) / dx, (100 - ray.x) / dx);
                }
                if (Math.abs(dz) > 1e-6) {
                    ts.push((-35 - ray.z) / dz, (35 - ray.z) / dz);
                }
                const valid = ts.filter((t) => t > 0.05).sort((a, b) => a - b);
                const t = valid[0] || 30;
                return { x: ray.x + dx * t, z: ray.z + dz * t };
            };
            const nearestHit = (ray) => {
                const dx = Math.cos(ray.angle), dz = Math.sin(ray.angle);
                let best = null;
                elements.forEach((el) => {
                    const rot = rad(Number(el.rot) || 0);
                    const tx = Math.cos(rot), tz = Math.sin(rot);
                    const den = cross(dx, dz, tx, tz);
                    if (Math.abs(den) < 1e-6) return;
                    const cx = el.x - ray.x, cz = el.z - ray.z;
                    const distance = cross(cx, cz, tx, tz) / den;
                    const offset = cross(cx, cz, dx, dz) / den;
                    if (distance <= 0.18 || Math.abs(offset) > halfLength(el)) return;
                    if (!best || distance < best.distance) best = { el, distance, offset };
                });
                return best;
            };

            const initialAngles = [-0.105, -0.07, -0.035, 0, 0.035, 0.07, 0.105];
            const queue = initialAngles.map((angle, i) => ({ x: 8, z: 0, angle, power: 1, branch: i, depth: 0 }));
            const segments = [];
            const screenHits = new Map();
            const blocked = [];
            while (queue.length) {
                let ray = queue.shift();
                let interactions = 0;
                while (ray.power > 0.015 && interactions++ < 12) {
                    const hit = nearestHit(ray);
                    if (!hit) {
                        const end = edgePoint(ray);
                        segments.push({ x1: ray.x, z1: ray.z, x2: end.x, z2: end.z, power: ray.power, branch: ray.branch });
                        break;
                    }
                    const dx = Math.cos(ray.angle), dz = Math.sin(ray.angle);
                    const hx = ray.x + dx * hit.distance;
                    const hz = ray.z + dz * hit.distance;
                    segments.push({ x1: ray.x, z1: ray.z, x2: hx, z2: hz, power: ray.power, branch: ray.branch });
                    const el = hit.el;

                    if (el.type === 'screen') {
                        if (!screenHits.has(el.id)) screenHits.set(el.id, []);
                        screenHits.get(el.id).push({ offset: hit.offset, power: ray.power });
                        break;
                    }
                    if (el.type === 'aperture' && Math.abs(hit.offset) > (Number(el.opening) || 10) / 2) {
                        blocked.push({ x: hx, z: hz });
                        break;
                    }

                    const rot = rad(Number(el.rot) || 0);
                    const tx = Math.cos(rot), tz = Math.sin(rot);
                    let nextAngle = ray.angle;
                    if (el.type === 'mirror' || el.type === 'splitter') {
                        /* 以鏡面切向量反射，旋轉或移動後仍遵守入射角＝反射角。 */
                        const dotT = dx * tx + dz * tz;
                        const reflected = Math.atan2(2 * dotT * tz - dz, 2 * dotT * tx - dx);
                        if (el.type === 'splitter') {
                            queue.push({ x: hx + Math.cos(ray.angle) * 0.22, z: hz + Math.sin(ray.angle) * 0.22,
                                angle: ray.angle, power: ray.power * 0.5, branch: ray.branch, depth: ray.depth + 1 });
                            queue.push({ x: hx + Math.cos(reflected) * 0.22, z: hz + Math.sin(reflected) * 0.22,
                                angle: reflected, power: ray.power * 0.5, branch: ray.branch + 20, depth: ray.depth + 1 });
                            break;
                        }
                        nextAngle = reflected;
                    } else if (el.type === 'convex' || el.type === 'concave') {
                        /* 薄透鏡公式在元件自己的切線／法線座標中運算。 */
                        let nx = tz, nz = -tx;
                        if (dx * nx + dz * nz < 0) { nx = -nx; nz = -nz; }
                        const normalSpeed = Math.max(dx * nx + dz * nz, 1e-5);
                        const incidentSlope = (dx * tx + dz * tz) / normalSpeed;
                        const outgoingSlope = incidentSlope - hit.offset / Number(el.f || 18);
                        nextAngle = Math.atan2(nz + tz * outgoingSlope, nx + tx * outgoingSlope);
                    }
                    ray = {
                        x: hx + Math.cos(nextAngle) * 0.22,
                        z: hz + Math.sin(nextAngle) * 0.22,
                        angle: nextAngle,
                        power: ray.power,
                        branch: ray.branch,
                        depth: ray.depth + 1
                    };
                }
            }
            const totalHitPower = [...screenHits.values()].flat().reduce((sum, hit) => sum + hit.power, 0);
            const allHits = [...screenHits.values()].flat();
            const weight = allHits.reduce((sum, hit) => sum + hit.power, 0) || 1;
            const mean = allHits.reduce((sum, hit) => sum + hit.offset * hit.power, 0) / weight;
            const rms = Math.sqrt(allHits.reduce((sum, hit) => sum + (hit.offset - mean) ** 2 * hit.power, 0) / weight);
            return { segments, screenHits, blocked, totalHitPower, transmission: totalHitPower / initialAngles.length, rms };
        }

        function drawOpticalTable3D(ctx, w, h, p) {
            const layout = opticalTableLayout(w, h, p);
            const { compact, paletteW, analysisW, centerL, centerR, project } = layout;
            const elements = p.elements || [];
            const trace = traceOpticalTable(elements);
            const selectedId = p.selectedId;

            /* 左側元件庫與右側分析欄，窄畫面自動隱藏。 */
            if (!compact) {
                ctx.fillStyle = 'rgba(255,255,255,0.88)';
                ctx.fillRect(0, 0, paletteW, h);
                ctx.strokeStyle = 'rgba(18,49,58,0.12)'; ctx.strokeRect(0.5, 0.5, paletteW - 1, h - 1);
                label(ctx, '光學元件庫', 14, 25, C.ink, 13);
                const items = [
                    ['convex', '凸透鏡', C.blue], ['concave', '凹透鏡', C.violet],
                    ['mirror', '反射鏡', C.orange], ['splitter', '分光鏡', C.cyan],
                    ['aperture', '可調光圈', C.rose], ['screen', '屏幕', C.green]
                ];
                items.forEach((item, i) => {
                    const y = 48 + i * 42;
                    ctx.fillStyle = 'rgba(18,49,58,0.035)'; ctx.fillRect(10, y - 16, paletteW - 20, 32);
                    ctx.fillStyle = item[2]; ctx.beginPath(); ctx.arc(24, y, 5, 0, Math.PI * 2); ctx.fill();
                    label(ctx, item[1], 36, y + 4, C.ink, 11);
                });
                labelWrap(ctx, '從下方選單選擇元件，再按「加入元件」。桌面上的元件可直接拖曳。',
                          12, h - 68, C.muted, 10, 14, paletteW - 24);

                const ax = w - analysisW;
                ctx.fillStyle = 'rgba(255,255,255,0.91)'; ctx.fillRect(ax, 0, analysisW, h);
                ctx.strokeStyle = 'rgba(18,49,58,0.12)'; ctx.strokeRect(ax + 0.5, 0.5, analysisW - 1, h - 1);
                label(ctx, '分析結果', ax + 14, 25, C.ink, 13);
                label(ctx, '總到達功率', ax + 14, 55, C.muted, 10);
                label(ctx, `${(trace.transmission * 100).toFixed(1)}%`, ax + 14, 79, C.orange, 21);
                label(ctx, '光斑 RMS', ax + 14, 108, C.muted, 10);
                label(ctx, `${trace.rms.toFixed(2)} cm`, ax + 14, 130, C.blue, 16);
                label(ctx, `光路段數　${trace.segments.length}`, ax + 14, 158, C.muted, 10);
                label(ctx, `屏幕命中　${[...trace.screenHits.values()].flat().length}`, ax + 14, 178, C.muted, 10);

                const plotX = ax + 18, plotY = 205, plotW = analysisW - 36, plotH = 126;
                ctx.fillStyle = '#fbfdfe'; ctx.fillRect(plotX, plotY, plotW, plotH);
                ctx.strokeStyle = 'rgba(18,49,58,0.18)'; ctx.strokeRect(plotX, plotY, plotW, plotH);
                dashed(ctx, plotX + plotW / 2, plotY + 8, plotX + plotW / 2, plotY + plotH - 8, 'rgba(18,49,58,0.18)');
                [...trace.screenHits.values()].flat().forEach((hit, i) => {
                    const px = plotX + plotW / 2 + Math.max(-1, Math.min(1, hit.offset / 15)) * plotW * 0.42;
                    const py = plotY + plotH / 2 + ((i % 5) - 2) * 4;
                    const r = 2 + hit.power * 4;
                    const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 2.3);
                    grad.addColorStop(0, 'rgba(255,80,60,0.9)'); grad.addColorStop(1, 'rgba(255,80,60,0)');
                    ctx.fillStyle = grad; ctx.fillRect(px - r * 2.3, py - r * 2.3, r * 4.6, r * 4.6);
                });
                label(ctx, '屏幕光斑位置', plotX + plotW / 2, plotY + plotH + 17, C.muted, 9, 'center');
            }

            /* 等角投影桌面。 */
            const corners = [project(0, -35), project(100, -35), project(100, 35), project(0, 35)];
            ctx.fillStyle = '#dfe5e7'; ctx.strokeStyle = '#52656c'; ctx.lineWidth = 1.5;
            ctx.beginPath(); corners.forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.save(); ctx.beginPath(); corners.forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)); ctx.closePath(); ctx.clip();
            for (let x = 0; x <= 100; x += 5) {
                const a = project(x, -35), b = project(x, 35);
                ctx.strokeStyle = x % 10 === 0 ? 'rgba(48,66,72,0.42)' : 'rgba(48,66,72,0.20)';
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
            for (let z = -35; z <= 35; z += 5) {
                const a = project(0, z), b = project(100, z);
                ctx.strokeStyle = z % 10 === 0 ? 'rgba(48,66,72,0.42)' : 'rgba(48,66,72,0.20)';
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
            ctx.restore();

            /* 紅色雷射光束：寬光暈＋亮核心。 */
            trace.segments.forEach((seg) => {
                const a = project(seg.x1, seg.z1, 62), b = project(seg.x2, seg.z2, 62);
                ctx.strokeStyle = `rgba(255,60,68,${0.10 + 0.18 * Math.min(seg.power, 1)})`;
                ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                ctx.strokeStyle = `rgba(255,88,96,${0.42 + 0.45 * Math.min(seg.power, 1)})`;
                ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            });

            /* 雷射光源與支架。 */
            const laserBase = project(8, 0), laserCenter = project(8, 0, 62);
            ctx.fillStyle = '#14242a'; ctx.fillRect(laserBase.x - 16, laserBase.y - 5, 32, 10);
            ctx.strokeStyle = '#263f48'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(laserBase.x, laserBase.y); ctx.lineTo(laserCenter.x, laserCenter.y + 8); ctx.stroke();
            ctx.fillStyle = '#17272e'; ctx.fillRect(laserCenter.x - 25, laserCenter.y - 10, 48, 20);
            for (let i = 0; i < 5; i++) { ctx.fillStyle = '#31454d'; ctx.fillRect(laserCenter.x - 23 + i * 8, laserCenter.y - 13, 4, 26); }
            ctx.fillStyle = '#ff4450'; ctx.beginPath(); ctx.arc(laserCenter.x + 24, laserCenter.y, 3, 0, Math.PI * 2); ctx.fill();
            label(ctx, '雷射', laserCenter.x, laserCenter.y - 19, C.rose, 10, 'center');

            elements.forEach((el, index) => {
                const base = project(el.x, el.z), center = project(el.x, el.z, 62);
                const selected = el.id === selectedId;
                const rot = rad(Number(el.rot) || 0);
                const e2 = project(el.x + Math.cos(rot) * 10, el.z + Math.sin(rot) * 10, 62);
                const vx = e2.x - center.x, vy = e2.y - center.y;
                const vl = Math.hypot(vx, vy) || 1;
                const tx = vx / vl, ty = vy / vl;
                ctx.fillStyle = selected ? C.violet : '#253940'; ctx.fillRect(base.x - 13, base.y - 5, 26, 10);
                ctx.strokeStyle = selected ? C.violet : '#324950'; ctx.lineWidth = selected ? 4 : 3;
                ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(center.x, center.y + 5); ctx.stroke();
                if (selected) {
                    ctx.strokeStyle = 'rgba(107,70,193,0.75)'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(base.x, base.y, 18, 0, Math.PI * 2); ctx.stroke();
                }

                if (el.type === 'convex' || el.type === 'concave') {
                    ctx.save(); ctx.translate(center.x, center.y); ctx.rotate(Math.atan2(ty, tx));
                    ctx.fillStyle = el.type === 'convex' ? 'rgba(80,190,225,0.35)' : 'rgba(145,105,220,0.30)';
                    ctx.strokeStyle = el.type === 'convex' ? C.blue : C.violet; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.ellipse(0, 0, 19, el.type === 'convex' ? 6 : 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
                } else if (el.type === 'mirror' || el.type === 'splitter' || el.type === 'screen') {
                    const halfW = el.type === 'screen' ? 25 : 19;
                    const halfH = el.type === 'screen' ? 27 : 20;
                    const col = el.type === 'screen' ? '#202e34' : (el.type === 'splitter' ? C.cyan : C.orange);
                    ctx.fillStyle = el.type === 'screen' ? 'rgba(73,45,92,0.78)' : (el.type === 'splitter' ? 'rgba(80,200,210,0.30)' : 'rgba(210,225,230,0.72)');
                    ctx.strokeStyle = col; ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(center.x - tx * halfW, center.y - ty * halfW - halfH);
                    ctx.lineTo(center.x + tx * halfW, center.y + ty * halfW - halfH);
                    ctx.lineTo(center.x + tx * halfW, center.y + ty * halfW + halfH);
                    ctx.lineTo(center.x - tx * halfW, center.y - ty * halfW + halfH);
                    ctx.closePath(); ctx.fill(); ctx.stroke();
                    (trace.screenHits.get(el.id) || []).forEach((hit) => {
                        const px = center.x + tx * hit.offset, py = center.y + ty * hit.offset;
                        ctx.fillStyle = 'rgba(255,90,80,0.9)'; ctx.beginPath(); ctx.arc(px, py, 3 + hit.power * 3, 0, Math.PI * 2); ctx.fill();
                    });
                } else if (el.type === 'aperture') {
                    ctx.strokeStyle = '#1d3037'; ctx.lineWidth = 9;
                    ctx.beginPath(); ctx.arc(center.x, center.y, 16, 0, Math.PI * 2); ctx.stroke();
                    ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(center.x, center.y, Math.max(4, (el.opening || 10) * 0.7), 0, Math.PI * 2); ctx.stroke();
                }
                labelFit(ctx, `${index + 1}. ${OPTICAL_BENCH_NAMES[el.type]}`, center.x, center.y - 34,
                         selected ? C.violet : C.ink, 9, 'center', { maxW: 92, clampW: w, plate: 1 });
            });

            label(ctx, compact ? '拖曳空白處旋轉視角｜拖曳元件改變位置' : '拖曳空白處旋轉視角｜滾輪縮放｜拖曳元件改變位置',
                  centerL + 8, h - 16, C.muted, 10);
        }

        LABS.optical_bench = {
            name: '3D 多元件光學工作臺',
            tag: 'N13 / N16 / N17',
            wide: true,
            height: 520,
            modes: [
                { key: 'table3d', label: '3D 光學桌' },
                { key: 'bench2d', label: '2D 光凳分析' }
            ],
            hint: '在<b>3D 光學桌</b>上配置雷射、透鏡、反射鏡、分光鏡、光圈與屏幕；拖曳空白處可旋轉視角、滾輪可縮放，拖曳元件則改變實際 X／Z 位置。分光鏡會產生兩條支路，右側即時計算到達屏幕的功率與光斑大小。切到<b>2D 光凳分析</b>可仔細觀察主光軸上的透鏡成像。',
            note: '光線追跡採近軸薄透鏡與理想幾何光學模型：計算會使用每個元件自己的位置與朝向；反射鏡遵守反射定律，理想分光鏡各分出 50% 功率。真實厚透鏡像差、偏振與繞射不在此模型內。',
            controls: [
                {
                    key: 'newType',
                    label: '準備加入的元件',
                    options: [
                        { value: 'convex', label: '凸透鏡（會聚）' },
                        { value: 'concave', label: '凹透鏡（發散）' },
                        { value: 'mirror', label: '平面反射鏡' },
                        { value: 'splitter', label: '50/50 分光鏡' },
                        { value: 'aperture', label: '可調光圈' },
                        { value: 'screen', label: '屏幕' }
                    ],
                    value: 'convex',
                    fmt: (v) => OPTICAL_BENCH_NAMES[v] || v
                },
                {
                    key: 'focal', label: '透鏡焦距 |f| (cm)', min: 8, max: 36, step: 1, value: 18,
                    fmt: (v) => `${Number(v).toFixed(0)} cm`,
                    onChange: (v, p) => {
                        const el = opticalBenchSelected(p);
                        if (el && (el.type === 'convex' || el.type === 'concave')) {
                            el.f = (el.type === 'concave' ? -1 : 1) * Number(v);
                        }
                    }
                },
                {
                    key: 'apertureSize', label: '光圈口徑 (cm)', min: 2, max: 16, step: 1, value: 10,
                    fmt: (v) => `${Number(v).toFixed(0)} cm`,
                    onChange: (v, p) => {
                        const el = opticalBenchSelected(p);
                        if (el && el.type === 'aperture') el.opening = Number(v);
                    }
                },
                {
                    key: 'rotation', label: '元件角度', min: 0, max: 175, step: 5, value: 90,
                    only: ['table3d'],
                    fmt: (v) => `${Number(v).toFixed(0)}°`,
                    onChange: (v, p) => {
                        const el = opticalBenchSelected(p);
                        if (el) el.rot = Number(v);
                    }
                },
                { key: 'objectHeight', label: '物體高度 (cm)', min: 3, max: 12, step: 1, value: 8,
                  only: ['bench2d'], fmt: (v) => `${v} cm` }
            ],
            extraButtons: [
                {
                    action: 'add-element',
                    label: '＋ 加入元件',
                    className: 'is-active',
                    onClick: (p, ui) => {
                        if (!Array.isArray(p.elements)) resetOpticalBench(p);
                        if (p.elements.length >= 16) {
                            p.benchNotice = '工作臺目前最多放置 16 個元件。';
                            ui.syncOutputs(); ui.paint(); return;
                        }
                        const type = p.newType;
                        if (p.mode === 'bench2d' && (type === 'mirror' || type === 'splitter')) {
                            p.benchNotice = `${OPTICAL_BENCH_NAMES[type]}會讓光路離開主光軸，請切到「3D 光學桌」加入。`;
                            ui.syncOutputs(); ui.paint(); return;
                        }
                        const tableSlots = [
                            [24, -17], [24, 17], [45, -20], [45, 20],
                            [68, -18], [68, 18], [82, -28], [82, 28]
                        ];
                        const slot = tableSlots.find(([x, z]) => !p.elements.some((item) => Math.hypot(item.x - x, (item.z || 0) - z) < 8));
                        const el = {
                            id: `oe-${p.nextElementId++}`,
                            type,
                            x: p.mode === 'table3d' && slot ? slot[0] : opticalBenchGap(p.elements),
                            z: p.mode === 'table3d' && slot ? slot[1] : 0,
                            rot: (type === 'mirror' || type === 'splitter') ? 45 : 90
                        };
                        if (type === 'convex' || type === 'concave') {
                            el.f = (type === 'concave' ? -1 : 1) * Number(p.focal);
                        }
                        if (type === 'aperture') el.opening = Number(p.apertureSize);
                        p.rotation = el.rot;
                        p.elements.push(el);
                        p.selectedId = el.id;
                        p.benchNotice = `已加入${OPTICAL_BENCH_NAMES[type]}；可直接在${p.mode === 'table3d' ? '桌面' : '光凳'}上拖曳。`;
                        ui.syncOutputs(); ui.paint();
                    }
                },
                {
                    action: 'delete-element',
                    label: '刪除選取元件',
                    onClick: (p, ui) => {
                        const el = opticalBenchSelected(p);
                        if (!el) {
                            p.benchNotice = '請先點選一個元件。';
                        } else {
                            p.elements = p.elements.filter((item) => item.id !== el.id);
                            p.selectedId = null;
                            p.benchNotice = `已移除${OPTICAL_BENCH_NAMES[el.type]}。`;
                        }
                        ui.syncOutputs(); ui.paint();
                    }
                },
                {
                    action: 'reset-view',
                    label: '重設視角',
                    onClick: (p, ui) => {
                        p.viewYaw = 20;
                        p.viewPitch = 32;
                        p.viewZoom = 1;
                        p.benchNotice = '視角已回到預設位置。';
                        ui.syncOutputs(); ui.paint();
                    }
                },
                {
                    action: 'clear-elements',
                    label: '清空工作臺',
                    onClick: (p, ui) => {
                        p.elements = [];
                        p.selectedId = null;
                        p.benchNotice = '工作臺已清空；可從「準備加入的元件」重新配置。';
                        ui.syncOutputs(); ui.paint();
                    }
                }
            ],
            onReset: (p) => resetOpticalBench(p),
            onMode: (p) => {
                p.benchNotice = p.mode === 'table3d'
                    ? '3D 模式：拖曳空白處旋轉視角、滾輪縮放；拖曳元件改變 X／Z 位置。'
                    : '2D 模式：顯示主光軸附近的透鏡、光圈與屏幕。';
                if (p.mode === 'bench2d') {
                    const visible = (p.elements || []).find((el) =>
                        ['convex', 'concave', 'aperture', 'screen'].includes(el.type) && Math.abs(el.z || 0) < 8);
                    p.selectedId = visible ? visible.id : null;
                }
            },
            readouts: (p) => {
                const elements = p.elements || [];
                const selected = opticalBenchSelected(p);
                const lensCount = elements.filter((el) => el.type === 'convex' || el.type === 'concave').length;
                const apertureCount = elements.filter((el) => el.type === 'aperture').length;
                const screenCount = elements.filter((el) => el.type === 'screen').length;
                const steeringCount = elements.filter((el) => el.type === 'mirror' || el.type === 'splitter').length;
                let selectedText = '未選取（點擊元件即可編輯）';
                if (selected) {
                    selectedText = p.mode === 'table3d'
                        ? `${OPTICAL_BENCH_NAMES[selected.type]} @ (${selected.x.toFixed(1)}, ${(selected.z || 0).toFixed(1)}) cm`
                        : `${OPTICAL_BENCH_NAMES[selected.type]} @ ${selected.x.toFixed(1)} cm`;
                    if (selected.type === 'convex' || selected.type === 'concave') selectedText += `，f = ${selected.f.toFixed(0)} cm`;
                    if (selected.type === 'aperture') selectedText += `，口徑 ${selected.opening.toFixed(0)} cm`;
                }
                const metrics = p.mode === 'table3d' ? traceOpticalTable(elements) : null;
                return [
                    { label: '工作臺元件', value: `${elements.length} 個` },
                    { label: '組成', value: `透鏡 ${lensCount}・轉向/分光 ${steeringCount}・光圈 ${apertureCount}・屏幕 ${screenCount}` },
                    { label: '目前選取', value: selectedText },
                    { label: p.mode === 'table3d' ? '屏幕總功率' : '操作提示',
                      value: p.mode === 'table3d' && metrics ? `${(metrics.transmission * 100).toFixed(1)}%，RMS ${metrics.rms.toFixed(2)} cm` : (p.benchNotice || '拖曳元件改變位置') }
                ];
            },
            setup: ({ host, canvas, params, disposers, syncOutputs, paint, getGeom }) => {
                resetOpticalBench(params);
                canvas.style.touchAction = 'none';
                canvas.style.cursor = 'grab';

                const pointOf = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const g = getGeom();
                    if (!rect.width || !rect.height) return null;
                    return {
                        x: (e.clientX - rect.left) * g.width / rect.width,
                        y: (e.clientY - rect.top) * g.height / rect.height
                    };
                };
                const screenX = (worldX) => {
                    const g = getGeom();
                    return 52 + worldX / 100 * Math.max(g.width - 80, 1);
                };
                const worldX = (screenPos) => {
                    const g = getGeom();
                    return Math.max(14, Math.min(96, (screenPos - 52) / Math.max(g.width - 80, 1) * 100));
                };
                const tablePoint = (el, height = 62) => {
                    const g = getGeom();
                    return opticalTableLayout(g.width, g.height, params).project(el.x, el.z || 0, height);
                };
                const updateEditors = (el) => {
                    if (!el) return;
                    if (el.type === 'convex' || el.type === 'concave') {
                        params.focal = Math.abs(el.f);
                        const input = host.querySelector('[id$="-focal"]');
                        if (input) input.value = params.focal;
                    }
                    if (el.type === 'aperture') {
                        params.apertureSize = el.opening;
                        const input = host.querySelector('[id$="-apertureSize"]');
                        if (input) input.value = params.apertureSize;
                    }
                    params.rotation = Number(el.rot) || 0;
                    const rotationInput = host.querySelector('[id$="-rotation"]');
                    if (rotationInput) rotationInput.value = params.rotation;
                };

                let draggingId = null;
                let dragOffset = { x: 0, z: 0 };
                let orbitStart = null;
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    const pt = pointOf(e);
                    if (!pt) return;
                    let picked = null, best = 24;
                    (params.elements || []).forEach((el) => {
                        const pos = params.mode === 'table3d' ? tablePoint(el) : { x: screenX(el.x), y: pt.y };
                        const d = params.mode === 'table3d' ? Math.hypot(pos.x - pt.x, pos.y - pt.y) : Math.abs(pos.x - pt.x);
                        if (d < best) { best = d; picked = el; }
                    });
                    if (picked && e.button === 0) {
                        params.selectedId = picked.id;
                        draggingId = picked.id;
                    } else if (params.mode === 'table3d') {
                        orbitStart = {
                            clientX: e.clientX,
                            clientY: e.clientY,
                            yaw: params.viewYaw,
                            pitch: params.viewPitch
                        };
                    } else {
                        params.selectedId = null;
                    }
                    if (draggingId && params.mode === 'table3d') {
                        const g = getGeom();
                        const at = opticalTableLayout(g.width, g.height, params).unproject(pt.x, pt.y + 62);
                        dragOffset = { x: picked.x - at.x, z: (picked.z || 0) - at.z };
                    }
                    updateEditors(picked);
                    params.benchNotice = draggingId
                        ? `已選取${OPTICAL_BENCH_NAMES[picked.type]}；拖曳可改變位置。`
                        : (params.mode === 'table3d' ? '正在旋轉視角。' : '未選取元件。');
                    canvas.style.cursor = (draggingId || orbitStart) ? 'grabbing' : 'grab';
                    syncOutputs(); paint();
                    e.preventDefault();
                });
                disposers.addEventListener(window, 'pointermove', (e) => {
                    if (orbitStart) {
                        params.viewYaw = orbitStart.yaw + (e.clientX - orbitStart.clientX) * 0.35;
                        params.viewPitch = Math.max(18, Math.min(62,
                            orbitStart.pitch - (e.clientY - orbitStart.clientY) * 0.25));
                        params.benchNotice = `視角：水平 ${Math.round(params.viewYaw)}°，俯角 ${Math.round(params.viewPitch)}°`;
                        syncOutputs(); paint();
                        e.preventDefault();
                        return;
                    }
                    if (!draggingId) return;
                    const pt = pointOf(e);
                    const el = (params.elements || []).find((item) => item.id === draggingId);
                    if (!pt || !el) return;
                    if (params.mode === 'table3d') {
                        const g = getGeom();
                        const at = opticalTableLayout(g.width, g.height, params).unproject(pt.x, pt.y + 62);
                        el.x = Math.round(Math.max(4, Math.min(96, at.x + dragOffset.x)) * 2) / 2;
                        el.z = Math.round(Math.max(-32, Math.min(32, at.z + dragOffset.z)) * 2) / 2;
                        params.benchNotice = `${OPTICAL_BENCH_NAMES[el.type]}位置：(${el.x.toFixed(1)}, ${el.z.toFixed(1)}) cm`;
                    } else {
                        el.x = Math.round(worldX(pt.x) * 2) / 2;
                        el.z = 0;
                        params.benchNotice = `${OPTICAL_BENCH_NAMES[el.type]}位置：${el.x.toFixed(1)} cm`;
                    }
                    syncOutputs(); paint();
                    e.preventDefault();
                });
                const stopDrag = () => {
                    draggingId = null;
                    orbitStart = null;
                    canvas.style.cursor = 'grab';
                };
                disposers.addEventListener(window, 'pointerup', stopDrag);
                disposers.addEventListener(window, 'pointercancel', stopDrag);
                disposers.addEventListener(canvas, 'contextmenu', (e) => e.preventDefault());
                disposers.addEventListener(canvas, 'wheel', (e) => {
                    if (params.mode !== 'table3d') return;
                    params.viewZoom = Math.max(0.72, Math.min(1.55,
                        params.viewZoom * Math.exp(-e.deltaY * 0.001)));
                    params.benchNotice = `視角縮放：${Math.round(params.viewZoom * 100)}%`;
                    syncOutputs(); paint();
                    e.preventDefault();
                }, { passive: false });
            },
            draw: (ctx, w, h, p) => {
                if (p.mode === 'table3d') {
                    drawOpticalTable3D(ctx, w, h, p);
                    return;
                }
                const elements = (p.elements || [])
                    .filter((el) => ['convex', 'concave', 'aperture', 'screen'].includes(el.type) && Math.abs(el.z || 0) < 8)
                    .slice().sort((a, b) => a.x - b.x);
                const selectedId = p.selectedId;
                const left = 52, right = w - 28;
                const span = Math.max(right - left, 1);
                const axisY = h * 0.45;
                const railY = h * 0.73;
                const yScale = Math.min(7, h / 72);
                const sx = (x) => left + x / 100 * span;
                const sy = (y) => axisY - y * yScale;
                const sourceX = 8;
                const rayEndX = 99;

                /* 淡格線與光凳刻度 */
                ctx.save();
                ctx.strokeStyle = 'rgba(18,49,58,0.055)'; ctx.lineWidth = 1;
                for (let cm = 0; cm <= 100; cm += 5) {
                    const X = sx(cm);
                    ctx.beginPath(); ctx.moveTo(X, 18); ctx.lineTo(X, railY + 34); ctx.stroke();
                }
                for (let yy = -20; yy <= 20; yy += 5) {
                    ctx.beginPath(); ctx.moveTo(left, sy(yy)); ctx.lineTo(right, sy(yy)); ctx.stroke();
                }
                ctx.restore();

                axis(ctx, left, axisY, right, axisY);
                label(ctx, '光軸', right - 28, axisY - 8, C.muted, 10);

                /* 光凳雙軌與尺 */
                ctx.fillStyle = 'rgba(18,49,58,0.72)';
                ctx.fillRect(left, railY, span, 5);
                ctx.fillStyle = 'rgba(18,49,58,0.28)';
                ctx.fillRect(left, railY + 11, span, 3);
                for (let cm = 0; cm <= 100; cm += 5) {
                    const X = sx(cm);
                    const major = cm % 10 === 0;
                    ctx.strokeStyle = major ? 'rgba(18,49,58,0.7)' : 'rgba(18,49,58,0.35)';
                    ctx.beginPath(); ctx.moveTo(X, railY + 16); ctx.lineTo(X, railY + (major ? 27 : 22)); ctx.stroke();
                    if (major) label(ctx, `${cm}`, X, railY + 40, C.muted, 9, 'center');
                }
                labelFit(ctx, '100 cm 光凳', left, railY + 78, C.ink, 11, 'left', { maxW: span });

                /* 物體／面光源固定在 8 cm */
                const objectH = Number(p.objectHeight) || 8;
                const objX = sx(sourceX), objY = sy(objectH);
                arrow(ctx, objX, axisY, objX, objY, C.green, 3);
                ctx.fillStyle = 'rgba(18,128,92,0.12)';
                ctx.fillRect(objX - 8, objY - 8, 16, Math.max(16, axisY - objY + 8));
                label(ctx, '發光物', objX, objY - 13, C.green, 11, 'center');
                label(ctx, '8 cm', objX, railY + 54, C.green, 9, 'center');

                /* 近軸光線追跡：狀態為 (高度 y, 斜率 θ)，薄透鏡令 θ -= y/f。 */
                const raySlopes = [-0.24, -0.18, -0.12, -0.06, 0, 0.06, 0.12, 0.18, 0.24];
                const screenHits = new Map();
                const blockedHits = [];
                raySlopes.forEach((initialSlope, rayIndex) => {
                    let x = sourceX, y = objectH, slope = initialSlope;
                    let active = true;
                    const segments = [];
                    for (const el of elements) {
                        if (!active || el.x < x - 0.01) continue;
                        const dx = Math.max(el.x - x, 0);
                        const nextY = y + slope * dx;
                        segments.push({ x1: x, y1: y, x2: el.x, y2: nextY });
                        x = el.x; y = nextY;
                        if (el.type === 'convex' || el.type === 'concave') {
                            slope -= y / el.f;
                        } else if (el.type === 'aperture') {
                            if (Math.abs(y) > el.opening / 2) {
                                blockedHits.push({ x, y });
                                active = false;
                            }
                        } else if (el.type === 'screen') {
                            if (!screenHits.has(el.id)) screenHits.set(el.id, []);
                            screenHits.get(el.id).push(y);
                            active = false;
                        }
                    }
                    if (active && x < rayEndX) {
                        segments.push({ x1: x, y1: y, x2: rayEndX, y2: y + slope * (rayEndX - x) });
                    }
                    ctx.save();
                    ctx.strokeStyle = `hsla(${190 + rayIndex * 3}, 88%, 38%, 0.58)`;
                    ctx.lineWidth = rayIndex === 4 ? 2.2 : 1.35;
                    segments.forEach((seg) => {
                        ctx.beginPath(); ctx.moveTo(sx(seg.x1), sy(seg.y1)); ctx.lineTo(sx(seg.x2), sy(seg.y2)); ctx.stroke();
                    });
                    ctx.restore();
                });

                blockedHits.forEach((hit) => {
                    const X = sx(hit.x), Y = sy(hit.y);
                    ctx.strokeStyle = C.rose; ctx.lineWidth = 1.4;
                    ctx.beginPath(); ctx.moveTo(X - 3, Y - 3); ctx.lineTo(X + 3, Y + 3);
                    ctx.moveTo(X + 3, Y - 3); ctx.lineTo(X - 3, Y + 3); ctx.stroke();
                });

                /* 元件本體畫在光線上方，選取者加上紫色外框與焦點記號。 */
                elements.forEach((el, index) => {
                    const X = sx(el.x);
                    const selected = el.id === selectedId;
                    const top = axisY - 92, bottom = axisY + 92;
                    ctx.save();
                    if (selected) {
                        ctx.fillStyle = 'rgba(107,70,193,0.08)';
                        ctx.strokeStyle = 'rgba(107,70,193,0.6)'; ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.roundRect(X - 22, top - 24, 44, bottom - top + 49, 8); ctx.fill(); ctx.stroke();
                    }

                    ctx.strokeStyle = selected ? C.violet : 'rgba(18,49,58,0.38)';
                    ctx.lineWidth = selected ? 2.2 : 1.3;
                    ctx.beginPath(); ctx.moveTo(X, bottom); ctx.lineTo(X, railY); ctx.stroke();
                    ctx.fillStyle = selected ? C.violet : '#41606b';
                    ctx.fillRect(X - 12, railY - 4, 24, 8);

                    if (el.type === 'convex' || el.type === 'concave') {
                        const concave = el.type === 'concave';
                        ctx.fillStyle = concave ? 'rgba(107,70,193,0.13)' : 'rgba(11,111,146,0.14)';
                        ctx.strokeStyle = concave ? C.violet : C.blue; ctx.lineWidth = 2.1;
                        ctx.beginPath();
                        if (!concave) {
                            ctx.moveTo(X, top); ctx.quadraticCurveTo(X + 16, axisY, X, bottom);
                            ctx.quadraticCurveTo(X - 16, axisY, X, top);
                        } else {
                            ctx.moveTo(X - 10, top); ctx.quadraticCurveTo(X + 5, axisY, X - 10, bottom);
                            ctx.lineTo(X + 10, bottom); ctx.quadraticCurveTo(X - 5, axisY, X + 10, top); ctx.closePath();
                        }
                        ctx.fill(); ctx.stroke();
                        if (selected) {
                            const focal = Math.abs(el.f);
                            [el.x - focal, el.x + focal].forEach((fx) => {
                                if (fx < 0 || fx > 100) return;
                                ctx.fillStyle = C.violet;
                                ctx.beginPath(); ctx.arc(sx(fx), axisY, 3.2, 0, Math.PI * 2); ctx.fill();
                                label(ctx, 'F', sx(fx), axisY + 17, C.violet, 9, 'center');
                            });
                        }
                    } else if (el.type === 'aperture') {
                        const halfGap = el.opening / 2 * yScale;
                        ctx.fillStyle = '#263f48';
                        ctx.fillRect(X - 6, top, 12, axisY - halfGap - top);
                        ctx.fillRect(X - 6, axisY + halfGap, 12, bottom - axisY - halfGap);
                        ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.arc(X, axisY, halfGap, -Math.PI / 2, Math.PI / 2);
                        ctx.arc(X, axisY, halfGap, Math.PI / 2, -Math.PI / 2); ctx.stroke();
                    } else if (el.type === 'screen') {
                        ctx.fillStyle = 'rgba(255,255,255,0.88)';
                        ctx.strokeStyle = selected ? C.violet : C.orange; ctx.lineWidth = 2;
                        ctx.fillRect(X - 5, top - 8, 10, bottom - top + 16);
                        ctx.strokeRect(X - 5, top - 8, 10, bottom - top + 16);
                        (screenHits.get(el.id) || []).forEach((hitY) => {
                            const Y = sy(hitY);
                            if (Y < top - 8 || Y > bottom + 8) return;
                            const grad = ctx.createRadialGradient(X, Y, 0, X, Y, 8);
                            grad.addColorStop(0, 'rgba(255,145,20,0.95)');
                            grad.addColorStop(1, 'rgba(255,145,20,0)');
                            ctx.fillStyle = grad; ctx.fillRect(X - 8, Y - 8, 16, 16);
                        });
                    }
                    labelFit(ctx, `${index + 1}. ${OPTICAL_BENCH_NAMES[el.type]}`, X, top - 31,
                             selected ? C.violet : C.ink, 10, 'center', { maxW: 100, clampW: w, plate: 1 });
                    label(ctx, `${el.x.toFixed(1)} cm`, X, railY + 54, selected ? C.violet : C.muted, 9, 'center');
                    ctx.restore();
                });

                const selected = opticalBenchSelected(p);
                const status = selected
                    ? `選取：${OPTICAL_BENCH_NAMES[selected.type]} @ ${selected.x.toFixed(1)} cm　｜　左右拖曳改變位置`
                    : '點擊元件以選取；拖曳可沿光凳移動。元件依左→右順序作用於光線。';
                ctx.fillStyle = 'rgba(255,255,255,0.88)';
                ctx.fillRect(left, h - 36, span, 26);
                labelFit(ctx, status, left + 8, h - 18, selected ? C.violet : C.muted, 11, 'left', { maxW: span - 16 });
            }
        };

