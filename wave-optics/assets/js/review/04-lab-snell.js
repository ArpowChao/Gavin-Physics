// 互動實驗：司乃耳定律與全反射
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 9. 司乃耳定律與全反射 -------------------------------------------- */
        /* 三種視角對應三種課堂現象：
         *   ray     單一光線：折射角、臨界角，以及反射率 R 隨入射角連續增加到 100%
         *   fan     水下光扇：點光源在水中向上射出一扇光（對應「水槽光扇」實驗影片）
         *   window  斯涅爾窗：潛水者仰望水面（對應水下仰拍照片與泳池水下影片）
         * 物理模型：平面（或小振幅起伏）界面、司乃耳定律、非偏振光的菲涅耳反射率。 */
        function fresnelR(n1, n2, cosi) {
            const c = Math.max(0, Math.min(1, cosi));
            const sint2 = (n1 / n2) * (n1 / n2) * (1 - c * c);
            if (sint2 >= 1) return 1;
            const cost = Math.sqrt(1 - sint2);
            const rs = (n1 * c - n2 * cost) / (n1 * c + n2 * cost);
            const rp = (n1 * cost - n2 * c) / (n1 * cost + n2 * c);
            return (rs * rs + rp * rp) / 2;
        }
        const SNELL_MEDIA = { '1.33': '水', '1.5': '玻璃', '2.42': '鑽石' };
        const snellMediumName = (n) => SNELL_MEDIA[String(n)] || '介質';
        const SNELL_FAN_STEP = 6, SNELL_FAN_MAX = 84;
        const SNELL_FAN_COLORS = ['#ff5a5f', '#ffb347', '#ffe66d', '#7ee081', '#5ec8ff', '#b28dff'];
        const SNELL_POOL_H = 3.5;     // 池深 (m)
        const SNELL_BALL = { z: 0.8, r: 0.32 }; // 浮球中心深度與半徑 (m)
        const SNELL_FOV = 80;         // 魚眼半視角 (°)：影像邊緣離正上方 80°

        /* 斯涅爾窗的側視版面與仰望影像版面：寬螢幕左右並排，窄螢幕上下堆疊 */
        function snellWindowLayout(w, h) {
            if (w >= 640) {
                const V = Math.min(h - 16, Math.floor(w * 0.46));
                return { sec: { x: 8, y: 8, w: w - V - 28, h: h - 16 }, view: { x: w - V - 8, y: Math.round((h - V) / 2), s: V } };
            }
            const V = Math.min(w - 16, 330);
            return { sec: { x: 8, y: 8, w: w - 16, h: 240 }, view: { x: Math.round((w - V) / 2), y: 262, s: V } };
        }

        /* 仰望影像：從眼睛對每個像素方向做光線追蹤。
         * 水面點的法線含小振幅波動；折射到空氣則取天空顏色，入射角超過臨界角或部分反射時
         * 取反射光線打到的池底／浮球；最後依水中路徑長加上水色衰減。 */
        const snellView = { key: '', img: null, N: 0, dirs: null };
        function snellViewImage(N, p, t) {
            const n = Number(p.nw), d = p.eyeD, H = SNELL_POOL_H;
            const ocean = p.scene === 'ocean';
            const amp = p.ripple * 0.10;
            const tq = amp > 0 ? Math.round(t * 30) / 30 : 0;
            const key = [N, n, d, p.sun, p.objX, p.scene, p.ripple, tq].join('|');
            if (snellView.key === key && snellView.img) return snellView.img;
            if (snellView.N !== N || !snellView.dirs) {
                const dirs = new Float32Array(N * N * 4);
                const c = (N - 1) / 2, aMax = rad(SNELL_FOV);
                for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
                    const k = (j * N + i) * 4;
                    const rho = Math.hypot(i - c, j - c) / (N / 2);
                    if (rho > 1) { dirs[k + 3] = -1; continue; }
                    const a = rho * aMax, ph = Math.atan2(-(j - c), i - c);
                    dirs[k] = Math.sin(a) * Math.cos(ph); dirs[k + 1] = Math.sin(a) * Math.sin(ph);
                    dirs[k + 2] = Math.cos(a); dirs[k + 3] = rho;
                }
                snellView.dirs = dirs; snellView.N = N;
                snellView.img = new ImageData(N, N);
            }
            const dirs = snellView.dirs, img = snellView.img, D = img.data;
            const e = rad(p.sun);
            const sx = -Math.cos(e), sz = Math.sin(e);           // 太陽在 −x 方向的天空
            const sunCos = Math.cos(rad(2.2)), glowK = 260;
            const warm = Math.max(0, Math.min(1, (16 - p.sun) / 12));     // 低角度太陽：暮色
            const skyDim = 0.55 + 0.45 * Math.min(1, p.sun / 25);
            const sunRGB = [255, 248 - 70 * warm, 228 - 150 * warm], glowRGB = [255, 236 - 70 * warm, 190 - 110 * warm];
            const bx = p.objX, bz = -SNELL_BALL.z, br = SNELL_BALL.r;
            const water = ocean ? [6, 34, 62] : [38, 150, 168];
            const L = ocean ? 11 : 9;
            const waves = [[2.6, 0.0, 1.1, 1.0], [-1.3, 3.1, 1.6, 0.7], [4.2, -2.4, 2.3, 0.45]];
            const out = [0, 0, 0];

            const hitBall = (ox, oy, oz, vx, vy, vz, tmax) => {
                const lx = ox - bx, ly = oy, lz = oz - bz;
                const b = lx * vx + ly * vy + lz * vz;
                const cc = lx * lx + ly * ly + lz * lz - br * br;
                const disc = b * b - cc;
                if (disc < 0) return -1;
                const s = -b - Math.sqrt(disc);
                return (s > 1e-4 && s < tmax) ? s : -1;
            };
            const ballColor = (px, py, pz) => {
                const nx = (px - bx) / br, ny = py / br, nz = (pz - bz) / br;
                const lam = 0.55 + 0.45 * Math.max(0, nz * 0.9 + nx * 0.3);
                out[0] = 232 * lam; out[1] = 70 * lam; out[2] = 52 * lam;
            };
            /* 水下場景：沿方向 v 從 (ox,oy,oz) 出發（向下或水平） */
            const below = (ox, oy, oz, vx, vy, vz, path0) => {
                const sb = hitBall(ox, oy, oz, vx, vy, vz, 60);
                let path;
                if (sb > 0) { ballColor(ox + vx * sb, oy + vy * sb, oz + vz * sb); path = path0 + sb; }
                else if (ocean || vz > -1e-3) {
                    out[0] = water[0] * 0.35; out[1] = water[1] * 0.35; out[2] = water[2] * 0.45; return;
                } else {
                    const s = (oz + H) / -vz;
                    const fx = ox + vx * s, fy = oy + vy * s;
                    path = path0 + s;
                    const lane = 2.5, lw = 0.13;
                    const mx = ((fx % lane) + lane) % lane;
                    const onLine = (mx < lw || mx > lane - lw) && Math.abs(fy) < 11;
                    const tee = Math.abs(Math.abs(fy) - 11) < lw && (mx < 0.55 || mx > lane - 0.55);
                    const tile = (((Math.floor(fx * 4) + Math.floor(fy * 4)) & 1) ? 0.97 : 1);
                    if (onLine || tee) { out[0] = 28; out[1] = 44; out[2] = 104; }
                    else { out[0] = 214 * tile; out[1] = 240 * tile; out[2] = 240 * tile; }
                }
                const f = Math.exp(-path / L);
                out[0] = water[0] + (out[0] - water[0]) * f;
                out[1] = water[1] + (out[1] - water[1]) * f;
                out[2] = water[2] + (out[2] - water[2]) * f;
            };
            const sky = (vx, vy, vz) => {
                const el = Math.max(0, vz);
                const tz = Math.pow(el, 0.55);
                let r = (200 + (52 - 200) * tz) * skyDim, g = (226 + (128 - 226) * tz) * skyDim, b = (240 + (206 - 240) * tz) * skyDim;
                // 雲：投影到高空水平面，越近地平線越擠
                if (el > 0.06) {
                    const cx = vx / el, cy = vy / el;
                    const cv = Math.sin(cx * 1.3 + 0.4) * Math.sin(cy * 1.1 - 0.7) + 0.55 * Math.sin(cx * 2.7 - cy * 1.9 + 1.2);
                    const a = Math.max(0, Math.min(1, (cv - 0.45) * 2.4)) * Math.min(1, (el - 0.06) * 6) * 0.85;
                    r += (250 - r) * a; g += (250 - g) * a; b += (252 - b) * a;
                }
                // 地平線上的樹林與建築剪影（仰角約 5°–15°）
                const ph = Math.atan2(vy, vx);
                // 泳池：周圍的樹與建築；深海：開闊海面，只剩遠方低矮的島影
                const ridge = ocean
                    ? 0.006 + 0.03 * Math.max(0, Math.sin(ph * 3 + 2.2)) * (0.5 + 0.5 * Math.sin(ph * 11))
                    : 0.09 + 0.16 * (0.5 + 0.5 * Math.sin(ph * 5 + 0.5)) * (0.55 + 0.45 * Math.sin(ph * 13));
                if (el < ridge) { r = 40 * skyDim; g = 70 * skyDim; b = 56 * skyDim; }
                // 太陽
                const cs = vx * sx + vz * sz;
                if (cs > sunCos) { r = sunRGB[0]; g = sunRGB[1]; b = sunRGB[2]; }
                else {
                    const gl = Math.min(1, Math.exp((cs - 1) * glowK) * 0.9 + Math.exp((cs - 1) * (18 - 8 * warm)) * (0.25 + 0.35 * warm));
                    r += (glowRGB[0] - r) * gl; g += (glowRGB[1] - g) * gl; b += (glowRGB[2] - b) * gl;
                }
                out[0] = r; out[1] = g; out[2] = b;
            };

            for (let k = 0, q = 0; q < N * N; q++, k += 4) {
                const rho = dirs[k + 3];
                if (rho < 0) { D[k] = 6; D[k + 1] = 10; D[k + 2] = 14; D[k + 3] = 255; continue; }
                const ux = dirs[k], uy = dirs[k + 1], uz = dirs[k + 2];
                const ts = d / uz;                       // 眼睛到水面的路徑長
                const sDirect = hitBall(0, 0, -d, ux, uy, uz, ts);
                let R, G, B;
                if (sDirect > 0) {
                    ballColor(ux * sDirect, uy * sDirect, -d + uz * sDirect);
                    const f = Math.exp(-sDirect / L);
                    R = water[0] + (out[0] - water[0]) * f; G = water[1] + (out[1] - water[1]) * f; B = water[2] + (out[2] - water[2]) * f;
                } else {
                    const px = ux * ts, py = uy * ts;
                    let gx = 0, gy = 0;
                    if (amp > 0) {
                        for (const [kx, ky, om, a] of waves) {
                            const cph = Math.cos(kx * px + ky * py - om * tq);
                            gx += a * kx * cph; gy += a * ky * cph;
                        }
                        gx *= amp / 3; gy *= amp / 3;
                    }
                    const nl = 1 / Math.sqrt(1 + gx * gx + gy * gy);
                    const Nx = -gx * nl, Ny = -gy * nl, Nz = nl;
                    const cosi = Math.max(0, ux * Nx + uy * Ny + uz * Nz);
                    const Rf = fresnelR(n, 1, cosi);
                    // 反射光（向下）
                    const rx = ux - 2 * cosi * Nx, ry = uy - 2 * cosi * Ny, rz = Math.min(-1e-3, uz - 2 * cosi * Nz);
                    below(px, py, 0, rx, ry, rz, ts);
                    R = out[0] * Rf; G = out[1] * Rf; B = out[2] * Rf;
                    if (Rf < 1) {
                        const sint2 = n * n * (1 - cosi * cosi);
                        const cost = Math.sqrt(1 - sint2);
                        const vx = n * ux + (cost - n * cosi) * Nx, vy = n * uy + (cost - n * cosi) * Ny, vz = n * uz + (cost - n * cosi) * Nz;
                        sky(vx, vy, vz);
                        const f = Math.exp(-ts / (L * 2.2)), T = 1 - Rf;
                        R += T * (water[0] + (out[0] - water[0]) * f);
                        G += T * (water[1] + (out[1] - water[1]) * f);
                        B += T * (water[2] + (out[2] - water[2]) * f);
                    }
                }
                const vig = rho > 0.93 ? 1 - (rho - 0.93) * 6 : 1;
                D[k] = R * vig; D[k + 1] = G * vig; D[k + 2] = B * vig; D[k + 3] = 255;
            }
            snellView.key = key;
            return img;
        }


        /* 斯涅爾窗的真實照片：與模擬並排對照。apply 為「套用到模擬」時要設定的參數。
         * 外部圖片採原文連結；載入失敗時改顯示文字連結。 */
        const SNELL_ARTICLE = 'https://www.divephotoguide.com/underwater-photography-techniques/article/underwater-photographer-s-guide-snell-s-window/';
        const SNELL_PHOTOS = [
            { src: 'assets/images/snell/sunset-sulawesi-marriott.jpg', title: '低角度的夕陽（印尼蘇拉威西）',
              look: '太陽很低，所以影像落在窗緣附近；水面的波浪把窗緣撕成鋸齒；窗外映出幽暗深水而一片漆黑。',
              credit: '攝影：Andrew Marriott', link: SNELL_ARTICLE,
              apply: { scene: 'ocean', sun: 10, ripple: 0.55, eyeD: 1.0 } },
            { src: 'assets/images/snell/shark-window.jpg', title: '鯊魚與窗中的天空',
              look: '藍天與白雲全部擠在圓窗內，越靠近窗緣的雲越扁；窗外是全反射映出的藍色海水。',
              credit: '來源待補（使用者提供）',
              apply: { scene: 'ocean', sun: 62, ripple: 0.2, eyeD: 2.0 } },
            { src: 'assets/images/snell/freedivers-window.jpg', title: '自由潛水者與正上方的太陽',
              look: '太陽接近天頂，影像在窗的中央；潛水者在窗內呈剪影；窗外暗藍，看不到天空。',
              credit: '來源待補（使用者提供）',
              apply: { scene: 'ocean', sun: 84, ripple: 0.25, eyeD: 2.6 } },
            { src: 'https://www.divephotoguide.com/images/lightboximage/m/1582820588.jpg', external: true,
              title: '淺水軟珊瑚與岸上叢林（Lembeh）',
              look: '在很淺的水中，太陽與岸上的樹林都在窗內；樹林被擠成窗緣的一圈深色剪影。',
              credit: '攝影：Andrew Marriott', link: SNELL_ARTICLE,
              apply: { scene: 'ocean', sun: 38, ripple: 0.1, eyeD: 0.6 } },
            { src: 'https://www.divephotoguide.com/images/lightboximage/m/1582820645.jpg', external: true,
              title: '同一片日落（Manado）之一',
              look: '與下一張相隔約 20 秒：太陽仰角幾乎不變，但水面起伏不同，窗緣的形狀完全不一樣。',
              credit: '攝影：Andrew Marriott', link: SNELL_ARTICLE,
              apply: { scene: 'ocean', sun: 9, ripple: 0.35, eyeD: 1.2 } },
            { src: 'https://www.divephotoguide.com/images/lightboximage/m/1582820686.jpg', external: true,
              title: '同一片日落（Manado）之二',
              look: '約 20 秒後。在模擬中按「播放」讓水面起伏，觀察窗緣隨時間變形。',
              credit: '攝影：Andrew Marriott', link: SNELL_ARTICLE,
              apply: { scene: 'ocean', sun: 9, ripple: 0.6, eyeD: 1.2 } }
        ];
        /* 真實影片與照片：放在對應模擬模式的讀數下方，可一鍵把模擬調成接近畫面的情況。
         * kind: 'video' | 'image'；chapters 為影片時間點；apply 為要套用的參數（有輸入元件就改元件，否則直接改 params）。 */
        const REAL_MEDIA = {
            poolVideo: { kind: 'video', src: 'assets/video/real/pool-underwater-mirror.mp4', poster: 'assets/images/real/pool-underwater-mirror.jpg',
                title: '泳池水下：水面變成一面鏡子',
                look: '鏡頭在水下斜看水面時，入射角大於臨界角，水面全反射，映出池底的泳道線與泳者的倒影；鏡頭轉向正上方時，窗內才看得到天花板。',
                credit: '影片：@myswimpro（Instagram 轉載，畫面含 Little Rock 標誌）；僅保留水下片段並移除音軌',
                chapters: [{ t: 0, label: '斜看水面：映出池底泳道線' }, { t: 13, label: '泳者與水面中的倒影' }, { t: 20, label: '往正上方看：窗內是天花板' }] },
            poolPhoto: { kind: 'image', src: 'assets/images/snell/pool-window-marriott.jpg', fit: 'contain',
                title: '泳池中仰望：窗內的人、窗外的磁磚',
                look: '上方的圓窗內看得到站在池邊的人，被壓縮在窗裡；窗外的水面全反射，映出池底、池壁的磁磚與水中的人。',
                credit: '攝影：Andrew Marriott' },
            fanVideo: { kind: 'video', src: 'assets/video/real/light-fan-tank-brigida.mp4', poster: 'assets/images/real/light-fan-tank-brigida.jpg',
                title: '水槽中的光扇：反射、折射與全反射',
                look: '彩色濾光片只用來分辨方向。陡的光穿出水面並向外張開；比臨界角斜的光全部反射回水中；光源越接近水面，射出的光扇越寬。',
                credit: '影片：Rosa Brígida，A.I.F.–E.S.T.T.（2010）〈Reflection, refraction and total internal reflection in water/air surface〉；移除音軌',
                chapters: [{ t: 0, label: '片頭：作者與出處' }, { t: 10, label: '注水：光源沒入水中' }, { t: 40, label: '斜的光全反射回水中' },
                           { t: 150, label: '光源接近水面：光扇出水張開' }, { t: 230, label: '近看水面的折射與反射' }] }
        };
        const withApply = (item, apply) => Object.assign({}, item, { apply });
        function realMediaHtml(key, panel) {
            const cards = panel.items.map((it, i) => {
                const credit = it.link ? `<a href="${it.link}" target="_blank" rel="noopener">${it.credit}／DivePhotoGuide</a>` : it.credit;
                const visual = it.kind === 'video'
                    ? `<div class="snell-photo-img is-video"><video controls preload="none" playsinline muted poster="${it.poster}"><source src="${it.src}" type="video/mp4"></video></div>`
                    : `<a class="snell-photo-img" href="${it.link || it.src}" target="_blank" rel="noopener">
                           <img src="${it.src}" alt="${it.title}" loading="lazy" ${it.external ? 'referrerpolicy="no-referrer"' : ''} ${it.fit ? `style="object-fit:${it.fit}"` : ''}
                                onerror="this.parentNode.classList.add('is-missing');this.remove();">
                           <span class="snell-photo-fallback">圖片無法載入，按此開啟原文</span>
                       </a>`;
                const chapters = (it.chapters || []).map((c) =>
                    `<button type="button" class="real-chapter" data-t="${c.t}">${Math.floor(c.t / 60)}:${String(c.t % 60).padStart(2, '0')} ${c.label}</button>`).join('');
                return `
                <figure class="snell-photo${it.kind === 'video' ? ' is-wide' : ''}" data-item="${i}">
                    ${visual}
                    <figcaption>
                        <b>${it.title}</b>
                        ${chapters ? `<div class="real-chapters">${chapters}</div>` : ''}
                        <span>${it.look}</span>
                        <small>${credit}</small>
                        ${it.apply ? `<button type="button" class="lab-btn snell-photo-apply" data-item="${i}">套用到模擬</button>` : ''}
                    </figcaption>
                </figure>`;
            }).join('');
            return `<section class="snell-photos" data-panel="${key}" hidden>
                    <h5>${panel.title}</h5>
                    <p>${panel.desc}</p>
                    <div class="snell-photo-grid">${cards}</div>
                </section>`;
        }
        /* 依模式顯示對應的真實影像，並綁定「套用到模擬」與影片章節 */
        function bindRealMedia({ host, params, disposers, paint, syncOutputs }, labId, panels) {
            const stage = host.querySelector('.lab-stage');
            const anchor = host.querySelector('.lab-readout') || stage;
            if (!stage || host.querySelector('.snell-photos')) return;
            anchor.insertAdjacentHTML('afterend', Object.entries(panels).map(([k, pnl]) => realMediaHtml(k, pnl)).join(''));
            const sync = () => {
                host.querySelectorAll('.snell-photos').forEach((el) => {
                    const show = el.dataset.panel === params.mode;
                    if (!show) el.querySelectorAll('video').forEach((v) => { try { v.pause(); } catch (_) { /* 略過 */ } });
                    el.hidden = !show;
                });
            };
            host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', sync));
            host.querySelectorAll('.snell-photos').forEach((el) => {
                const items = panels[el.dataset.panel].items;
                el.querySelectorAll('.snell-photo-apply').forEach((btn) => {
                    disposers.addEventListener(btn, 'click', () => {
                        const it = items[Number(btn.dataset.item)];
                        Object.entries(it.apply).forEach(([k, v]) => {
                            const input = host.querySelector(`[id$="${labId}-${k}"]`);
                            if (input && input.type === 'checkbox') {
                                input.checked = !!v; input.dispatchEvent(new Event('change'));
                            } else if (input) {
                                input.value = String(v);
                                input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input'));
                            } else params[k] = v;
                        });
                        paint(); syncOutputs();
                        stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    });
                });
                el.querySelectorAll('.real-chapter').forEach((btn) => {
                    disposers.addEventListener(btn, 'click', () => {
                        const video = btn.closest('figure').querySelector('video');
                        if (!video) return;
                        const go = () => { video.currentTime = Number(btn.dataset.t); video.play().catch(() => {}); };
                        if (video.readyState >= 1) go();
                        else { video.preload = 'metadata'; video.addEventListener('loadedmetadata', go, { once: true }); video.load(); }
                    });
                });
            });
            sync();
        }
        LABS.snell = {
            name: '司乃耳定律與全反射',
            tag: 'N13 / N15',
            wide: true,            /* 寬螢幕時撐出正文欄寬，見 #main-content.lab-wide */
            hint: '一次調整一個參數，觀察折射方向。光由折射率較大的一側射向較小的一側，入射角超過臨界角時發生全反射；等於臨界角時，折射角為 90°。',
            hintFor: (p) => ({
                ray: '一次調整一個參數，觀察折射方向。光由折射率較大的一側射向較小的一側，入射角超過臨界角時發生全反射；等於臨界角時，折射角為 90°。線條粗細代表光的強弱：留意入射角接近臨界角時，反射光如何變亮。',
                fan: '光源放在水中，向上射出一扇光線（顏色只用來分辨方向，不是色散）。比臨界角陡的光穿出水面，而且向外張得更開；比臨界角斜的光全部反射回水裡。改變光源深度：出光範圍跟著變大，但能射出的始終是同一批角度。',
                window: '潛水者仰望水面：水面上方從地平線到天頂的整片天空（180°），折射後被壓縮進頂角 2θc 的圓錐，稱為「斯涅爾窗」。窗外的視線入射角大於臨界角，看到的是水面全反射映出的水下景物。左圖是側視光路，右圖是用相同光路算出的仰望影像。'
            })[p.mode] || '',
            note: '全反射條件：n₁ > n₂，且入射角 > 臨界角 θ_c（sinθ_c = n₂/n₁）。「光密、光疏」比較的是折射率，與物質的質量密度不同。',
            noteFor: (p) => ({
                ray: '全反射條件：n₁ > n₂，且入射角 > 臨界角 θ_c（sinθ_c = n₂/n₁）。「光密、光疏」比較的是折射率，與物質的質量密度不同。<br>入射角小於臨界角時，反射與折射同時存在；反射率 R 隨入射角增加，在臨界角處連續升到 100%，所以全反射不是突然「開關」，而是折射光漸弱、終至消失。（R 依非偏振光的菲涅耳公式計算。）',
                fan: '每條光線能否射出只由它的入射角決定，與深度無關；深度 h 只決定水面上「光能射出的圓」半徑 r = h·tanθ_c。從水面上方看，水中光源只在這個圓內透光。<br>剛好小於臨界角的光，出水後幾乎貼著水面前進，而且很暗（大部分被反射）。真實水槽中，全反射光還會再被槽壁、槽底反射。',
                window: '窗的視角 2θ_c 與深度無關（水約 97°）；深度 d 只改變窗在水面上的大小 r = d·tanθ_c。地平線附近的景物被擠在窗緣，太陽的影像也比實際位置更靠近正上方。<br>窗外是全反射：泳池中映出明亮的池底與泳道線，看起來像一面鏡子；深海中下方幽暗，所以窗外一片漆黑。水面有波浪時，各處法線方向不同，窗緣變得破碎、閃動，就像照片中的鋸齒邊。<br>簡化：水面以小振幅正弦波表示；未計入色散（實際窗緣會帶一點彩色）與水中散射光。'
            })[p.mode] || '',
            modes: [
                { key: 'ray', label: '單一光線' },
                { key: 'fan', label: '水下光扇' },
                { key: 'window', label: '斯涅爾窗（水下仰望）' }
            ],
            height: (p, w) => {
                if (p.mode === 'window') return w >= 640 ? Math.min(420, Math.floor(w * 0.46) + 16) : 262 + Math.min(w - 16, 330) + 10;
                if (p.mode === 'fan') return 380;
                return 340;
            },
            controls: [
                { key: 'th1', label: '入射角 θ₁', min: 0, max: 89, step: 1, value: 40, fmt: (v) => `${v}°`, only: ['ray'] },
                { key: 'n1', label: '入射側折射率 n₁', min: 1, max: 2.5, step: 0.05, value: 1.5, fmt: (v) => v.toFixed(2), only: ['ray'] },
                { key: 'n2', label: '出射側折射率 n₂', min: 1, max: 2.5, step: 0.05, value: 1.0, fmt: (v) => v.toFixed(2), only: ['ray'] },
                { key: 'nw', label: '光源所在介質（上方為空氣）', value: '1.33', only: ['fan', 'window'],
                  options: [{ value: '1.33', label: '水 n = 1.33' }, { value: '1.5', label: '玻璃 n = 1.50' }, { value: '2.42', label: '鑽石 n = 2.42' }],
                  fmt: () => '' },
                { key: 'depth', label: '光源深度 h', min: 2, max: 30, step: 1, value: 12, fmt: (v) => `${v} cm`, only: ['fan'] },
                { key: 'eyeD', label: '眼睛深度 d', min: 0.4, max: 3, step: 0.1, value: 1.6, fmt: (v) => `${v.toFixed(1)} m`, only: ['window'] },
                { key: 'sun', label: '太陽仰角', min: 8, max: 90, step: 1, value: 55, fmt: (v) => `${v}°`, only: ['window'] },
                { key: 'objX', label: '浮球水平距離', min: 0.6, max: 6, step: 0.1, value: 3.2, fmt: (v) => `${v.toFixed(1)} m`, only: ['window'] },
                { key: 'ripple', label: '水面波動', min: 0, max: 1, step: 0.05, value: 0.2, fmt: (v) => v === 0 ? '平靜' : `${Math.round(v * 100)}%`, only: ['window'] },
                { key: 'scene', label: '水下環境', value: 'pool', only: ['window'],
                  options: [{ value: 'pool', label: '泳池（明亮池底）' }, { value: 'ocean', label: '深海（下方幽暗）' }],
                  fmt: () => '' }
            ],
            readouts: (p) => {
                if (p.mode === 'fan' || p.mode === 'window') {
                    const n = Number(p.nw), thc = Math.asin(1 / n);
                    if (p.mode === 'fan') {
                        const r = p.depth * Math.tan(thc);
                        let out = 0, total = 0, edge = 0;
                        for (let a = -SNELL_FAN_MAX; a <= SNELL_FAN_MAX; a += SNELL_FAN_STEP) {
                            total++;
                            if (Math.abs(a) < deg(thc)) { out++; edge = Math.max(edge, Math.abs(a)); }
                        }
                        return [
                            { label: '臨界角 θ_c', value: `${deg(thc).toFixed(1)}°` },
                            { label: '出光圓半徑 r = h·tanθ_c', value: `${r.toFixed(1)} cm` },
                            { label: '射出水面的光線', value: `${out} / ${total} 條` },
                            { label: `最斜的出射光（入射 ${edge}°）`, value: `折射角 ${deg(Math.asin(n * Math.sin(rad(edge)))).toFixed(0)}°` }
                        ];
                    }
                    const r = p.eyeD * Math.tan(thc);
                    const aSun = deg(Math.asin(Math.cos(rad(p.sun)) / n));
                    const aImg = deg(Math.atan(p.objX / (p.eyeD + SNELL_BALL.z)));
                    const tir = aImg > deg(thc);
                    const Rimg = fresnelR(n, 1, Math.cos(rad(aImg)));
                    return [
                        { label: '臨界角 θ_c', value: `${deg(thc).toFixed(1)}°` },
                        { label: '窗的視角 2θ_c（與深度無關）', value: `${(2 * deg(thc)).toFixed(1)}°` },
                        { label: '窗的直徑 2r = 2d·tanθ_c', value: `${(2 * r).toFixed(2)} m` },
                        { label: '太陽影像偏離正上方', value: `${aSun.toFixed(1)}°（實際 ${90 - p.sun}°）` },
                        { label: '浮球倒影的視線角', value: `${aImg.toFixed(1)}°：${tir ? '全反射，清楚' : `部分反射 R≈${Math.round(Rimg * 100)}%`}` }
                    ];
                }
                const s2 = p.n1 * Math.sin(rad(p.th1)) / p.n2;
                const tir = s2 > 1;
                const canTir = p.n1 > p.n2;
                const R = fresnelR(p.n1, p.n2, Math.cos(rad(p.th1)));
                return [
                    { label: '折射角 θ₂', value: tir ? '不存在（全反射）' : `${deg(Math.asin(s2)).toFixed(1)}°` },
                    { label: '臨界角 θ_c', value: canTir ? `${deg(Math.asin(p.n2 / p.n1)).toFixed(1)}°` : '不存在（疏→密）' },
                    { label: '反射率 R ／ 透射 T', value: `${(R * 100).toFixed(R > 0.995 && !tir ? 1 : 0)}% ／ ${((1 - R) * 100).toFixed(0)}%` },
                    { label: '光速比 v₁ : v₂', value: `${(1 / p.n1).toFixed(2)} : ${(1 / p.n2).toFixed(2)}` },
                    { label: '目前狀態', value: tir ? '全反射' : p.th1 === 0 ? '垂直入射・不偏折' : (p.n1 > p.n2 ? '偏離法線' : (p.n1 < p.n2 ? '偏向法線' : '不偏折')) }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                if (p.mode === 'fan') return LABS.snell.drawFan(ctx, w, h, p, t);
                if (p.mode === 'window') return LABS.snell.drawWindow(ctx, w, h, p, t);
                return LABS.snell.drawRay(ctx, w, h, p);
            },

            /* 斯涅爾窗與水下光扇模式：讀數下方附真實影片與照片對照 */
            setup: (ctx) => bindRealMedia(ctx, 'snell', {
                window: {
                    title: '真實影像對照：斯涅爾窗與水面全反射',
                    desc: '按「套用到模擬」，把太陽仰角、水面波動與深度調成接近畫面的情況，再和上方的仰望影像比較。',
                    items: [
                        withApply(REAL_MEDIA.poolVideo, { scene: 'pool', eyeD: 1.0, ripple: 0.15, sun: 60, objX: 3.2 }),
                        withApply(REAL_MEDIA.poolPhoto, { scene: 'pool', eyeD: 0.8, ripple: 0.25, sun: 70 }),
                        ...SNELL_PHOTOS
                    ]
                },
                fan: {
                    title: '真實影像對照：水槽中的光扇',
                    desc: '影片中光源的位置與傾角會改變；按「套用到模擬」把模擬設成水中光源，再拖動深度比較。',
                    items: [withApply(REAL_MEDIA.fanVideo, { nw: '1.33', depth: 8 })]
                }
            }),
            /* ---------- 單一光線 ---------- */
            drawRay: (ctx, w, h, p) => {
                const iy = h * 0.5, cx = w * 0.5;
                ctx.fillStyle = `rgba(11,111,146,${0.04 + (p.n1 - 1) * 0.05})`; ctx.fillRect(0, 0, w, iy);
                ctx.fillStyle = `rgba(201,117,15,${0.04 + (p.n2 - 1) * 0.05})`; ctx.fillRect(0, iy, w, h - iy);
                ctx.strokeStyle = 'rgba(18,49,58,0.4)'; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(0, iy); ctx.lineTo(w, iy); ctx.stroke();
                label(ctx, `介質 1：n₁ = ${p.n1.toFixed(2)}${p.n1 > p.n2 ? '（光密）' : p.n1 < p.n2 ? '（光疏）' : ''}`, 12, 20, C.blue, 12);
                label(ctx, `介質 2：n₂ = ${p.n2.toFixed(2)}${p.n2 > p.n1 ? '（光密）' : p.n2 < p.n1 ? '（光疏）' : ''}`, 12, h - 12, C.orange, 12);

                dashed(ctx, cx, 10, cx, h - 10, 'rgba(18,49,58,0.35)');
                label(ctx, '法線', cx + 6, 34, C.muted, 10);

                const th1 = rad(p.th1);
                const s2 = p.n1 * Math.sin(th1) / p.n2;
                const tir = s2 > 1;
                const R = Math.min(w * 0.42, h * 0.42);
                const Rf = fresnelR(p.n1, p.n2, Math.cos(th1));

                // 入射線
                arrow(ctx, cx - Math.sin(th1) * R, iy - Math.cos(th1) * R, cx, iy, C.blue, 2.6);
                label(ctx, '入射線', cx - Math.sin(th1) * R - 6, iy - Math.cos(th1) * R - 6, C.blue, 11);

                // 反射線：粗細與透明度隨反射率 R
                ctx.globalAlpha = 0.25 + 0.75 * Rf;
                arrow(ctx, cx, iy, cx + Math.sin(th1) * R, iy - Math.cos(th1) * R, C.rose, 0.8 + 2.4 * Rf);
                ctx.globalAlpha = 1;
                labelFit(ctx, tir ? '全反射（R = 100%）' : `反射線 R = ${Math.round(Rf * 100)}%`,
                    cx + Math.sin(th1) * R * 0.55 + 4, iy - Math.cos(th1) * R * 0.55 - 8, C.rose, 11, 'left', { clampW: w });

                if (!tir) {
                    const th2 = Math.asin(Math.min(1, s2));
                    ctx.globalAlpha = 0.3 + 0.7 * (1 - Rf);
                    arrow(ctx, cx, iy, cx + Math.sin(th2) * R, iy + Math.cos(th2) * R, C.orange, 0.8 + 2.4 * (1 - Rf));
                    ctx.globalAlpha = 1;
                    labelFit(ctx, `折射線 T = ${Math.round((1 - Rf) * 100)}%`, cx + Math.sin(th2) * R * 0.7 + 6, iy + Math.cos(th2) * R * 0.7 + 18,
                        C.orange, 11, 'left', { clampW: w, plate: 1 });
                    ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(cx, iy, 46, Math.PI / 2 - th2, Math.PI / 2); ctx.stroke();
                    label(ctx, `θ₂ = ${deg(th2).toFixed(1)}°`, cx + 10, iy + 62, C.orange, 11);
                }

                ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(cx, iy, 46, -Math.PI / 2 - th1, -Math.PI / 2); ctx.stroke();
                labelFit(ctx, `θ₁ = ${p.th1}°`, cx - 54, iy - 30, C.blue, 11, 'right', { clampW: w });

                // 臨界角參考線
                if (p.n1 > p.n2) {
                    const thc = Math.asin(p.n2 / p.n1);
                    dashed(ctx, cx, iy, cx - Math.sin(thc) * R, iy - Math.cos(thc) * R, 'rgba(107,70,193,0.7)');
                    // 與「入射線」標籤的外框相交時往下錯開，避免兩個標籤疊在一起
                    ctx.font = '11px Outfit, "Noto Sans TC", sans-serif';
                    const ctext = `臨界角 ${deg(thc).toFixed(1)}°`;
                    const ix = cx - Math.sin(th1) * R - 6, iyL = iy - Math.cos(th1) * R - 6;
                    const iw = ctx.measureText('入射線').width, cw = ctx.measureText(ctext).width;
                    const cxr = cx - Math.sin(thc) * R - 4;
                    let cyL = iy - Math.cos(thc) * R + 16;
                    const hits = (y) => cxr > ix - 4 && cxr - cw < ix + iw + 4 && y > iyL - 14 && y - 14 < iyL;
                    for (let k = 0; k < 6 && hits(cyL); k++) cyL += 16;
                    labelFit(ctx, ctext, cxr, cyL, C.violet, 11, 'right', { clampW: w, plate: 1 });
                }

                // 左下角：反射率 R 對入射角的曲線
                const gw = Math.min(190, Math.max(120, cx - 70)), gx0 = 34;
                const gTop = iy + 34, gBot = h - 40, gh = gBot - gTop;
                if (gh > 50) {
                    ctx.fillStyle = 'rgba(255,255,255,0.78)';
                    ctx.fillRect(gx0 - 26, gTop - 22, gw + 34, gh + 40);
                    labelFit(ctx, '反射率 R 與入射角', gx0 - 20, gTop - 8, C.ink, 11, 'left', { maxW: gw + 24 });
                    ctx.strokeStyle = 'rgba(18,49,58,0.35)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(gx0, gTop); ctx.lineTo(gx0, gBot); ctx.lineTo(gx0 + gw, gBot); ctx.stroke();
                    label(ctx, '100%', gx0 - 3, gTop + 4, C.muted, 9, 'right');
                    label(ctx, '0', gx0 - 3, gBot + 3, C.muted, 9, 'right');
                    label(ctx, '90°', gx0 + gw, gBot + 12, C.muted, 9, 'right');
                    ctx.strokeStyle = C.rose; ctx.lineWidth = 1.8; ctx.beginPath();
                    for (let i = 0; i <= 120; i++) {
                        const a = i / 120 * 90;
                        const y = gBot - fresnelR(p.n1, p.n2, Math.cos(rad(a))) * gh;
                        const x = gx0 + a / 90 * gw;
                        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                    if (p.n1 > p.n2) {
                        const xc = gx0 + deg(Math.asin(p.n2 / p.n1)) / 90 * gw;
                        dashed(ctx, xc, gTop, xc, gBot, 'rgba(107,70,193,0.7)');
                        labelFit(ctx, 'θc', xc, gBot + 12, C.violet, 9, 'center', { clampW: w });
                    }
                    const xp = gx0 + p.th1 / 90 * gw, yp = gBot - Rf * gh;
                    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(xp, yp, 3.6, 0, Math.PI * 2); ctx.fill();
                }
            },

            /* ---------- 水下光扇 ---------- */
            drawFan: (ctx, w, h, p, t) => {
                const n = Number(p.nw), thc = Math.asin(1 / n);
                const ys = Math.round(h * 0.40);
                const wallL = 14, wallR = w - 14, yb = h - 40;
                const s = (yb - ys - 16) / 32;                 // px / cm
                const sxp = w / 2, syp = ys + p.depth * s;
                // 暗室背景與水槽
                ctx.fillStyle = '#0b161c'; ctx.fillRect(0, 0, w, h);
                const wg = ctx.createLinearGradient(0, ys, 0, yb);
                wg.addColorStop(0, '#173a46'); wg.addColorStop(1, '#0f2a33');
                ctx.fillStyle = wg; ctx.fillRect(wallL, ys, wallR - wallL, yb - ys);
                ctx.strokeStyle = 'rgba(190,225,235,0.45)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(wallL, ys - 30); ctx.lineTo(wallL, yb); ctx.lineTo(wallR, yb); ctx.lineTo(wallR, ys - 30); ctx.stroke();
                ctx.strokeStyle = 'rgba(160,220,240,0.8)'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(wallL, ys); ctx.lineTo(wallR, ys); ctx.stroke();

                // 一條光線的路徑：水中段（含全反射後）與空氣段
                const trace = (phi) => {
                    const pts = [[sxp, syp]];
                    const dx = Math.sin(phi), dy = -Math.cos(phi);
                    let tw = (syp - ys) / -dy;
                    let hx = sxp + dx * tw;
                    if (hx < wallL || hx > wallR) {
                        const tl = ((dx < 0 ? wallL : wallR) - sxp) / dx;
                        pts.push([sxp + dx * tl, syp + dy * tl]);
                        return { water: pts, air: null, refl: null, tir: Math.abs(phi) > thc, hit: false };
                    }
                    pts.push([hx, ys]);
                    const R = fresnelR(n, 1, Math.cos(phi));
                    // 反射後向下，打到槽壁或槽底為止
                    const rdx = dx, rdy = -dy;
                    const tB = (yb - ys) / rdy, tS = ((rdx < 0 ? wallL : wallR) - hx) / (rdx || 1e-9);
                    const tr = Math.min(tB, tS > 0 ? tS : Infinity);
                    const refl = [[hx, ys], [hx + rdx * tr, ys + rdy * tr]];
                    if (R >= 1) return { water: pts, air: null, refl, R, tir: true, hit: true };
                    const b = Math.asin(n * Math.sin(phi));
                    const adx = Math.sin(b), ady = -Math.cos(b);
                    const tT = ys / -ady, tA = ((adx < 0 ? 0 : w) - hx) / (adx || 1e-9);
                    const ta = Math.min(tT, tA > 0 ? tA : Infinity);
                    return { water: pts, air: [[hx, ys], [hx + adx * ta, ys + ady * ta]], refl, R, tir: false, hit: true };
                };
                const beam = (a, b, color, alpha) => {
                    ctx.strokeStyle = color;
                    ctx.globalAlpha = alpha * 0.28; ctx.lineWidth = 5;
                    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
                    ctx.globalAlpha = alpha; ctx.lineWidth = 1.6;
                    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
                    ctx.globalAlpha = 1;
                };
                // 光脈衝：水中速度 c/n，空氣中速度 c（點的間距反映光速差）
                const pulses = (segs, color, alpha) => {
                    const V = 130, period = 1.1;
                    let tau0 = 0;
                    ctx.fillStyle = color; ctx.globalAlpha = alpha;
                    for (const sg of segs) {
                        const [a, b, nn] = sg;
                        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
                        const dur = len * nn / V;
                        const first = Math.ceil((tau0 - t) / period);
                        for (let m = first; ; m++) {
                            const tau = t + m * period - tau0;
                            if (tau > dur) break;
                            if (tau < 0) continue;
                            const f = tau / dur;
                            ctx.beginPath(); ctx.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 2.2, 0, Math.PI * 2); ctx.fill();
                        }
                        tau0 += dur;
                    }
                    ctx.globalAlpha = 1;
                };

                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                let idx = 0;
                for (let a = -SNELL_FAN_MAX; a <= SNELL_FAN_MAX; a += SNELL_FAN_STEP, idx++) {
                    const phi = rad(a);
                    const col = SNELL_FAN_COLORS[idx % SNELL_FAN_COLORS.length];
                    const tr = trace(phi);
                    beam(tr.water[0], tr.water[1], col, 0.95);
                    const segs = [[tr.water[0], tr.water[1], n]];
                    if (tr.hit) {
                        const R = tr.R;
                        if (tr.air) {
                            beam(tr.air[0], tr.air[1], col, Math.max(0.12, 1 - R));
                            if (R > 0.02) beam(tr.refl[0], tr.refl[1], col, Math.min(1, R * 1.4));
                            segs.push([tr.air[0], tr.air[1], 1]);
                        } else {
                            beam(tr.refl[0], tr.refl[1], col, 0.95);
                            segs.push([tr.refl[0], tr.refl[1], n]);
                        }
                    }
                    pulses(segs, '#ffffff', 0.8);
                }
                ctx.restore();

                // 光源（燈與燈罩）
                ctx.fillStyle = '#05090b';
                ctx.beginPath(); ctx.arc(sxp, syp + 3, 13, 0, Math.PI); ctx.fill();
                const lg = ctx.createRadialGradient(sxp, syp, 0, sxp, syp, 10);
                lg.addColorStop(0, '#fffbe6'); lg.addColorStop(1, 'rgba(255,240,180,0)');
                ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(sxp, syp, 10, 0, Math.PI * 2); ctx.fill();

                // 臨界角圓錐與出光範圍
                const r = p.depth * Math.tan(thc) * s;
                ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(sxp - r, ys); ctx.lineTo(sxp, syp); ctx.lineTo(sxp + r, ys); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(sxp, syp); ctx.lineTo(sxp, ys); ctx.stroke();
                ctx.restore();
                const xl = Math.max(wallL, sxp - r), xr = Math.min(wallR, sxp + r);
                ctx.strokeStyle = '#fff6b0'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(xl, ys); ctx.lineTo(xr, ys); ctx.stroke();
                ctx.strokeStyle = 'rgba(255,90,110,0.85)';
                if (xl > wallL) { ctx.beginPath(); ctx.moveTo(wallL, ys); ctx.lineTo(xl, ys); ctx.stroke(); }
                if (xr < wallR) { ctx.beginPath(); ctx.moveTo(xr, ys); ctx.lineTo(wallR, ys); ctx.stroke(); }

                const plate = 'rgba(8,18,24,0.82)';
                labelFit(ctx, `空氣 n = 1.00`, wallL + 6, 18, '#cfe9f2', 11, 'left', { clampW: w, plate });
                labelFit(ctx, `${snellMediumName(n)} n = ${n.toFixed(2)}`, wallL + 6, yb - 8, '#cfe9f2', 11, 'left', { clampW: w, plate });
                labelFit(ctx, `出光範圍 2r（θ < θc）`, sxp, ys - 8, '#fff6b0', 11, 'center', { clampW: w, plate });
                if (xr < wallR - 60) labelFit(ctx, '全反射', (xr + wallR) / 2, ys - 8, '#ff9aa8', 11, 'center', { clampW: w, plate });
                labelFit(ctx, `h = ${p.depth} cm`, sxp - 20, syp + 4, '#ffffff', 10, 'right', { clampW: w, plate });
                labelFit(ctx, `θc = ${deg(thc).toFixed(1)}°`, sxp + 20, syp + 4, '#ffffff', 10, 'left', { clampW: w, plate });
                labelWrap(ctx, '顏色只用來分辨方向　白點是光脈衝：水中較密、空氣中較疏（光速 c/n）',
                    wallL, h - 22, 'rgba(207,233,242,0.85)', 10, 13, w - 2 * wallL);
            },

            /* ---------- 斯涅爾窗 ---------- */
            drawWindow: (ctx, w, h, p, t) => {
                const n = Number(p.nw), thc = Math.asin(1 / n);
                const L = snellWindowLayout(w, h);
                const sec = L.sec, V = L.view;
                const d = p.eyeD, r = d * Math.tan(thc);
                const ocean = p.scene === 'ocean';
                const bx = p.objX, bz = SNELL_BALL.z, br = SNELL_BALL.r;

                /* 側視圖 —— 等比例尺：水平 x（m）、垂直深度 z（m） */
                const xmin = -Math.max(r * 1.18 + 0.3, 1.7), xmax = Math.max(r * 1.18 + 0.3, bx + br + 0.4);
                const skyH = Math.round(sec.h * 0.30);
                const s = Math.min(sec.w / (xmax - xmin), (sec.h - skyH - 10) / SNELL_POOL_H);
                const X = (x) => sec.x + (x - xmin) * s + (sec.w - (xmax - xmin) * s) / 2;
                const ys = sec.y + skyH;
                const Z = (z) => ys - z * s;                     // z 向上為正，水面 z = 0
                const yFloor = Z(-SNELL_POOL_H);
                ctx.save();
                ctx.beginPath(); ctx.rect(sec.x, sec.y, sec.w, sec.h); ctx.clip();
                const skyG = ctx.createLinearGradient(0, sec.y, 0, ys);
                skyG.addColorStop(0, '#d7ecf7'); skyG.addColorStop(1, '#f4fafc');
                ctx.fillStyle = skyG; ctx.fillRect(sec.x, sec.y, sec.w, skyH);
                const wG = ctx.createLinearGradient(0, ys, 0, sec.y + sec.h);
                wG.addColorStop(0, ocean ? '#2b6e8f' : '#7cc9d4'); wG.addColorStop(1, ocean ? '#071d2e' : '#4fa9b8');
                ctx.fillStyle = wG; ctx.fillRect(sec.x, ys, sec.w, sec.h - skyH);
                if (!ocean) {
                    ctx.fillStyle = '#e9f6f6'; ctx.fillRect(sec.x, yFloor, sec.w, sec.y + sec.h - yFloor);
                    ctx.strokeStyle = 'rgba(18,49,58,0.35)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(sec.x, yFloor); ctx.lineTo(sec.x + sec.w, yFloor); ctx.stroke();
                }
                ctx.strokeStyle = 'rgba(18,49,58,0.55)'; ctx.lineWidth = 1.4;
                ctx.beginPath(); ctx.moveTo(sec.x, ys); ctx.lineTo(sec.x + sec.w, ys); ctx.stroke();

                const ex = X(0), ey = Z(-d);
                // 看得到天空的圓錐（斯涅爾窗）
                ctx.fillStyle = 'rgba(255,236,150,0.32)';
                ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(X(-r), ys); ctx.lineTo(X(r), ys); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = 'rgba(107,70,193,0.85)'; ctx.lineWidth = 1.3;
                // 窗緣的極限光路：空氣側沿水面（與法線成 90°），水中與法線成 θc。
                [[sec.x, X(-r)], [sec.x + sec.w, X(r)]].forEach(([edgeX, hx]) => {
                    ctx.beginPath();
                    ctx.moveTo(edgeX, ys);
                    ctx.lineTo(hx, ys); ctx.lineTo(ex, ey); ctx.stroke();
                });
                dashed(ctx, ex, ey, ex, ys, 'rgba(18,49,58,0.5)');
                // 窗的寬度標尺
                ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(X(-r), ys); ctx.lineTo(X(r), ys); ctx.stroke();

                // 陽光：從 −x 方向的天空照下，在水面折射後進入眼睛
                const e = rad(p.sun);
                const aSun = Math.asin(Math.cos(e) / n);
                const hxSun = X(-d * Math.tan(aSun));
                const dirx = Math.cos(e), diry = Math.sin(e);   // 光前進方向（向右下）
                let tBack = (ys - sec.y) / diry;
                if (dirx > 1e-6) tBack = Math.min(tBack, (hxSun - sec.x) / dirx);
                const sunX0 = hxSun - dirx * tBack, sunY0 = ys - diry * tBack;
                ctx.strokeStyle = '#e0a400'; ctx.lineWidth = 2.4;
                ctx.beginPath(); ctx.moveTo(sunX0, sunY0); ctx.lineTo(hxSun, ys); ctx.stroke();
                arrow(ctx, hxSun, ys, ex + (hxSun - ex) * 0.25, ey + (ys - ey) * 0.25, '#e0a400', 2.4);
                ctx.fillStyle = '#ffc928';
                ctx.beginPath(); ctx.arc(sunX0 + dirx * 8, sunY0 + diry * 8, 6, 0, Math.PI * 2); ctx.fill();

                // 浮球與它在水面的倒影（虛像位於水面上方對稱處）
                const bX = X(bx), bY = Z(-bz), bR = br * s;
                const xm = bx * d / (d + bz);                 // 反射點
                const aImg = Math.atan(bx / (d + bz));
                const tir = aImg > thc;
                const Rimg = fresnelR(n, 1, Math.cos(aImg));
                ctx.save();
                if (!tir) ctx.setLineDash([4, 4]);
                ctx.strokeStyle = C.rose; ctx.globalAlpha = 0.35 + 0.65 * Rimg; ctx.lineWidth = 1.8;
                ctx.beginPath(); ctx.moveTo(bX, bY); ctx.lineTo(X(xm), ys); ctx.lineTo(ex, ey); ctx.stroke();
                ctx.restore();
                arrow(ctx, X(xm) + (ex - X(xm)) * 0.55, ys + (ey - ys) * 0.55, X(xm) + (ex - X(xm)) * 0.62, ys + (ey - ys) * 0.62, C.rose, 1.8);
                dashed(ctx, X(xm), ys, bX, Z(bz), 'rgba(194,38,74,0.45)');
                ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(194,38,74,0.6)'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(bX, Z(bz), bR, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
                ctx.fillStyle = '#e8463a'; ctx.beginPath(); ctx.arc(bX, bY, bR, 0, Math.PI * 2); ctx.fill();

                // 眼睛
                ctx.fillStyle = '#ffffff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
                ctx.beginPath(); ctx.ellipse(ex, ey, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex, ey - 1.5, 3, 0, Math.PI * 2); ctx.fill();
                ctx.restore();

                // 側視圖文字
                const lp = 'rgba(255,255,255,0.84)';
                labelFit(ctx, `${snellMediumName(n)} n=${n.toFixed(2)}（上方空氣）`, sec.x + 6, Math.min(yFloor, sec.y + sec.h) - 7, C.blue, 11, 'left', { clampW: w, plate: lp, maxW: sec.w * 0.55 });
                labelFit(ctx, '陽光', sunX0 + dirx * 8 + 9, Math.max(sec.y + 13, sunY0 + diry * 8 - 4), '#9a6c00', 11, 'left', { clampW: w, plate: lp });
                labelFit(ctx, `2r`, ex, ys - 7, '#8a6400', 11, 'center', { clampW: w, plate: lp });
                labelFit(ctx, 'd', ex + 5, (ys + ey) / 2 + 4, C.ink, 11, 'left', { clampW: w });
                labelFit(ctx, `θc`, ex - 6, ey - 16, C.violet, 11, 'right', { clampW: w });
                const imgRight = bX + bR + 36 < sec.x + sec.w;
                labelFit(ctx, '倒影', imgRight ? bX + bR + 4 : bX - bR - 4, Z(bz) + 4, C.rose, 11, imgRight ? 'left' : 'right', { clampW: w, plate: lp });

                /* 仰望影像 */
                const N = Math.max(120, Math.min(300, Math.round(V.s * Math.min(2, window.devicePixelRatio || 1) * 0.8)));
                const img = snellViewImage(N, p, t);
                const off = getOffscreen(N, N);
                off.ctx.putImageData(img, 0, 0);
                const vcx = V.x + V.s / 2, vcy = V.y + V.s / 2, vR = V.s / 2;
                ctx.fillStyle = '#060a0e'; ctx.fillRect(V.x, V.y, V.s, V.s);
                ctx.save();
                ctx.beginPath(); ctx.arc(vcx, vcy, vR - 0.5, 0, Math.PI * 2); ctx.clip();
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(off.canvas, 0, 0, N, N, V.x, V.y, V.s, V.s);
                // 相機對著太陽時的過曝光暈（照片中的亮團與光芒）：畫在太陽影像的位置
                const aS = deg(Math.asin(Math.cos(rad(p.sun)) / n));
                const sx0 = vcx - aS / SNELL_FOV * vR, bloomR = V.s * (0.07 + 0.05 * Math.max(0, (20 - p.sun) / 20));
                const warmB = Math.max(0, Math.min(1, (16 - p.sun) / 12));
                const bg = ctx.createRadialGradient(sx0, vcy, 0, sx0, vcy, bloomR);
                bg.addColorStop(0, `rgba(255,${Math.round(250 - 60 * warmB)},${Math.round(225 - 130 * warmB)},0.95)`);
                bg.addColorStop(0.35, `rgba(255,${Math.round(230 - 70 * warmB)},${Math.round(170 - 100 * warmB)},0.45)`);
                bg.addColorStop(1, 'rgba(255,220,150,0)');
                ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(sx0, vcy, bloomR, 0, Math.PI * 2); ctx.fill();
                const rW = deg(thc) / SNELL_FOV * vR;
                ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(vcx, vcy, rW, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
                const vp = 'rgba(6,14,20,0.72)';
                labelFit(ctx, `仰望影像（魚眼 ${2 * SNELL_FOV}°）`, V.x + 4, V.y + 14, '#e9f5f8', 10, 'left', { clampW: w, plate: vp, maxW: V.s * 0.6 });
                labelFit(ctx, `窗緣＝地平線（${deg(thc).toFixed(1)}°）`, vcx, vcy - rW - 6, '#ffffff', 10, 'center', { clampW: w, plate: vp, maxW: V.s - 20 });
                labelFit(ctx, ocean ? '窗外：全反射映出幽暗深水' : '窗外：全反射映出池底與浮球',
                    vcx, Math.min(V.y + V.s - 8, vcy + (rW + vR) / 2 + 4), '#ffffff', 10, 'center', { clampW: w, plate: vp, maxW: V.s - 20 });
            }
        };

