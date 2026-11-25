// 全域 Canvas 繪圖板、頁面啟動
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== 全域 Canvas 繪圖板控制邏輯 =====
        const canvasStates = {};

        function disposeCanvasState(uid) {
            const state = canvasStates[uid];
            if (!state) return;
            if (state.resizeHandler) {
                window.removeEventListener('resize', state.resizeHandler);
            }
            state.isDrawing = false;
            delete canvasStates[uid];
        }

        function disposeAllCanvasStates() {
            Object.keys(canvasStates).forEach(disposeCanvasState);
        }

        function initCanvas(uid, sheetFile) {
            const canvas = document.getElementById(`canvas-${uid}`);
            if (!canvas) return;

            const existingState = canvasStates[uid];
            // 清單重新渲染後會出現同 id 的新元素，舊狀態不可繼續指向已移除的畫布。
            if (existingState && existingState.canvas !== canvas) {
                disposeCanvasState(uid);
            }

            // 若此畫布尚未註冊狀態，進行註冊
            if (!canvasStates[uid]) {
                const state = {
                    canvas: canvas,
                    ctx: canvas.getContext('2d'),
                    isDrawing: false,
                    tool: 'pen',
                    lastX: 0,
                    lastY: 0,
                    sheetFile: sheetFile,
                    sheetRatio: 2.5,
                    resizeHandler: null
                };
                canvasStates[uid] = state;

                // 綁定事件（僅綁定一次）
                canvas.addEventListener('mousedown', (e) => startDrawing(e, uid));
                canvas.addEventListener('mousemove', (e) => draw(e, uid));
                canvas.addEventListener('mouseup', () => stopDrawing(uid));
                canvas.addEventListener('mouseout', () => stopDrawing(uid));

                // 觸控事件相容
                canvas.addEventListener('touchstart', (e) => {
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                    canvas.dispatchEvent(mouseEvent);
                    e.preventDefault();
                }, { passive: false });

                canvas.addEventListener('touchmove', (e) => {
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                    canvas.dispatchEvent(mouseEvent);
                    e.preventDefault();
                }, { passive: false });

                canvas.addEventListener('touchend', () => {
                    const mouseEvent = new MouseEvent('mouseup', {});
                    canvas.dispatchEvent(mouseEvent);
                });

                // 監聽視窗大小改變，自動調整 canvas 比例
                state.resizeHandler = () => {
                    if (canvasStates[uid] === state && canvas.isConnected) {
                        resizeCanvas(uid);
                    }
                };
                window.addEventListener('resize', state.resizeHandler);

                // 依答案卡底圖的原始尺寸設定畫布比例，避免不同年度作答區被壓扁或裁切。
                if (sheetFile) {
                    const sheetImage = new Image();
                    sheetImage.onload = () => {
                        if (!sheetImage.naturalWidth || !sheetImage.naturalHeight) return;
                        // 圖片可能在切換年份／節點後才載入，避免回頭修改新的同名畫布。
                        if (canvasStates[uid] !== state || state.canvas !== canvas || !canvas.isConnected) return;
                        state.sheetRatio = sheetImage.naturalWidth / sheetImage.naturalHeight;
                        resizeCanvas(uid);
                        resizeExamBody(canvas);
                    };
                    sheetImage.src = `assets/exam_crops/${sheetFile}`;
                }
            }

            // 每次展開時重新 resize 確保寬高尺寸正確
            resizeCanvas(uid);
        }

        function resizeCanvas(uid) {
            const state = canvasStates[uid];
            if (!state) return;
            const canvas = state.canvas;
            const ctx = state.ctx;

            if (!canvas.isConnected) {
                disposeCanvasState(uid);
                return;
            }

            const container = canvas.parentElement;
            if (!container) return;
            const width = container.clientWidth || 500;

            const ratio = state.sheetRatio || 2.5;
            const height = width / ratio;

            // 備份現有內容以免 resize 後筆跡被清空
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (canvas.width > 0 && canvas.height > 0) {
                tempCtx.drawImage(canvas, 0, 0);
            }

            const dpr = window.devicePixelRatio || 1;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // 恢復畫筆與橡皮擦狀態
            if (state.tool === 'pen') {
                ctx.strokeStyle = '#1d4ed8'; // 大考常用原子筆藍色
                ctx.lineWidth = 2.5;
                ctx.globalCompositeOperation = 'source-over';
            } else {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 15;
                ctx.globalCompositeOperation = 'destination-out';
            }

            // 貼回舊筆跡
            if (tempCanvas.width > 0 && tempCanvas.height > 0) {
                // 使用完整 backing store；除以 DPR 會只複製左上角。
                ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, width, height);
            }
        }

        // 🎓 將多行自動換行文字精準繪製至 HTML5 Canvas 畫布
        function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.font = 'bold 15px "PingFang TC", "Microsoft JhengHei", sans-serif';
            ctx.fillStyle = '#1d4ed8'; // 大考標準原子筆藍色
            ctx.textBaseline = 'top';

            const rawLines = text.split('\n');
            let currentY = y;

            rawLines.forEach(rawLine => {
                let currentLine = '';
                for (let i = 0; i < rawLine.length; i++) {
                    const char = rawLine[i];
                    const testLine = currentLine + char;
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && currentLine.length > 0) {
                        ctx.fillText(currentLine, x, currentY);
                        currentLine = char;
                        currentY += lineHeight;
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) {
                    ctx.fillText(currentLine, x, currentY);
                    currentY += lineHeight;
                }
            });

            ctx.restore();
        }

        function addCanvasText(uid) {
            const state = canvasStates[uid];
            if (!state) return;
            state.tool = 'text';
            setCanvasTool(uid, 'text');
        }

        function startDrawing(e, uid) {
            const state = canvasStates[uid];
            if (!state) return;

            const rect = state.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 🎯 PPT 多行可調整寬度文字框：點擊畫布位置跳出可拖拉、自動換行的文字框
            if (state.tool === 'text') {
                const container = state.canvas.parentElement;

                // 清除前一個尚未提交的輸入框
                const oldInput = container.querySelector('.canvas-ppt-input-wrap');
                if (oldInput) oldInput.remove();

                const wrap = document.createElement('div');
                wrap.className = 'canvas-ppt-input-wrap';
                wrap.style.position = 'absolute';
                wrap.style.left = `${x}px`;
                wrap.style.top = `${y}px`;
                wrap.style.zIndex = '100';

                const availWidth = Math.max(220, Math.min(container.clientWidth - x - 20, 650));

                wrap.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#2563EB; color:white; padding:3px 8px; border-radius:6px 6px 0 0; font-size:0.75rem; font-weight:bold; user-select:none;">
                        <span>🔤 可拉寬度文字框 (自動換行)</span>
                        <button type="button" class="commit-ppt-btn" style="background:#10B981; color:white; border:none; border-radius:3px; padding:2px 8px; cursor:pointer; font-size:0.75rem; font-weight:bold;">✅ 確定蓋印</button>
                    </div>
                    <textarea class="canvas-ppt-textarea" placeholder="請在此輸入長篇論述 (拖拉右下角可調整寬高，會自動換行)..." style="width:${availWidth}px; height:85px; font:bold 15px 'PingFang TC', 'Microsoft JhengHei', sans-serif; color:#1d4ed8; background:rgba(255,255,255,0.96); border:2px dashed #2563EB; border-radius:0 0 6px 6px; padding:6px 8px; outline:none; resize:both; box-shadow:0 6px 16px rgba(0,0,0,0.2); line-height:1.5; margin:0; display:block;"></textarea>
                `;

                const textarea = wrap.querySelector('.canvas-ppt-textarea');
                const commitBtn = wrap.querySelector('.commit-ppt-btn');

                let isCommitted = false;
                const commitText = () => {
                    if (isCommitted) return;
                    isCommitted = true;
                    const val = textarea.value.trim();
                    const currentBoxWidth = textarea.clientWidth - 18;
                    if (val) {
                        drawMultilineText(state.ctx, val, x, y + 26, currentBoxWidth, 22);
                        // 🎯 記錄打字內容，供評分引擎動態對照
                        state.recordedText = ((state.recordedText || '') + '\n' + val).trim();
                        const textEl = document.getElementById(`handwrite-text-${uid}`);
                        if (textEl) {
                            textEl.value = ((textEl.value || '') + '\n' + val).trim();
                        }
                    }
                    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
                    state.tool = 'pen';
                    setCanvasTool(uid, 'pen');
                };

                commitBtn.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    commitText();
                });

                textarea.addEventListener('keydown', (evt) => {
                    if (evt.ctrlKey && evt.key === 'Enter') {
                        evt.preventDefault();
                        commitText();
                    }
                });

                container.appendChild(wrap);
                setTimeout(() => textarea.focus(), 20);
                return;
            }

            state.isDrawing = true;
            state.lastX = x;
            state.lastY = y;
        }

        function draw(e, uid) {
            const state = canvasStates[uid];
            if (!state || !state.isDrawing || state.tool === 'text') return;

            const rect = state.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ctx = state.ctx;
            ctx.beginPath();
            ctx.moveTo(state.lastX, state.lastY);
            ctx.lineTo(x, y);

            if (state.tool === 'pen') {
                ctx.strokeStyle = '#1d4ed8'; // 大考原子筆藍色
                ctx.lineWidth = 2.5;
                ctx.globalCompositeOperation = 'source-over';
            } else {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 15;
                ctx.globalCompositeOperation = 'destination-out';
            }
            ctx.stroke();

            state.lastX = x;
            state.lastY = y;
        }

        function stopDrawing(uid) {
            const state = canvasStates[uid];
            if (state) state.isDrawing = false;
        }

        function setCanvasTool(uid, tool) {
            const state = canvasStates[uid];
            if (!state) return;
            state.tool = tool;

            const wrap = document.getElementById(`board-wrap-${uid}`);
            if (wrap) {
                wrap.querySelectorAll('.canvas-tool-btn').forEach(btn => {
                    if (btn.getAttribute('data-tool') === tool) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        }

        function clearCanvas(uid) {
            const state = canvasStates[uid];
            if (!state) return;
            const dpr = window.devicePixelRatio || 1;
            state.ctx.clearRect(0, 0, state.canvas.width / dpr, state.canvas.height / dpr);
        }

        function toggleWritingMode(uid) {
            const textEl = document.getElementById(`handwrite-text-${uid}`);
            const boardEl = document.getElementById(`board-wrap-${uid}`);
            const toggleBtn = document.getElementById(`toggle-mode-btn-${uid}`);

            if (textEl.style.display === 'none') {
                textEl.style.display = 'block';
                boardEl.style.display = 'none';
                toggleBtn.textContent = '✍️ 切換手寫板';
                resizeExamBody(toggleBtn);
            } else {
                textEl.style.display = 'none';
                boardEl.style.display = 'block';
                toggleBtn.textContent = '⌨️ 切換打字框';
                setTimeout(() => {
                    initCanvas(uid, '');
                    resizeExamBody(toggleBtn);
                }, 50);
            }
        }

        function toggleExamSol(btn, key) {
            const item = btn.closest('.exam-item');
            const box = btn.parentElement.querySelector('.exam-sol');
            const isHand = Boolean(examSolutions[key]?.hand);
            if (box.hasAttribute('hidden')) {
                box.removeAttribute('hidden');
                btn.textContent = isHand ? '📋 收合參考答案與評分規準' : '📖 收合答案與詳解';

                // 核對選擇題答案
                if (!isHand) checkExamMC(key, item);

                scheduleMathJax([box], { delay: 0, after: () => resizeExamBody(btn) });
            } else {
                box.setAttribute('hidden', '');
                btn.textContent = isHand ? '📋 顯示參考答案與評分規準' : '📖 顯示答案與詳解';

                // 重設選擇題答案以重新練習
                if (!isHand) resetExamMC(key, item);
            }
            resizeExamBody(btn);
        }

        function setExamYear(y) {
            examYearFilter = y;
            if (y !== 'all') loadedExamYears.add(y);
            renderExamsView();
        }

        function loadExamYear(year) {
            loadedExamYears.add(year);
            renderExamsView();
            requestAnimationFrame(() => {
                document.querySelector(`[data-exam-year="${year}"]`)?.scrollIntoView({ block: 'start' });
            });
        }

        function setShow99(v) {
            show99 = v;
            // 若關閉 99 課綱時正停在 99 課綱的篩選，退回全部
            if (!show99 && examYearFilter !== 'all' && examPapers[examYearFilter] && examPapers[examYearFilter].cur === '99') {
                examYearFilter = 'all';
            }
            if (currentView === 'stats') renderStatsView();
            else renderExamsView();
        }

        function toggleInvertCrops(v) {
            invertCrops = v;
            document.querySelectorAll('.exam-crop').forEach(img => {
                img.classList.toggle('inverted', invertCrops);
            });
        }

        // 從命題矩陣點某節點 → 跳到歷屆試題並篩選該節點
        function showExamsForNode(nodeId) {
            // 若該節點只有 99 課綱的題，自動開啟 99 課綱以免空白
            const cnt = nodeExamCounts(nodeId);
            if (cnt.c108 === 0 && cnt.c99 > 0) show99 = true;
            navigateTo(`exams-${nodeId}`);
        }
        function clearExamNode() {
            navigateTo('tool-exams');
        }

        // Initialize the hash router. A deep link opens directly; an empty URL lands on the study home.
        window.addEventListener('load', () => {
            buildNodeSidebar();
            const initialRoute = routeFromLocation();
            history.replaceState({ physicsApp: true, physicsRoute: initialRoute, physicsDepth: 0 }, '', `#${encodeURIComponent(initialRoute)}`);
            renderRoute(initialRoute);
            updateWrongNavBadge();
        });
        window.addEventListener('popstate', () => renderRoute(routeFromLocation()));
        window.addEventListener('hashchange', () => {
            const route = routeFromLocation();
            if (route !== lastRenderedRoute) renderRoute(route);
        });

