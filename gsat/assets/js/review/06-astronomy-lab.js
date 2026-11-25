// 天體運行與行星逆行互動實驗室
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 天體運行與行星逆行互動實驗室 (astronomy lab) =====
        function drawAstronomyLab(frameDtSeconds = 0) {
            const setup = prepLabCanvas('astronomy-canvas');
            if (!setup) return;
            const { ctx, w, h } = setup;
            
            if (window.physicsLab.astroTime === undefined) window.physicsLab.astroTime = 0;
            if (window.physicsLab.astroTrace === undefined) window.physicsLab.astroTrace = [];
            if (window.physicsLab.astroPaused === undefined) window.physicsLab.astroPaused = false;
            
            const mode = document.getElementById('astro-mode').value;
            const showSightline = document.getElementById('astro-show-sightline').checked;
            const showOrbits = document.getElementById('astro-show-orbits').checked;
            const showSky = document.getElementById('astro-show-sky').checked;
            const showTrace = document.getElementById('astro-show-trace').checked;
            
            // 圓軌道近似：兩個面板共用同一比例尺。1 AU = 58 px，火星軌道半徑 = 1.524 AU。
            // 地心圖的本輪半徑也是 1 AU，因此火星最遠可到 2.524 AU，仍完整落在星空環內。
            const AU_PX = 58;
            const EARTH_ORBIT_AU = 1;
            const MARS_ORBIT_AU = 1.524;
            const EARTH_PERIOD_Y = 1;
            const MARS_PERIOD_Y = 1.881;
            const R_E = AU_PX * EARTH_ORBIT_AU;
            const R_M = AU_PX * MARS_ORBIT_AU;
            const R_stars = 174;

            if (!window.physicsLab.astroPaused && frameDtSeconds > 0) {
                const speed = labNumber('astro-speed') !== undefined ? labNumber('astro-speed') : 1.0;
                // 1 秒動畫時間約代表 1 rad；以實際影格時間積分，避免螢幕更新率改變公轉速率。
                window.physicsLab.astroTime += Math.min(frameDtSeconds, 0.05) * speed;
            }

            const theta_E = window.physicsLab.astroTime;
            const omega_E = 1 / EARTH_PERIOD_Y;
            const omega_M = 1 / MARS_PERIOD_Y;
            const theta_M = (omega_M / omega_E) * window.physicsLab.astroTime;

            const x_E_rel = R_E * Math.cos(theta_E);
            const y_E_rel = R_E * Math.sin(theta_E);
            const x_M_rel = R_M * Math.cos(theta_M);
            const y_M_rel = R_M * Math.sin(theta_M);
            
            const dx = x_M_rel - x_E_rel;
            const dy = y_M_rel - y_E_rel;
            const phi = Math.atan2(dy, dx);
            
            const dist = Math.hypot(dx, dy);
            // 火星軌道傾角約 1.85°；天空投影的上下位移來自真實緯度角，而不是任意波形。
            const marsInclination = 1.85 * Math.PI / 180;
            const marsZ = R_M * Math.sin(marsInclination) * Math.sin(theta_M - 0.7);
            const betaAngle = Math.atan2(marsZ, dist);
            const beta = betaAngle * 420;
            
            if (!window.physicsLab.astroPaused && frameDtSeconds > 0) {
                window.physicsLab.astroTrace.push({ phi, beta });
                if (window.physicsLab.astroTrace.length > 500) {
                    window.physicsLab.astroTrace.shift();
                }
            }
            
            // dφ/dt = (r × v)/|r|²。直接由瞬時位置、速度判斷，不受影格率與暫停影響。
            const vx = -omega_M * R_M * Math.sin(theta_M) + omega_E * R_E * Math.sin(theta_E);
            const vy =  omega_M * R_M * Math.cos(theta_M) - omega_E * R_E * Math.cos(theta_E);
            const apparentAngularVelocity = (dx * vy - dy * vx) / Math.max(dist * dist, 1e-9);
            const isRetrograde = apparentAngularVelocity < 0;
            
            const earthEl = document.getElementById('astro-earth-angle');
            const marsEl = document.getElementById('astro-mars-angle');
            const relEl = document.getElementById('astro-relative-angle');
            if (earthEl) earthEl.textContent = `${((theta_E * 180 / Math.PI) % 360).toFixed(1)}°`;
            if (marsEl) marsEl.textContent = `${((theta_M * 180 / Math.PI) % 360).toFixed(1)}°`;
            if (relEl) {
                let diffAng = ((theta_E - theta_M) * 180 / Math.PI) % 360;
                if (diffAng < 0) diffAng += 360;
                relEl.textContent = `${diffAng.toFixed(1)}°`;
            }
            
            const stateEl = document.getElementById('astro-state-readout');
            if (stateEl) {
                if (isRetrograde) {
                    stateEl.textContent = '逆行 (Retrograde)';
                    stateEl.style.color = '#f87171';
                } else {
                    stateEl.textContent = '順行 (Prograde)';
                    stateEl.style.color = '#72b9b5';
                }
            }
            
            if (mode === 'both') {
                drawHeliocentric(ctx, 260, 205, R_E, R_M, R_stars, theta_E, theta_M, phi, showOrbits, showSightline, showSky, isRetrograde);
                drawGeocentric(ctx, 700, 205, R_E, R_M, R_stars, theta_E, theta_M, phi, showOrbits, showSightline, showSky, isRetrograde);
            } else if (mode === 'helio') {
                const singleScale = 1.16;
                drawHeliocentric(ctx, 480, 205, R_E * singleScale, R_M * singleScale, R_stars + 20, theta_E, theta_M, phi, showOrbits, showSightline, showSky, isRetrograde);
            } else if (mode === 'geo') {
                const singleScale = 1.16;
                drawGeocentric(ctx, 480, 205, R_E * singleScale, R_M * singleScale, R_stars + 20, theta_E, theta_M, phi, showOrbits, showSightline, showSky, isRetrograde);
            }
            
            drawSkyView(ctx, w, h, phi, beta, showSky, showTrace, isRetrograde);
        }

        function drawCircularVelocity(ctx, x, y, phase, color, length = 13) {
            const tx = -Math.sin(phase);
            const ty = Math.cos(phase);
            const x2 = x + tx * length;
            const y2 = y + ty * length;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            const heading = Math.atan2(ty, tx);
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - 5 * Math.cos(heading - 0.55), y2 - 5 * Math.sin(heading - 0.55));
            ctx.lineTo(x2 - 5 * Math.cos(heading + 0.55), y2 - 5 * Math.sin(heading + 0.55));
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function rayExitPointOnCircle(originX, originY, directionX, directionY, circleX, circleY, radius) {
            const directionLength = Math.hypot(directionX, directionY) || 1;
            const ux = directionX / directionLength;
            const uy = directionY / directionLength;
            const ox = originX - circleX;
            const oy = originY - circleY;
            const projection = ox * ux + oy * uy;
            const discriminant = Math.max(0, projection * projection - (ox * ox + oy * oy - radius * radius));
            const distance = -projection + Math.sqrt(discriminant);
            return { x: originX + distance * ux, y: originY + distance * uy };
        }

        function drawApparentPositionMarker(ctx, x, y) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            ctx.strokeStyle = '#fecaca';
            ctx.lineWidth = 1.6;
            ctx.strokeRect(-4, -4, 8, 8);
            ctx.restore();
            labText(ctx, '視位置', x + 8, y - 7, '#d5e2e3', 9, 'left');
        }

        function drawHeliocentric(ctx, cx, cy, R_E, R_M, R_stars, theta_E, theta_M, phi, showOrbits, showSightline, showSky, isRetrograde) {
            labText(ctx, '日心圓軌道模型', cx, 30, '#d5e2e3', 15, 'center');
            labText(ctx, '同一比例尺：地球 1.00 AU｜火星 1.524 AU', cx, 49, '#8eaab2', 10, 'center');
            
            ctx.strokeStyle = '#26444e';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx, cy, R_stars + 15, 0, Math.PI * 2); ctx.stroke();
            
            if (showSky) {
                drawStarRingBackground(ctx, cx, cy, R_stars);
            }
            
            if (showOrbits) {
                ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.arc(cx, cy, R_E, 0, Math.PI * 2); ctx.stroke();
                
                ctx.strokeStyle = 'rgba(248, 113, 113, 0.15)';
                ctx.beginPath(); ctx.arc(cx, cy, R_M, 0, Math.PI * 2); ctx.stroke();
                ctx.setLineDash([]);
            }
            
            const sunGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 10);
            sunGrad.addColorStop(0, '#fff');
            sunGrad.addColorStop(0.3, '#fbbf24');
            sunGrad.addColorStop(1, 'rgba(251,191,36,0)');
            ctx.fillStyle = sunGrad;
            ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
            
            const x_E = cx + R_E * Math.cos(theta_E);
            const y_E = cy + R_E * Math.sin(theta_E);
            const x_M = cx + R_M * Math.cos(theta_M);
            const y_M = cy + R_M * Math.sin(theta_M);
            
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath(); ctx.arc(x_E, y_E, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x_E, y_E, 7, 0, Math.PI * 2); ctx.stroke();
            labText(ctx, '地', x_E + 8, y_E + 4, '#60a5fa', 11, 'left');
            drawCircularVelocity(ctx, x_E, y_E, theta_E, 'rgba(96,165,250,.85)');
            
            ctx.fillStyle = '#f87171';
            ctx.beginPath(); ctx.arc(x_M, y_M, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
            ctx.beginPath(); ctx.arc(x_M, y_M, 6, 0, Math.PI * 2); ctx.stroke();
            labText(ctx, '火', x_M + 8, y_M + 4, '#f87171', 11, 'left');
            drawCircularVelocity(ctx, x_M, y_M, theta_M, 'rgba(248,113,113,.85)');
            
            // 從地球出發、穿過火星的射線，與示意星空環的遠端交點才是視位置。
            const projected = rayExitPointOnCircle(x_E, y_E, x_M - x_E, y_M - y_E, cx, cy, R_stars);
            const x_proj = projected.x;
            const y_proj = projected.y;
            
            if (showSightline) {
                ctx.strokeStyle = isRetrograde ? 'rgba(248,113,113,0.45)' : 'rgba(213,226,227,0.3)';
                ctx.lineWidth = 1.2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.moveTo(x_E, y_E); ctx.lineTo(x_proj, y_proj); ctx.stroke();
                ctx.setLineDash([]);
            }
            
            drawApparentPositionMarker(ctx, x_proj, y_proj);
        }

        function drawGeocentric(ctx, cx, cy, R_E, R_M, R_stars, theta_E, theta_M, phi, showOrbits, showSightline, showSky, isRetrograde) {
            labText(ctx, '地心等價分解（均輪＋本輪）', cx, 30, '#d5e2e3', 15, 'center');
            labText(ctx, '均輪 1.524 AU｜本輪 1.00 AU｜兩者皆等角速率', cx, 49, '#8eaab2', 10, 'center');
            
            ctx.strokeStyle = '#26444e';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx, cy, R_stars + 15, 0, Math.PI * 2); ctx.stroke();
            
            if (showSky) {
                drawStarRingBackground(ctx, cx, cy, R_stars);
            }
            
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.stroke();
            labText(ctx, '地', cx + 10, cy + 4, '#60a5fa', 11, 'left');
            
            const x_S = cx - R_E * Math.cos(theta_E);
            const y_S = cy - R_E * Math.sin(theta_E);
            
            if (showOrbits) {
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.arc(cx, cy, R_E, 0, Math.PI * 2); ctx.stroke();
            }
            
            const sunGrad = ctx.createRadialGradient(x_S, y_S, 2, x_S, y_S, 8);
            sunGrad.addColorStop(0, '#fff');
            sunGrad.addColorStop(0.3, '#fbbf24');
            sunGrad.addColorStop(1, 'rgba(251,191,36,0)');
            ctx.fillStyle = sunGrad;
            ctx.beginPath(); ctx.arc(x_S, y_S, 10, 0, Math.PI * 2); ctx.fill();
            labText(ctx, '日', x_S + 10, y_S + 4, '#fbbf24', 11, 'left');
            drawCircularVelocity(ctx, x_S, y_S, theta_E + Math.PI, 'rgba(251,191,36,.85)');
            
            if (showOrbits) {
                ctx.strokeStyle = 'rgba(132, 169, 176, 0.12)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.arc(cx, cy, R_M, 0, Math.PI * 2); ctx.stroke();
            }
            
            const x_c = cx + R_M * Math.cos(theta_M);
            const y_c = cy + R_M * Math.sin(theta_M);
            
            if (showOrbits) {
                ctx.fillStyle = 'rgba(132, 169, 176, 0.4)';
                ctx.beginPath(); ctx.arc(x_c, y_c, 2.5, 0, Math.PI * 2); ctx.fill();
                labText(ctx, 'C', x_c + 7, y_c - 7, '#8eaab2', 9, 'left');
                drawCircularVelocity(ctx, x_c, y_c, theta_M, 'rgba(132,169,176,.75)', 11);
                
                ctx.strokeStyle = 'rgba(213, 226, 227, 0.15)';
                ctx.setLineDash([2, 2]);
                ctx.beginPath(); ctx.arc(x_c, y_c, R_E, 0, Math.PI * 2); ctx.stroke();
                ctx.setLineDash([]);
            }
            
            const x_M_geo = x_c - R_E * Math.cos(theta_E);
            const y_M_geo = y_c - R_E * Math.sin(theta_E);
            
            if (showOrbits) {
                ctx.strokeStyle = 'rgba(213, 226, 227, 0.25)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x_c, y_c); ctx.lineTo(x_M_geo, y_M_geo); ctx.stroke();
            }
            
            ctx.fillStyle = '#f87171';
            ctx.beginPath(); ctx.arc(x_M_geo, y_M_geo, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x_M_geo, y_M_geo, 6, 0, Math.PI * 2); ctx.stroke();
            labText(ctx, '火', x_M_geo + 8, y_M_geo + 4, '#f87171', 11, 'left');
            drawCircularVelocity(ctx, x_M_geo, y_M_geo, theta_E + Math.PI, 'rgba(248,113,113,.85)');
            
            const x_proj = cx + R_stars * Math.cos(phi);
            const y_proj = cy + R_stars * Math.sin(phi);
            
            if (showSightline) {
                ctx.strokeStyle = isRetrograde ? 'rgba(248,113,113,0.45)' : 'rgba(213,226,227,0.3)';
                ctx.lineWidth = 1.2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x_proj, y_proj); ctx.stroke();
                ctx.setLineDash([]);
            }
            
            drawApparentPositionMarker(ctx, x_proj, y_proj);
        }

        function drawStarRingBackground(ctx, cx, cy, R_stars) {
            ctx.strokeStyle = 'rgba(145, 167, 173, 0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx, cy, R_stars, 0, Math.PI * 2); ctx.stroke();
            
            const constellations = [
                { name: '牡羊座', angle: 0 },
                { name: '雙子座', angle: Math.PI / 4 },
                { name: '獅子座', angle: Math.PI / 2 },
                { name: '處女座', angle: 3 * Math.PI / 4 },
                { name: '天秤座', angle: Math.PI },
                { name: '天蠍座', angle: -3 * Math.PI / 4 },
                { name: '摩羯座', angle: -Math.PI / 2 },
                { name: '雙魚座', angle: -Math.PI / 4 }
            ];
            
            constellations.forEach(c => {
                const x_s = cx + R_stars * Math.cos(c.angle);
                const y_s = cy + R_stars * Math.sin(c.angle);
                
                ctx.fillStyle = 'rgba(213, 226, 227, 0.6)';
                ctx.beginPath(); ctx.arc(x_s, y_s, 2, 0, Math.PI * 2); ctx.fill();
                
                const x_t = cx + (R_stars + 16) * Math.cos(c.angle);
                const y_t = cy + (R_stars + 16) * Math.sin(c.angle) + 4;
                labText(ctx, c.name, x_t, y_t, 'rgba(145, 167, 173, 0.55)', 10, 'center');
            });
        }

        function drawSkyView(ctx, w, h, phi, beta, showSky, showTrace, isRetrograde) {
            const X_left = 120;
            const W_sky = 720;
            const Y_top = 440;
            const Y_mid = 480;
            const H_sky = 80;
            
            ctx.fillStyle = '#0d2630';
            ctx.fillRect(X_left, Y_top, W_sky, H_sky);
            
            ctx.strokeStyle = '#26444e';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(X_left, Y_top, W_sky, H_sky);
            
            ctx.strokeStyle = 'rgba(145, 167, 173, 0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(X_left, Y_mid); ctx.lineTo(X_left + W_sky, Y_mid); ctx.stroke();
            
            labText(ctx, '地球觀測天空 (觀測投影)', X_left - 15, Y_mid + 5, '#9fb7c0', 12, 'right');
            labText(ctx, '恆星背景', X_left + 10, Y_top + 18, 'rgba(145, 167, 173, 0.35)', 10, 'left');
            
            const constellations = [
                { name: '天秤座', angle: -Math.PI },
                { name: '天蠍座', angle: -3 * Math.PI / 4 },
                { name: '摩羯座', angle: -Math.PI / 2 },
                { name: '雙魚座', angle: -Math.PI / 4 },
                { name: '牡羊座', angle: 0 },
                { name: '雙子座', angle: Math.PI / 4 },
                { name: '獅子座', angle: Math.PI / 2 },
                { name: '處女座', angle: 3 * Math.PI / 4 },
                { name: '天秤座', angle: Math.PI }
            ];
            
            if (showSky) {
                constellations.forEach(c => {
                    const x = X_left + ((c.angle + Math.PI) / (2 * Math.PI)) * W_sky;
                    
                    ctx.strokeStyle = 'rgba(145, 167, 173, 0.05)';
                    ctx.beginPath(); ctx.moveTo(x, Y_top); ctx.lineTo(x, Y_top + H_sky); ctx.stroke();
                    
                    labText(ctx, c.name, x, Y_top + H_sky - 8, 'rgba(145, 167, 173, 0.35)', 9, 'center');
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.beginPath(); ctx.arc(x - 20, Y_mid - 15, 1, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(x + 20, Y_mid + 10, 1.2, 0, Math.PI * 2); ctx.fill();
                });
            }
            
            if (showTrace && window.physicsLab.astroTrace && window.physicsLab.astroTrace.length > 1) {
                ctx.strokeStyle = 'rgba(248, 113, 113, 0.7)';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                let first = true;
                let lastX = 0;
                for (let i = 0; i < window.physicsLab.astroTrace.length; i++) {
                    const pt = window.physicsLab.astroTrace[i];
                    const x = X_left + ((pt.phi + Math.PI) / (2 * Math.PI)) * W_sky;
                    const y = Y_mid - pt.beta;
                    
                    if (first) {
                        ctx.moveTo(x, y);
                        first = false;
                    } else {
                        if (Math.abs(x - lastX) > W_sky * 0.8) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    lastX = x;
                }
                ctx.stroke();
            }
            
            const m_x = X_left + ((phi + Math.PI) / (2 * Math.PI)) * W_sky;
            const m_y = Y_mid - beta;
            
            ctx.strokeStyle = isRetrograde ? 'rgba(248, 113, 113, 0.25)' : 'rgba(114, 185, 181, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath(); ctx.moveTo(m_x, Y_top); ctx.lineTo(m_x, Y_top + H_sky); ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#f87171';
            ctx.beginPath(); ctx.arc(m_x, m_y, 4.5, 0, Math.PI * 2); ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(m_x, m_y, 6.5, 0, Math.PI * 2); ctx.stroke();
            
            labText(ctx, '火星 (Mars)', m_x, m_y - 10, '#f87171', 10, 'center');
        }

        function updateAstroReadouts() {
            if (!window.physicsLab || !document.getElementById('astro-speed')) return;
            const speed = labNumber('astro-speed');
            document.getElementById('astro-speed-out').textContent = `${speed.toFixed(1)}×`;
            
            const mode = document.getElementById('astro-mode').value;
            const explains = {
                both: `圓軌道近似下，兩圖使用完全相同的尺度與時間：地球軌道半徑 1.00 AU、火星 1.524 AU；地球週期 1.000 年、火星 1.881 年。右圖只是把左圖轉成以地球為原點的幾何分解，所以天空中的火星投影相同；這是幾何觀測等價，不代表兩種模型具有相同的動力學解釋。`,
                helio: `日心圓軌道模型：地球與火星各自在固定半徑的圓上做等角速率圓周運動，角速率分別為 ω<sub>E</sub>=2π/1.000 年、ω<sub>M</sub>=2π/1.881 年。地球位於內軌道且角速率較大，追越火星時會看到火星相對背景星空短暫逆行。`,
                geo: `地心等價分解：火星的位置由兩個均速圓周運動相加。均輪中心 C 以半徑 1.524 AU、角速率 ω<sub>M</sub> 繞地球；火星再以半徑 1.00 AU、角速率 ω<sub>E</sub> 繞 C。火星的合成軌跡不必是圓，但組成它的均輪與本輪都各自是等角速率圓周運動。`
            };
            document.getElementById('astro-explain').innerHTML = explains[mode];
            
            drawAstronomyLab();
        }

        function toggleAstroPause() {
            if (!window.physicsLab) return;
            window.physicsLab.astroPaused = !window.physicsLab.astroPaused;
            const btn = document.getElementById('astro-pause-btn');
            if (!btn) return;
            btn.textContent = window.physicsLab.astroPaused ? '▶ 繼續動畫' : '⏸ 暫停動畫';
            btn.classList.toggle('active', window.physicsLab.astroPaused);
            drawAstronomyLab();
        }

        function resetAstroTrace() {
            if (!window.physicsLab) return;
            window.physicsLab.astroTrace = [];
            drawAstronomyLab();
        }

        function keplerSectionHtml() {
            return `
                <div class="handout-section-title" style="margin-top: 1.5rem;">💡 核心觀念解析：天體模型的演進與克卜勒定律的物理本質</div>
                <p class="content-subtitle">在物理學的發展史上，克卜勒定律是由古典幾何宇宙觀邁向近代動力學（萬有引力）的關鍵橋樑。理解其內涵需從模型的演進與觀測數據出發：</p>
                
                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">1. 地心說 vs. 日心說模型的本質對決</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        歷史上，如何解釋觀測到的<b>「行星逆行現象」</b>（行星在背景星空中短暫向後移動）是天體模型最重要的試金石：
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li><b>托勒密的地心說 (Geocentric Model)</b>：以地球為宇宙中心。為了在「圓周運動」的執念下解釋逆行，必須假設行星在小圓（<b>本輪</b>）上旋轉，而本輪中心又在大圓（<b>均輪</b>）上繞地旋轉。此外，為了配合觀測，所有行星本輪的旋轉週期與方向都必須與太陽的位置進行「人為強制同步」，使得系統極其複雜且缺乏物理機制。</li>
                        <li><b>哥白尼的日心說 (Heliocentric Model)</b>：將太陽置於中心，行星繞日公轉。逆行現象迎刃而解——它只不過是<b>「軌道追越的幾何投影」</b>。地球位於內軌道，公轉速率較快，當它追上並超越外軌道的火星時，由地球看火星的視角線便會向後退。這就如同在高速公路上超車時，鄰車看起來在往後退一般，本質極為簡單優雅。</li>
                    </ul>
                </div>

                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">2. 克卜勒定律的發現與三大定律內涵</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        克卜勒利用導師第谷長達數十年的高精度觀測數據，拋棄了古希臘「完美圓周」的束縛，歸納出行星運動三大定律：
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li><b>第一定律（橢圓軌道定律）</b>：所有行星繞太陽公轉的軌道都是橢圓，太陽位於橢圓的其中一個焦點上。此定律打破了均輪與本輪的繁瑣幾何設定。</li>
                        <li><b>第二定律（等面積定律）</b>：行星與太陽的連線，在相同的時間內掃過的面積相等。這意味著行星在軌道上各點的速率是變化的：<b>近日點距離小、速率最快；遠日點距離大、速率最慢</b>。從能量觀點看，近日點重力勢能最低、動能最高；遠日點則相反，本質為力學能守恆。</li>
                        <li><b>第三定律（週期定律）</b>：行星公轉週期 $T$ 的平方與軌道半長軸 $R$ 的三次方成正比，即 $\\frac{T^2}{R^3} = K$（常數）。此常數 $K$ 僅由<b>中心天體的質量</b>決定，繞同一中心天體運行的所有行星，其 $K$ 值均相同。</li>
                    </ul>
                </div>

                <div class="handout-section-title">🔍 觀念深度剖析：地心說 vs. 日心說 ＆ 太陽系公轉特徵對照</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 20%">比較項目</th>
                                <th style="width: 40%">托勒密地心說模型</th>
                                <th style="width: 40%">哥白尼日心說模型</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>宇宙中心</b></td>
                                <td>地球（靜止不動）</td>
                                <td>太陽（靜止不動，行星繞日）</td>
                            </tr>
                            <tr>
                                <td><b>行星逆行解釋</b></td>
                                <td>行星本身繞著<b>本輪</b>旋轉，本輪中心繞著<b>均輪</b>旋轉，當行星處於本輪內側時速度與均輪相反，產生逆行。</td>
                                <td>地球公轉速率快於外側行星。當地球<b>追越</b>外側行星時，觀測視線在背景星空產生向後的投影。</td>
                            </tr>
                            <tr>
                                <td><b>系統複雜度</b></td>
                                <td>極高，需數十個本輪、均輪與偏心圓疊加，且各行星本輪必須與太陽同步。</td>
                                <td>極低，行星僅需做簡單的繞日圓周（或橢圓）運動即可自然解釋。</td>
                            </tr>
                            <tr>
                                <td><b>牛頓力學解釋</b></td>
                                <td>無法以簡單的物理規律解釋（需要極其複雜、非物理的力場）。</td>
                                <td>可用<b>萬有引力定律</b>統一解釋（$\\frac{T^2}{R^3} = \\frac{4\\pi^2}{GM}$），常數 $K$ 由太陽質量 $M$ 決定。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="info-alert" style="margin-top: 1rem; margin-bottom: 1.5rem;">
                    <span class="info-alert-icon">💡</span>
                    <div>
                        <strong>數據實證：太陽系主要行星週期與軌道半長軸對照表（驗證第三定律）</strong><br>
                        由下方真實觀測數據可見，不同行星的 $R^3/T^2$ 比值幾乎完全相等（常數 $K \\approx 1.00\\,\\text{AU}^3/\\text{yr}^2$），這正是克卜勒從數據中提取規律的偉大實證：
                    </div>
                </div>

                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 15%">行星名稱</th>
                                <th style="width: 20%">軌道半長軸 $R$ (AU)</th>
                                <th style="width: 20%">公轉週期 $T$ (年)</th>
                                <th style="width: 20%">$R^3$ ($\\text{AU}^3$)</th>
                                <th style="width: 20%">$T^2$ ($\\text{yr}^2$)</th>
                                <th>$R^3/T^2$ 比值</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>水星</b></td>
                                <td>0.387</td>
                                <td>0.241</td>
                                <td>0.058</td>
                                <td>0.058</td>
                                <td><span class="code-badge">1.00</span></td>
                            </tr>
                            <tr>
                                <td><b>金星</b></td>
                                <td>0.723</td>
                                <td>0.615</td>
                                <td>0.378</td>
                                <td>0.378</td>
                                <td><span class="code-badge">1.00</span></td>
                            </tr>
                            <tr>
                                <td><b>地球</b></td>
                                <td>1.000</td>
                                <td>1.000</td>
                                <td>1.000</td>
                                <td>1.000</td>
                                <td><span class="code-badge">1.00</span></td>
                            </tr>
                            <tr>
                                <td><b>火星</b></td>
                                <td>1.524</td>
                                <td>1.881</td>
                                <td>3.540</td>
                                <td>3.538</td>
                                <td><span class="code-badge">1.00</span></td>
                            </tr>
                            <tr>
                                <td><b>木星</b></td>
                                <td>5.203</td>
                                <td>11.86</td>
                                <td>140.8</td>
                                <td>140.7</td>
                                <td><span class="code-badge">1.00</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="handout-section-title">📝 生活應用與估算實戰：同步衛星與系外行星軌道計算</div>
                <div class="edu-card" style="margin-bottom: 2rem;">
                    <div style="font-weight: 700; color: var(--accent-rose); margin-bottom: 0.5rem;">🔥 費米估算實戰：利用克卜勒第三定律快速求同步衛星軌道</div>
                    <p style="font-size: 0.92rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-main);">
                        已知國際太空站（ISS）在離地表約 $400\\,\\text{km}$ 軌道繞地球運行，其公轉週期約為 $1.5\\,\\text{小時}$ (90分鐘)。若同步衛星的公轉週期必須等於地球自轉週期（$24\\,\\text{小時}$），請估算同步衛星的軌道半徑約為地球半徑的幾倍？（地球半徑 $R_e \\approx 6400\\,\\text{km}$）
                    </p>
                    <div style="background-color: #f8fafc; border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; font-size: 0.88rem; line-height: 1.5; color: var(--text-main);">
                        <strong>估算步驟解析：</strong><br>
                        1. <b>建立比例關係</b>：繞同一中心天體（地球）運行，適用克卜勒第三定律：$\\frac{r^3}{T^2} = \\text{常數} \\implies \\left(\\frac{r_{\\text{同步}}}{r_{\\text{ISS}}}\\right)^3 = \\left(\\frac{T_{\\text{同步}}}{T_{\\text{ISS}}}\\right)^2$。<br>
                        2. <b>代入週期比值</b>：$\\frac{T_{\\text{同步}}}{T_{\\text{ISS}}} = \\frac{24\\,\\text{小時}}{1.5\\,\\text{小時}} = 16$倍。<br>
                        3. <b>求解半徑比值</b>：$\\left(\\frac{r_{\\text{同步}}}{r_{\\text{ISS}}}\\right)^3 = 16^2 = 256$。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 估算 $256$ 的三次方根：因為 $6^3 = 216$，$7^3 = 343$，故 $\\sqrt[3]{256} \\approx 6.3$。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 因此 $r_{\\text{同步}} \\approx 6.3 \\times r_{\\text{ISS}}$。<br>
                        4. <b>換算地表高度與地球半徑倍數</b>：<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• ISS 軌道半徑 $r_{\\text{ISS}} = R_e + 400\\,\\text{km} \\approx 6400 + 400 = 6800\\,\\text{km}$（約等於 $1.06\\,R_e$）。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 同步衛星軌道半徑 $r_{\\text{同步}} \\approx 6.3 \\times 6800\\,\\text{km} \\approx 42800\\,\\text{km}$。<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;• 換算為地球半徑倍數：$\\frac{42800\\,\\text{km}}{6400\\,\\text{km}} \\approx 6.7$倍（真實值約為 $6.6$倍）。此方法能快速在選擇題中找出答案！
                    </div>
                </div>
            `;
        }

        // 靜電與電磁比較——併入模組六 N19
        function electrostaticsSectionHtml() {
            return `
                <div class="handout-section-title" style="margin-top: 1.5rem;">💡 核心觀念解析：電場與電力線的物理本質</div>
                <p class="content-subtitle">在物理學中，電荷之間的靜電力是如何跨越空間發揮作用的？「場」的概念是解決超距力本質的關鍵橋樑，我們常將其與磁場進行類比：</p>
                
                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">1. 從「超距力」到「場 (Field)」的抽象建立</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        庫侖定律描述了兩個靜止電荷間的交互作用力，但電荷如何「得知」另一個電荷的存在？
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li><b>場的觀點</b>：帶電體 $Q$ 會在其周圍空間建立<b>電場 (Electric Field)</b>。當另一個電荷 $q$ 進入此空間時，它是與該處的「電場」發生局部交互作用，進而受到靜電力 $F = qE$。</li>
                        <li><b>磁場的類比</b>：正如磁鐵在其周圍空間建立<b>磁場 (Magnetic Field)</b>，並對放入其中的磁極或電流施加磁力。場是物質存在的一種形式，本身帶有能量。</li>
                    </ul>
                </div>

                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">2. 力線的引入：電場與磁場的幾何視覺化</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        法拉第首創用「力線」來定性描繪場的強弱與方向：
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li><b>電力線 (Electric Field Lines)</b>：用以描繪電場分佈的假想曲線。電力線的切線方向代表該點的電場方向（即正電荷受力方向）；電力線的疏密程度代表電場強度（越密越強）。</li>
                        <li><b>磁力線 (Magnetic Field Lines)</b>：用以描繪磁場分佈的假想曲線。與電力線相似，其切線代表磁場方向，疏密代表磁場強度。</li>
                    </ul>
                </div>

                <div class="handout-section-title">🔍 電場與磁場的特性對照</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 20%">比較項目</th>
                                <th style="width: 40%">電場與電力線 (Electrostatics)</th>
                                <th style="width: 40%">磁場與磁力線 (Magnetism)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>場的定義</b></td>
                                <td>單位正試驗電荷受到的靜電力：$E = F/q$。</td>
                                <td>由磁針 N 極受力方向定義磁場方向（量值與電流受力有關）。</td>
                            </tr>
                            <tr>
                                <td><b>基本源頭</b></td>
                                <td><b>正、負電荷</b>（存在單一正電荷或單一負電荷，即「電單極子」）。</td>
                                <td><b>N、S 磁極</b>（自然界中不存在單一磁極，即「磁單極子」不存在，必成對出現）。</td>
                            </tr>
                            <tr>
                                <td><b>力線起點與終點</b></td>
                                <td>發自<b>正電荷</b>（或無限遠），終止於<b>負電荷</b>（或無限遠）。電力線為<b>非封閉曲線</b>。</td>
                                <td>在外部由 <b>N 極指向 S 極</b>，內部由 <b>S 極指向 N 極</b>。磁力線為<b>封閉曲線</b>。</td>
                            </tr>
                            <tr>
                                <td><b>共同特性</b></td>
                                <td colspan="2" style="text-align: center;">① 力線的<b>切線方向</b>為該點的場方向。&nbsp;&nbsp;&nbsp;&nbsp;② 力線的<b>疏密程度</b>代表場的強弱。<br>③ 空間中任兩條力線<b>絕不相交</b>（否則交點會有兩個場方向，物理上不成立）。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="handout-section-title">📝 生活應用與避雷針原理</div>
                <div class="edu-card" style="margin-bottom: 2rem;">
                    <div style="font-weight: 700; color: var(--accent-rose); margin-bottom: 0.5rem;">⚡ 尖端放電與靜電屏蔽在生活中的實踐</div>
                    <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-main);">
                        電場與電力線的規律能完美解釋大考常考的靜電現象：
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color: var(--text-main); padding-left:1.25rem; margin-bottom:1rem;">
                        <li><b>尖端放電 (Tip Discharge)</b>：帶電導體表面各處的電荷分佈不均勻，<b>曲率半徑愈小（愈尖銳）的地方，電荷密度愈高</b>。因此，尖端附近的電場極強，容易使周圍空氣分子游離而發生放電現象。
                            <br>• <i>大考實例</i>：<b>避雷針</b>的頂端非常尖銳，當雷雲接近時，避雷針藉由尖端放電將雷雲的電荷緩慢中和，或將閃電直接引導至地面，保護建築物。沈括《夢溪筆談》中記載雷擊僅燒毀木材卻未熔化金屬，即與放電路徑與電磁阻抗有關。
                        </li>
                        <li><b>靜電屏蔽 (Electrostatic Shielding)</b>：一個封閉的金屬空腔導體，在達到靜電平衡時，<b>金屬內部的電場恆為零</b>，內部電力線為零。所有多餘的電荷只會分佈在導體的外表面。
                            <br>• <i>大考實例</i>：<b>防靜電工作服</b>中織有金屬細絲，形成屏蔽網，保護穿戴者免受外部強電場的靜電放電干擾；汽車或飛機遭遇雷擊時，金屬車殼／機身會將電流引導至外表面並流走，車內／機艙內部的人安全無虞。
                        </li>
                    </ul>
                </div>
            `;
        }

        // 載流導線與右手定則——併入模組六 N20
        function magnetismSectionHtml() {
            return `
                <div class="handout-section-title" style="margin-top: 1.5rem;">💡 核心觀念解析：厄斯特的發現與安培右手定則</div>
                <p class="content-subtitle">厄斯特於 1820 年偶然發現通電導線會使下方的磁針發生偏轉，揭開了「電生磁」的序幕，成為建立電動力學的第一座橋梁。磁場方向由安培右手定則判定：</p>
                
                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">1. 載流直導線的磁場與右手定則</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        <b>直導線右手定則</b>：右手大拇指指向<b>電流 $I$</b> 的方向，四指彎曲環繞導線的方向即為<b>磁場 $B$</b> 的方向。
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li><b>磁場形態</b>：以導線為中心的同心圓。距離導線愈近，磁場愈強。</li>
                        <li><b>視角符號（必考）</b>：為在二維紙面上作圖，物理學規定：
                            <br>• <b>$\odot$（圓圈內點）</b>：代表電流或磁場方向<b>垂直穿出紙面</b>（如箭頭迎面飛來）。
                            <br>• <b>$\otimes$（圓圈內叉）</b>：代表電流或磁場方向<b>垂直穿入紙面</b>（如箭尾背向飛去）。
                        </li>
                    </ul>
                </div>

                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">2. 載流螺線管（線圈）的磁場與右手定則</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        當直導線繞成螺旋狀時，各圈導線產生的磁場會在管內疊加，形成極為均勻的平行磁場。
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li><b>螺線管右手定則</b>：右手四指順著<b>線圈上的電流 $I$</b> 環繞彎曲，大拇指所指的方向即為<b>管內磁場 $B$</b> 的方向（等效於電磁鐵的 N 極端）。</li>
                        <li><b>內外部磁場對照</b>：外部磁力線由 N 極出發、收於 S 極；<b>內部磁力線則平行且緊密，由 S 極指向 N 極</b>，形成一條完整的閉合曲線。</li>
                    </ul>
                </div>

                <div class="handout-section-title">🔍 載流導線磁場形態與作圖剖析</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 25%">導線形態</th>
                                <th style="width: 40%">磁力線幾何形狀</th>
                                <th style="width: 35%">大考作圖與磁場強度特徵</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>載流直導線</b></td>
                                <td>以導線為同心圓中心，磁場平面與導線垂直。</td>
                                <td>大考常用 $\odot$ 與 $\otimes$ 畫出導線截面，判斷兩側磁場疊加（如同向電流相吸、反向電流相斥的定性判斷）。</td>
                            </tr>
                            <tr>
                                <td><b>載流單圓環導線</b></td>
                                <td>靠近導線處為同心圓，圓環中心處磁力線收斂為一條垂直通過環心的直線。</td>
                                <td>大考主要考察環心處的磁場方向判定。大拇指指環心磁場，四指順著圓環電流環繞。</td>
                            </tr>
                            <tr>
                                <td><b>載流螺線管 (電磁鐵)</b></td>
                                <td><b>管內</b>：平行且均勻的強磁場。<br><b>管外</b>：與條形磁鐵（Bar Magnet）磁場完全相同。</td>
                                <td>管內磁場方向為 <b>S $\\to$ N</b>。管內磁場強度與電流大小、單位長度圈數成正比，與管子長度無關。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="handout-section-title">📝 生活應用與電磁鐵增強實戰</div>
                <div class="edu-card" style="margin-bottom: 2rem;">
                    <div style="font-weight: 700; color: var(--accent-rose); margin-bottom: 0.5rem;">⚡ 電磁起重機與馬達的物理本質</div>
                    <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-main);">
                        電流磁效應是現代電機與生活科技的基石：
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem; margin-bottom:1rem;">
                        <li><b>電磁鐵 (Electromagnet)</b>：在載流螺線管中套入一個<b>軟鐵芯 (Soft Iron Core)</b>。通電時，軟鐵芯被急速磁化，使整體磁場增強數千倍；斷電時，軟鐵芯迅速退磁，磁性消失。此即為「可控制磁性」的磁鐵。
                            <br>• <i>增強磁場三要素</i>：<b>① 增加電流 $I$</b>；<b>② 增加單位長度的線圈圈數 $n$</b>；<b>③ 套入高導磁材料（如鐵芯）</b>。
                            <br>• <i>生活實例</i>：電磁起重機（吸放廢鐵）、傳統電鈴、磁浮列車。
                        </li>
                        <li><b>電動機 (馬達) 與揚聲器 (喇叭)</b>：馬達是利用「電流在磁場中受磁力作用（載流導線受力 $F = ILB$）」來產生旋轉力矩，將電能轉換為機械能；喇叭則是利用變動電流在磁場中受力，帶動紙盆振動發聲。
                        </li>
                    </ul>
                </div>

                <div class="handout-section-title">🎬 補充資料：電池小火車實驗</div>
                <div class="edu-card" style="margin-bottom: 2rem;">
                    <div style="font-weight: 700; color: var(--primary-blue); margin-bottom: 0.5rem;">EJ實驗：電池小火車（2）磁鐵方向</div>
                    <div style="display:flex; flex-wrap:wrap; gap:1.25rem; align-items:flex-start;">
                        <div style="flex:0 1 315px; width:100%; margin-inline:auto;">
                            <iframe
                                src="https://www.youtube.com/embed/Gaw5zPC1OAk"
                                title="EJ實驗：電池小火車（2）磁鐵方向"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen
                                style="display:block; width:100%; aspect-ratio:9/16; border:0; border-radius:0.85rem; background:#111;"
                            ></iframe>
                            <a href="https://www.youtube.com/shorts/Gaw5zPC1OAk" target="_blank" rel="noopener"
                               style="display:block; margin-top:0.65rem; text-align:center; color:var(--primary-blue); font-size:0.88rem; font-weight:700;">
                                無法播放時，在 YouTube 開啟影片 ↗
                            </a>
                        </div>
                        <div style="flex:1 1 320px;">
                            <p style="font-size:0.92rem; line-height:1.7; color:var(--text-main); margin-top:0;">
                                影片中的「小火車」由電池與兩端的強力磁鐵組成。磁鐵接觸裸銅線圈後形成閉合電路，電流流過線圈，使線圈周圍產生磁場；這個磁場再與永久磁鐵的磁場交互作用，形成沿線圈軸向的推進力。
                            </p>
                            <div style="padding:0.85rem 1rem; border-left:4px solid var(--accent-rose); border-radius:0.45rem; background:var(--accent-rose-light); font-size:0.9rem; line-height:1.65; color:var(--text-main);">
                                <b>影片觀察任務</b>
                                <ol style="margin:0.45rem 0 0; padding-left:1.25rem;">
                                    <li>把兩顆磁鐵一起反轉時，運動方向如何改變？</li>
                                    <li>只反轉其中一顆磁鐵，是否仍能順利前進？</li>
                                    <li>依安培右手定則，判斷線圈磁場方向，並連結到磁鐵受到的合力方向。</li>
                                </ol>
                            </div>
                            <p style="font-size:0.84rem; line-height:1.55; color:var(--text-muted); margin:0.8rem 0 0;">
                                ※ 實際受力來自磁場與電流的交互作用；磁鐵方向、電流方向與接觸位置會共同影響結果。強力磁鐵與線圈可能發熱，實作時應避免短路過久。
                            </p>
                        </div>
                    </div>

                    <figure style="margin:1.5rem 0 0;">
                        <svg viewBox="0 0 900 430" role="img" aria-labelledby="batteryTrainTitle batteryTrainDesc"
                             style="display:block; width:100%; height:auto; border:1px solid var(--border-light); border-radius:0.9rem; background:#f8fbff;">
                            <title id="batteryTrainTitle">電池小火車的電流、磁場與受力方向示意圖</title>
                            <desc id="batteryTrainDesc">電池與兩端磁鐵包在銅線圈內。磁鐵接觸線圈後，電流只流過兩接觸點之間的線圈，使這一小段線圈成為電磁鐵；它吸引左磁鐵並排斥右磁鐵，兩力都朝右而推動整組電池。</desc>
                            <defs>
                                <linearGradient id="batteryBody" x1="0" x2="1">
                                    <stop offset="0" stop-color="#334155"/>
                                    <stop offset="0.12" stop-color="#64748b"/>
                                    <stop offset="0.88" stop-color="#94a3b8"/>
                                    <stop offset="1" stop-color="#475569"/>
                                </linearGradient>
                                <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#2563eb"/>
                                </marker>
                                <marker id="arrowRose" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#e11d48"/>
                                </marker>
                                <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#059669"/>
                                </marker>
                            </defs>

                            <text x="450" y="32" text-anchor="middle" font-size="20" font-weight="700" fill="#1e3a5f">電池小火車：局部通電線圈形成電磁鐵</text>

                            <!-- 整條裸銅線圈是軌道；接觸點外沒有接入電池，不屬於有效通電區 -->
                            <g fill="none" stroke="#a16207" stroke-width="6" opacity="0.35">
                                <ellipse cx="145" cy="190" rx="32" ry="92"/>
                                <ellipse cx="205" cy="190" rx="32" ry="92"/>
                                <ellipse cx="265" cy="190" rx="32" ry="92"/>
                                <ellipse cx="325" cy="190" rx="32" ry="92"/>
                                <ellipse cx="385" cy="190" rx="32" ry="92"/>
                                <ellipse cx="445" cy="190" rx="32" ry="92"/>
                                <ellipse cx="505" cy="190" rx="32" ry="92"/>
                                <ellipse cx="565" cy="190" rx="32" ry="92"/>
                                <ellipse cx="625" cy="190" rx="32" ry="92"/>
                                <ellipse cx="685" cy="190" rx="32" ry="92"/>
                                <ellipse cx="745" cy="190" rx="32" ry="92"/>
                            </g>
                            <text x="755" y="95" font-size="16" font-weight="700" fill="#92400e">未通電線圈</text>
                            <path d="M742 101 L710 129" stroke="#92400e" stroke-width="2"/>

                            <!-- A、B 兩接觸點之間的線圈才有電流，先畫位於電池後方的半圈 -->
                            <rect x="276" y="82" width="344" height="218" rx="22" fill="#dbeafe" fill-opacity="0.5" stroke="#60a5fa" stroke-width="2" stroke-dasharray="8 6"/>
                            <text x="448" y="62" text-anchor="middle" font-size="17" font-weight="700" fill="#1d4ed8">有效通電區：只在兩顆磁鐵接觸點之間</text>
                            <g fill="none" stroke="#d97706" stroke-width="8">
                                <path d="M325 98 A32 92 0 0 1 325 282"/>
                                <path d="M385 98 A32 92 0 0 1 385 282"/>
                                <path d="M445 98 A32 92 0 0 1 445 282"/>
                                <path d="M505 98 A32 92 0 0 1 505 282"/>
                                <path d="M565 98 A32 92 0 0 1 565 282"/>
                            </g>

                            <!-- 電池與兩端磁鐵位於線圈內 -->
                            <rect x="335" y="158" width="230" height="64" rx="12" fill="url(#batteryBody)" stroke="#334155" stroke-width="2"/>
                            <rect x="315" y="164" width="24" height="52" rx="5" fill="#ef4444"/>
                            <rect x="565" y="164" width="24" height="52" rx="5" fill="#ef4444"/>
                            <rect x="294" y="158" width="21" height="64" rx="5" fill="#3b82f6"/>
                            <rect x="589" y="158" width="21" height="64" rx="5" fill="#3b82f6"/>
                            <text x="450" y="197" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">電池</text>
                            <text x="302" y="149" text-anchor="middle" font-size="14" font-weight="700" fill="#1d4ed8">S</text>
                            <text x="327" y="149" text-anchor="middle" font-size="14" font-weight="700" fill="#dc2626">N</text>
                            <text x="577" y="149" text-anchor="middle" font-size="14" font-weight="700" fill="#dc2626">N</text>
                            <text x="600" y="149" text-anchor="middle" font-size="14" font-weight="700" fill="#1d4ed8">S</text>
                            <circle cx="294" cy="190" r="7" fill="#facc15" stroke="#92400e" stroke-width="2"/>
                            <circle cx="610" cy="190" r="7" fill="#facc15" stroke="#92400e" stroke-width="2"/>
                            <text x="294" y="245" text-anchor="middle" font-size="13" font-weight="700" fill="#92400e">接觸點 A</text>
                            <text x="610" y="245" text-anchor="middle" font-size="13" font-weight="700" fill="#92400e">接觸點 B</text>

                            <!-- 前半圈覆在電池前方，表現線圈包住電池與磁鐵 -->
                            <g fill="none" stroke="#f59e0b" stroke-width="8">
                                <path d="M325 98 A32 92 0 0 0 325 282"/>
                                <path d="M385 98 A32 92 0 0 0 385 282"/>
                                <path d="M445 98 A32 92 0 0 0 445 282"/>
                                <path d="M505 98 A32 92 0 0 0 505 282"/>
                                <path d="M565 98 A32 92 0 0 0 565 282"/>
                            </g>

                            <!-- 閉合迴路：電流只經過 A、B 之間的線圈 -->
                            <path d="M310 292 C350 325, 550 325, 590 292" fill="none" stroke="#2563eb" stroke-width="5" marker-end="url(#arrowBlue)"/>
                            <text x="450" y="348" text-anchor="middle" font-size="16" font-weight="700" fill="#2563eb">線圈電流 I：A → 中間線圈 → B</text>
                            <path d="M610 270 C670 364, 230 392, 294 270" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#arrowBlue)"/>
                            <text x="450" y="409" text-anchor="middle" font-size="14" fill="#475569">再經磁鐵與電池內部返回，形成閉合迴路</text>

                            <!-- 有效通電區成為一小段等效電磁鐵 -->
                            <rect x="350" y="105" width="200" height="36" rx="18" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
                            <text x="370" y="129" text-anchor="middle" font-size="17" font-weight="700" fill="#047857">S</text>
                            <text x="450" y="129" text-anchor="middle" font-size="15" font-weight="700" fill="#047857">等效電磁鐵</text>
                            <text x="530" y="129" text-anchor="middle" font-size="17" font-weight="700" fill="#047857">N</text>
                            <path d="M360 88 L540 88" fill="none" stroke="#059669" stroke-width="4" stroke-dasharray="9 6" marker-end="url(#arrowGreen)"/>
                            <text x="555" y="93" font-size="15" font-weight="700" fill="#047857">B</text>

                            <!-- 左端被吸引、右端被排斥，兩力都向右 -->
                            <path d="M265 137 L322 137" fill="none" stroke="#e11d48" stroke-width="5" marker-end="url(#arrowRose)"/>
                            <text x="292" y="122" text-anchor="middle" font-size="13" font-weight="700" fill="#be123c">吸引力</text>
                            <path d="M570 137 L627 137" fill="none" stroke="#e11d48" stroke-width="5" marker-end="url(#arrowRose)"/>
                            <text x="598" y="122" text-anchor="middle" font-size="13" font-weight="700" fill="#be123c">排斥力</text>
                            <path d="M650 190 L800 190" fill="none" stroke="#e11d48" stroke-width="7" marker-end="url(#arrowRose)"/>
                            <text x="725" y="172" text-anchor="middle" font-size="18" font-weight="700" fill="#be123c">合力／前進</text>
                        </svg>
                        <figcaption style="margin-top:0.65rem; text-align:center; font-size:0.84rem; line-height:1.5; color:var(--text-muted);">
                            只有磁鐵接觸點 A、B 之間的線圈接入電池而有電流，這一段才形成電磁鐵。圖示配置中，等效電磁鐵吸引左磁鐵、排斥右磁鐵，兩個磁力同向疊加而推動整組電池向右。
                        </figcaption>
                    </figure>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:0.8rem; margin-top:1rem;">
                        <div style="padding:0.9rem 1rem; border-radius:0.7rem; background:var(--bg-soft); border:1px solid var(--border-light); font-size:0.88rem; line-height:1.6;">
                            <b style="color:var(--primary-blue);">① 右手握拳定則：先找磁場</b><br>
                            四指沿線圈的傳統電流方向彎曲，大拇指所指就是螺線管內部磁場方向，也指向螺線管的 N 極。適用於小火車線圈與 Q16、Q60。
                        </div>
                        <div style="padding:0.9rem 1rem; border-radius:0.7rem; background:var(--bg-soft); border:1px solid var(--border-light); font-size:0.88rem; line-height:1.6;">
                            <b style="color:var(--accent-rose);">② 右手開掌定則：再找受力</b><br>
                            四指指向傳統電流 $I$，讓磁場 $B$ 穿入掌心，大拇指即指載流導線的受力 $F$。適用於單極馬達銅線的旋轉方向與 Q59；必須有<b>外加磁場</b>，不能說導線受自己的磁場推動。
                        </div>
                    </div>
                </div>
            `;
        }

        function electromagneticInductionSectionHtml() {
            return `
                <div class="handout-section-title" style="margin-top: 1.5rem;">💡 核心觀念解析：電磁感應與冷次定律的物理本質</div>
                <p class="content-subtitle">電磁感應是法拉第於 1831 年發現的，它證明了「磁生電」的可能性。核心概念是穿過線圈的「磁場變化」（磁力線數目的改變），而冷次定律則是自然界的「電磁慣性」體現：</p>

                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">1. 磁場與感應電流的產生條件</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        <b>電磁感應的關鍵不在於「有沒有磁場」，而在於「穿過線圈的磁場（磁力線數目）有沒有隨著時間發生變化」。</b>
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li><b>磁力線數目</b>：穿過某特定面積的磁力線總數。當磁場變強或線圈面積改變時，磁場就會改變。</li>
                        <li><b>感應電流的大小</b>：穿過線圈的磁場變化得越「快」，感應電流越大（定性關係；量化公式屬選修範圍，學測不考）。</li>
                    </ul>
                </div>

                <div class="edu-card" style="margin-bottom: 1.5rem;">
                    <h4 style="margin-top:0; color:var(--primary-blue);">2. 冷次定律——對抗變化的電磁慣性</h4>
                    <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
                        <b>冷次定律的物理本質是「抵抗（阻礙）磁場的變化」，這是能量守恆定律的必然結果。</b>
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem;">
                        <li>若原本穿過線圈向下的磁力線<b>增加</b>，線圈產生的感應電流磁場必須<b>向上</b>以抵消其增加。</li>
                        <li>若原本穿過線圈向下的磁力線<b>減少</b>，線圈產生的感應電流磁場必須<b>向下</b>以補充其減少（此時感應電流會去拉住即將離開的磁鐵，表現為吸引力）。</li>
                    </ul>
                </div>

                <div class="handout-section-title">🔍 「電流磁效應」與「電磁感應」雙向耦合的經典範例</div>
                <p class="content-subtitle" style="margin-bottom:1rem;">在許多實際裝置中，「電生磁」（電流磁效應）與「磁生電」（電磁感應）是前後相隨、緊密耦合在一起的：</p>
                <div class="edu-table-container" style="margin-bottom:1.5rem;">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 25%">經典應用與現象</th>
                                <th style="width: 45%">物理機制與耦合過程（電生磁 ➔ 磁生電）</th>
                                <th style="width: 30%">大考特徵與解題關鍵</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>鄰近雙線圈實驗</b></td>
                                <td>主線圈接通或斷開開關時電流改變，其產生的磁場隨之改變（<b>電流磁效應</b>）；此變化的磁場穿過鄰近的副線圈，使穿過副線圈的磁力線數目改變而產生暫時的感應電流（<b>電磁感應</b>）。</td>
                                <td>指針僅在開關<b>接通（On）</b>或<b>斷開（Off）</b>的「瞬間」偏轉。若開關一直保持 On（直流電穩定），則無感應電流。</td>
                            </tr>
                            <tr>
                                <td><b>交流變壓器</b></td>
                                <td>主線圈通以交流電，在鐵芯中產生週期性方向變化的磁場（<b>電流磁效應</b>）；鐵芯引導該變化磁場穿過副線圈，副線圈因穿過的磁力線數目持續改變而產生感應交流電壓（<b>電磁感應</b>）。</td>
                                <td>變壓器<b>必須使用交流電（AC）</b>才有效；電壓比等於圈數比：$\\frac{V_1}{V_2} = \\frac{N_1}{N_2}$。</td>
                            </tr>
                            <tr>
                                <td><b>非接觸式感應供電<br>(無線充電 / 悠遊卡)</b></td>
                                <td>發射端（充電盤／讀卡機）通以高頻交流電，在周圍空間激發快速變動的磁場（<b>電流磁效應</b>）；接收端（手機／感應卡）內部線圈靠近時，因磁場變化產生感應電流以驅動晶片或充電（<b>電磁感應</b>）。</td>
                                <td>關鍵特徵在於<b>「接收端沒有裝電池」</b>卻能通電運作。利用電磁感應實現能量的非接觸式傳輸。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="handout-section-title">📝 生活應用與電磁加熱實戰</div>
                <div class="edu-card" style="margin-bottom: 2rem;">
                    <div style="font-weight: 700; color: var(--accent-orange); margin-bottom: 0.5rem;">⚡ 電磁爐與電磁煞車的物理本質</div>
                    <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-main);">
                        電磁爐與電磁煞車同样是結合了電流磁效應與電磁感應的生活實例：
                    </p>
                    <ul style="font-size:0.92rem; line-height:1.6; color:var(--text-main); padding-left:1.25rem; margin-bottom:1rem;">
                        <li><b>電磁爐加熱 (Induction Cooker)</b>：
                            <br>• <b>步驟一 (電生磁)</b>：電磁爐內部的線圈通以高頻交流電，產生快速變化的磁場。
                            <br>• <b>步驟二 (磁生電)</b>：當鐵製鍋具放置在爐面上時，變化的磁場穿過金屬鍋底，在鍋底感應出環狀的<b>渦電流 (Eddy Current)</b>（電磁感應）。
                            <br>• <b>步驟三 (熱效應)</b>：鍋底的感應電流因金屬電阻而產生焦耳熱（$P=I^2R$），達到直接加熱鍋內食物的效果（注意：必須是鐵製等具磁導性與電阻的鍋具才有效，玻璃或鋁鍋無法以此加熱）。
                        </li>
                        <li><b>電磁煞車 (Electromagnetic Braking)</b>：
                            <br>• <b>機制</b>：當旋轉中的金屬圓盤或前行的列車金屬葉片通過強力磁鐵產生的磁場（電流磁效應）時，金屬內部會因電磁感應產生反向的應電流與阻礙其運動的磁力（冷次定律的體現），達到平穩煞車的效果（常應用於雲霄飛車或高鐵煞車）。
                        </li>
                    </ul>
                </div>
            `;
        }

        // 四大基本交互作用對照矩陣——併入模組七
        function fourForcesSectionHtml() {
            return `
                <div class="handout-section-title" style="margin-top: 1.5rem;">🌌 四大基本交互作用對照矩陣</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width: 20%">基本交互作用</th>
                                <th style="width: 15%">相對強度</th>
                                <th style="width: 20%">作用範圍 (m)</th>
                                <th style="width: 15%">媒介粒子</th>
                                <th>大考主要物理特徵與生活實例</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>強交互作用 (強力)</strong></td>
                                <td>$10^2$ (最強)</td>
                                <td>$\\approx 10^{-15}$ (短程力)</td>
                                <td>膠子</td>
                                <td>作用於原子核內。克服質子間庫侖靜電排斥力以穩定結合質子與中子；束縛夸克。</td>
                            </tr>
                            <tr>
                                <td><strong>電磁交互作用</strong></td>
                                <td>$1$ (次強)</td>
                                <td>$\\infty$ (長程力)</td>
                                <td>光子</td>
                                <td>作用於帶電粒子間。主導日常所有接觸力（摩擦力、彈力、正向力）與化學鍵。</td>
                            </tr>
                            <tr>
                                <td><strong>弱交互作用 (弱力)</strong></td>
                                <td>$10^{-13}$</td>
                                <td>$\\approx 10^{-18}$ (極短程)</td>
                                <td>W/Z 玻色子</td>
                                <td>控制原子核的放射性衰變，例如使中子衰變為質子的 $\\beta$ 衰變。</td>
                            </tr>
                            <tr>
                                <td><strong>萬有引力 (重力)</strong></td>
                                <td>$10^{-38}$ (最弱)</td>
                                <td>$\\infty$ (長程力)</td>
                                <td>重力子（理論預測，尚未發現）</td>
                                <td>作用於所有具質量的物體。主導天體運行與天體重力場，但在微觀粒子間極微弱。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

