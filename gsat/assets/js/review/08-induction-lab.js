// 電磁感應與冷次定律互動模擬
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ========== 電磁感應與冷次定律互動模擬 ==========
        function bindInductionControls() {
            ['ind-pos', 'ind-pole', 'ind-turns', 'ind-auto', 'ind-show-ext', 'ind-show-ind', 'ind-show-tot', 'ind-show-change'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    addViewEventListener(el, 'input', updateInductionReadouts);
                    addViewEventListener(el, 'change', updateInductionReadouts);
                }
            });
            const canvas = document.getElementById('induction-canvas');
            if (!canvas) return;
            let isDragging = false;
            const getMouseX = (evt) => {
                const rect = canvas.getBoundingClientRect();
                return (evt.clientX - rect.left) * (canvas.width / rect.width);
            };
            const onMouseDown = (evt) => {
                if (document.getElementById('ind-auto').checked) return;
                if (Math.abs(getMouseX(evt) - labNumber('ind-pos')) < 90) isDragging = true;
            };
            const onMouseMove = (evt) => {
                if (!isDragging) return;
                let mouseX = Math.max(150, Math.min(480, getMouseX(evt)));
                document.getElementById('ind-pos').value = Math.round(mouseX);
                updateInductionReadouts();
            };
            const onMouseUp = () => { isDragging = false; };
            const onTouchStart = (evt) => {
                if (document.getElementById('ind-auto').checked) return;
                if (Math.abs(getMouseX(evt.touches[0]) - labNumber('ind-pos')) < 90) {
                    isDragging = true;
                    evt.preventDefault();
                }
            };
            const onTouchMove = (evt) => {
                if (!isDragging) return;
                let mouseX = Math.max(150, Math.min(480, getMouseX(evt.touches[0])));
                document.getElementById('ind-pos').value = Math.round(mouseX);
                updateInductionReadouts();
                evt.preventDefault();
            };
            const onTouchEnd = () => { isDragging = false; };

            addViewEventListener(canvas, 'mousedown', onMouseDown);
            addViewEventListener(window, 'mousemove', onMouseMove);
            addViewEventListener(window, 'mouseup', onMouseUp);
            addViewEventListener(canvas, 'touchstart', onTouchStart, { passive: false });
            addViewEventListener(window, 'touchmove', onTouchMove, { passive: false });
            addViewEventListener(window, 'touchend', onTouchEnd);
        }

        function setInductionStep(step, button) {
            if (!window.physicsLab) return;
            window.physicsLab.inductionStep = step;
            document.querySelectorAll('.induction-step-btn').forEach(btn => btn.classList.toggle('active', btn === button));
            updateInductionReadouts();
        }

        function unpauseInduction() {
            if (window.physicsLab && window.physicsLab.paused && (!PhysicsRuntime.prefersReducedMotion() || window.physicsLab.motionEnabled)) {
                toggleInductionPause();
            }
        }

        function updateInductionReadouts() {
            unpauseInduction();
            if (!document.getElementById('ind-pos')) return;
            const magnetX = labNumber('ind-pos'), pole = document.getElementById('ind-pole').value, turns = labNumber('ind-turns');
            const dist = Math.max(80, 680 - magnetX), directionFactor = (pole === 'N') ? 1 : -1;
            const baseFlux = Math.max(0, (120000 / (dist * dist)) - 0.427) * 1.166;
            const fluxExt = baseFlux * directionFactor;
            document.getElementById('ind-pos-out').textContent = formatLabDistance(680 - magnetX);
            document.getElementById('ind-turns-out').textContent = `${turns} 圈`;
            const deltaField = (window.physicsLab && window.physicsLab.lastDeltaField) || 0;
            const inducedField = (window.physicsLab && window.physicsLab.lastInducedField) || 0;
            const totalField = (window.physicsLab && window.physicsLab.lastTotalField) || fluxExt;
            document.getElementById('ind-flux-ext-readout').textContent = fluxExt.toFixed(2);
            document.getElementById('ind-flux-ind-readout').textContent = deltaField.toFixed(2);
            document.getElementById('ind-flux-tot-readout').textContent = inducedField.toFixed(2);
            document.getElementById('ind-current-dir-readout').textContent = totalField.toFixed(2);
            const step = window.physicsLab.inductionStep || 1;
            const explains = {
                1: "步驟一：藍線是外加磁場 B<sub>ext</sub>；磁鐵越靠近，磁場絕對值越大。",
                2: "步驟二：粉紅線是相鄰兩個實際取樣點的外加磁場差 ΔB<sub>ext</sub>。藍線到達極大或極小值時不再增減，粉紅線必定同時回到 0。",
                3: "步驟三：綠線以 B<sub>ind</sub> = −ΔB<sub>ext</sub> 表示抵抗變化，橘線是 B<sub>total</sub> = B<sub>ext</sub> + B<sub>ind</sub>。例：100 降到 80，ΔB<sub>ext</sub> = −20、B<sub>ind</sub> = +20、B<sub>total</sub> = 100。"
            };
            document.getElementById('induction-explain').innerHTML = explains[step];
        }

        function drawInductionLab(renderOnly = false) {
            if (renderOnly) return;
            const setup = prepLabCanvas('induction-canvas');
            if (!setup) return;
            const { ctx, w, h } = setup, t = window.physicsLab.time, step = window.physicsLab.inductionStep || 1;
            const isAuto = document.getElementById('ind-auto').checked, pole = document.getElementById('ind-pole').value, turns = labNumber('ind-turns');
            let magnetX = labNumber('ind-pos');
            const magnetY = 270, coilX = 680, coilY = 270;

            if (window.physicsLab.paused) {
                const fluxExt = window.physicsLab.lastFluxExtVal || 0;
                const deltaField = window.physicsLab.lastDeltaField || 0;
                const inducedField = window.physicsLab.lastInducedField || 0;
                const totalField = window.physicsLab.lastTotalField || fluxExt;
                const displayMagnetX = window.physicsLab.lastMagnetX !== undefined ? window.physicsLab.lastMagnetX : magnetX;
                const displayDist = Math.max(80, coilX - displayMagnetX);

                drawInductionSetup(ctx, coilX, coilY, turns, -inducedField, step);
                drawMagnet(ctx, displayMagnetX, magnetY, pole);
                drawMagnetFieldLines(ctx, displayMagnetX, magnetY, pole, displayDist, step);
                if (step >= 3) drawInducedFieldLines(ctx, coilX, coilY, inducedField);
                drawInductionPhysicsVectors(ctx, w, h, fluxExt, deltaField, inducedField, totalField, step);
                drawInductionGraph();
                return;
            }

            const modeKey = `${isAuto ? 'auto' : 'manual'}:${pole}`;
            if (window.physicsLab.lastInductionModeKey !== modeKey) {
                window.physicsLab.lastInductionModeKey = modeKey;
                window.physicsLab.lastFluxExt = undefined;
                window.physicsLab.inductionHistory = [];
            }
            const dt = window.physicsLab.fixedDt || (1 / 60 * 2.1 * labNumber('wave-speed'));
            if (isAuto) {
                magnetX = 315 + Math.sin(t * 0.8) * 165;
                document.getElementById('ind-pos').value = Math.round(magnetX);
                document.getElementById('ind-pos-out').textContent = formatLabDistance(coilX - magnetX);
            }
            const dist = Math.max(80, coilX - magnetX);
            const measuredVel = (magnetX - window.physicsLab.lastMagnetX) / dt;
            const exactAutoVel = 132 * Math.cos(t * 0.8);
            const vel = isAuto ? exactAutoVel : measuredVel;
            window.physicsLab.lastMagnetX = magnetX;
            window.physicsLab.magnetVel = isAuto ? vel : window.physicsLab.magnetVel * 0.72 + vel * 0.28;
            const directionFactor = (pole === 'N') ? 1 : -1;
            const baseFlux = Math.max(0, (120000 / (dist * dist)) - 0.427) * 1.166;
            const fluxExt = baseFlux * directionFactor;
            const isCoupled = (120000 / (dist * dist)) > 0.427;
            const dFluxDx = isCoupled ? directionFactor * 1.166 * 240000 / (dist * dist * dist) : 0;
            const fluxRate = dFluxDx * window.physicsLab.magnetVel;
            const previousFlux = window.physicsLab.lastFluxExt;
            const deltaField = previousFlux === undefined ? 0 : fluxExt - previousFlux;
            const inducedField = -deltaField;
            const fieldCeiling = ((120000 / (200 * 200)) - 0.427) * 1.166;
            const totalField = fluxExt + inducedField;

            window.physicsLab.lastFluxExt = fluxExt;
            window.physicsLab.lastFluxExtVal = fluxExt;
            window.physicsLab.lastDeltaField = deltaField;
            window.physicsLab.lastInducedField = inducedField;
            window.physicsLab.lastTotalField = totalField;
            document.getElementById('ind-flux-ext-readout').textContent = fluxExt.toFixed(2);
            document.getElementById('ind-flux-ind-readout').textContent = deltaField.toFixed(2);
            document.getElementById('ind-flux-tot-readout').textContent = inducedField.toFixed(2);
            document.getElementById('ind-current-dir-readout').textContent = totalField.toFixed(2);
            drawInductionSetup(ctx, coilX, coilY, turns, -inducedField, step);
            drawMagnet(ctx, magnetX, magnetY, pole);
            drawMagnetFieldLines(ctx, magnetX, magnetY, pole, dist, step);
            if (step >= 3) drawInducedFieldLines(ctx, coilX, coilY, inducedField);
            drawInductionPhysicsVectors(ctx, w, h, fluxExt, deltaField, inducedField, totalField, step);

            if (!window.physicsLab.inductionHistory) window.physicsLab.inductionHistory = [];
            const history = window.physicsLab.inductionHistory;
            const previousSample = history[history.length - 1];
            if (isAuto && previousSample && Number.isFinite(previousSample.fluxRate) && previousSample.fluxRate * fluxRate < 0) {
                const fraction = Math.abs(previousSample.fluxRate) / (Math.abs(previousSample.fluxRate) + Math.abs(fluxRate));
                const turningTime = previousSample.time + (t - previousSample.time) * fraction;
                const atNearPeak = previousSample.fluxRate > 0 && fluxRate < 0;
                const turningField = atNearPeak ? directionFactor * fieldCeiling : 0;
                history.push({ time: turningTime, fluxExt: turningField, deltaField: 0, inducedField: 0, totalField: turningField, fluxRate: 0 });
            }
            history.push({ time: t, fluxExt, deltaField, inducedField, totalField, fluxRate });
            while (window.physicsLab.inductionHistory.length > 240) {
                window.physicsLab.inductionHistory.shift();
            }
            drawInductionGraph();
        }

        function drawInductionGraph() {
            const canvas = document.getElementById('induction-graph-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;
            const left = 72, right = 170, top = 22, bottom = 30, gap = 30;
            const pw = w - left - right, mainH = 190;
            const mainCenterY = top + mainH / 2;
            const zoomTop = top + mainH + gap;
            const zoomH = h - zoomTop - bottom;
            const zoomCenterY = zoomTop + zoomH / 2;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = LAB_PALETTE.ink;
            ctx.fillRect(0, 0, w, h);

            for (let i = 0; i <= 6; i++) {
                const x = left + pw * i / 6;
                labLine(ctx, x, top, x, top + mainH, 'rgba(37, 64, 77, 0.42)', 1);
                labLine(ctx, x, zoomTop, x, zoomTop + zoomH, 'rgba(37, 64, 77, 0.42)', 1);
            }
            for (let i = 0; i <= 4; i++) {
                const y = top + mainH * i / 4;
                labLine(ctx, left, y, left + pw, y, i === 2 ? '#6f8790' : 'rgba(37, 64, 77, 0.5)', i === 2 ? 1.5 : 1);
            }
            [zoomTop, zoomCenterY, zoomTop + zoomH].forEach((y, i) => {
                labLine(ctx, left, y, left + pw, y, i === 1 ? '#6f8790' : 'rgba(37, 64, 77, 0.5)', i === 1 ? 1.5 : 1);
            });
            labLine(ctx, left, top, left, top + mainH, '#6f8790', 1.5);
            labLine(ctx, left, zoomTop, left, zoomTop + zoomH, '#6f8790', 1.5);
            labText(ctx, '+3', left - 10, top + 5, '#94a3b8', 10, 'right');
            labText(ctx, '0', left - 10, mainCenterY + 4, '#d9eef2', 10, 'right');
            labText(ctx, '−3', left - 10, top + mainH, '#94a3b8', 10, 'right');
            labRichText(ctx, ['ΔB', { text: 'ext', sub: true }, ' 與 B', { text: 'ind', sub: true }, ' 放大比較'], left, zoomTop - 9, '#70d2d0', 10, 'left');
            labText(ctx, '過去', left, h - 9, '#70d2d0', 10, 'left');
            labText(ctx, '時間 → 現在', left + pw, h - 9, '#70d2d0', 10, 'right');

            const history = (window.physicsLab && window.physicsLab.inductionHistory) || [];
            if (history.length < 2) {
                labText(ctx, '移動磁鐵或開啟自動來回運動', left + pw / 2, mainCenterY + 4, '#64748b', 13, 'center');
                return;
            }

            const sharedScale = 3.1;
            const zoomScale = Math.max(0.01, ...history.map(row => Math.abs(row.deltaField || 0)), ...history.map(row => Math.abs(row.inducedField || 0)));
            const firstTime = history[0].time;
            const lastTime = history[history.length - 1].time;
            const timeSpan = Math.max(0.001, lastTime - firstTime);
            const drawCurve = (key, color, width, centerY, halfHeight, scale, dash = []) => {
                ctx.save();
                ctx.strokeStyle = labTone(color);
                ctx.lineWidth = width;
                ctx.setLineDash(dash);
                ctx.beginPath();
                for (let i = 0; i < history.length; i++) {
                    const x = left + ((history[i].time - firstTime) / timeSpan) * pw;
                    const y = centerY - (history[i][key] / scale) * halfHeight * 0.86;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.restore();
            };

            const showExt = document.getElementById('ind-show-ext') && document.getElementById('ind-show-ext').checked;
            const showInd = document.getElementById('ind-show-ind') && document.getElementById('ind-show-ind').checked;
            const showTot = document.getElementById('ind-show-tot') && document.getElementById('ind-show-tot').checked;
            const showChange = document.getElementById('ind-show-change') && document.getElementById('ind-show-change').checked;
            const step = window.physicsLab.inductionStep || 1;
            if (showTot && step >= 3) drawCurve('totalField', '#f59e0b', 4.2, mainCenterY, mainH / 2, sharedScale, [9, 6]);
            if (showExt) drawCurve('fluxExt', '#3b82f6', 2.8, mainCenterY, mainH / 2, sharedScale);
            if (showChange && step >= 2) drawCurve('deltaField', '#ec4899', 2.4, mainCenterY, mainH / 2, sharedScale);
            if (showInd && step >= 3) drawCurve('inducedField', '#10b981', 2.4, mainCenterY, mainH / 2, sharedScale);
            if (showChange && step >= 2) drawCurve('deltaField', '#ec4899', 2.8, zoomCenterY, zoomH / 2, zoomScale);
            if (showInd && step >= 3) drawCurve('inducedField', '#10b981', 2.8, zoomCenterY, zoomH / 2, zoomScale);
            labText(ctx, `+${zoomScale.toFixed(2)}`, left - 10, zoomTop + 5, '#94a3b8', 9, 'right');
            labText(ctx, '0', left - 10, zoomCenterY + 4, '#d9eef2', 9, 'right');
            labText(ctx, `−${zoomScale.toFixed(2)}`, left - 10, zoomTop + zoomH, '#94a3b8', 9, 'right');

            const legX = left + pw + 18, legY = top + 4, legW = 145, legH = 138;
            ctx.fillStyle = 'rgba(15, 32, 43, 0.9)';
            ctx.beginPath(); ctx.roundRect(legX, legY, legW, legH, 6); ctx.fill();
            ctx.strokeStyle = '#25404d'; ctx.lineWidth = 1.5; ctx.stroke();
            const drawLegendItem = (ly, active, color, parts) => {
                ctx.fillStyle = active ? labTone(color) : LAB_PALETTE.gridStrong;
                ctx.beginPath(); ctx.arc(legX + 15, ly, 5, 0, Math.PI * 2); ctx.fill();
                labRichText(ctx, parts, legX + 28, ly + 4, active ? '#bcd0d6' : '#526b76', 11, 'left');
            };
            drawLegendItem(legY + 22, showExt, '#3b82f6', ['B', { text: 'ext', sub: true }]);
            drawLegendItem(legY + 52, showTot && step >= 3, '#f59e0b', ['B', { text: 'total', sub: true }]);
            drawLegendItem(legY + 82, showChange && step >= 2, '#ec4899', ['ΔB', { text: 'ext', sub: true }]);
            drawLegendItem(legY + 112, showInd && step >= 3, '#10b981', ['B', { text: 'ind', sub: true }, ' = −ΔB']);
            labText(ctx, '四線共用同一磁場刻度', legX + legW / 2, legY + legH + 16, '#7f9ba5', 9, 'center');
        }

        function drawMagnet(ctx, x, y, pole) {
            const w = 150, h = 50;
            ctx.save();
            ctx.translate(x, y);
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;
            const sPoleColor = '#2563eb', nPoleColor = '#dc2626';
            const leftColor = (pole === 'N') ? sPoleColor : nPoleColor;
            const rightColor = (pole === 'N') ? nPoleColor : sPoleColor;
            const gradLeft = ctx.createLinearGradient(-w/2, -h/2, 0, h/2);
            gradLeft.addColorStop(0, leftColor); gradLeft.addColorStop(0.5, '#ffffff33'); gradLeft.addColorStop(1, '#00000066');
            ctx.fillStyle = gradLeft; ctx.beginPath(); ctx.roundRect(-w/2, -h/2, w/2, h, [8, 0, 0, 8]); ctx.fill();
            const gradRight = ctx.createLinearGradient(0, -h/2, w/2, h/2);
            gradRight.addColorStop(0, rightColor); gradRight.addColorStop(0.5, '#ffffff33'); gradRight.addColorStop(1, '#00000066');
            ctx.fillStyle = gradRight; ctx.beginPath(); ctx.roundRect(0, -h/2, w/2, h, [0, 8, 8, 0]); ctx.fill();
            ctx.shadowColor = 'transparent'; ctx.lineWidth = 1.5; ctx.strokeStyle = '#ffffff44'; ctx.stroke();
            const leftText = (pole === 'N') ? 'S' : 'N', rightText = (pole === 'N') ? 'N' : 'S';
            labText(ctx, leftText, -w/4, 7, '#ffffff', 22, 'center');
            labText(ctx, rightText, w/4, 7, '#ffffff', 22, 'center');
            ctx.restore();
        }

        function drawMagnetFieldLines(ctx, mx, my, pole, dist, step) {
            ctx.save();
            const isNRight = (pole === 'N'), color = 'rgba(59, 130, 246, 0.48)', activeColor = 'rgba(96, 165, 250, 0.9)';
            ctx.strokeStyle = labTone(color); ctx.lineWidth = 1.8;
            const heights = [32, 68, 115, 175], w = 150, xN = isNRight ? mx + 75 : mx - 75, xS = isNRight ? mx - 75 : mx + 75;
            heights.forEach((hVal, idx) => {
                ctx.strokeStyle = (step === 1 && idx < 3) ? activeColor : color;
                ctx.beginPath(); ctx.moveTo(xN, my); ctx.bezierCurveTo(xN + hVal*0.5, my - hVal, xS - hVal*0.5, my - hVal, xS, my); ctx.stroke();
                const arrowT = 0.5, arrowX = mx + Math.cos(Math.PI * arrowT) * 120, arrowY = my - hVal * Math.sin(Math.PI * arrowT);
                drawArrowHead(ctx, arrowX, arrowY, isNRight ? Math.PI : 0, 7, ctx.strokeStyle);
                ctx.beginPath(); ctx.moveTo(xN, my); ctx.bezierCurveTo(xN + hVal*0.5, my + hVal, xS - hVal*0.5, my + hVal, xS, my); ctx.stroke();
                drawArrowHead(ctx, arrowX, arrowY + hVal * 2 * Math.sin(Math.PI * arrowT), isNRight ? Math.PI : 0, 7, ctx.strokeStyle);
            });
            ctx.strokeStyle = (step === 1) ? activeColor : color;
            ctx.beginPath(); ctx.moveTo(mx - 220, my); ctx.lineTo(mx + 220, my); ctx.stroke();
            const axDir = isNRight ? 0 : Math.PI;
            drawArrowHead(ctx, mx + 180, my, axDir, 8, ctx.strokeStyle);
            drawArrowHead(ctx, mx - 180, my, axDir, 8, ctx.strokeStyle);
            ctx.restore();
        }

        function drawInducedFieldLines(ctx, cx, cy, inducedField) {
            if (Math.abs(inducedField) < 0.002) return;
            ctx.save();
            ctx.strokeStyle = 'rgba(16, 185, 129, ' + Math.min(1, 0.28 + Math.abs(inducedField) * 6) + ')';
            ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
            const isLeft = (inducedField < 0);
            const ys = [cy - 20, cy, cy + 20];
            ys.forEach(y => {
                ctx.beginPath(); ctx.moveTo(cx - 120, y); ctx.lineTo(cx + 120, y); ctx.stroke();
                drawArrowHead(ctx, isLeft ? cx - 80 : cx + 80, y, isLeft ? Math.PI : 0, 8, ctx.strokeStyle);
            });
            ctx.restore();
        }

        function drawInductionSetup(ctx, cx, cy, turns, current, step) {
            const bulbX = cx - 60, bulbY = cy + 140, galvoX = cx + 60, galvoY = cy + 140;
            const radiusX = 22, radiusY = 48;
            
            // Draw circuit wires
            ctx.save(); ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; ctx.beginPath();
            // Wire 1: Coil left to Bulb top
            ctx.moveTo(cx - 80, cy + radiusY);
            ctx.lineTo(cx - 80, cy + 100);
            ctx.lineTo(bulbX, cy + 100);
            ctx.lineTo(bulbX, bulbY - 20);
            
            // Wire 2: Coil right to Galvanometer right terminal
            ctx.moveTo(cx + 80, cy + radiusY);
            ctx.lineTo(cx + 80, cy + 100);
            ctx.lineTo(galvoX + 12, cy + 100);
            ctx.lineTo(galvoX + 12, galvoY + 15);
            
            // Wire 3: Bulb bottom to Galvanometer left terminal
            ctx.moveTo(bulbX, bulbY + 20);
            ctx.lineTo(bulbX, cy + 175);
            ctx.lineTo(galvoX - 12, cy + 175);
            ctx.lineTo(galvoX - 12, galvoY + 15);
            ctx.stroke(); ctx.restore();

            const startX = cx - 80, endX = cx + 80, spacing = (endX - startX) / Math.max(1, turns);

            // Step 1: Draw back wires (behind the core)
            ctx.save();
            ctx.strokeStyle = '#78350f'; ctx.lineWidth = 4;
            for (let i = 0; i < turns; i++) {
                const x1 = startX + (i + 0.5) * spacing;
                const y1 = cy - radiusY;
                const x2 = startX + (i + 1) * spacing;
                const y2 = cy + radiusY;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.bezierCurveTo(x1 + spacing * 0.25, y1 + 5, x2 - spacing * 0.25, y2 - 5, x2, y2);
                ctx.stroke();
            }
            ctx.restore();

            // Step 2: Draw the iron core
            ctx.save();
            const coreGrad = ctx.createLinearGradient(cx - 100, 0, cx + 100, 0);
            coreGrad.addColorStop(0, '#334155'); coreGrad.addColorStop(0.5, '#94a3b8'); coreGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.roundRect(cx - 100, cy - 35, 200, 70, 8); ctx.fill();
            ctx.restore();

            // Step 3: Draw front wires (in front of the core)
            ctx.save();
            for (let i = 0; i < turns; i++) {
                const x1 = startX + i * spacing;
                const y1 = cy + radiusY;
                const x2 = startX + (i + 0.5) * spacing;
                const y2 = cy - radiusY;
                
                const copperGrad = ctx.createLinearGradient(x1, 0, x2, 0);
                copperGrad.addColorStop(0, '#b45309'); copperGrad.addColorStop(0.3, '#f59e0b'); copperGrad.addColorStop(0.6, '#d97706'); copperGrad.addColorStop(1, '#78350f');
                ctx.strokeStyle = copperGrad; ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.bezierCurveTo(x1 + spacing * 0.25, y1 - 5, x2 - spacing * 0.25, y2 + 5, x2, y2);
                ctx.stroke();
                
                // Draw particles gliding on the front wires
                if (step === 3 && Math.abs(current) > 0.02) {
                    ctx.fillStyle = '#fef08a';
                    const speedMultiplier = current * 0.15, particleT = (window.physicsLab.time * speedMultiplier + i / turns) % 1;
                    const t = (particleT + 1) % 1; // Ensure 0 <= t < 1
                    
                    const p0x = x1, p0y = y1;
                    const p1x = x1 + spacing * 0.25, p1y = y1 - 5;
                    const p2x = x2 - spacing * 0.25, p2y = y2 + 5;
                    const p3x = x2, p3y = y2;
                    
                    const mt = 1 - t;
                    const mt2 = mt * mt;
                    const mt3 = mt2 * mt;
                    const t2 = t * t;
                    const t3 = t2 * t;
                    
                    const px = mt3 * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * p3x;
                    const py = mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y;
                    
                    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
                    
                    if (t > 0.3 && t < 0.7) {
                        const tx = 3 * mt2 * (p1x - p0x) + 6 * mt * t * (p2x - p1x) + 3 * t2 * (p3x - p2x);
                        const ty = 3 * mt2 * (p1y - p0y) + 6 * mt * t * (p2y - p1y) + 3 * t2 * (p3y - p2y);
                        const angle = Math.atan2(ty, tx);
                        drawArrowHead(ctx, px, py, angle, 6, '#fef08a');
                    }
                }
            }
            ctx.restore();

            // Draw Bulb
            ctx.save(); ctx.translate(bulbX, bulbY);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, -10, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#64748b'; ctx.fillRect(-8, 6, 16, 10);
            ctx.strokeStyle = (step === 3 && Math.abs(current) > 0.02) ? '#fef08a' : '#475569'; ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-2, -6); ctx.lineTo(2, -6); ctx.lineTo(6, 2); ctx.stroke();
            
            if (step === 3 && Math.abs(current) > 0.02) {
                const glow = Math.min(1.0, Math.abs(current) * 1.8);
                const radGrad = ctx.createRadialGradient(0, -10, 2, 0, -10, 32 * glow);
                radGrad.addColorStop(0, 'rgba(253, 224, 71, ' + (glow * 0.85) + ')');
                radGrad.addColorStop(0.3, 'rgba(253, 224, 71, ' + (glow * 0.4) + ')');
                radGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
                ctx.fillStyle = radGrad; ctx.beginPath(); ctx.arc(0, -10, 32 * glow, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            
            // Draw Galvanometer
            ctx.save(); ctx.translate(galvoX, galvoY);
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(-15, -8); ctx.lineTo(-12, -6); ctx.moveTo(0, -18); ctx.lineTo(0, -15); ctx.moveTo(15, -8); ctx.lineTo(12, -6); ctx.stroke();
            labText(ctx, 'G', 0, 15, '#334155', 10, 'center');
            const needleAngle = (step === 3) ? Math.max(-Math.PI / 4, Math.min(Math.PI / 4, current * 2.2)) : 0;
            ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(18 * Math.sin(needleAngle), -18 * Math.cos(needleAngle)); ctx.stroke();
            
            // Draw + and - terminals
            ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(-12, 15, 3.5, 0, Math.PI * 2); ctx.fill();
            labText(ctx, '+', -12, 24, '#dc2626', 8, 'center');
            ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(12, 15, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.stroke();
            labText(ctx, '-', 12, 24, '#94a3b8', 8, 'center');
            ctx.restore();
        }

        function drawArrowHead(ctx, x, y, angle, size, color) {
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = labTone(color);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size, -size*0.45); ctx.lineTo(size, size*0.45); ctx.closePath(); ctx.fill();
            ctx.restore();
        }

        function drawInductionPhysicsVectors(ctx, w, h, fluxExt, deltaField, inducedField, totalField, step) {
            const cardX = 35, cardY = 32, cardW = 320, cardH = 150;
            ctx.save(); ctx.fillStyle = 'rgba(15, 32, 43, 0.88)'; ctx.beginPath(); ctx.roundRect(cardX, cardY, cardW, cardH, 8); ctx.fill();
            ctx.strokeStyle = '#25404d'; ctx.lineWidth = 2; ctx.stroke();
            labText(ctx, '磁場變化即時觀測', cardX + 16, cardY + 28, '#70d2d0', 16);
            const barLeft = cardX + 126, barW = 164, barH = 15;
            const showExt = document.getElementById('ind-show-ext') && document.getElementById('ind-show-ext').checked;
            const showInd = document.getElementById('ind-show-ind') && document.getElementById('ind-show-ind').checked;
            const showTot = document.getElementById('ind-show-tot') && document.getElementById('ind-show-tot').checked;
            const showChange = document.getElementById('ind-show-change') && document.getElementById('ind-show-change').checked;
            const extMax = 3.1;
            const changeMax = Math.max(0.15, Math.abs(deltaField), Math.abs(inducedField));

            if (showExt) {
                labRichText(ctx, ['B', { text: 'ext', sub: true }], cardX + 16, cardY + 60, '#60a5fa', 13);
                drawProgressBar(ctx, barLeft, cardY + 48, barW, barH, fluxExt, extMax, '#3b82f6');
            } else {
                labRichText(ctx, ['B', { text: 'ext', sub: true }, '（隱藏）'], cardX + 16, cardY + 60, '#526b76', 13);
                drawProgressBar(ctx, barLeft, cardY + 48, barW, barH, 0, 1, '#475569');
            }

            if (showChange && step >= 2) {
                labRichText(ctx, ['ΔB', { text: 'ext', sub: true }], cardX + 16, cardY + 90, '#f472b6', 13);
                drawProgressBar(ctx, barLeft, cardY + 78, barW, barH, deltaField, changeMax, '#ec4899');
            } else {
                labRichText(ctx, ['ΔB', { text: 'ext', sub: true }, step >= 2 ? '（隱藏）' : '（步驟 2）'], cardX + 16, cardY + 90, '#526b76', 13);
                drawProgressBar(ctx, barLeft, cardY + 78, barW, barH, 0, 1, '#475569');
            }

            if (showInd && step >= 3) {
                labRichText(ctx, ['B', { text: 'ind', sub: true }, ' = −ΔB'], cardX + 16, cardY + 120, '#34d399', 13);
                drawProgressBar(ctx, barLeft, cardY + 108, barW, barH, inducedField, changeMax, '#10b981');
            } else {
                labRichText(ctx, ['B', { text: 'ind', sub: true }, step >= 3 ? '（隱藏）' : '（步驟 3）'], cardX + 16, cardY + 120, '#526b76', 13);
                drawProgressBar(ctx, barLeft, cardY + 108, barW, barH, 0, 1, '#475569');
            }

            const vecY = 475, startVecX = w / 2 - 120, scaleVec = 40.0;
            ctx.fillStyle = 'rgba(7, 24, 33, 0.45)'; ctx.beginPath(); ctx.roundRect(startVecX - 60, vecY - 32, w / 2 + 10, 48, 6); ctx.fill();
            if (showExt) {
                drawVectorArrow(ctx, startVecX, vecY, fluxExt * scaleVec, '#3b82f6', ['B', { text: 'ext', sub: true }, '（外加磁場）']);
            } else {
                drawVectorArrow(ctx, startVecX, vecY, 0, '#475569', ['B', { text: 'ext', sub: true }, '（隱藏）']);
            }

            if (showInd && step >= 3) {
                drawVectorArrow(ctx, startVecX + 180, vecY, inducedField * 40, '#10b981', ['B', { text: 'ind', sub: true }, ' = −ΔB', { text: 'ext', sub: true }]);
            } else {
                drawVectorArrow(ctx, startVecX + 180, vecY, 0, '#475569', ['B', { text: 'ind', sub: true }, '（步驟 3）']);
            }

            if (showTot && step >= 3) {
                drawVectorArrow(ctx, startVecX + 360, vecY, totalField * scaleVec, '#f59e0b', ['B', { text: 'total', sub: true }, ' = B', { text: 'ext', sub: true }, ' + B', { text: 'ind', sub: true }]);
            } else {
                drawVectorArrow(ctx, startVecX + 360, vecY, 0, '#475569', ['B', { text: 'total', sub: true }, '（步驟 3）']);
            }
            ctx.restore();
        }

        function drawProgressBar(ctx, x, y, w, h, value, maxVal, color) {
            ctx.save(); ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 3); ctx.fill();
            ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
            const clampVal = Math.max(-maxVal, Math.min(maxVal, value)), fillW = (clampVal / maxVal) * (w / 2);
            ctx.fillStyle = labTone(color); ctx.beginPath();
            if (fillW >= 0) ctx.roundRect(x + w / 2, y + 1.5, fillW, h - 3, [0, 2, 2, 0]);
            else ctx.roundRect(x + w / 2 + fillW, y + 1.5, -fillW, h - 3, [2, 0, 0, 2]);
            ctx.fill(); ctx.restore();
        }

        function drawVectorArrow(ctx, x, y, length, color, label) {
            ctx.save(); ctx.strokeStyle = labTone(color); ctx.lineWidth = 4.5; ctx.lineCap = 'round';
            ctx.fillStyle = '#ffffffbb'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
            if (Array.isArray(label)) labRichText(ctx, label, x, y - 14, color, 12, 'center');
            else labText(ctx, label, x, y - 14, color, 12, 'center');
            if (Math.abs(length) > 2) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + length, y); ctx.stroke();
                drawArrowHead(ctx, x + length, y, (length > 0) ? 0 : Math.PI, 8, color);
            } else {
                ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
        }

        function drawPhotoGraph() {
            const canvas = document.getElementById('photo-graph-canvas');
            const modeEl = document.getElementById('photo-graph-mode');
            if (!canvas || !modeEl || modeEl.value === 'none') return;
            const ctx = canvas.getContext('2d'), v = photoValues(), mode = modeEl.value;
            const w = canvas.width, h = canvas.height, left = 82, right = 38, top = 38, bottom = 52, pw = w - left - right, ph = h - top - bottom;
            ctx.clearRect(0, 0, w, h); ctx.fillStyle = LAB_PALETTE.ink; ctx.fillRect(0, 0, w, h);
            if (mode === 'all') {
                drawPhotoResultsDashboard(ctx, w, h, v);
                return;
            }
            for (let x = left; x <= left + pw; x += pw / 8) labLine(ctx, x, top, x, top + ph, 'rgba(159,183,192,.1)', 1);
            for (let y = top; y <= top + ph; y += ph / 5) labLine(ctx, left, y, left + pw, y, 'rgba(159,183,192,.1)', 1);
            labLine(ctx, left, top + ph, left + pw, top + ph, '#b7d1d8', 2); labLine(ctx, left, top, left, top + ph, '#b7d1d8', 2);

            if (mode === 'voltage') {
                const xOf = voltage => left + (voltage + 5) / 10 * pw;
                const yOf = fraction => top + ph - fraction * ph * 0.84;
                const fraction = voltage => {
                    if (!v.emits || voltage <= -v.kmax) return 0;
                    const x = Math.max(0, Math.min(1, (voltage + v.kmax) / (v.saturationVoltage + v.kmax)));
                    return x * x * (3 - 2 * x);
                };
                ctx.strokeStyle = '#71d1cf'; ctx.lineWidth = 3; ctx.beginPath();
                for (let voltage = -5; voltage <= 5; voltage += 0.05) { const x = xOf(voltage), y = yOf(fraction(voltage)); voltage === -5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
                if (v.emits) labLine(ctx, xOf(-v.kmax), top + ph - 5, xOf(-v.kmax), top + ph + 7, '#ff7f98', 2);
                labLine(ctx, xOf(v.voltage), top, xOf(v.voltage), top + ph, '#ffc36b', 2, [6, 5]);
                labText(ctx, 'I / Isat', 22, top + ph / 2, '#bcd0d6', 14); labText(ctx, '電池電壓 V', left + pw / 2, h - 12, '#bcd0d6', 14, 'center');
                labText(ctx, '典型曲線；過渡形狀依電子分布與電極幾何', left + pw, 24, '#ffbf69', 13, 'right');
            } else if (mode === 'irradiance') {
                const xOf = value => left + value / 100 * pw;
                const maxCurrent = v.emits ? v.saturationCurrentUA * 100 / v.irradiance : 1;
                const yOf = current => top + ph - current / Math.max(1e-12, maxCurrent) * ph * 0.86;
                labLine(ctx, xOf(0), yOf(0), xOf(100), yOf(maxCurrent), '#71d1cf', 3);
                ctx.fillStyle = '#ffc36b'; ctx.beginPath(); ctx.arc(xOf(v.irradiance), yOf(v.saturationCurrentUA), 6, 0, Math.PI * 2); ctx.fill();
                labText(ctx, 'Isat（μA）', 18, top + ph / 2, '#bcd0d6', 14); labText(ctx, '輻照度 Eₑ（W/m²）', left + pw / 2, h - 12, '#bcd0d6', 14, 'center');
                labText(ctx, v.emits ? '固定波長、面積與 η：Isat ∝ Eₑ' : 'hf < W：全範圍 Isat = 0', left + pw, 24, v.emits ? '#71d1cf' : '#ff7f98', 13, 'right');
            } else {
                const hEv = 4.135667696e-15, fMin = 2.5, fMax = 18;
                const xOf = f14 => left + (f14 - fMin) / (fMax - fMin) * pw;
                const maxK = Math.max(0.1, hEv * fMax * 1e14 - v.work);
                const yOf = energy => top + ph - energy / maxK * ph * 0.86;
                const f0 = v.work / hEv / 1e14;
                ctx.strokeStyle = '#71d1cf'; ctx.lineWidth = 3; ctx.beginPath();
                for (let f14 = Math.max(fMin, f0); f14 <= fMax; f14 += 0.05) { const k = hEv * f14 * 1e14 - v.work; f14 <= Math.max(fMin, f0) + 0.05 ? ctx.moveTo(xOf(f14), yOf(k)) : ctx.lineTo(xOf(f14), yOf(k)); } ctx.stroke();
                const currentF = 299792458 / (v.nm * 1e-9) / 1e14;
                ctx.fillStyle = '#ffc36b'; ctx.beginPath(); ctx.arc(xOf(currentF), yOf(v.kmax), 6, 0, Math.PI * 2); ctx.fill();
                labText(ctx, 'Kmax（eV）', 16, top + ph / 2, '#bcd0d6', 14); labText(ctx, '頻率 f（×10¹⁴ Hz）', left + pw / 2, h - 12, '#bcd0d6', 14, 'center');
                labText(ctx, '斜率 = h；橫軸截距 = f₀ = W/h', left + pw, 24, '#71d1cf', 13, 'right');
            }
        }

        function drawPhotoResultsDashboard(ctx, w, h, v) {
            ctx.fillStyle = LAB_PALETTE.ink; ctx.fillRect(0, 0, w, h);
            const panelW = 300, panelH = 268, panelY = 16;
            const panelXs = [12, 330, 648];
            const panels = panelXs.map(x => ({ x, y: panelY, w: panelW, h: panelH, left: x + 42, top: panelY + 52, pw: panelW - 60, ph: 158 }));
            panels.forEach(panel => {
                ctx.fillStyle = 'rgba(20,47,59,.82)'; ctx.beginPath(); ctx.roundRect(panel.x, panel.y, panel.w, panel.h, 10); ctx.fill();
                ctx.strokeStyle = '#294754'; ctx.lineWidth = 1.5; ctx.stroke();
                for (let i = 1; i < 4; i++) labLine(ctx, panel.left, panel.top + panel.ph * i / 4, panel.left + panel.pw, panel.top + panel.ph * i / 4, 'rgba(159,183,192,.1)', 1);
                labLine(ctx, panel.left, panel.top + panel.ph, panel.left + panel.pw, panel.top + panel.ph, '#9db9c1', 1.5);
                labLine(ctx, panel.left, panel.top, panel.left, panel.top + panel.ph, '#9db9c1', 1.5);
            });

            // A. I–V：兩種光強有不同飽和電流，但共用同一截止電壓。
            const a = panels[0], xV = voltage => a.left + (voltage + 5) / 10 * a.pw, yI = fraction => a.top + a.ph - fraction * a.ph * 0.84;
            const fraction = voltage => {
                if (!v.emits || voltage <= -v.kmax) return 0;
                const x = Math.max(0, Math.min(1, (voltage + v.kmax) / (v.saturationVoltage + v.kmax)));
                return x * x * (3 - 2 * x);
            };
            [[1, '#71d1cf', []], [0.48, '#7fa5b0', [6, 5]]].forEach(curve => {
                ctx.save(); ctx.strokeStyle = curve[1]; ctx.lineWidth = 2.5; ctx.setLineDash(curve[2]); ctx.beginPath();
                for (let voltage = -5; voltage <= 5; voltage += 0.08) { const x = xV(voltage), y = yI(fraction(voltage) * curve[0]); voltage === -5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore();
            });
            if (v.emits) labLine(ctx, xV(-v.kmax), a.top + a.ph - 4, xV(-v.kmax), a.top + a.ph + 7, '#ff7f98', 2);
            labText(ctx, 'A｜光電流—電壓', a.x + 14, a.y + 25, '#eef7f8', 15);
            labText(ctx, '高／低光強：Isat 不同，Vs 相同', a.x + 14, a.y + 44, '#9fc3cc', 11);
            labText(ctx, 'V', a.left + a.pw / 2, a.y + a.h - 14, '#9fb7c0', 12, 'center'); labText(ctx, 'I', a.left - 18, a.top + a.ph / 2, '#9fb7c0', 12);

            // B. 固定頻率高於底限時，飽和電流與輻照度成正比。
            const b = panels[1], xE = value => b.left + value / 100 * b.pw, ySat = fraction => b.top + b.ph - fraction * b.ph * 0.84;
            if (v.emits) labLine(ctx, xE(0), ySat(0), xE(100), ySat(1), '#71d1cf', 2.8);
            else labLine(ctx, xE(0), ySat(0), xE(100), ySat(0), '#ff7f98', 2.8);
            ctx.fillStyle = '#ffc36b'; ctx.beginPath(); ctx.arc(xE(v.irradiance), ySat(v.emits ? v.irradiance / 100 : 0), 5, 0, Math.PI * 2); ctx.fill();
            labText(ctx, 'B｜飽和電流—輻照度', b.x + 14, b.y + 25, '#eef7f8', 15);
            labText(ctx, v.emits ? '固定 f、材質：Isat ∝ Eₑ' : 'f < f₀：再強仍無光電流', b.x + 14, b.y + 44, v.emits ? '#9fc3cc' : '#ff9bad', 11);
            labText(ctx, 'Eₑ', b.left + b.pw / 2, b.y + b.h - 14, '#9fb7c0', 12, 'center'); labText(ctx, 'Isat', b.left - 28, b.top + b.ph / 2, '#9fb7c0', 11);

            // C. 最大動能—頻率：斜率 h，橫軸截距 f₀。
            const c = panels[2], hEv = 4.135667696e-15, fMin = 2.5, fMax = 18;
            const xF = f14 => c.left + (f14 - fMin) / (fMax - fMin) * c.pw;
            const maxK = Math.max(0.1, hEv * fMax * 1e14 - v.work), yK = energy => c.top + c.ph - energy / maxK * c.ph * 0.84;
            const f0 = v.work / hEv / 1e14;
            ctx.strokeStyle = '#71d1cf'; ctx.lineWidth = 2.8; ctx.beginPath();
            for (let f14 = Math.max(fMin, f0); f14 <= fMax; f14 += 0.08) { const energy = hEv * f14 * 1e14 - v.work; f14 <= Math.max(fMin, f0) + 0.08 ? ctx.moveTo(xF(f14), yK(energy)) : ctx.lineTo(xF(f14), yK(energy)); } ctx.stroke();
            const currentF = 299792458 / (v.nm * 1e-9) / 1e14;
            ctx.fillStyle = '#ffc36b'; ctx.beginPath(); ctx.arc(xF(currentF), yK(v.kmax), 5, 0, Math.PI * 2); ctx.fill();
            labText(ctx, 'C｜最大動能—頻率', c.x + 14, c.y + 25, '#eef7f8', 15);
            labText(ctx, 'Kmax = hf − W；斜率 = h', c.x + 14, c.y + 44, '#9fc3cc', 11);
            labText(ctx, 'f', c.left + c.pw / 2, c.y + c.h - 14, '#9fb7c0', 12, 'center'); labText(ctx, 'Kmax', c.left - 34, c.top + c.ph / 2, '#9fb7c0', 11);

            labText(ctx, '共同觀察：光電子無可測發射延遲；提高光強不改變 Kmax 或 Vs', w / 2, h - 5, '#f7d66f', 12, 'center');
        }

        function planck(lambdaM, temp) {
            const h = 6.62607015e-34, c = 299792458, k = 1.380649e-23;
            const exponent = h * c / (lambdaM * k * temp);
            return (2 * h * c * c) / (Math.pow(lambdaM, 5) * (Math.exp(Math.min(exponent, 700)) - 1));
        }

        function rayleighJeans(lambdaM, temp) {
            const c = 299792458, k = 1.380649e-23;
            return 2 * c * k * temp / Math.pow(lambdaM, 4);
        }

        function scientificLabel(value) {
            if (!Number.isFinite(value) || value === 0) return '0';
            const exponent = Math.floor(Math.log10(Math.abs(value)));
            const mantissa = value / Math.pow(10, exponent);
            return `${mantissa.toFixed(1)}×10^${exponent}`;
        }

        function fluxLabel(value) {
            if (value >= 1e6) return `${(value / 1e6).toFixed(2)} MW/m²`;
            if (value >= 1e3) return `${(value / 1e3).toFixed(2)} kW/m²`;
            return `${value.toFixed(2)} W/m²`;
        }

        function blackbodyBand(nm) {
            if (nm < 380) return '紫外線';
            if (nm <= 750) return '可見光';
            return '紅外線';
        }

        function temperatureColor(temp) {
            const x = Math.max(1000, Math.min(12000, temp));
            if (x < 3000) return '#ff7657';
            if (x < 5000) return '#ffb66d';
            if (x < 7000) return '#fff4cf';
            if (x < 9000) return '#bde1ff';
            return '#7cb9ff';
        }

        function drawBlackbodyLab() {
            const setup = prepLabCanvas('blackbody-canvas');
            if (!setup || !document.getElementById('bb-temp')) return;
            const { ctx, w, h } = setup;
            const temp = labNumber('bb-temp'), maxNm = labNumber('bb-range');
            const showSun = document.getElementById('bb-sun').checked;
            const showRj = document.getElementById('bb-rj').checked;
            const scaleMode = document.getElementById('bb-scale').value;
            const left = 112, right = 38, top = 48, bottom = 76, pw = w - left - right, ph = h - top - bottom;
            const minNm = 100, sunT = 5778, samples = 420;
            const curves = [{ temp, color: temperatureColor(temp), label: `Planck ${temp} K`, law: 'planck' }];
            if (showSun && temp !== sunT) curves.push({ temp: sunT, color: '#f7d66f', label: 'Planck 太陽 5778 K', dash: [8, 6], law: 'planck' });
            if (showRj) curves.push({ temp, color: '#ff7f98', label: `Rayleigh–Jeans ${temp} K`, dash: [4, 5], law: 'rj' });
            let maxB = 0, minPositive = Infinity;
            curves.forEach(curve => {
                curve.points = [];
                for (let i = 0; i <= samples; i++) {
                    const nm = minNm + (maxNm - minNm) * i / samples;
                    const perMeter = curve.law === 'rj' ? rayleighJeans(nm * 1e-9, curve.temp) : planck(nm * 1e-9, curve.temp);
                    const b = perMeter * 1e-9; // 轉為每 nm 的光譜輻射亮度
                    curve.points.push({ nm, b });
                    maxB = Math.max(maxB, b);
                    if (b > 0) minPositive = Math.min(minPositive, b);
                }
            });
            const lockScale = document.getElementById('bb-lock-scale').checked;
            if (lockScale) {
                const sunPeakNm = 2.897771955e6 / 5778;
                const sunPeakB = planck(sunPeakNm * 1e-9, 5778) * 1e-9;
                maxB = sunPeakB * 1.25;
            }
            const xOf = nm => left + (nm - minNm) / (maxNm - minNm) * pw;
            const logMax = Math.log10(maxB);
            const logMin = Math.max(Math.log10(minPositive), logMax - 8);
            const yOf = b => {
                if (scaleMode === 'log') {
                    const normalized = (Math.log10(Math.max(b, Math.pow(10, logMin))) - logMin) / Math.max(1e-12, logMax - logMin);
                    return top + ph - normalized * ph;
                }
                return top + ph - b / maxB * ph;
            };
            const visibleStart = xOf(380), visibleEnd = xOf(Math.min(750, maxNm));
            if (visibleEnd > visibleStart) {
                const grad = ctx.createLinearGradient(visibleStart, 0, visibleEnd, 0);
                ['#6d28d9','#2563eb','#16a34a','#eab308','#f97316','#dc2626'].forEach((c, i, a) => grad.addColorStop(i / (a.length - 1), c));
                ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = grad; ctx.fillRect(visibleStart, top, visibleEnd - visibleStart, ph); ctx.restore();
            }
            labLine(ctx, left, top, left, top + ph, '#b7d1d8', 2); labLine(ctx, left, top + ph, left + pw, top + ph, '#b7d1d8', 2);
            for (let nm = 500; nm <= maxNm; nm += 500) { const x = xOf(nm); labLine(ctx, x, top + ph, x, top + ph + 8, '#b7d1d8', 1); labText(ctx, String(nm), x, top + ph + 30, '#9fb7c0', 13, 'center'); }
            for (let i = 0; i <= 4; i++) {
                const y = top + ph - ph * i / 4;
                labLine(ctx, left, y, left + pw, y, 'rgba(159,183,192,.15)', 1);
                const value = scaleMode === 'log'
                    ? Math.pow(10, logMin + (logMax - logMin) * i / 4)
                    : maxB * i / 4;
                labText(ctx, scientificLabel(value), left - 10, y + 4, '#9fb7c0', 11, 'right');
            }
            labText(ctx, '波長 λ（nm）', left + pw / 2, h - 16, '#b7d1d8', 16, 'center');
            ctx.save(); ctx.translate(22, top + ph / 2); ctx.rotate(-Math.PI / 2); labText(ctx, 'Bλ（W·m⁻²·sr⁻¹·nm⁻¹）', 0, 0, '#b7d1d8', 14, 'center'); ctx.restore();
            curves.forEach((curve, index) => {
                ctx.save(); ctx.strokeStyle = labTone(curve.color); ctx.lineWidth = index === 0 ? 4 : 2.5; ctx.setLineDash(curve.dash || []); ctx.beginPath();
                curve.points.forEach((p, i) => { const x = xOf(p.nm), y = yOf(p.b); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); ctx.restore();
                labText(ctx, curve.label, w - 48, 38 + index * 23, curve.color, 14, 'right');
            });
            const peak = 2.897771955e6 / temp;
            const peakB = planck(peak * 1e-9, temp) * 1e-9;
            const px = xOf(peak), py = yOf(peakB);
            if (peak >= minNm && peak <= maxNm) { labLine(ctx, px, py, px, top + ph, temperatureColor(temp), 1.5, [6, 5]); ctx.fillStyle = temperatureColor(temp); ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill(); }
            if (showRj) labText(ctx, '短波端古典曲線發散＝紫外災難', left + 18, top + 25, '#ff9bad', 14);
            const sigma = 5.670374419e-8;
            const flux = sigma * Math.pow(temp, 4);
            document.getElementById('bb-temp-out').textContent = `${temp} K`;
            document.getElementById('bb-range-out').textContent = `100–${maxNm} nm`;
            document.getElementById('bb-peak-readout').textContent = `${Math.round(peak)} nm`;
            document.getElementById('bb-band-readout').textContent = blackbodyBand(peak);
            document.getElementById('bb-flux-readout').textContent = fluxLabel(flux);
            document.getElementById('bb-power-readout').textContent = `${Math.pow(temp / sunT, 4).toFixed(2)}×`;
        }

        let hertzExperimentState = null;

        function hertzExperimentHtml() {
            return `
                <div class="hertz-history-lab" id="hertz-history-lab">
                    <div class="hertz-history-head">
                        <div>
                            <div class="hertz-history-kicker">Prediction → Evidence</div>
                            <h4>赫茲火花實驗：把馬克士威的預測變成可觀察證據</h4>
                            <p>操作發射火花、改變接收環距離與方向，觀察接收端是否出現微小火花。動畫時間已刻意放慢，方便看清證據鏈。</p>
                        </div>
                        <span class="hertz-curriculum-badge">課綱 PKa-Vc-7｜定性、不推導</span>
                    </div>
                    <div class="hertz-history-body">
                        <div class="hertz-canvas-card">
                            <canvas id="hertz-history-canvas" width="900" height="390" role="img" aria-label="赫茲火花發射器、電磁波傳播與接收環火花的互動示意圖">
                                瀏覽器不支援 Canvas，請閱讀右側實驗步驟。
                            </canvas>
                            <div class="hertz-stage-caption" aria-live="polite">
                                <span class="hertz-stage-pill" id="hertz-stage-pill">待機</span>
                                <span id="hertz-stage-message">按下「發射一次」，從發射端火花開始觀察。</span>
                            </div>
                        </div>
                        <aside class="hertz-control-panel" aria-label="赫茲實驗操作面板">
                            <h5>實驗操作</h5>
                            <div class="hertz-control-buttons">
                                <button class="hertz-control-btn primary wide" id="hertz-fire-btn" type="button">⚡ 發射一次</button>
                                <button class="hertz-control-btn" id="hertz-auto-btn" type="button" aria-pressed="false">▶ 連續演示</button>
                                <button class="hertz-control-btn" id="hertz-reset-btn" type="button">↺ 重設</button>
                            </div>
                            <div class="hertz-slider-group">
                                <label for="hertz-distance">
                                    <span>發射端至接收環距離</span>
                                    <output id="hertz-distance-out">3 m</output>
                                </label>
                                <input id="hertz-distance" type="range" min="1" max="5" value="3" step="0.5">
                            </div>
                            <div class="hertz-slider-group">
                                <label for="hertz-angle">
                                    <span>接收環法線與磁場夾角</span>
                                    <output id="hertz-angle-out">0°（對準）</output>
                                </label>
                                <input id="hertz-angle" type="range" min="0" max="90" value="0" step="15">
                            </div>
                            <div class="hertz-readouts">
                                <div class="hertz-readout">
                                    <span>相對接收強度（模型）</span>
                                    <strong id="hertz-coupling-out">11%</strong>
                                </div>
                                <div class="hertz-readout">
                                    <span>接收訊號（定性）</span>
                                    <strong id="hertz-signal-out">待發射</strong>
                                </div>
                                <div class="hertz-readout">
                                    <span>接收端觀察</span>
                                    <strong id="hertz-spark-out">尚無火花</strong>
                                </div>
                            </div>
                            <div class="hertz-apparatus-legend" aria-label="裝置配色圖例">
                                <span><i class="hertz-legend-dot" style="background:#2563a8;"></i>藍色：偶極左半與高壓次級左端</span>
                                <span><i class="hertz-legend-dot" style="background:#c76b24;"></i>橙色：偶極右半與高壓次級右端</span>
                                <span><i class="hertz-legend-dot" style="background:#6f8991;"></i>灰框：高壓脈衝電源，內部電路不展開</span>
                            </div>
                            <div class="hertz-evidence">
                                <strong>證據怎麼讀：</strong>
                                發射端與接收端沒有導線相連；接收環仍出現火花，支持「電磁擾動可以在空間中傳遞」。距離變遠或把接收環轉成正交時，接收現象會變弱。
                            </div>
                        </aside>
                    </div>
                    <div class="hertz-model-strip">
                        <strong>教學模型：</strong>
                        接收環感應到的訊號強度會隨「距離變遠」與「法線偏離磁場方向（角度變大）」而減弱，模型中的相對接收強度以
                        $I_r/I_0\\approx(1\\text{ m}/r)^2\\cos^2\\theta$ 簡化顯示。這只用來比較趨勢，不代表原實驗的精密量測值。
                        方框把電池、斷續器、一次側與二次側統整為「高壓脈衝電源」；圖中只保留兩個高壓輸出端，分別連到發射偶極的左右兩半。
                    </div>
                </div>
            `;
        }

        function hertzVideoPlayerHtml() {
            const videoUrl = 'https://www.youtube.com/watch?v=26Cs4CRwUj8';
            if (window.location.protocol === 'file:') {
                return `
                    <a class="hertz-video-fallback" href="${videoUrl}" target="_blank" rel="noopener noreferrer" aria-label="前往 YouTube 觀看 Hertz experiment">
                        <img src="https://i.ytimg.com/vi/26Cs4CRwUj8/hqdefault.jpg" alt="Hertz experiment 影片預覽圖" loading="lazy">
                        <span class="hertz-video-fallback-content">
                            <span class="hertz-video-play" aria-hidden="true">▶</span>
                            <strong>前往 YouTube 觀看實物實驗</strong>
                            <small>目前是本機檔案模式；為避免播放器錯誤 153，影片將在 YouTube 開啟。</small>
                        </span>
                    </a>
                `;
            }
            return `
                <iframe
                    src="https://www.youtube-nocookie.com/embed/26Cs4CRwUj8"
                    title="Hertz experiment 實物示範"
                    loading="lazy"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen></iframe>
            `;
        }

        function renderHertzExperimentView() {
            const main = document.getElementById('main-content');
            main.innerHTML = `
                <div class="content-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
                    <div>
                        <span class="content-badge">N18 專屬實驗｜電磁波的發射與接收</span>
                        <h2 class="content-title">從加速電荷到赫茲火花實驗</h2>
                        <p class="content-subtitle">先比較靜止、等速與加速電荷，再判斷 $\\vec E$、$\\vec B$ 與傳播方向，最後以赫茲裝置檢驗電磁波能跨越空間。</p>
                    </div>
                    <button class="print-btn print-hide" type="button" onclick="window.print()"><span>🖨️</span> 列印實驗說明</button>
                </div>

                ${dipoleAntennaHtml()}
                ${emWaveDirectionRuleHtml()}

                <div class="handout-section-title" style="margin-top:2rem;">⚡ 實驗驗證：赫茲如何發射與接收電磁波</div>

                <div class="hertz-dedicated-intro">
                    <article class="hertz-video-card">
                        <div class="hertz-video-frame">
                            ${hertzVideoPlayerHtml()}
                        </div>
                        <div class="hertz-video-meta">
                            實物對照：Rex.Prototypes™ 的
                            <a href="https://youtube.com/shorts/26Cs4CRwUj8" target="_blank" rel="noopener noreferrer">Hertz experiment</a>。
                            影片以直線電極重製發射與接收火花隙；下方動畫改用赫茲經典的開口接收環，兩者都在觀察「無導線連接時，接收端仍出現放電」。
                        </div>
                    </article>

                    <article class="hertz-guide-card">
                        <h3>先辨認裝置，再開始操作</h3>
                        <ol>
                            <li><strong>發射端：</strong>兩根共線偶極導體的外端接電容端板，內端是球形火花隙；「高壓脈衝電源」方框的兩個輸出端分別接到偶極左右兩半。</li>
                            <li><strong>放電瞬間：</strong>端板電位差超過空氣擊穿條件後，火花隙短暫導通，偶極中的電荷來回振盪並形成快速衰減的電磁波脈衝。</li>
                            <li><strong>空間：</strong>發射端與接收端沒有電線連接，能量不是沿著導線傳過去。</li>
                            <li><strong>接收端：</strong>獨立的單匝共振環沒有電源；電磁波在環中激起振盪，當可調開口兩端電壓足夠高時才出現微小火花。</li>
                        </ol>
                        <div class="hertz-question">
                            <strong>操作任務：</strong>先在 $r=3\\text{ m}$、$\\theta=0^\\circ$ 發射；再只改變一個變因。比較距離增大、接收環轉到 $90^\\circ$ 時，接收火花有何變化。
                        </div>
                        <div class="hertz-question">
                            <strong>安全提醒：</strong>真實裝置涉及高電壓、火花放電與電磁干擾；課堂應使用合格設備並由教師操作，不要依影片自行仿作。
                        </div>
                    </article>
                </div>

                ${hertzExperimentHtml()}

                <div class="hertz-explanation-grid">
                    <article class="hertz-explain-card">
                        <h3>為什麼能發射？</h3>
                        <p>火花不是電磁波本身。放電使電荷快速加速並造成電流急遽變化，因而產生隨時間變化的電場與磁場；這個擾動會帶著能量向外傳播。</p>
                    </article>
                    <article class="hertz-explain-card">
                        <h3>為什麼能接收？</h3>
                        <p>電磁波抵達接收環時，穿過環面的磁力線數目隨時間改變，形成感應電流。接收端的小火花，是擾動已跨越空間並在另一套裝置造成作用的可見證據。</p>
                    </article>
                    <article class="hertz-explain-card">
                        <h3>這證明了什麼？</h3>
                        <p>赫茲以實驗支持馬克士威的預測：變動的電場與磁場可以形成電磁波，且光也屬於電磁波。所有真空中的電磁波都滿足 $c=f\\lambda$。</p>
                    </article>
                </div>

                <div class="hertz-model-strip">
                    <strong>不要誤判：</strong>接收端火花不是發射端火花「跳過很遠的空氣」；它是接收環內新產生的放電。畫面中的波紋、傳播時間與裝置尺寸都已放大或放慢，只用來呈現因果順序。
                </div>

                <div style="margin-top:1.4rem;">
                    <button class="route-link-btn print-hide" type="button" onclick="navigateTo('node-N18')">← 回到 N18 電磁波與電磁波譜</button>
                </div>
            `;
            scheduleMathJax([main]);
            initDipoleConceptLab();
            initHertzExperiment();
            window.scrollTo(0, 0);
        }

        function initHertzExperiment() {
            const canvas = document.getElementById('hertz-history-canvas');
            if (!canvas) return;
            if (hertzExperimentState) hertzExperimentState.destroy();

            const ctx = canvas.getContext('2d');
            const fireBtn = document.getElementById('hertz-fire-btn');
            const autoBtn = document.getElementById('hertz-auto-btn');
            const resetBtn = document.getElementById('hertz-reset-btn');
            const distanceInput = document.getElementById('hertz-distance');
            const angleInput = document.getElementById('hertz-angle');
            const distanceOut = document.getElementById('hertz-distance-out');
            const angleOut = document.getElementById('hertz-angle-out');
            const couplingOut = document.getElementById('hertz-coupling-out');
            const signalOut = document.getElementById('hertz-signal-out');
            const sparkOut = document.getElementById('hertz-spark-out');
            const stagePill = document.getElementById('hertz-stage-pill');
            const stageMessage = document.getElementById('hertz-stage-message');
            if (!ctx || !fireBtn || !autoBtn || !resetBtn || !distanceInput || !angleInput) return;

            const listeners = [];
            const reduceMotion = PhysicsRuntime.prefersReducedMotion();
            const state = {
                phase: 0,
                running: false,
                auto: false,
                fired: false,
                detected: false,
                raf: null,
                lastTime: 0,
                clock: PhysicsRuntime.createFixedClock({ stepHz: 120 }),
                duration: 2.7,
                width: 0,
                height: 0,
                dpr: 1,
                resizeObserver: null,
                destroyed: false
            };

            function listen(element, type, handler) {
                element.addEventListener(type, handler);
                listeners.push([element, type, handler]);
            }

            function values() {
                return {
                    distance: Number(distanceInput.value),
                    angle: Number(angleInput.value)
                };
            }

            function coupling() {
                const { distance, angle } = values();
                const distanceFactor = 1 / Math.pow(distance, 2);
                const orientationFactor = Math.pow(Math.cos(angle * Math.PI / 180), 2);
                return Math.max(0, distanceFactor * orientationFactor);
            }

            function canDetect() {
                return coupling() >= 0.07;
            }

            function geometry() {
                const { distance, angle } = values();
                const t = (distance - 1) / 4;
                const source = { x: state.width * 0.22, y: state.height * 0.48 };
                const receiver = {
                    x: state.width * (0.62 + 0.18 * t),
                    y: state.height * 0.48,
                    r: Math.max(34, Math.min(55, state.width * 0.065)),
                    tilt: angle * Math.PI / 180
                };
                return { source, receiver };
            }

            function drawSpark(x, y, scale, color) {
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1.5, 2.3 * scale);
                ctx.shadowColor = color;
                ctx.shadowBlur = 12 * scale;
                ctx.beginPath();
                ctx.moveTo(x - 12 * scale, y);
                ctx.lineTo(x - 5 * scale, y - 8 * scale);
                ctx.lineTo(x - scale, y + 3 * scale);
                ctx.lineTo(x + 5 * scale, y - 6 * scale);
                ctx.lineTo(x + 12 * scale, y);
                ctx.stroke();
                ctx.restore();
            }

            function drawArrow(x1, y1, x2, y2, color) {
                const angle = Math.atan2(y2 - y1, x2 - x1);
                ctx.save();
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 - 8 * Math.cos(angle - Math.PI / 6), y2 - 8 * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(x2 - 8 * Math.cos(angle + Math.PI / 6), y2 - 8 * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            function drawTransmitter(source) {
                const narrow = state.width < 620;
                const rodHalf = Math.max(40, Math.min(82, state.width * 0.085));
                const plateW = narrow ? 12 : 18;
                const plateH = narrow ? 44 : 58;
                const gapBallR = narrow ? 5.5 : 7;
                const leftColor = '#2563a8';
                const rightColor = '#c76b24';
                const leftRodOuter = source.x - rodHalf;
                const rightRodOuter = source.x + rodHalf;
                const leftGapX = source.x - 9;
                const rightGapX = source.x + 9;

                // Hertzian dipole: two collinear conductors, capacitive end plates, and a central ball gap.
                ctx.fillStyle = 'rgba(37, 99, 168, 0.15)';
                ctx.strokeStyle = leftColor;
                ctx.lineWidth = 2;
                ctx.fillRect(leftRodOuter - plateW, source.y - plateH / 2, plateW, plateH);
                ctx.strokeRect(leftRodOuter - plateW, source.y - plateH / 2, plateW, plateH);
                ctx.fillStyle = 'rgba(199, 107, 36, 0.16)';
                ctx.strokeStyle = rightColor;
                ctx.fillRect(rightRodOuter, source.y - plateH / 2, plateW, plateH);
                ctx.strokeRect(rightRodOuter, source.y - plateH / 2, plateW, plateH);

                ctx.lineCap = 'round';
                ctx.lineWidth = narrow ? 4 : 5;
                ctx.strokeStyle = leftColor;
                ctx.beginPath();
                ctx.moveTo(leftRodOuter, source.y);
                ctx.lineTo(leftGapX - gapBallR, source.y);
                ctx.stroke();
                ctx.strokeStyle = rightColor;
                ctx.beginPath();
                ctx.moveTo(rightGapX + gapBallR, source.y);
                ctx.lineTo(rightRodOuter, source.y);
                ctx.stroke();
                ctx.lineCap = 'butt';

                ctx.fillStyle = leftColor;
                ctx.beginPath();
                ctx.arc(leftGapX, source.y, gapBallR, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = rightColor;
                ctx.beginPath();
                ctx.arc(rightGapX, source.y, gapBallR, 0, Math.PI * 2);
                ctx.fill();

                const coilW = Math.max(104, Math.min(142, state.width * 0.2));
                const coilH = narrow ? 52 : 58;
                const coilX = source.x - coilW / 2;
                const coilY = source.y + (narrow ? 68 : 75);
                const secondaryLeft = coilX + 19;
                const secondaryRight = coilX + coilW - 19;
                const leftTapX = source.x - Math.min(44, rodHalf * 0.62);
                const rightTapX = source.x + Math.min(44, rodHalf * 0.62);
                const leadLevel = source.y + (narrow ? 32 : 39);

                // The two high-voltage secondary terminals charge the two halves separately.
                ctx.lineWidth = 2.2;
                ctx.strokeStyle = leftColor;
                ctx.beginPath();
                ctx.moveTo(leftTapX, source.y);
                ctx.lineTo(leftTapX, leadLevel);
                ctx.lineTo(secondaryLeft, leadLevel);
                ctx.lineTo(secondaryLeft, coilY);
                ctx.stroke();
                ctx.strokeStyle = rightColor;
                ctx.beginPath();
                ctx.moveTo(rightTapX, source.y);
                ctx.lineTo(rightTapX, leadLevel);
                ctx.lineTo(secondaryRight, leadLevel);
                ctx.lineTo(secondaryRight, coilY);
                ctx.stroke();
                [
                    [leftTapX, source.y, leftColor],
                    [rightTapX, source.y, rightColor],
                    [secondaryLeft, coilY, leftColor],
                    [secondaryRight, coilY, rightColor]
                ].forEach(([x, y, color]) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Functional block: internal battery, interrupter, iron core and windings are intentionally abstracted.
                ctx.fillStyle = '#f7fbfb';
                ctx.strokeStyle = '#6f8991';
                ctx.lineWidth = 1.7;
                ctx.beginPath();
                ctx.roundRect(coilX, coilY, coilW, coilH, 8);
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = leftColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(coilX + 1, coilY + 1);
                ctx.lineTo(source.x, coilY + 1);
                ctx.stroke();
                ctx.strokeStyle = rightColor;
                ctx.beginPath();
                ctx.moveTo(source.x, coilY + 1);
                ctx.lineTo(coilX + coilW - 1, coilY + 1);
                ctx.stroke();
                ctx.fillStyle = '#244954';
                ctx.textAlign = 'center';
                ctx.font = `800 ${narrow ? 11 : 13}px "Noto Sans TC", sans-serif`;
                ctx.fillText('高壓脈衝電源', source.x, coilY + 25);
                ctx.fillStyle = '#648089';
                ctx.font = `${narrow ? 9 : 10}px "Noto Sans TC", sans-serif`;
                ctx.fillText('Ruhmkorff 感應線圈', source.x, coilY + 42);

                if (state.running && state.phase < 0.14) drawSpark(source.x, source.y, 1.05, '#f6a51c');
                ctx.textAlign = 'center';
                ctx.fillStyle = '#244954';
                ctx.font = `700 ${narrow ? 11 : 13}px "Noto Sans TC", sans-serif`;
                ctx.fillText(narrow ? '發射器：偶極＋球形火花隙' : '發射器：電容端板—偶極導體—球形火花隙', source.x, source.y - plateH / 2 - 23);
                ctx.fillStyle = '#6a8188';
                ctx.font = `${narrow ? 10 : 11}px "Noto Sans TC", sans-serif`;
                ctx.fillText('A', leftRodOuter - plateW / 2, source.y - plateH / 2 - 7);
                ctx.fillText('A′', rightRodOuter + plateW / 2, source.y - plateH / 2 - 7);
                if (!narrow) ctx.fillText('高壓次級左右分接', source.x, source.y - plateH / 2 - 7);
                ctx.fillStyle = '#8c5b22';
                ctx.font = `700 ${narrow ? 9 : 10}px "Noto Sans TC", sans-serif`;
                ctx.fillText('D 火花隙', source.x, source.y - gapBallR - 8);
            }

            function drawReceiver(receiver, receiverSpark) {
                const projectedRx = receiver.r * (0.22 + 0.78 * Math.cos(receiver.tilt));
                const topY = receiver.y - receiver.r;

                ctx.save();
                ctx.translate(receiver.x, receiver.y);
                ctx.strokeStyle = '#8b5b2b';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.ellipse(0, 0, projectedRx, receiver.r, 0, -Math.PI / 2 + 0.13, Math.PI * 1.5 - 0.13);
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = '#b66c32';
                ctx.beginPath();
                ctx.arc(receiver.x - projectedRx * 0.13, topY + 1, 4.5, 0, Math.PI * 2);
                ctx.arc(receiver.x + projectedRx * 0.13, topY + 1, 4.5, 0, Math.PI * 2);
                ctx.fill();
                if (receiverSpark) drawSpark(receiver.x, topY + 1, 0.58, '#37b9c2');

                ctx.strokeStyle = '#66828a';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(receiver.x + projectedRx * 0.13 + 5, topY - 1);
                ctx.lineTo(receiver.x + Math.max(30, projectedRx * 0.72), topY - 18);
                ctx.stroke();
                ctx.fillStyle = '#536f78';
                ctx.font = '10px "Noto Sans TC", sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('可調微小火花隙', receiver.x + Math.max(32, projectedRx * 0.72), topY - 17);

                ctx.strokeStyle = '#78949d';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(receiver.x, receiver.y + receiver.r);
                ctx.lineTo(receiver.x, receiver.y + receiver.r + 45);
                ctx.moveTo(receiver.x - 28, receiver.y + receiver.r + 45);
                ctx.lineTo(receiver.x + 28, receiver.y + receiver.r + 45);
                ctx.stroke();

                ctx.fillStyle = '#244954';
                ctx.font = '700 13px "Noto Sans TC", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('接收器：單匝共振環', receiver.x, receiver.y - receiver.r - 46);
                ctx.fillStyle = '#6a8188';
                ctx.font = '12px "Noto Sans TC", sans-serif';
                ctx.fillText('獨立、無電源、未接發射器', receiver.x, receiver.y - receiver.r - 31);
            }

            function drawWave(source, receiver) {
                if (!state.fired || state.phase <= 0.08) return;
                const arrivalPhase = 0.76;
                const pathLength = receiver.x - source.x;
                const radius = Math.min(state.phase / arrivalPhase, 1) * pathLength;

                ctx.save();
                ctx.strokeStyle = '#20aeb5';
                ctx.lineWidth = 2.2;
                for (let i = 0; i < 4; i++) {
                    const r = radius - i * Math.max(34, state.width * 0.05);
                    if (r <= 8) continue;
                    ctx.globalAlpha = Math.max(0.08, 0.36 - i * 0.065);
                    ctx.beginPath();
                    ctx.arc(source.x, source.y, r, -0.55, 0.55);
                    ctx.stroke();
                }
                ctx.restore();

                const arrowStart = source.x + 90;
                const arrowEnd = Math.min(receiver.x - receiver.r - 24, source.x + radius - 16);
                if (arrowEnd > arrowStart) {
                    drawArrow(arrowStart, source.y - 76, arrowEnd, source.y - 76, '#19969d');
                    ctx.fillStyle = '#167c83';
                    ctx.font = '700 12px "Noto Sans TC", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('電磁擾動向外傳播', (arrowStart + arrowEnd) / 2, source.y - 87);
                }
            }

            function updateLabels() {
                const { distance, angle } = values();
                const strength = coupling();
                distanceOut.textContent = `${distance.toFixed(distance % 1 ? 1 : 0)} m`;
                angleOut.textContent = angle === 0 ? '0°（對準）' : angle === 90 ? '90°（轉正交）' : `${angle}°`;
                if (couplingOut) couplingOut.textContent = `${Math.round(strength * 100)}%`;
                if (!state.fired) signalOut.textContent = '待發射';
                else if (strength >= 0.5) signalOut.textContent = '強';
                else if (strength >= 0.15) signalOut.textContent = '中等';
                else if (strength >= 0.07) signalOut.textContent = '微弱';
                else signalOut.textContent = '幾乎無';

                if (!state.fired || state.phase < 0.76) sparkOut.textContent = '尚無火花';
                else sparkOut.textContent = state.detected ? '觀察到微小火花' : '未觀察到火花';

                if (!state.fired && !state.running) {
                    stagePill.textContent = '待機';
                    stageMessage.textContent = '按下「發射一次」，從發射端火花開始觀察。';
                } else if (state.phase < 0.14) {
                    stagePill.textContent = '步驟 1';
                    stageMessage.textContent = '發射火花使電荷快速變動，形成電磁擾動。';
                } else if (state.phase < 0.76) {
                    stagePill.textContent = '步驟 2';
                    stageMessage.textContent = '發射端與接收端沒有導線相連；擾動正在跨越空間。';
                } else if (state.detected) {
                    stagePill.textContent = '步驟 3';
                    stageMessage.textContent = '接收環出現微小火花：這是電磁波抵達的可觀察證據。';
                } else {
                    stagePill.textContent = '步驟 3';
                    stageMessage.textContent = '接收現象太弱；試著把接收環轉回對準方向或拉近。';
                }
            }

            function draw() {
                const { width, height } = state;
                if (!width || !height) return;
                const { source, receiver } = geometry();
                const receiverSpark = state.phase >= 0.76 && state.phase <= 0.93 && state.detected;

                ctx.clearRect(0, 0, width, height);
                const bg = ctx.createLinearGradient(0, 0, 0, height);
                bg.addColorStop(0, '#fbfefe');
                bg.addColorStop(1, '#edf7f7');
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, width, height);

                ctx.save();
                ctx.strokeStyle = 'rgba(92, 139, 145, 0.12)';
                ctx.lineWidth = 1;
                for (let x = 24; x < width; x += 32) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 22; y < height; y += 32) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                ctx.restore();

                ctx.strokeStyle = '#afc7ca';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(24, height - 52);
                ctx.lineTo(width - 24, height - 52);
                ctx.stroke();

                drawWave(source, receiver);
                drawTransmitter(source);
                drawReceiver(receiver, receiverSpark);

                ctx.fillStyle = '#70868e';
                ctx.font = '11px "Noto Sans TC", sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('示意動畫：傳播時間已放慢，裝置未依實際比例繪製。', 18, height - 17);
                updateLabels();
            }

            function resize() {
                const rect = canvas.getBoundingClientRect();
                state.width = Math.max(320, rect.width);
                state.height = Math.max(280, rect.height);
                state.dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.round(state.width * state.dpr);
                canvas.height = Math.round(state.height * state.dpr);
                ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
                draw();
            }

            function frame(timestamp) {
                if (state.destroyed || !state.running) return;
                state.clock.advance(timestamp, dt => {
                    state.phase += dt / state.duration;
                    if (state.phase >= 0.76 && canDetect()) state.detected = true;
                    if (state.phase >= 1) {
                        if (state.auto) {
                            state.phase = 0;
                            state.detected = false;
                        } else {
                            state.phase = 1;
                            state.running = false;
                        }
                    }
                });
                draw();
                if (state.running) state.raf = requestAnimationFrame(frame);
            }

            function fire() {
                if (state.raf) cancelAnimationFrame(state.raf);
                state.fired = true;
                state.detected = false;
                state.phase = 0;
                state.running = true;
                state.lastTime = 0;
                state.clock.reset();
                if (reduceMotion) {
                    state.phase = 1;
                    state.running = false;
                    state.detected = canDetect();
                    draw();
                    return;
                }
                state.raf = requestAnimationFrame(frame);
                draw();
            }

            function reset() {
                if (state.raf) cancelAnimationFrame(state.raf);
                state.raf = null;
                state.phase = 0;
                state.running = false;
                state.auto = false;
                state.fired = false;
                state.detected = false;
                state.lastTime = 0;
                state.clock.reset();
                distanceInput.value = '3';
                angleInput.value = '0';
                autoBtn.textContent = reduceMotion ? '減少動態：連播關閉' : '▶ 連續演示';
                autoBtn.setAttribute('aria-pressed', 'false');
                draw();
            }

            function toggleAuto() {
                if (reduceMotion) return;
                state.auto = !state.auto;
                autoBtn.textContent = state.auto ? 'Ⅱ 停止連播' : '▶ 連續演示';
                autoBtn.setAttribute('aria-pressed', String(state.auto));
                if (state.auto && !state.running) fire();
            }

            function adjustExperiment() {
                if (state.phase >= 0.76) state.detected = canDetect();
                draw();
            }

            listen(fireBtn, 'click', fire);
            listen(autoBtn, 'click', toggleAuto);
            listen(resetBtn, 'click', reset);
            listen(distanceInput, 'input', adjustExperiment);
            listen(angleInput, 'input', adjustExperiment);

            if (reduceMotion) {
                autoBtn.disabled = true;
                autoBtn.textContent = '減少動態：連播關閉';
                stageMessage.textContent = '已依系統偏好改用靜態結果；按下「發射一次」會直接顯示接收結果。';
            }

            if ('ResizeObserver' in window) {
                state.resizeObserver = new ResizeObserver(resize);
                state.resizeObserver.observe(canvas);
            } else {
                listen(window, 'resize', resize);
            }

            state.destroy = () => {
                state.destroyed = true;
                if (state.raf) cancelAnimationFrame(state.raf);
                if (state.resizeObserver) state.resizeObserver.disconnect();
                listeners.forEach(([element, type, handler]) => element.removeEventListener(type, handler));
            };

            hertzExperimentState = state;
            registerViewDisposer(() => {
                state.destroy();
                if (hertzExperimentState === state) hertzExperimentState = null;
            });
            resize();
        }

        function renderSummaryView() {
            const main = document.getElementById('main-content');
            main.innerHTML = `
                <div class="content-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
                    <div>
                        <span class="content-badge">新增內容｜全範圍概念串聯</span>
                        <h2 class="content-title">高中物理核心總整理</h2>
                        <p class="content-subtitle">從科學史、物質結構與基本常數出發，串聯運動、場、波動、能量與近代物理。適合第一次建立全貌，也適合考前快速查漏。</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()"><span>🖨️</span> 列印總整理</button>
                </div>

                <nav class="summary-jump-list" aria-label="總整理章節">
                    <a class="summary-jump" role="button" tabindex="0" onclick="scrollToSummary('summary-history')"><span class="summary-jump-code">01</span>科學史脈絡</a>
                    <a class="summary-jump" role="button" tabindex="0" onclick="scrollToSummary('summary-constants')"><span class="summary-jump-code">02</span>常數與單位</a>
                    <a class="summary-jump" role="button" tabindex="0" onclick="scrollToSummary('summary-matter')"><span class="summary-jump-code">03</span>物質與基本力</a>
                    <a class="summary-jump" role="button" tabindex="0" onclick="scrollToSummary('summary-fields')"><span class="summary-jump-code">04</span>運動與場</a>
                    <a class="summary-jump" role="button" tabindex="0" onclick="scrollToSummary('summary-waves')"><span class="summary-jump-code">05</span>波動統整</a>
                    <a class="summary-jump" role="button" tabindex="0" onclick="scrollToSummary('summary-energy')"><span class="summary-jump-code">06</span>能量統整</a>
                    <a class="summary-jump" role="button" tabindex="0" onclick="scrollToSummary('summary-modern')"><span class="summary-jump-code">07</span>近代物理</a>
                </nav>

                <section class="summary-section" id="summary-history">
                    <div class="summary-section-head"><h3>科學史不是人名表，而是問題如何被解決</h3><span>觀察 → 定律 → 統整 → 新理論</span></div>
                    <div class="edu-table-container">
                        <table class="edu-table">
                            <thead><tr><th>時代／領域</th><th>關鍵人物</th><th>核心貢獻</th><th>要連結的考點</th></tr></thead>
                            <tbody>
                                <tr><td>天體運動</td><td>克卜勒</td><td>由觀測資料歸納行星三定律</td><td>橢圓軌道、等面積律、$T^2\\propto r^3$</td></tr>
                                <tr><td>古典力學</td><td>牛頓</td><td>以運動定律與萬有引力統一天上、地上的運動</td><td>$\\Sigma F=ma$、$F_g=GMm/r^2$</td></tr>
                                <tr><td>電磁學</td><td>庫侖、厄斯特、安培</td><td>建立靜電力，發現電流與磁場的關係</td><td>平方反比、右手定則、電磁鐵</td></tr>
                                <tr><td>電磁學</td><td>法拉第、冷次</td><td>變動磁場產生感應電流，方向阻礙磁場變化</td><td>發電機、變壓器、感應卡</td></tr>
                                <tr><td>電磁統合（理論）</td><td>馬克士威</td><td>統整電與磁的規律，預測電磁場的擾動能在空間傳播；計算結果與光速相同，因而推論光是電磁波</td><td>變動電場與磁場、電磁波、光速 $c$</td></tr>
                                <tr><td>電磁統合（實驗）</td><td>赫茲</td><td>讓發射端產生火花，並在分離的接收環觀察到微小火花，證實電磁擾動能跨越空間傳遞</td><td>理論預測與實驗證據、電磁波發射與接收</td></tr>
                                <tr><td>能量</td><td>焦耳</td><td>證明機械功可轉換成熱，確立能量守恆</td><td>$1\\text{ cal}\\approx4.186\\text{ J}$、能量退化</td></tr>
                                <tr><td>原子結構</td><td>湯木生、拉塞福、波耳</td><td>電子 → 原子核 → 量子化能階模型</td><td>金箔散射、能階躍遷、線光譜</td></tr>
                                <tr><td>量子物理</td><td>普朗克、愛因斯坦</td><td>能量量子化與光量子說</td><td>$E=hf$、光電效應</td></tr>
                                <tr><td>物質波</td><td>德布羅意、戴維森與革末</td><td>提出並以電子繞射證實物質具有波動性</td><td>$\\lambda=h/p$、波粒二象性</td></tr>
                            </tbody>
                        </table>
                    </div>

                    ${hertzExperimentHtml()}
                </section>

                <section class="summary-section" id="summary-constants">
                    <div class="summary-section-head"><h3>常用物理常數與換算</h3><span>題目未提供時仍應認得數量級</span></div>
                    <div class="edu-table-container">
                        <table class="edu-table">
                            <thead><tr><th>名稱</th><th>符號與近似值</th><th>出現情境</th><th>單位提醒</th></tr></thead>
                            <tbody>
                                <tr><td>真空光速</td><td>$c=3.00\\times10^8\\text{ m/s}$</td><td>電磁波、質能互換、光子</td><td>$c=f\\lambda$</td></tr>
                                <tr><td>萬有引力常數</td><td>$G=6.67\\times10^{-11}$</td><td>天體引力與重力場</td><td>$\\text{N·m}^2/\\text{kg}^2$</td></tr>
                                <tr><td>庫侖常數</td><td>$k=9.0\\times10^9$</td><td>點電荷間靜電力</td><td>$\\text{N·m}^2/\\text{C}^2$</td></tr>
                                <tr><td>普朗克常數</td><td>$h=6.626\\times10^{-34}$</td><td>光子能量、物質波</td><td>$\\text{J·s}$</td></tr>
                                <tr><td>基本電荷</td><td>$e=1.60\\times10^{-19}\\text{ C}$</td><td>電子電量、電子伏特</td><td>電子帶電量為 $-e$</td></tr>
                                <tr><td>重力加速度</td><td>$g\\approx9.8\\text{ m/s}^2$</td><td>近地面落體、重量、位能</td><td>估算常取 $10\\text{ m/s}^2$</td></tr>
                                <tr><td>電子伏特</td><td>$1\\text{ eV}=1.60\\times10^{-19}\\text{ J}$</td><td>原子能階、光子能量</td><td>是能量單位，不是電壓</td></tr>
                                <tr><td>熱功當量</td><td>$1\\text{ cal}\\approx4.186\\text{ J}$</td><td>熱量與機械能換算</td><td>$1\\text{ kcal}=4186\\text{ J}$</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="summary-section" id="summary-matter">
                    <div class="summary-section-head"><h3>物質的組成與四大基本交互作用</h3><span>新補 N06｜從結構層次看作用力</span></div>
                    <div class="summary-grid" style="margin-bottom:0.9rem;">
                        <article class="summary-note">
                            <h4>物質結構的包含關係</h4>
                            <p><strong>物質 → 分子 → 原子 → 原子核＋電子 → 質子、中子 → 夸克</strong></p>
                            <p>原子約 $10^{-10}$ m，原子核約 $10^{-15}$ m；原子核半徑小十萬倍，卻集中了原子幾乎全部質量。</p>
                        </article>
                        <article class="summary-note">
                            <h4>哪些是基本粒子？</h4>
                            <ul><li><strong>夸克：</strong>組成質子與中子。</li><li><strong>輕子：</strong>電子與微中子屬此類。</li><li><strong>媒介粒子：</strong>光子、膠子、W/Z 玻色子傳遞交互作用。</li></ul>
                        </article>
                    </div>
                    <div class="edu-table-container">
                        <table class="edu-table">
                            <thead><tr><th>交互作用</th><th>作用對象／範圍</th><th>相對強度</th><th>典型現象</th></tr></thead>
                            <tbody>
                                <tr><td>強作用</td><td>夸克、核子；約 $10^{-15}$ m</td><td>最強</td><td>束縛夸克並維持原子核穩定</td></tr>
                                <tr><td>電磁作用</td><td>帶電粒子；長程</td><td>次強</td><td>庫侖力、化學鍵、摩擦力、彈力</td></tr>
                                <tr><td>弱作用</td><td>基本粒子；約 $10^{-18}$ m</td><td>很弱</td><td>$\\beta$ 衰變、中子轉變</td></tr>
                                <tr><td>重力</td><td>所有有能量與質量者；長程</td><td>最弱</td><td>落體、行星與星系運動</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="summary-section" id="summary-fields">
                    <div class="summary-section-head"><h3>運動與「場」的共同語言</h3><span>先畫狀態，再選公式</span></div>
                    <div class="summary-grid">
                        <article class="summary-note"><h4>運動學：描述，不追原因</h4><p>位置變化形成位移，位移的時變率是速度，速度的時變率是加速度：$v=\\Delta x/\\Delta t$、$a=\\Delta v/\\Delta t$。$v-t$ 圖斜率代表加速度、面積代表位移。</p></article>
                        <article class="summary-note"><h4>動力學：合力造成加速度</h4><p>$\\Sigma F=ma$ 的方向關係比代數更重要。先畫受力圖、定正方向，再列分量式；作用力與反作用力作用在不同物體上，不能互相抵消。</p></article>
                        <article class="summary-note"><h4>重力場</h4><p>質量 $M$ 在空間建立重力場 $g=GM/r^2$，另一質量 $m$ 放入後受力 $F=mg$。場描述「該位置每單位質量受到的力」。</p></article>
                        <article class="summary-note"><h4>電場與磁場</h4><p>電荷建立電場，電荷在電場受力；電流建立磁場，變動磁場又可建立感應電場。法拉第與馬克士威把電、磁與光串成同一套架構。</p></article>
                    </div>
                </section>

                <section class="summary-section" id="summary-waves">
                    <div class="summary-section-head"><h3>波動統整：先分類，再判斷不變量</h3><span>$v=f\\lambda$ 是關係，不代表波速由頻率決定</span></div>
                    <div class="edu-table-container">
                        <table class="edu-table">
                            <thead><tr><th>主題</th><th>判斷核心</th><th>常見實例</th><th>容易混淆處</th></tr></thead>
                            <tbody>
                                <tr><td>力學波／電磁波</td><td>力學波需介質；電磁波可在真空傳播</td><td>聲波、水波／光、無線電波</td><td>波傳遞能量，不把介質整體搬走</td></tr>
                                <tr><td>橫波／縱波</td><td>介質振動方向垂直／平行於傳播方向</td><td>繩波／空氣中的聲波</td><td>水面波不是單純的橫波</td></tr>
                                <tr><td>反射</td><td>同一介質內入射角等於反射角</td><td>回音、鏡面反射</td><td>頻率、波速、波長皆不變</td></tr>
                                <tr><td>折射</td><td>跨介質時頻率不變，波速與波長改變</td><td>光偏折、地震波路徑</td><td>慢介質偏向法線；快介質偏離法線</td></tr>
                                <tr><td>干涉</td><td>同相加強、反相相消</td><td>雙狹縫、薄膜鍍膜</td><td>暗紋仍有波到達，只是疊加相消</td></tr>
                                <tr><td>繞射</td><td>孔寬或障礙物與波長接近時最明顯</td><td>聲音繞牆、X 光晶體繞射</td><td>不是波「轉彎」，而是波前展開</td></tr>
                                <tr><td>都卜勒效應</td><td>接近時接收頻率升高，遠離時降低</td><td>救護車、血流測速、星系紅移</td><td>波源本身頻率不一定改變</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="summary-section" id="summary-energy">
                    <div class="summary-section-head"><h3>能量統整：追蹤轉移，而不是背形式</h3><span>總量守恆，但可用程度會下降</span></div>
                    <div class="edu-table-container">
                        <table class="edu-table">
                            <thead><tr><th>能量／速率</th><th>關係式</th><th>系統觀點</th><th>常見情境</th></tr></thead>
                            <tbody>
                                <tr><td>動能</td><td>$K=\\frac12mv^2$</td><td>與運動狀態有關</td><td>煞車、碰撞、滑行</td></tr>
                                <tr><td>重力位能</td><td>$U_g=mgh$</td><td>近地表、選定零位面</td><td>水力發電、拋體</td></tr>
                                <tr><td>彈性位能</td><td>$U_s=\\frac12kx^2$</td><td>儲存在形變的彈性體</td><td>彈簧、弓箭</td></tr>
                                <tr><td>熱量</td><td>$Q=ms\\Delta T$</td><td>因溫差傳遞的能量</td><td>混合熱平衡、加熱</td></tr>
                                <tr><td>功</td><td>$W=F\\Delta x\\cos\\theta$</td><td>力透過位移轉移能量</td><td>起重機、摩擦耗散</td></tr>
                                <tr><td>功率</td><td>$P=W/\\Delta t$、$P_E=IV$</td><td>能量轉換的快慢</td><td>電器額定功率、馬達</td></tr>
                                <tr><td>質能</td><td>$E=\\Delta mc^2$</td><td>核反應的質量虧損轉為能量</td><td>核分裂、太陽核融合</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="summary-grid" style="margin-top:0.9rem;">
                        <article class="summary-note"><h4>守恆不等於「都能再利用」</h4><p>摩擦使機械能轉為分散的內能，總能量仍守恆，但能量品質下降。這是能源效率、廢熱與熱力學第二定律的共同核心。</p></article>
                        <article class="summary-note"><h4>核分裂與核融合</h4><p>分裂是重核裂成中等質量原子核；融合是輕核結合。兩者皆由反應前後的質量差釋能，不是把燃料全部質量轉成能量。</p></article>
                    </div>
                </section>

                <section class="summary-section" id="summary-modern">
                    <div class="summary-section-head"><h3>近代物理：每個實驗各證明什麼？</h3><span>現象、控制變因、結論要分開</span></div>
                    <div class="edu-table-container">
                        <table class="edu-table">
                            <thead><tr><th>現象／實驗</th><th>關鍵觀察</th><th>支持的模型</th><th>核心關係式</th></tr></thead>
                            <tbody>
                                <tr><td>黑體輻射</td><td>能量交換並非連續</td><td>普朗克能量量子化</td><td>$E=nhf$</td></tr>
                                <tr><td>光電效應</td><td>存在底限頻率；提高強度只增光電子數</td><td>光具有粒子性</td><td>$hf=W+K_{\\max}$</td></tr>
                                <tr><td>雙狹縫與繞射</td><td>出現明暗相間條紋</td><td>光或物質具有波動性</td><td>$\\Delta=n\\lambda$</td></tr>
                                <tr><td>電子晶體繞射</td><td>電子束產生繞射圖樣</td><td>德布羅意物質波</td><td>$\\lambda=h/p$</td></tr>
                                <tr><td>原子線光譜</td><td>只出現特定離散波長</td><td>電子能階量子化</td><td>$\\Delta E=hf$</td></tr>
                                <tr><td>拉塞福散射</td><td>少數 $\\alpha$ 粒子大角度偏折</td><td>正電與質量集中於極小原子核</td><td>庫侖斥力與尺度判斷</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="summary-grid" style="margin-top:0.9rem;">
                        <article class="summary-note"><h4>光電效應兩組變因</h4><ul><li>提高頻率：光電子最大動能增加。</li><li>提高強度：單位時間光子數增加，光電流變大。</li><li>低於底限頻率：再強、照再久都沒有光電子。</li></ul></article>
                        <article class="summary-note"><h4>波粒二象性</h4><p>不是物體有時「變成」波、有時「變成」粒子，而是同一量子系統在不同實驗安排下呈現不同可觀察特徵；物質波描述位置機率分布。</p></article>
                    </div>
                </section>

                <div class="summary-source">
                    本頁依現有 108 課綱節點重新整理，補充架構參考自
                    <a href="https://arpowchao.github.io/posts/physics-summary/" target="_blank" rel="noopener">高中物理學測知識總整理</a>（CC BY 4.0）。內容已重新編排並與本站題庫節點對照。
                </div>
            `;

            scheduleMathJax([main]);
            initHertzExperiment();
            window.scrollTo(0, 0);
        }

        const contextColumns = [
            {
                tone: 'sky', domain: '氣象 × 運動學', title: '颱風路徑：彎曲不等於變快',
                signal: '路徑彎曲、起點終點、移動速率',
                model: '速度是向量；方向改變就有加速度',
                start: '先判斷題目問路程還是位移',
                formulas: ['平均速度＝位移／時間', '平均速率＝路程／時間', 'ΣF＝ma'],
                traps: ['速率不變但方向改變時，加速度與合力仍不為零。', '平均速度只看起點與終點，不能拿彎曲路徑長度來除。'],
                exams: ['111 學測 Q1–2', '108 學測 Q37'], nodes: ['N03', 'N04'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs><marker id="aw-ty-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker><marker id="aw-ty-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ea580c"/></marker></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><path d="M30,138 Q120,138 175,40" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6,5"/><text x="30" y="156" font-size="10" fill="#475569">颱風路徑</text><circle cx="73" cy="131" r="4" fill="#334155"/><line x1="73" y1="131" x2="101" y2="122" stroke="#2563eb" stroke-width="2.4" marker-end="url(#aw-ty-b)"/><text x="97" y="140" font-size="11" fill="#2563eb" font-weight="bold">v</text><line x1="73" y1="131" x2="66" y2="110" stroke="#ea580c" stroke-width="2.4" marker-end="url(#aw-ty-o)"/><text x="52" y="108" font-size="11" fill="#ea580c" font-weight="bold">a</text><circle cx="139" cy="90" r="4" fill="#334155"/><line x1="139" y1="90" x2="159" y2="68" stroke="#2563eb" stroke-width="2.4" marker-end="url(#aw-ty-b)"/><text x="163" y="66" font-size="11" fill="#2563eb" font-weight="bold">v</text><line x1="139" y1="90" x2="123" y2="76" stroke="#ea580c" stroke-width="2.4" marker-end="url(#aw-ty-o)"/><text x="108" y="74" font-size="11" fill="#ea580c" font-weight="bold">a</text><text x="110" y="168" font-size="10" fill="#334155" text-anchor="middle">兩處 v 等長（速率同）→ 方向變，a 指向彎內側</text></svg>`
            },

            {
                tone: 'motion', domain: '阻力 × 落體', title: '空氣阻力落體：終端速率不是停止',
                signal: '阻力隨速率增大、v–t 圖漸平、終端速率',
                model: '重力固定，阻力增大，合力與加速度逐漸歸零',
                start: '向下取正，先寫 mg − D(v)＝ma',
                formulas: ['mg − D(v)＝ma', '終端狀態：D(vₜ)＝mg', 'v–t 圖斜率＝a'],
                traps: ['終端速率時是 a＝0、v＝定值，不是 v＝0。', '同形狀物體在相同速率下阻力相近；質量較大者通常需更高速才平衡重力。'],
                exams: ['112 學測 Q33', '107 學測 Q16', '110 學測 Q58–59'], nodes: ['N05', 'N03', 'N04'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs><marker id="aw-fa-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/></marker><marker id="aw-fa-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ea580c"/></marker></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><text x="110" y="20" font-size="10.5" fill="#334155" text-anchor="middle">紅＝重力 mg（不變）　橘＝空氣阻力（隨 v 增）</text><circle cx="45" cy="72" r="9" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/><line x1="45" y1="81" x2="45" y2="113" stroke="#ef4444" stroke-width="2.4" marker-end="url(#aw-fa-r)"/><line x1="45" y1="63" x2="45" y2="53" stroke="#ea580c" stroke-width="2.4" marker-end="url(#aw-fa-o)"/><text x="45" y="138" font-size="10.5" fill="#334155" text-anchor="middle" font-weight="bold">初期</text><text x="45" y="151" font-size="9.5" fill="#475569" text-anchor="middle">a ≈ g</text><circle cx="110" cy="72" r="9" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/><line x1="110" y1="81" x2="110" y2="113" stroke="#ef4444" stroke-width="2.4" marker-end="url(#aw-fa-r)"/><line x1="110" y1="63" x2="110" y2="41" stroke="#ea580c" stroke-width="2.4" marker-end="url(#aw-fa-o)"/><text x="110" y="138" font-size="10.5" fill="#334155" text-anchor="middle" font-weight="bold">中期</text><text x="110" y="151" font-size="9.5" fill="#475569" text-anchor="middle">阻力變大</text><text x="110" y="162" font-size="9.5" fill="#475569" text-anchor="middle">a 漸小</text><circle cx="175" cy="72" r="9" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/><line x1="175" y1="81" x2="175" y2="113" stroke="#ef4444" stroke-width="2.4" marker-end="url(#aw-fa-r)"/><line x1="175" y1="63" x2="175" y2="31" stroke="#ea580c" stroke-width="2.4" marker-end="url(#aw-fa-o)"/><text x="175" y="138" font-size="10.5" fill="#334155" text-anchor="middle" font-weight="bold">終端</text><text x="175" y="151" font-size="9.5" fill="#475569" text-anchor="middle">阻力＝重力</text><text x="175" y="162" font-size="9.5" fill="#475569" text-anchor="middle">等速下落</text></svg>`
            },
            {
                tone: 'wave', domain: '地科 × 波動', title: '地震預警：抵達時間差才是核心',
                signal: 'P 波先到、S 波後到、走時曲線、海嘯抵達',
                model: '不同波走相同距離，但波速不同',
                start: '把未知震源距離設成同一個 d',
                formulas: ['t＝d／v', 'Δt＝d(1／vₛ − 1／vₚ)', '可應變時間＝抵達時刻−通知時刻'],
                traps: ['先後到達的時間差，不等於市民真正擁有的預警時間。', 'km/s、km/min 與秒、分鐘混用時要先統一單位。'],
                exams: ['113 學測 Q31', '115 學測 Q8', '110 學測 Q16'], nodes: ['N14', 'N03'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs><marker id="aw-eq-s" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#475569"/></marker><marker id="aw-eq-d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#334155"/></marker></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><line x1="35" y1="148" x2="205" y2="148" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#aw-eq-s)"/><line x1="35" y1="148" x2="35" y2="18" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#aw-eq-s)"/><text x="196" y="163" font-size="10" fill="#475569">距離</text><text x="12" y="26" font-size="10" fill="#475569">時間</text><line x1="35" y1="148" x2="195" y2="58" stroke="#2563eb" stroke-width="2.4"/><text x="160" y="88" font-size="10.5" fill="#2563eb" font-weight="bold">P 波（快）</text><line x1="35" y1="148" x2="160" y2="20" stroke="#ef4444" stroke-width="2.4"/><text x="55" y="70" font-size="10.5" fill="#ef4444" font-weight="bold">S 波（慢，破壞大）</text><line x1="140" y1="148" x2="140" y2="34" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3"/><text x="140" y="161" font-size="9.5" fill="#475569" text-anchor="middle">測站</text><circle cx="140" cy="89" r="3.5" fill="#2563eb"/><circle cx="140" cy="41" r="3.5" fill="#ef4444"/><line x1="148" y1="86" x2="148" y2="44" stroke="#334155" stroke-width="1.8" marker-start="url(#aw-eq-d)" marker-end="url(#aw-eq-d)"/><text x="154" y="68" font-size="10.5" fill="#334155" font-weight="bold">Δt＝預警時間</text></svg>`
            },
            {
                tone: 'orbit', domain: '天體 × 力學', title: '衛星軌道：週期、重力與失重一起看',
                signal: '同步衛星、太空站、軌道高度、微重力',
                model: '萬有引力提供向心力；軌道半徑決定週期與速率',
                start: '先把高度 h 換成中心距離 r＝R＋h',
                formulas: ['T² ∝ r³', 'v＝√(GM／r)', 'g＝GM／r²'],
                traps: ['軌道高度不是軌道半徑。', '失重代表支撐力近零，不代表萬有引力消失；質量未知時不能武斷比較總能量。'],
                exams: ['114 學測 Q19', '111 參考卷 Q52', '108 學測 Q51', '107 學測 Q60'], nodes: ['N07', 'N08', 'N09'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs><marker id="aw-sa-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/></marker><marker id="aw-sa-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><circle cx="110" cy="112" r="30" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.5"/><text x="110" y="116" font-size="10.5" fill="#334155" text-anchor="middle">地球</text><circle cx="110" cy="112" r="68" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,5"/><circle cx="110" cy="44" r="6" fill="#334155"/><line x1="110" y1="52" x2="110" y2="76" stroke="#ef4444" stroke-width="2.4" marker-end="url(#aw-sa-r)"/><text x="62" y="68" font-size="10" fill="#ef4444" font-weight="bold">重力指向地心</text><line x1="118" y1="44" x2="152" y2="44" stroke="#2563eb" stroke-width="2.4" marker-end="url(#aw-sa-b)"/><text x="158" y="48" font-size="11" fill="#2563eb" font-weight="bold">v</text><text x="110" y="170" font-size="10" fill="#334155" text-anchor="middle">只受重力 → 一直改變方向（也是失重的原因）</text></svg>`
            },
            {
                tone: 'medical', domain: '醫療 × 訊號', title: '醫療物理：先找訊號如何被改變',
                signal: '血流回波、額溫槍、質子治療、介面折射',
                model: '移動改變頻率；介面改變方向；能量沉積決定治療深度',
                start: '先標出波源、接收者、反射體與傳質',
                formulas: ['接近：f觀測上升', '遠離：f觀測下降', '|Δf| ∝ 血流速率'],
                traps: ['都卜勒頻移的正負看距離正在縮短或增加，不看物體名稱。', '波跨介質時頻率不變；額溫槍接收的是紅外線，不是量到「熱流速度」。'],
                exams: ['111 學測 Q49–51、Q54', '112 學測 Q29、Q32', '113 學測 Q22–23'], examCount: 5, nodes: ['N15', 'N16', 'N18', 'N26'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs><marker id="aw-md-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker><marker id="aw-md-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/></marker></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><text x="38" y="30" font-size="10.5" fill="#2563eb" font-weight="bold">X 光</text><rect x="66" y="40" width="76" height="102" rx="14" fill="rgba(37,99,235,0.08)" stroke="#94a3b8" stroke-width="1.2"/><text x="104" y="56" font-size="9.5" fill="#475569" text-anchor="middle">組織</text><ellipse cx="104" cy="96" rx="15" ry="26" fill="#94a3b8"/><text x="104" y="99" font-size="9.5" fill="#ffffff" text-anchor="middle">骨</text><line x1="18" y1="66" x2="62" y2="66" stroke="#2563eb" stroke-width="3" marker-end="url(#aw-md-b)"/><line x1="18" y1="96" x2="62" y2="96" stroke="#2563eb" stroke-width="3" marker-end="url(#aw-md-b)"/><line x1="18" y1="126" x2="62" y2="126" stroke="#2563eb" stroke-width="3" marker-end="url(#aw-md-b)"/><line x1="146" y1="66" x2="176" y2="66" stroke="#2563eb" stroke-width="2.2" marker-end="url(#aw-md-b)"/><line x1="146" y1="96" x2="176" y2="96" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" marker-end="url(#aw-md-f)"/><line x1="146" y1="126" x2="176" y2="126" stroke="#2563eb" stroke-width="2.2" marker-end="url(#aw-md-b)"/><rect x="184" y="46" width="12" height="100" fill="#475569"/><rect x="184" y="80" width="12" height="32" fill="#e2e8f0"/><text x="190" y="160" font-size="9.5" fill="#475569" text-anchor="middle">底片</text><text x="104" y="170" font-size="10" fill="#334155" text-anchor="middle">骨吸收多 → 穿透少 → 影像對比</text></svg>`
            },
            {
                tone: 'energy', domain: '能源 × 熱學', title: '能源題：先畫能量帳本再代公式',
                signal: '發電功率、效率、耗電量、融冰、抬升、水庫',
                model: '輸入能量在形式間轉換；有用輸出與耗散必須同時入帳',
                start: '先定系統邊界，再畫「輸入 → 轉換 → 輸出」',
                formulas: ['P＝E／t', 'η＝有用輸出／總輸入', 'Q＝mL', 'ΔU重＝mgh'],
                traps: ['「一度電」是能量，不是功率。', '能量沒有消失；效率小於 100% 是部分能量轉成較難利用的熱。'],
                exams: ['112 學測 Q37–40', '114 學測 Q20–21', '113 學測 Q24–25', '108 學測 Q54–56'], nodes: ['N09', 'N10', 'N12'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><polygon points="12,72 76,72 76,64 96,84 76,104 76,96 12,96" fill="#2563eb" opacity="0.85"/><text x="42" y="88" font-size="10.5" fill="#ffffff" text-anchor="middle" font-weight="bold">輸入 100</text><rect x="96" y="56" width="46" height="56" rx="8" fill="#e2e8f0" stroke="#475569" stroke-width="1.4"/><text x="119" y="88" font-size="10.5" fill="#334155" text-anchor="middle" font-weight="bold">裝置</text><polygon points="142,66 186,52 184,47 206,52 192,68 190,63 145,77" fill="#16a34a" opacity="0.9"/><text x="176" y="36" font-size="10.5" fill="#16a34a" font-weight="bold" text-anchor="middle">有用 40</text><polygon points="142,92 184,106 186,100 204,116 182,124 184,118 140,106" fill="#ea580c" opacity="0.9"/><text x="178" y="142" font-size="10.5" fill="#ea580c" font-weight="bold" text-anchor="middle">廢熱 60</text><text x="110" y="158" font-size="10" fill="#334155" text-anchor="middle">能量守恆：100 ＝ 40 ＋ 60</text><text x="110" y="171" font-size="10" fill="#334155" text-anchor="middle">效率 ＝ 有用/輸入 ＝ 40%</text></svg>`
            },
            {
                tone: 'induction', domain: '科技 × 電磁', title: '感應裝置：有磁場不代表有感應電流',
                signal: '磁鐵移動、線圈電流改變、無線充電、感應卡',
                model: '穿過線圈的磁力線（磁場）發生變化，才產生感應電流',
                start: '先看穿過線圈的磁力線有沒有變、變多快，再用冷次定律判方向',
                formulas: ['磁力線變化 → 感應電流', '變化越快 → 感應電流越大', '冷次定律：感應效果反抗磁力線的變化'],
                traps: ['磁場很強但完全不變時，仍可沒有感應電流。', '冷次定律反抗的是「變化」，不是一律產生與原磁場相反的磁場。'],
                exams: ['111 學測 Q6', '114 學測 Q27', '113 學測 Q44–46', '115 學測 Q53'], nodes: ['N21', 'N20'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs><marker id="aw-in-s" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#475569"/></marker><marker id="aw-in-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#16a34a"/></marker></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><rect x="24" y="62" width="34" height="26" fill="#2563eb"/><rect x="58" y="62" width="34" height="26" fill="#ef4444"/><text x="41" y="80" font-size="11" fill="#ffffff" text-anchor="middle" font-weight="bold">S</text><text x="75" y="80" font-size="11" fill="#ffffff" text-anchor="middle" font-weight="bold">N</text><line x1="34" y1="46" x2="80" y2="46" stroke="#475569" stroke-width="2.2" marker-end="url(#aw-in-s)"/><text x="57" y="38" font-size="10" fill="#475569" text-anchor="middle">移動（關鍵！）</text><path d="M92,68 Q112,60 128,66" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3"/><path d="M92,82 Q112,90 128,84" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3"/><ellipse cx="136" cy="75" rx="6" ry="24" fill="none" stroke="#2563eb" stroke-width="2"/><ellipse cx="150" cy="75" rx="6" ry="24" fill="none" stroke="#2563eb" stroke-width="2"/><ellipse cx="164" cy="75" rx="6" ry="24" fill="none" stroke="#2563eb" stroke-width="2"/><ellipse cx="178" cy="75" rx="6" ry="24" fill="none" stroke="#2563eb" stroke-width="2"/><path d="M136,99 L136,132 L150,132" fill="none" stroke="#475569" stroke-width="1.6"/><path d="M178,99 L178,132 L172,132" fill="none" stroke="#475569" stroke-width="1.6"/><circle cx="161" cy="132" r="13" fill="#ffffff" stroke="#475569" stroke-width="1.6"/><line x1="161" y1="141" x2="169" y2="124" stroke="#16a34a" stroke-width="2" marker-end="url(#aw-in-g)"/><text x="161" y="160" font-size="9.5" fill="#16a34a" text-anchor="middle" font-weight="bold">指針偏轉</text><text x="110" y="174" font-size="10" fill="#334155" text-anchor="middle">磁力線變化才感應；磁鐵靜止 → 電流＝0</text></svg>`
            },
            {
                tone: 'quantum', domain: '材料 × 量子', title: '光電與材料：先判斷是光子還是波',
                signal: '底限頻率、最大波長、能隙、EUV、薄膜反射',
                model: '單一光子能量由頻率決定；多束光疊加則看相位與光程差',
                start: '遇到能隙先寫 E＝hc／λ；遇到明暗條紋改查相位',
                formulas: ['E＝hf＝hc／λ', 'Kmax＝hf−W', '干涉：比較光程差與相位'],
                traps: ['提高光強度增加光子數，不會提高單一光子的能量。', '波長越長，光子能量越低；薄膜題還要處理反射相位與介質波速。'],
                exams: ['114 學測 Q50–51', '115 學測 Q47–49', '111 參考卷 Q23', '112 學測 Q30–31'], nodes: ['N23', 'N24', 'N17', 'N28'],
                svg: `<svg viewBox="0 0 220 180" class="context-card-svg" role="img"><defs><marker id="aw-pe-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/></marker><marker id="aw-pe-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7c3aed"/></marker><marker id="aw-pe-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs><rect x="1" y="1" width="218" height="178" rx="12" fill="rgba(148,163,184,0.10)"/><rect x="20" y="118" width="180" height="26" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.2"/><text x="110" y="135" font-size="10" fill="#475569" text-anchor="middle">金屬表面</text><line x1="40" y1="42" x2="64" y2="112" stroke="#ef4444" stroke-width="2.4" marker-end="url(#aw-pe-r)"/><text x="40" y="32" font-size="10" fill="#ef4444" text-anchor="middle" font-weight="bold">低頻光子</text><text x="42" y="44" font-size="9.5" fill="#ef4444" text-anchor="middle">f＜f₀</text><text x="80" y="104" font-size="11" fill="#ef4444" font-weight="bold">✗</text><text x="94" y="104" font-size="9.5" fill="#475569">再亮也沒用</text><line x1="132" y1="42" x2="152" y2="112" stroke="#7c3aed" stroke-width="2.4" marker-end="url(#aw-pe-v)"/><text x="136" y="32" font-size="10" fill="#7c3aed" text-anchor="middle" font-weight="bold">高頻光子</text><text x="132" y="44" font-size="9.5" fill="#7c3aed" text-anchor="middle">f≥f₀</text><circle cx="160" cy="106" r="5" fill="#2563eb"/><line x1="164" y1="102" x2="186" y2="76" stroke="#2563eb" stroke-width="2" marker-end="url(#aw-pe-b)"/><text x="192" y="70" font-size="10.5" fill="#2563eb" font-weight="bold" text-anchor="middle">e⁻</text><text x="110" y="163" font-size="10" fill="#334155" text-anchor="middle">看單一光子能量 hν 夠不夠</text><text x="110" y="175" font-size="10" fill="#334155" text-anchor="middle">亮度只改變光子「數量」</text></svg>`
            }
        ];

        function contextColumnHtml(column) {
            const formulas = column.formulas.map(item => `<span class="context-formula">${item}</span>`).join('');
            const traps = column.traps.map(item => `<li>${item}</li>`).join('');
            const nodes = column.nodes.map(id => `<button class="context-node-btn" type="button" onclick="openContextNode('${id}')">${nodeLabel(id)}</button>`).join('');

            return `
                <article class="context-card" data-tone="${column.tone}">
                    <div class="context-card-content">
                        <div class="context-card-left">
                            <div class="context-card-head">
                                <div><div class="context-domain">${column.domain}</div><h3>${column.title}</h3></div>
                                <span class="context-frequency">${column.examCount || column.exams.length} 組代表題</span>
                            </div>
                            <div class="context-translation" aria-label="題幹訊號到物理模型的翻譯流程">
                                <div class="context-translation-step"><span>題幹訊號</span><b>${column.signal}</b></div>
                                <div class="context-arrow" aria-hidden="true">→</div>
                                <div class="context-translation-step"><span>物理翻譯</span><b>${column.model}</b></div>
                                <div class="context-arrow" aria-hidden="true">→</div>
                                <div class="context-translation-step"><span>第一步</span><b>${column.start}</b></div>
                            </div>
                            <div class="context-block"><div class="context-block-title">起手式與核心關係</div><div class="context-formulas">${formulas}</div></div>
                            <div class="context-block"><div class="context-block-title">最常失分的地方</div><ul class="context-traps">${traps}</ul></div>
                            <div class="context-block"><div class="context-block-title">代表歷屆題</div><div class="context-exam-list">${column.exams.join('　／　')}</div></div>
                            <div class="context-card-footer">
                                <div class="context-node-list">${nodes}</div>
                                <button class="context-exam-btn" type="button" onclick="showExamsForNode('${column.nodes[0]}')">練這類題目 →</button>
                            </div>
                        </div>
                        <div class="context-card-right">
                            ${column.svg || ''}
                        </div>
                    </div>
                </article>
            `;
        }

        function openContextNode(nodeId) {
            navigateTo(`node-${nodeId}`);
        }

        function renderContextsView() {
            currentView = 'contexts';
            const main = document.getElementById('main-content');
            main.innerHTML = `
                <div class="content-header">
                    <div>
                        <span class="content-badge">常考情境專欄</span>
                        <h2 class="content-title">把題目外衣翻成物理模型</h2>
                        <p class="content-subtitle">依現有歷屆題整理高重複情境。先辨認題幹動詞與可觀察量，再選模型；地科、生物或科技名詞只是場景，不應取代物理判斷。</p>
                    </div>
                </div>
                <section class="context-hero" aria-label="情境題閱讀原則">
                    <strong>情境只是外衣；真正決定解法的是「什麼量正在改變」。</strong>
                    <p>每篇專欄都沿同一條翻譯軌閱讀：題幹訊號 → 物理模型 → 第一條關係式。看到陌生題材時，先找位移、方向、波速、能量、磁場變化或頻率，而不是先背情境名稱。</p>
                </section>
                <section class="context-grid" aria-label="八類常考物理情境">
                    ${contextColumns.map(contextColumnHtml).join('')}
                </section>
            `;
            scheduleMathJax([main]);
            window.scrollTo(0, 0);
        }

        // 各節點掌握度：彙整題庫與歷屆試題的作答紀錄（一題掛多節點時同時計入各節點）
        function nodeMasteryMap() {
            const map = {};
            [studyRecords.bank, studyRecords.exam].forEach(store => {
                Object.values(store).forEach(rec => {
                    (rec.nodes || []).forEach(id => {
                        const m = map[id] || (map[id] = { a: 0, c: 0 });
                        m.a += rec.a;
                        m.c += rec.c;
                    });
                });
            });
            return map;
        }
        function masteryCellHtml(m) {
            if (!m || m.a === 0) return '<span class="mastery-none">未作答</span>';
            const pct = Math.round(m.c / m.a * 100);
            const cls = pct >= 80 ? 'mastery-good' : pct >= 60 ? 'mastery-mid' : 'mastery-low';
            return `<span class="${cls}">${pct}%</span><br><span style="font-size:0.72rem; color:var(--text-muted); font-weight:500;">${m.c}/${m.a} 次</span>`;
        }

        function renderStatsView() {
            currentView = 'stats';
            const main = document.getElementById('main-content');

            // Calculate total questions dynamically for each node based on show99
            const mastery = nodeMasteryMap();
            const sorted = [...knowledgeNodes].map(n => {
                const { c108, reference108, c99 } = nodeExamCounts(n.id);
                const total = c108 + (show99 ? c99 : 0);
                const modTitle = modulesData[n.module] ? modulesData[n.module].title.split('：')[1] : '';
                const m = mastery[n.id] || { a: 0, c: 0 };
                return { ...n, c108, reference108, c99, total, modTitle, mast: m };
            });

            // Sort nodes dynamically
            sorted.sort((a, b) => {
                let valA, valB;
                if (statsSortKey === 'code') {
                    valA = a.code; valB = b.code;
                } else if (statsSortKey === 'name') {
                    valA = a.name; valB = b.name;
                } else if (statsSortKey === 'module') {
                    valA = a.module; valB = b.module;
                } else if (statsSortKey === 'exam5y') {
                    valA = a.c108; valB = b.c108;
                } else { // 'total'
                    valA = a.total; valB = b.total;
                }

                if (valA < valB) return statsSortDesc ? 1 : -1;
                if (valA > valB) return statsSortDesc ? -1 : 1;

                return a.id.localeCompare(b.id);
            });

            let rowsHtml = '';
            sorted.forEach((n, idx) => {
                let link;
                if (n.total === 0) {
                    link = `<div class="stats-exam-none">（歷屆此節點多以觀念判斷題出現，另見題庫）</div>`;
                } else if (show99) {
                    const bd = n.c99 > 0 ? `（108課綱 ${n.c108}＋99課綱 ${n.c99}）` : `（${n.c108} 題）`;
                    link = `<div class="stats-exam-link">📚 查看此節點的歷屆試題 ${bd} →</div>`;
                } else if (n.c108 > 0) {
                    const extra = n.c99 > 0 ? `<span style="color:var(--text-muted); font-weight:500;">＋99課綱 ${n.c99}（勾選可見）</span>` : '';
                    link = `<div class="stats-exam-link">📚 查看此節點的歷屆試題（${n.c108} 題）→ ${extra}</div>`;
                } else {
                    link = `<div class="stats-exam-link">📚 99 課綱歷屆 ${n.c99} 題（點擊後自動納入顯示）→</div>`;
                }
                rowsHtml += `
                    <tr ${n.total > 0 ? `class="stats-row-click" onclick="showExamsForNode('${n.id}')" title="檢視此節點的歷屆試題"` : ''}>
                        <td style="text-align: center; font-weight: 700; color: var(--primary-blue);">${idx + 1}</td>
                        <td class="col-secondary"><span class="code-badge">${n.code}</span></td>
                        <td style="font-weight: 600; color: var(--text-main);">${n.name}</td>
                        <td class="col-secondary" style="font-size: 0.82rem;">${n.modTitle}</td>
                        <td style="text-align: center; color: var(--accent-cyan); font-weight: 700;">${n.c108} 組</td>
                        <td class="col-secondary" style="text-align: center; color: var(--primary-blue); font-weight: 700;">${n.total} 組</td>
                        <td class="mastery-cell">${masteryCellHtml(n.mast)}</td>
                        <td class="col-detail" style="font-size: 0.85rem;">${n.detail}${link}</td>
                    </tr>
                `;
            });

            main.innerHTML = `
                <div class="content-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <span class="content-badge">數據分析數據庫</span>
                        <h2 class="content-title">近五年（111-115）學測物理命題矩陣（知識節點層級）</h2>
                        <p class="content-subtitle">統計 5 年正式試卷中 ${STATS_RECENT_GROUPS} 個物理題組包含的知識節點；所有相關節點一律計入，不區分主次。111 官方參考卷另列，不混入五年數字。</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()">
                        <span>🖨️</span> 列印數據
                    </button>
                </div>

                <div class="bank-filter-bar" style="margin-bottom:1.25rem;">
                    <div class="bank-filter-row">
                        <label class="cur-toggle">
                            <input type="checkbox" ${show99 ? 'checked' : ''} onchange="setShow99(this.checked)">
                            <span>歷屆試題數一併納入 99 課綱（106–110 學測）</span>
                        </label>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        「近五年含相關」會計入每題所有實際參與公式、判斷或排除選項的知識節點，不區分主次；純名詞或情境背景不計。勾選後，「總歷屆題組」會再納入 99 課綱舊制題。
                    </div>
                </div>

                <div class="edu-card">
                    <div class="edu-card-title">📊 知識節點命題頻率排行</div>
                    <div class="edu-table-container">
                        <table class="edu-table">
                            <thead>
                                <tr>
                                    <th style="width: 6%; text-align: center;">排名</th>
                                    <th class="col-secondary" style="width: 10%; cursor: pointer;" onclick="toggleStatsSort('code')">課綱代碼 ${getSortArrow('code')}</th>
                                    <th style="width: 24%; cursor: pointer;" onclick="toggleStatsSort('name')">知識節點 ${getSortArrow('name')}</th>
                                    <th class="col-secondary" style="width: 16%; cursor: pointer;" onclick="toggleStatsSort('module')">所屬模組 ${getSortArrow('module')}</th>
                                    <th style="width: 14%; text-align: center; cursor: pointer;" onclick="toggleStatsSort('exam5y')">近五年含相關 ${getSortArrow('exam5y')}</th>
                                    <th class="col-secondary" style="width: 12%; text-align: center; cursor: pointer;" onclick="toggleStatsSort('total')">總歷屆題組 ${getSortArrow('total')}</th>
                                    <th style="width: 9%; text-align: center;" title="依你在題庫與歷屆試題的作答紀錄計算">掌握度</th>
                                    <th class="col-detail">五年核心考點</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.4;">
                        💡 <strong>點擊表頭（如：近五年含相關、總歷屆題組、所屬模組等）</strong>即可將矩陣重新排序；<strong>點選任意列</strong>可直接原地展開該節點的所有歷屆試題進行練習。
                    </div>
                </div>
            `;
            scheduleMathJax([main]);
        }

        // Render tool-buster View
        function renderBusterView() {
            const main = document.getElementById('main-content');
            main.innerHTML = `
                <div class="content-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <span class="content-badge">解題戰略破譯</span>
                        <h2 class="content-title">大考「素養包裝」破解對照矩陣</h2>
                        <p class="content-subtitle">引導學生從「看見表面包裝（可視化）」走向「識破物理本質（可識化）」，一秒看穿題目的真正考點。</p>
                    </div>
                    <button class="print-btn print-hide" onclick="window.print()">
                        <span>🖨️</span> 列印矩陣
                    </button>
                </div>

                <div class="edu-card">
                    <div class="edu-card-title">⚡ 歷屆經典難題包裝破解</div>

                    <div class="buster-table-row">
                        <div class="buster-cell buster-cell-surface">
                            <span class="buster-label">Visualization 表面題型包裝</span>
                            <div class="buster-text-q">113 學測 Q31：地震 P 波與 S 波抵達時間差</div>
                            <p class="buster-text-desc">包裝了地震震央距、P/S波速、市民應變秒數等看似複雜的地科背景。</p>
                        </div>
                        <div class="buster-cell buster-cell-core">
                            <span class="buster-label">Realization 物理模型本質</span>
                            <div class="buster-model-title">等速直線運動追及問題 (運動學 $S=vt$)</div>
                            <p class="buster-text-desc">地震波在均勻介質中是等速前進的。解題只需要用國中學過的 $\\Delta t = \\frac{d}{v_S} - \\frac{d}{v_P}$，本質上與波動學干涉、繞射、波長頻率交會無關。</p>
                        </div>
                    </div>

                    <div class="buster-table-row">
                        <div class="buster-cell buster-cell-surface">
                            <span class="buster-label">Visualization 表面題型包裝</span>
                            <div class="buster-text-q">111 學測 Q58-60：電磁天平與公斤的量子定義</div>
                            <p class="buster-text-desc">以「普朗克常數訂為新質量基準」的電磁天平（國際上稱 Kibble 天平，題幹未用此詞）為背景，包裝了量子計量與磁鐵線圈結構等前沿概念。</p>
                        </div>
                        <div class="buster-cell buster-cell-core">
                            <span class="buster-label">Realization 物理模型本質</span>
                            <div class="buster-model-title">天平力平衡與電磁感應（$F_B = f_B I$ 與 $V = f_B v$）</div>
                            <p class="buster-text-desc">雖包裝複雜，解題只需兩步：靜態模式下磁力 $F_B = f_B I$ 與待測物重力平衡；動態模式下由「感應電壓對線圈速度」的線性圖求出 $f_B$，代回即得質量。本質為力平衡＋電磁感應比例關係的消去法。</p>
                        </div>
                    </div>

                    <div class="buster-table-row">
                        <div class="buster-cell buster-cell-surface">
                            <span class="buster-label">Visualization 表面題型包裝</span>
                            <div class="buster-text-q">114 學測 Q48：細胞膜平衡電壓比例</div>
                            <p class="buster-text-desc">給定複雜的細胞膜通道 Nernst 平衡電壓公式，要比較攝氏 27 度與 17 度時的平衡電壓量值比。</p>
                        </div>
                        <div class="buster-cell buster-cell-core">
                            <span class="buster-label">Realization 物理模型本質</span>
                            <div class="buster-model-title">熱力學絕對溫標轉換 ($V \\propto T$)</div>
                            <p class="buster-text-desc">此題在物理上只考查「溫標轉換」。公式中的 $T$ 為絕對溫度，攝氏 27℃ = 300 K，17℃ = 290 K。電壓與絕對溫度成正比，故比值為 300 / 290，是極為簡單的正比關係。</p>
                        </div>
                    </div>

                    <div class="buster-table-row">
                        <div class="buster-cell buster-cell-surface">
                            <span class="buster-label">Visualization 表面題型包裝</span>
                            <div class="buster-text-q">115 學測 Q49：鍍膜反射電場手繪</div>
                            <p class="buster-text-desc">給出 EUV 微影設備反射鏡薄膜結構，要求學生畫出光束在薄膜界面的反射線與折射線箭頭，以及電場疊加。</p>
                        </div>
                        <div class="buster-cell buster-cell-core">
                            <span class="buster-label">Realization 物理模型本質</span>
                            <div class="buster-model-title">波動折射作圖與干涉加強 (光程差)</div>
                            <p class="buster-text-desc">折射線作圖只需用司乃耳定律：光從慢速介質（反射層）進入快速介質時，折射角大於入射角、偏離法線。電場疊加則利用反射波波峰與波峰同相疊加的干涉加強，回歸波的疊加本質。</p>
                        </div>
                    </div>

                    <div class="buster-table-row">
                        <div class="buster-cell buster-cell-surface">
                            <span class="buster-label">Visualization 表面題型包裝</span>
                            <div class="buster-text-q">112 學測 Q32：都卜勒血流測速</div>
                            <p class="buster-text-desc">包裝了醫學影像儀器、超音波探頭、紅血球反射訊號等看似專業的生醫工程背景。</p>
                        </div>
                        <div class="buster-cell buster-cell-core">
                            <span class="buster-label">Realization 物理模型本質</span>
                            <div class="buster-model-title">都卜勒效應頻率偏移（相對運動定性判斷）</div>
                            <p class="buster-text-desc">只需判斷「相對接近或遠離」：紅血球迎向探頭 ➔ 反射回來的超音波頻率升高；背離探頭 ➔ 頻率降低。頻率偏移量對應血流速度，本質為波動章節的都卜勒定性規律，與儀器構造細節無關。</p>
                        </div>
                    </div>

                </div>
            `;
            scheduleMathJax([main]);
        }

