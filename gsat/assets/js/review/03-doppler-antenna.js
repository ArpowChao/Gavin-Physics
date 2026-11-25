// N15 都卜勒效應專題、3D 偶極天線電磁波模擬
// （由 gsat_physics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        // ===== N15 都卜勒效應：波源運動影響波長之專題與動畫影片 =====
        function jumpDopplerVideo(sec, stepIndex) {
            const video = document.getElementById('doppler-video-player');
            if (!video) return;
            video.currentTime = sec;
            video.play().catch(() => {});
            setDopplerActiveStep(stepIndex);
        }

        function setDopplerActiveStep(stepIndex) {
            document.querySelectorAll('.doppler-cue-pill, .doppler-cue-btn').forEach((btn, idx) => {
                btn.classList.toggle('active', idx === stepIndex);
            });
            document.querySelectorAll('.doppler-step-card').forEach((card, idx) => {
                const step = card.dataset.step !== undefined ? parseInt(card.dataset.step, 10) : idx;
                card.classList.toggle('active', step === stepIndex);
            });
        }

        function initDopplerVideoEvents() {
            const video = document.getElementById('doppler-video-player');
            if (!video) return;
            const cues = [
                { t: 0, idx: 0 },
                { t: 15, idx: 1 },
                { t: 28, idx: 2 },
                { t: 41, idx: 3 },
                { t: 48, idx: 4 },
                { t: 58, idx: 5 }
            ];
            const onTime = () => {
                const cur = video.currentTime;
                let activeIdx = 0;
                for (let i = cues.length - 1; i >= 0; i--) {
                    if (cur >= cues[i].t) {
                        activeIdx = cues[i].idx;
                        break;
                    }
                }
                setDopplerActiveStep(activeIdx);
            };
            video.addEventListener('timeupdate', onTime);
            registerViewDisposer(() => {
                video.pause();
                video.removeEventListener('timeupdate', onTime);
            });
        }

        function dopplerVideoWidgetHtml() {
            return `
                <div class="doppler-theater-widget">
                    <div class="doppler-theater-header">
                        <div class="doppler-theater-title">
                            <span>🎬 慢動作動態拆解：為何波源運動會改變波長？</span>
                            <span class="doppler-theater-badge">Manim 動畫示範</span>
                        </div>
                        <div class="doppler-theater-hint">
                            💡 點擊步驟標籤可精準跳轉播放，右側即時同步關鍵物理觀念
                        </div>
                    </div>
                    
                    <div class="doppler-theater-body">
                        <div class="doppler-theater-media">
                            <div class="doppler-video-aspect">
                                <video id="doppler-video-player" class="doppler-video-el" controls playsinline preload="metadata">
                                    <source src="assets/videos/doppler_2.mp4" type="video/mp4">
                                    <source src="doppler_2.mp4" type="video/mp4">
                                    您的瀏覽器不支援 HTML5 影片播放。
                                </video>
                            </div>
                        </div>

                        <div class="doppler-theater-interactive">
                            <div class="doppler-cues-pills">
                                <button type="button" class="doppler-cue-pill active" onclick="jumpDopplerVideo(0, 0)">
                                    <span class="pill-idx">① 基準</span><span class="pill-time">00:00</span>
                                </button>
                                <button type="button" class="doppler-cue-pill" onclick="jumpDopplerVideo(15, 1)">
                                    <span class="pill-idx">② 圓心</span><span class="pill-time">00:15</span>
                                </button>
                                <button type="button" class="doppler-cue-pill" onclick="jumpDopplerVideo(28, 2)">
                                    <span class="pill-idx">③ 擠壓</span><span class="pill-time">00:28</span>
                                </button>
                                <button type="button" class="doppler-cue-pill" onclick="jumpDopplerVideo(41, 3)">
                                    <span class="pill-idx">④ 對比</span><span class="pill-time">00:41</span>
                                </button>
                                <button type="button" class="doppler-cue-pill" onclick="jumpDopplerVideo(48, 4)">
                                    <span class="pill-idx">⑤ 動態</span><span class="pill-time">00:48</span>
                                </button>
                                <button type="button" class="doppler-cue-pill" onclick="jumpDopplerVideo(58, 5)">
                                    <span class="pill-idx">⑥ 音障</span><span class="pill-time">00:58</span>
                                </button>
                            </div>

                            <div class="doppler-active-card-container">
                                <div class="doppler-step-card active" data-step="0">
                                    <div class="doppler-step-title">① 先看波源不動：同心圓對稱傳播</div>
                                    <div class="doppler-step-desc">
                                        波一旦產生便在介質中以速度 $v$ 等速向外擴展。波源不動時，每個週期發射的波前都是完美的同心圓，相鄰兩圈之間的幾何距離就是固有波長 $\\lambda = v T$。
                                    </div>
                                </div>
                                <div class="doppler-step-card" data-step="1">
                                    <div class="doppler-step-title">② 圓心留在波源「當時」的位置（破除迷思關鍵！）</div>
                                    <div class="doppler-step-desc">
                                        <b>學生常犯迷思</b>：誤以為波發射後會被波源拖著走。<br>
                                        <b>真相</b>：1 秒前、2 秒前發射的波前，其幾何圓心<b>永遠固定在波源當初發射時的座標</b>！波在介質中獨立前進，完全不受波源後續運動影響。
                                    </div>
                                </div>
                                <div class="doppler-step-card" data-step="2">
                                    <div class="doppler-step-title">③ 往右看：圓心向右平移，前方波前「擠在一起」</div>
                                    <div class="doppler-step-desc">
                                        當波源朝右以速度 $v_s$ 移動時，新發射的波前圓心向右平移了 $v_s T$。在波源前方，後發射的波更靠近前一個波，兩相鄰波前間距縮短為 $\\lambda' = (v - v_s)T < \\lambda$。空間波長被實質壓縮！
                                    </div>
                                </div>
                                <div class="doppler-step-card" data-step="3">
                                    <div class="doppler-step-title">④ 把三種間隔並排 —— 差別一眼就看出來</div>
                                    <div class="doppler-step-desc">
                                        <b>前方（紅）</b>：$\\lambda' = (v - v_s)T$ ➔ 視波長縮短、接收頻率升高（藍移）；<br>
                                        <b>原本（藍）</b>：$\\lambda = v T$ ➔ 波源不動時的固有波長；<br>
                                        <b>後方（綠）</b>：$\\lambda'' = (v + v_s)T$ ➔ 視波長拉長、接收頻率降低（紅移）。
                                    </div>
                                </div>
                                <div class="doppler-step-card" data-step="4">
                                    <div class="doppler-step-title">⑤ 連續發射動態：每個十字都是一個波前的圓心</div>
                                    <div class="doppler-step-desc">
                                        連續發射時，波源前方的波前密集、後方的波前稀疏。因為介質中的波速 $v$ 不變，前方觀察者每秒接收到的波前數增多（$f' = \\frac{v}{\\lambda'} > f_0$），音調變高！
                                    </div>
                                </div>
                                <div class="doppler-step-card" data-step="5">
                                    <div class="doppler-step-title">⑥ 如果波源跑得跟波一樣快呢？全部疊成一點，就是音障</div>
                                    <div class="doppler-step-desc">
                                        當 $v_s = v$ 時，$\\lambda' = (v - v)T = 0$！波源永遠貼在自己波前的最前緣，所有前方波前疊加在一起形成極高密度的壓力波前 —— 這就是「音障」與激波波前！
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function dopplerNodeWidgetHtml() {
            return `
                <div class="handout-section-title">🎬 動態圖解：為何波源運動會改變波長？（Manim 慢動作拆解）</div>
                ${dopplerVideoWidgetHtml()}
            `;
        }

        function dopplerSectionHtml() {
            return `
                <div class="handout-section-title" style="margin-top:0;">🎯 專題導讀：為什麼都卜勒效應中「波源運動」會改變波長？</div>
                <div class="edu-card" style="border-left:5px solid var(--primary-blue); margin-bottom:1.5rem; background:linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(255,255,255,0.9) 100%);">
                    <p style="font-size:0.95rem; line-height:1.7; color:var(--text-main); margin:0;">
                        在高中物理與學測波動單元中，「都卜勒效應」是極易混淆的高頻考點。許多同學只死記「接近頻率高、遠離頻率低」，卻無法解釋：<b>為什麼波源移動會改變空間波長，而觀察者移動卻不改變波長？波在介質中的傳播速率究竟有沒有變？</b><br>
                        本專題結合 Manim 社群版的高畫質慢動作拆解動畫與四層資訊架構，從波前的幾何圓心分布出發，帶你徹底掌握都卜勒效應的物理本質。
                    </p>
                </div>

                ${dopplerVideoWidgetHtml()}

                <div class="handout-section-title">💡 核心觀念解析：波源運動影響波長的三大物理本質</div>
                <div class="formulas-grid" style="grid-template-columns: 1fr; margin-bottom: 2rem;">
                    <div class="formula-card">
                        <div class="formula-card-title">📌 原理一：波速由介質決定，波一旦發射即與波源脫鉤</div>
                        <div class="formula-desc">
                            力學波在均勻介質中的傳播速率 $v$ 僅取決於介質本身的性質（例如空氣溫度、壓強與密度），<b>絕不隨波源的運動快慢而改變</b>！當波源移動時，它並不會把前面的波「推得更快」，波在空間中依然以介質決定的速度 $v$ 前進。
                        </div>
                    </div>
                    <div class="formula-card">
                        <div class="formula-card-title">📌 原理二：幾何本質 —— 每個波前的圓心永遠留在發射瞬時的座標</div>
                        <div class="formula-desc">
                            波前是一圈圈向外擴散的球面波（平面上為同心圓）。在某時刻發射的波前，它的圓心就永遠固定在<b>「發射那一瞬間波源所在的空間座標」</b>。即使波源後續跑得再快，已經發射到介質中的波前也不會被拉著跑。
                        </div>
                    </div>
                    <div class="formula-card">
                        <div class="formula-card-title">📌 原理三：波源移動導致相鄰圓心平移 ➔ 前方波前擠壓、後方波前拉長</div>
                        <div class="formula-desc">
                            當波源以速率 $v_s$ 向右移動時，每隔一個週期 $T$，波源的位置便向右位移了 $\\Delta x = v_s T$：
                            <ul style="margin: 0.5rem 0 0 1.25rem; line-height: 1.7;">
                                <li><b>在波源前方</b>：新發射的波前圓心更靠近前一個波前，相鄰兩波前間距縮短為：
                                    $$\\lambda' = vT - v_s T = (v - v_s)T = \\lambda - v_s T < \\lambda$$
                                    波前擠壓，視波長變短！因為介質波速 $v$ 不變，接收頻率必升高：$f' = \\frac{v}{\\lambda'} = \\frac{v}{v - v_s} f_0 > f_0$。
                                </li>
                                <li><b>在波源後方</b>：波源遠離前一個波前，相鄰兩波前間距拉長為：
                                    $$\\lambda'' = vT + v_s T = (v + v_s)T = \\lambda + v_s T > \\lambda$$
                                    波前稀疏，視波長變長！接收頻率降低：$f'' = \\frac{v}{\\lambda''} = \\frac{v}{v + v_s} f_0 < f_0$。
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="handout-section-title">🔍 觀念深度剖析：大考盲點對照與音障極限</div>
                <div class="edu-card" style="margin-bottom: 2rem;">
                    <div style="font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem; font-size: 1rem;">
                        ⚡ 「波源移動」 vs. 「觀察者移動」物理量變化全維度對照表
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="doppler-compare-table">
                            <thead>
                                <tr>
                                    <th style="width: 22%;">比較維度</th>
                                    <th style="width: 39%;">① 波源移動（觀察者靜止）</th>
                                    <th style="width: 39%;">② 觀察者移動（波源靜止）</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><b>波在介質中的傳播速率 $v$</b></td>
                                    <td><span style="color:var(--accent-green); font-weight:700;">完全不變</span>（由介質決定）</td>
                                    <td><span style="color:var(--accent-green); font-weight:700;">完全不變</span>（由介質決定）</td>
                                </tr>
                                <tr>
                                    <td><b>空間中的實際波長 $\\lambda'$</b></td>
                                    <td><b style="color:var(--accent-rose);">改變！</b><br>前方波前被壓縮：$\\lambda' = \\lambda - v_s T$<br>後方波前被拉長：$\\lambda'' = \\lambda + v_s T$</td>
                                    <td><span style="color:var(--accent-green); font-weight:700;">完全不變！</span><br>波源圓心未移動，空間波前間距仍為固有波長 $\\lambda = \\frac{v}{f_0}$</td>
                                </tr>
                                <tr>
                                    <td><b>觀察者與波的相對相遇速率 $v_{\\text{rel}}$</b></td>
                                    <td><b>不變</b>（觀察者靜止，波迎面傳來的速度仍為 $v$）</td>
                                    <td><b style="color:var(--primary-blue);">改變！</b><br>迎向波源時：$v_{\\text{rel}} = v + v_o$<br>背離波源時：$v_{\\text{rel}} = v - v_o$</td>
                                </tr>
                                <tr>
                                    <td><b>觀察者測得的接收頻率 $f'$</b></td>
                                    <td>$f' = \\frac{v}{\\lambda'} = \\frac{v}{v \\mp v_s} f_0$<br>（分母改變）</td>
                                    <td>$f' = \\frac{v_{\\text{rel}}}{\\lambda} = \\frac{v \\pm v_o}{v} f_0$<br>（分子改變）</td>
                                </tr>
                                <tr>
                                    <td><b>高頻陷阱辨析</b></td>
                                    <td>常誤以為「波源朝我開過來，所以聲速變快」➔ <b>大錯！聲速只看空氣！</b></td>
                                    <td>常誤以為「觀察者迎面跑過去，把波長撞短了」➔ <b>大錯！空間波長沒變，只是每秒撞到的波前變多！</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top: 1.25rem; padding: 0.85rem 1rem; background: rgba(245, 158, 11, 0.08); border-radius: 8px; border-left: 4px solid var(--accent-orange);">
                        <strong style="color: #b45309;">🚀 音障（Sound Barrier）與激波（Shock Wave）極限分析：</strong>
                        <p style="margin: 0.35rem 0 0; font-size: 0.88rem; color: var(--text-main); line-height: 1.6;">
                            當波源運動速率 $v_s$ 增加到等於介質波速 $v$（例如音速 $340$ m/s）時，前方視波長 $\\lambda' = (v - v)T = 0$。此時所有同心圓波前在波源正前方無限堆疊，空氣密度與壓強急遽攀升形成強烈的阻抗，這就是「音障」；若波源超音速飛行（$v_s > v$），所有波前包絡面會形成圓錐狀激波面（馬赫錐），橫掃地面時產生震撼巨響（音爆）。
                        </p>
                    </div>
                </div>

                <div class="handout-section-title">📝 生活應用與估算實戰：學測三大命題情境拆解</div>
                <div class="features-grid" style="margin-bottom: 2rem;">
                    <div class="feature-guide-box">
                        <div class="feature-trigger">
                            <span class="feature-trigger-tag">學測高頻應用 1</span>
                            <div class="feature-trigger-title">111、112 學測：超音波血流計（都卜勒測速儀）</div>
                        </div>
                        <div class="feature-bridge">
                            <div class="feature-bridge-title">➔ 物理模型解構</div>
                            <div class="feature-bridge-desc">
                                儀器探頭向人體發射固定頻率超音波，血管中流動的紅血球扮演反射體。紅血球流動時相對於探頭運動，反射回來的超音波頻率產生都卜勒頻移 $\\Delta f$。流速越快，頻率偏移量 $\\Delta f$ 越大。因此人體血流速率排序：動脈(A) &gt; 靜脈(V) &gt; 微血管(C) ➔ $\\Delta f_A > \\Delta f_V > \\Delta f_C$。
                            </div>
                        </div>
                        <div class="feature-trap">
                            <div class="feature-trap-title">⚡ 避坑指南</div>
                            <div class="feature-trap-desc">超音波跨越脂肪、肌肉與血管界面時會發生折射與反射，但頻率偏移量完全取決於紅血球與探頭的相對運動速度，與波在組織中的能量吸收無關。</div>
                        </div>
                    </div>

                    <div class="feature-guide-box">
                        <div class="feature-trigger">
                            <span class="feature-trigger-tag">學測高頻應用 2</span>
                            <div class="feature-trigger-title">114 學測 Q22-23：太空船向外飛行時的訊號頻率變化</div>
                        </div>
                        <div class="feature-bridge">
                            <div class="feature-bridge-title">➔ 物理模型解構</div>
                            <div class="feature-bridge-desc">
                                太空船自地球發射前往火星，航行過程持續遠離地球。都卜勒效應核心規律：<b>只要波源與觀察者的相對距離正在拉長，接收頻率就恆低於原發射頻率（$f < f_0$）</b>。無論太空船是加速遠離還是等速遠離，測得頻率皆 $f < f_0$。
                            </div>
                        </div>
                        <div class="feature-trap">
                            <div class="feature-trap-title">⚡ 避坑指南</div>
                            <div class="feature-trap-desc">易錯題常設陷阱：「加速遠離時頻率變大」➔ 錯！加速遠離會使頻率「比 $f_0$ 偏低得更多」（偏移量 $\\Delta f$ 變大），但接收頻率數值仍然恆小於原發射頻率 $f_0$。</div>
                        </div>
                    </div>

                    <div class="feature-guide-box">
                        <div class="feature-trigger">
                            <span class="feature-trigger-tag">學測高頻應用 3</span>
                            <div class="feature-trigger-title">115 學測 Q13：系外行星徑向速度法（恆星都卜勒頻移波形）</div>
                        </div>
                        <div class="feature-bridge">
                            <div class="feature-bridge-title">➔ 物理模型解構</div>
                            <div class="feature-bridge-desc">
                                行星與恆星繞共同質心公轉。當恆星公轉到「朝向地球接近」的半軌道時，光譜藍移（$f > f_0$）；當恆星公轉到「背離地球遠離」的半軌道時，光譜紅移（$f < f_0$）。地球觀測到的恆星頻率隨時間呈現週期性的週期波形圖。
                            </div>
                        </div>
                        <div class="feature-trap">
                            <div class="feature-trap-title">⚡ 避坑指南</div>
                            <div class="feature-trap-desc">光的都卜勒效應也是波動現象：紅移指波長變長、頻率變低（遠離）；藍移指波長變短、頻率變高（接近）。不要把天文光譜紅移誤記為顏色一定是紅光。</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 電磁波頻譜與應用（含繞射）——併入模組五；電荷運動模擬改放 N18 節點實驗。
        function emSpectrumSectionHtml() {
            const bands = [
                ['無線電波', '&gt; 1 m', '#45a85a'],
                ['微波', '1 mm～1 m', '#e1a72c'],
                ['紅外線', '700 nm～1 mm', '#ef7d32'],
                ['可見光', '400～700 nm', '#2fa9c7'],
                ['紫外線', '10～400 nm', '#7667c9'],
                ['X 射線', '0.01～10 nm', '#5069b3'],
                ['γ 射線', '&lt; 0.01 nm', '#8a5da8']
            ];
            const bandHtml = bands.map(band => `
                <div class="em-spectrum-band" style="--band-color:${band[2]};">
                    <strong>${band[0]}</strong>
                    <span>${band[1]}</span>
                </div>
            `).join('');
            const rows = [
                ['無線電波', '&gt; 1 m', '廣播、電視、低頻行動通訊', '波長較長，遇到相同尺度的建築物時較容易繞入陰影區'],
                ['微波', '1 mm～1 m', '行動通訊、Wi-Fi、雷達、微波爐', '常有較強直進性；金屬可反射微波'],
                ['紅外線', '約 μm', '熱像儀、遙控器；地表向外的熱輻射', '被大氣中二氧化碳、水氣吸收（溫室效應）'],
                ['可見光', '400～700 nm', '視覺、相機、光學顯微鏡', '日常孔洞遠大於波長，因此看起來近似直線傳播'],
                ['紫外線', '約 10～400 nm', '殺菌、螢光；使皮膚曬傷', '大部分被平流層的臭氧吸收'],
                ['X 射線', '約 0.01～10 nm', '醫學造影、晶體結構分析', '波長與原子間距相當，可形成晶體繞射圖樣'],
                ['γ 射線', '&lt; 0.01 nm', '核醫示蹤、放射治療', '頻率高、單一光子能量高']
            ];
            let body = '';
            rows.forEach(r => {
                body += `<tr><td style="font-weight:600; color:var(--text-main); white-space:nowrap;">${r[0]}</td><td style="white-space:nowrap;">${r[1]}</td><td>${r[2]}</td><td style="font-size:0.82rem;">${r[3]}</td></tr>`;
            });
            return `
                <section class="em-spectrum-section" id="em-spectrum-applications">
                <div class="handout-section-title">🌈 電磁波頻譜、應用與繞射</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div>所有電磁波在真空中的速率都相同，且滿足 $c=f\\lambda$。由左至右<b>頻率升高、波長縮短</b>；各波段的分界是約略範圍，不是突然改變的硬邊界。</div>
                </div>
                <div class="em-spectrum-axis" role="img" aria-label="電磁波由長波長低頻率排列到短波長高頻率">
                    <div class="em-spectrum-axis-head">
                        <span>← 波長較長・頻率較低</span>
                        <span>波長較短・頻率較高 →</span>
                    </div>
                    <div class="em-spectrum-band-grid">${bandHtml}</div>
                </div>
                <div class="spectrum-law-strip">
                    <div class="spectrum-law-item"><b>同一真空速率：</b>所有波段都以光速 $c$ 傳播，不是 γ 射線跑得比較快。</div>
                    <div class="spectrum-law-item"><b>頻率與波長反向：</b>同在真空中，$f$ 越高，$\\lambda=c/f$ 越短。</div>
                </div>
                <div class="edu-table-container">
                    <table class="edu-table">
                         <thead>
                             <tr>
                                 <th style="width:12%">波段</th>
                                 <th style="width:14%">波長（約）</th>
                                 <th style="width:30%">主要應用</th>
                                 <th>與繞射／吸收的關係</th>
                             </tr>
                         </thead>
                         <tbody>${body}</tbody>
                    </table>
                </div>
                <div class="handout-section-title" style="margin-top:1.75rem;">📡 七個生活情境，把頻譜、應用與繞射連起來</div>
                <div class="spectrum-story-grid">
                    <article class="spectrum-story-card" style="--card-accent:#2e6f9e;">
                        <header class="spectrum-story-head">
                            <span class="spectrum-story-kicker">廣播</span>
                            <h3>AM 與 FM：名稱是調變方式，也代表不同廣播頻段</h3>
                        </header>
                        <figure class="spectrum-photo-frame spectrum-photo-frame--radio">
                            <img src="assets/images/em-spectrum/am-fm-radio.jpg" width="1280" height="806" loading="lazy" decoding="async" alt="一台同時具有 AM 與 FM 頻段刻度的傳統收音機">
                            <figcaption class="spectrum-photo-callout">同一台收音機，兩段載波頻率相差近百倍</figcaption>
                        </figure>
                        <div class="spectrum-credit">圖片：<a href="https://commons.wikimedia.org/wiki/File:Older_AMFM_radio.jpg" target="_blank" rel="noopener noreferrer">Dsw4／Wikimedia Commons</a>（公有領域）</div>
                        <div class="spectrum-story-body">
                            <p class="spectrum-story-conclusion">AM、FM 是調變方式；日常說的 AM／FM 電台也各自使用不同廣播頻段。</p>
                            <div class="spectrum-fact-list">
                                <div><b>AM 526.5～1606.5 kHz：</b>波長約 190～570 m，較容易繞過地形與大型障礙物。</div>
                                <div><b>FM 88～108 MHz：</b>波長約 2.8～3.4 m，較接近視線傳播，遇大型障礙物時訊號陰影較明顯。</div>
                                <div><b>不要混淆：</b>AM／FM 不是電磁波種類；兩者都屬於無線電波。</div>
                            </div>
                        </div>
                    </article>

                    <article class="spectrum-story-card" style="--card-accent:#2673c9;">
                        <header class="spectrum-story-head">
                            <span class="spectrum-story-kicker">行動通訊</span>
                            <h3>3G、4G、5G：世代不是單一頻率</h3>
                        </header>
                        <figure class="spectrum-photo-frame spectrum-photo-frame--tower">
                            <img src="assets/images/em-spectrum/cell-tower.jpg" width="1280" height="960" loading="lazy" decoding="async" alt="架設多組行動通訊天線的基地台鐵塔">
                            <figcaption class="spectrum-photo-callout">低頻段重涵蓋，高頻段換取較寬頻寬</figcaption>
                        </figure>
                        <div class="spectrum-credit">圖片：<a href="https://commons.wikimedia.org/wiki/File:Mobile_telephone_antennas_tower.jpg" target="_blank" rel="noopener noreferrer">Leon Brooks／Wikimedia Commons</a>（公有領域）</div>
                        <div class="spectrum-story-body">
                            <p class="spectrum-story-conclusion">3G、4G、5G 是通訊技術世代，不各自對應唯一頻率；實際使用的頻段可能重疊。</p>
                            <div class="spectrum-fact-list">
                                <div><b>較低頻段：</b>波長較長，繞射較明顯，通常有利於遠距離與室內涵蓋。</div>
                                <div><b>較高頻段：</b>通常較容易取得較寬頻寬，可安排更多通道或更高資料率。</div>
                                <div><b>代價：</b>波長較短時，繞過大型障礙物的能力較弱，也較容易受到遮蔽與吸收。</div>
                            </div>
                        </div>
                    </article>

                    <article class="spectrum-story-card" style="--card-accent:#d18a1b;">
                        <header class="spectrum-story-head">
                            <span class="spectrum-story-kicker">微波</span>
                            <h3>微波爐網孔：微波出不來，眼睛卻看得進去</h3>
                        </header>
                        <figure class="spectrum-photo-frame spectrum-photo-frame--mesh">
                            <img src="assets/images/em-spectrum/microwave-door.jpg" width="1200" height="914" loading="lazy" decoding="async" alt="微波爐門上布滿細小孔洞的金屬網">
                            <figcaption class="spectrum-photo-callout">同一個網孔：對 12 cm 微波很小，對可見光卻很大</figcaption>
                        </figure>
                        <div class="spectrum-credit">圖片：<a href="https://commons.wikimedia.org/wiki/File:MW_door.jpg" target="_blank" rel="noopener noreferrer">Baran Ivo／Wikimedia Commons</a>（公有領域）</div>
                        <div class="spectrum-story-body">
                            <p class="spectrum-story-conclusion">判斷能不能穿過網孔，不能只看孔「小不小」，要把孔徑和波長相比。</p>
                            <div class="spectrum-fact-list">
                                <div><b>微波：</b>微波爐常用約 2.45 GHz，波長約 12 cm；金屬網孔遠小於波長，微波不易有效穿出。</div>
                                <div><b>可見光：</b>波長約 0.4～0.7 μm，遠小於網孔，所以能穿過孔洞讓人看見爐內。</div>
                            </div>
                        </div>
                    </article>

                    <article class="spectrum-story-card" style="--card-accent:#b85c42;">
                        <header class="spectrum-story-head">
                            <span class="spectrum-story-kicker">紅外線</span>
                            <h3>遙控器與熱像：看不見，不代表不存在</h3>
                        </header>
                        <figure class="spectrum-photo-frame">
                            <img src="assets/images/em-spectrum/infrared-thermal.jpg" width="960" height="720" loading="lazy" decoding="async" alt="以假色顯示人體與環境溫度差異的紅外線熱像圖">
                            <figcaption class="spectrum-photo-callout">顏色是感測器把紅外線強弱轉成的假色，不是物體真的變色</figcaption>
                        </figure>
                        <div class="spectrum-credit">圖片：<a href="https://commons.wikimedia.org/wiki/File:Thermal-image.jpg" target="_blank" rel="noopener noreferrer">MartinThoma／Wikimedia Commons</a>（CC0）</div>
                        <div class="spectrum-story-body">
                            <p class="spectrum-story-conclusion">紅外線位在可見紅光之外，可用來傳送訊號，也能偵測物體放出的熱輻射。</p>
                            <div class="spectrum-fact-list">
                                <div><b>遙控器：</b>常用約 <b>940 nm</b> 的近紅外線，以快速亮暗變化編碼指令。</div>
                                <div><b>熱像儀：</b>常偵測約 8～15 μm 的熱紅外線，再把強弱轉成可見的假色影像。</div>
                                <div><b>共同點：</b>紅外線和可見光都是電磁波，只是人眼感受不到紅外線。</div>
                            </div>
                        </div>
                    </article>

                    <article class="spectrum-story-card" style="--card-accent:#1595a2;">
                        <header class="spectrum-story-head">
                            <span class="spectrum-story-kicker">可見光</span>
                            <h3>可見光看起來直線傳播，縮小狹縫就看見繞射</h3>
                        </header>
                        <figure class="spectrum-photo-frame spectrum-photo-frame--diffraction">
                            <img src="assets/images/em-spectrum/visible-diffraction.jpg" width="960" height="423" loading="lazy" decoding="async" alt="雷射光分別通過二十微米與四十微米單狹縫後形成的繞射亮紋">
                            <figcaption class="spectrum-photo-callout">上：20 μm 狹縫　下：40 μm 狹縫</figcaption>
                        </figure>
                        <div class="spectrum-credit">圖片：<a href="https://commons.wikimedia.org/wiki/File:Slit_20um_40um.jpg" target="_blank" rel="noopener noreferrer">Pieter Kuiper／Wikimedia Commons</a>（公有領域）</div>
                        <div class="spectrum-story-body">
                            <p class="spectrum-story-conclusion">狹縫越窄，中央亮紋越寬：尺度 a 越接近波長 λ，繞射越明顯。</p>
                            <div class="spectrum-fact-list">
                                <div><b>日常情況：</b>門窗和牆角的尺度遠大於約 500 nm 的可見光波長，所以繞射角很小，看起來近似直線傳播。</div>
                                <div><b>照片判讀：</b>20 μm 狹縫比 40 μm 狹縫窄，因此上方亮紋展得更開。</div>
                            </div>
                        </div>
                    </article>

                    <article class="spectrum-story-card" style="--card-accent:#7455a8;">
                        <header class="spectrum-story-head">
                            <span class="spectrum-story-kicker">紫外線</span>
                            <h3>UVA、UVB、UVC：同是紫外線，到達地表的比例不同</h3>
                        </header>
                        <figure class="spectrum-photo-frame">
                            <img src="assets/images/em-spectrum/ultraviolet-uvc.jpg" width="960" height="720" loading="lazy" decoding="async" alt="實驗室密閉設備中使用紫外線進行表面消毒">
                            <figcaption class="spectrum-photo-callout">人工 UVC 可用於消毒，但必須避免眼睛與皮膚直接曝露</figcaption>
                        </figure>
                        <div class="spectrum-credit">圖片：<a href="https://commons.wikimedia.org/wiki/File:UV-ontsmetting_laminaire-vloeikast.JPG" target="_blank" rel="noopener noreferrer">Newbie~commonswiki／Wikimedia Commons</a>（公有領域）</div>
                        <div class="spectrum-story-body">
                            <p class="spectrum-story-conclusion">波長越短，單一光子的能量越高；但太陽光到達地表前，三類紫外線被大氣吸收的程度不同。</p>
                            <div class="uv-band-list">
                                <div class="uv-band-row"><b>UVA 315～400 nm</b><span>大多可到達地表；與曬黑、皮膚老化有關，仍需防護。</span></div>
                                <div class="uv-band-row"><b>UVB 280～315 nm</b><span>大部分被吸收，少量到達地表；容易造成曬傷。</span></div>
                                <div class="uv-band-row"><b>UVC 100～280 nm</b><span>太陽的 UVC 被大氣吸收；人工 UVC 可消毒，但不可直接照射人體。</span></div>
                            </div>
                        </div>
                    </article>

                    <article class="spectrum-story-card spectrum-story-card--wide" style="--card-accent:#6d5bb5;">
                        <header class="spectrum-story-head">
                            <span class="spectrum-story-kicker">X 射線</span>
                            <h3>X 射線醫學造影與晶體繞射：同一種波，兩種讀圖方式</h3>
                        </header>
                        <figure class="spectrum-photo-frame spectrum-photo-pair">
                            <img src="assets/images/em-spectrum/xray-chest.jpg" width="657" height="776" loading="lazy" decoding="async" alt="胸腔 X 光影像，可見骨骼與肺部形成不同明暗">
                            <img src="assets/images/em-spectrum/xray-crystal-diffraction.png" width="500" height="500" loading="lazy" decoding="async" alt="晶體產生的 X 射線繞射斑點圖樣">
                            <figcaption class="spectrum-photo-callout">左：組織吸收差異　右：晶體散射波的干涉圖樣</figcaption>
                        </figure>
                        <div class="spectrum-credit">圖片：<a href="https://commons.wikimedia.org/wiki/File:Chest_X-Ray.jpg" target="_blank" rel="noopener noreferrer">US Army／Wikimedia Commons</a>（公有領域）；<a href="https://commons.wikimedia.org/wiki/File:Beugungsbild_eines_Kristalls.png" target="_blank" rel="noopener noreferrer">Ain2000／Wikimedia Commons</a>（公有領域）</div>
                        <div class="spectrum-story-body">
                            <p class="spectrum-story-conclusion">醫學影像看穿透強度，晶體分析看干涉圖樣；兩者都利用短波長 X 射線與物質作用。</p>
                            <div class="spectrum-fact-list">
                                <div><b>醫學造影：</b>不同組織吸收與散射 X 射線的比例不同，偵測器記錄剩餘強度，形成明暗對比。</div>
                                <div><b>晶體繞射：</b>X 射線波長接近晶體中的原子間距，各處散射波彼此干涉，在特定方向形成亮點。</div>
                            </div>
                        </div>
                    </article>
                </div>

                <template class="spectrum-app-grid" aria-hidden="true">
                    <article class="spectrum-app-card" style="--card-accent:#2673c9;">
                        <h3>📶 3G、4G、5G：世代不是單一頻率</h3>
                        <div class="spectrum-app-figure" role="img" aria-label="長波較容易繞過建築物，短波在建築物後方形成較明顯的訊號陰影區">
                            <svg viewBox="0 0 440 180" aria-hidden="true" focusable="false">
                                <defs>
                                    <marker id="signal-long-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#2673c9"/></marker>
                                    <marker id="signal-short-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#e56b45"/></marker>
                                </defs>
                                <rect width="440" height="180" fill="#f7fbff"/>
                                <path d="M0 150 H440" stroke="#a9c9b1" stroke-width="3"/>
                                <g stroke="#31596e" stroke-width="5" fill="none"><path d="M42 150 L58 54 L74 150"/><path d="M49 112 H67 M46 130 H70"/></g>
                                <circle cx="58" cy="47" r="6" fill="#2673c9"/>
                                <path d="M47 42 Q58 31 69 42 M41 35 Q58 18 75 35" fill="none" stroke="#2673c9" stroke-width="3" stroke-linecap="round"/>
                                <rect x="178" y="55" width="104" height="95" rx="4" fill="#dce7ed" stroke="#688596" stroke-width="2"/>
                                <path d="M178 55 L230 25 L282 55" fill="#b9ccd6" stroke="#688596" stroke-width="2"/>
                                <g fill="#f8d77a"><rect x="194" y="74" width="18" height="24"/><rect x="224" y="74" width="18" height="24"/><rect x="251" y="74" width="18" height="24"/></g>
                                <path d="M72 71 C135 15 207 15 284 45 C330 62 356 77 393 91" fill="none" stroke="#2673c9" stroke-width="5" stroke-linecap="round" marker-end="url(#signal-long-arrow)"/>
                                <path d="M72 112 L168 102" fill="none" stroke="#e56b45" stroke-width="5" stroke-linecap="round" marker-end="url(#signal-short-arrow)"/>
                                <path d="M286 104 L404 138 L286 150 Z" fill="rgba(71,85,105,.1)"/>
                                <rect x="392" y="88" width="17" height="34" rx="3" fill="#ffffff" stroke="#31596e" stroke-width="3"/><circle cx="400.5" cy="115" r="2" fill="#31596e"/>
                                <text x="112" y="25" class="diagram-label" fill="#2673c9">長波：繞得過去</text>
                                <text x="292" y="160" class="diagram-note">短波：後方陰影較明顯</text>
                            </svg>
                        </div>
                        <div class="spectrum-app-summary">
                            <div><b>先釐清：</b>3G、4G、5G 是技術世代，不各自對應唯一頻率；使用頻段可以重疊。</div>
                            <div><b>低頻段：</b>波長較長，較容易繞過建築物，涵蓋距離通常較大。</div>
                            <div><b>5G 中、高頻段：</b>通常可取得<b>較寬頻寬</b>，能安排更多通道；但短波繞射較弱，也更容易形成訊號陰影。</div>
                        </div>
                    </article>
                    <article class="spectrum-app-card" style="--card-accent:#d18a1b;">
                        <h3>🍲 微波爐網孔：微波出不來，眼睛卻看得進去</h3>
                        <div class="spectrum-app-figure" role="img" aria-label="微波被金屬網門擋回爐內，可見光因波長遠小於網孔而能穿過網門進入眼睛">
                            <svg viewBox="0 0 440 180" aria-hidden="true" focusable="false">
                                <defs><pattern id="microwave-mesh" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2.1" fill="#ffffff" stroke="#536979" stroke-width="1.3"/></pattern></defs>
                                <rect width="440" height="180" fill="#fffaf1"/>
                                <rect x="25" y="25" width="292" height="132" rx="12" fill="#536979"/>
                                <rect x="39" y="39" width="262" height="104" rx="7" fill="#fff5df"/>
                                <path d="M58 88 C78 52 99 124 120 88 S162 52 184 88 S225 124 247 88" fill="none" stroke="#d18a1b" stroke-width="6" stroke-linecap="round"/>
                                <path d="M247 88 C228 66 211 66 194 88" fill="none" stroke="#e36a45" stroke-width="4" stroke-linecap="round"/>
                                <rect x="248" y="38" width="53" height="106" fill="url(#microwave-mesh)" stroke="#536979" stroke-width="2"/>
                                <path d="M79 113 L366 113" stroke="#1595a2" stroke-width="3"/>
                                <path d="M355 113 L344 106 V120 Z" fill="#1595a2"/>
                                <path d="M368 112 C383 92 404 93 416 112 C404 132 383 132 368 112 Z" fill="#ffffff" stroke="#31596e" stroke-width="3"/><circle cx="392" cy="112" r="8" fill="#1595a2"/><circle cx="392" cy="112" r="3" fill="#173f52"/>
                                <text x="60" y="55" class="diagram-label">微波 λ 約 12 cm</text>
                                <text x="251" y="28" class="diagram-note">金屬網孔 ≪ 微波波長</text>
                                <text x="319" y="151" class="diagram-note" fill="#1595a2">可見光穿過 → 眼睛</text>
                            </svg>
                        </div>
                        <div class="spectrum-app-summary">
                            <div><b>微波：</b>常用約 <b>2.45 GHz</b>，波長約 12 cm；金屬網反射微波，網孔又遠小於波長，因此不容易有效穿出。</div>
                            <div><b>可見光：</b>波長只有約 0.4～0.7 μm，遠小於網孔，所以可以穿過孔洞讓人看見爐內。</div>
                        </div>
                    </article>
                    <article class="spectrum-app-card" style="--card-accent:#1595a2;">
                        <h3>🔦 可見光看起來直線傳播</h3>
                        <div class="spectrum-app-figure" role="img" aria-label="可見光波長遠小於日常開口，通過大開口後只有邊緣稍微繞射，整體看起來近似直線前進">
                            <svg viewBox="0 0 440 180" aria-hidden="true" focusable="false">
                                <defs><marker id="visible-ray-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#1595a2"/></marker></defs>
                                <rect width="440" height="180" fill="#f4fcfd"/>
                                <circle cx="45" cy="90" r="17" fill="#ffe27a" stroke="#d4a72a" stroke-width="3"/>
                                <g stroke="#1595a2" stroke-width="3" fill="none" opacity=".75"><path d="M82 39 Q96 90 82 141"/><path d="M108 39 Q122 90 108 141"/><path d="M134 39 Q148 90 134 141"/></g>
                                <path d="M190 12 V58 M190 122 V168" stroke="#435f70" stroke-width="13" stroke-linecap="round"/>
                                <path d="M178 58 H202 M178 122 H202" stroke="#435f70" stroke-width="4"/>
                                <path d="M150 73 L388 63 M150 90 L397 90 M150 107 L388 117" stroke="#1595a2" stroke-width="3.5" fill="none" marker-end="url(#visible-ray-arrow)"/>
                                <path d="M202 58 L418 18 V58 L202 72 Z M202 108 L418 122 V162 L202 122 Z" fill="rgba(71,85,105,.08)"/>
                                <path d="M205 66 Q221 71 230 82 M205 114 Q221 109 230 98" fill="none" stroke="#e56b45" stroke-width="3" stroke-dasharray="5 4"/>
                                <text x="22" y="24" class="diagram-note">可見光 λ 約 500 nm</text>
                                <text x="162" y="92" class="diagram-label" text-anchor="end">a ≫ λ</text>
                                <text x="275" y="30" class="diagram-label" fill="#1595a2">大致直線前進</text>
                                <text x="249" y="153" class="diagram-note">只有開口邊緣稍微彎曲</text>
                            </svg>
                        </div>
                        <div class="spectrum-app-summary">
                            <div><b>日常尺度：</b>門窗、硬幣或牆角是 mm～m，遠大於約 500 nm 的可見光波長，因此繞射角很小，陰影邊界看起來清楚。</div>
                            <div><b>縮小狹縫：</b>當開口接近光波長，光仍會向外展開並形成明暗分布，顯示光具有波動性。</div>
                        </div>
                    </article>
                    <article class="spectrum-app-card" style="--card-accent:#6d5bb5;">
                        <h3>🩻 X 射線醫學造影與晶體繞射</h3>
                        <div class="spectrum-app-figure" role="img" aria-label="左側顯示不同人體組織吸收 X 射線造成影像對比，右側顯示 X 射線被晶體原子層散射後在特定方向加強">
                            <svg viewBox="0 0 440 180" aria-hidden="true" focusable="false">
                                <defs><marker id="xray-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#6d5bb5"/></marker></defs>
                                <rect width="440" height="180" fill="#faf8ff"/>
                                <line x1="220" y1="20" x2="220" y2="160" stroke="#d7d0e8" stroke-width="2" stroke-dasharray="5 5"/>
                                <g transform="translate(18 25)">
                                    <path d="M8 58 L38 42 V74 Z" fill="#6d5bb5"/><circle cx="5" cy="58" r="5" fill="#3f3474"/>
                                    <path d="M40 47 L145 31 M40 58 L145 58 M40 69 L145 85" stroke="#6d5bb5" stroke-width="3" opacity=".72"/>
                                    <path d="M88 18 C70 30 72 48 78 58 C72 71 70 92 88 104 C106 93 104 71 98 58 C104 46 106 30 88 18 Z" fill="#f2cbbf" stroke="#a96d62" stroke-width="2"/>
                                    <path d="M88 32 V84 M79 49 H97 M81 67 H95" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
                                    <rect x="145" y="23" width="31" height="70" rx="4" fill="#3f4a59"/>
                                    <path d="M151 34 H170 M151 45 H170 M151 56 H170 M151 67 H170 M151 78 H170" stroke="#d9dee5" stroke-width="3"/>
                                    <text x="88" y="124" class="diagram-label" text-anchor="middle">不同吸收 → 影像對比</text>
                                </g>
                                <g transform="translate(235 23)">
                                    <path d="M7 28 L74 68" stroke="#6d5bb5" stroke-width="4" marker-end="url(#xray-arrow)"/>
                                    <g stroke="#708697" stroke-width="2"><path d="M35 91 H177"/><path d="M35 113 H177"/><path d="M35 135 H177"/></g>
                                    <g fill="#8ab8c7"><circle cx="52" cy="91" r="5"/><circle cx="84" cy="91" r="5"/><circle cx="116" cy="91" r="5"/><circle cx="148" cy="91" r="5"/><circle cx="68" cy="113" r="5"/><circle cx="100" cy="113" r="5"/><circle cx="132" cy="113" r="5"/><circle cx="164" cy="113" r="5"/><circle cx="52" cy="135" r="5"/><circle cx="84" cy="135" r="5"/><circle cx="116" cy="135" r="5"/><circle cx="148" cy="135" r="5"/></g>
                                    <path d="M77 68 L132 26 M77 68 L164 51" fill="none" stroke="#e56b45" stroke-width="4" marker-end="url(#xray-arrow)"/>
                                    <text x="102" y="157" class="diagram-label" text-anchor="middle">散射波干涉 → 繞射點</text>
                                </g>
                            </svg>
                        </div>
                        <div class="spectrum-app-summary">
                            <div><b>醫學造影：</b>不同組織吸收與散射的比例不同，偵測器記錄剩餘強度，形成影像對比；使用時需依醫療需要控制劑量。</div>
                            <div><b>晶體分析：</b>X 射線波長接近原子間距，各原子層散射波彼此<b>干涉</b>，特定方向加強形成<b>晶體繞射</b>圖樣。</div>
                        </div>
                    </article>
                </template>
                <div class="diffraction-guide" id="diffraction-scale-guide">
                    <h3>🌀 繞射判斷核心：比較波長 $\\lambda$ 與尺度 $a$</h3>
                    <div class="diffraction-scale-grid">
                        <article class="diffraction-scale-card">
                            <strong>$a \\gg \\lambda$</strong>
                            障礙物或開口遠大於波長，繞射只集中在邊緣，整體看起來近似直線前進。例：可見光通過門窗。
                        </article>
                        <article class="diffraction-scale-card">
                            <strong>$a \\approx \\lambda$</strong>
                            尺度與波長相近，波會明顯彎入幾何陰影區或由狹縫向外散開，繞射最容易觀察。
                        </article>
                        <article class="diffraction-scale-card">
                            <strong>$a \\ll \\lambda$</strong>
                            若是小障礙物，波容易繞過；若是極小狹縫，穿過的能量很少，但穿出的部分會向廣角散開。微波爐網孔屬後者。
                        </article>
                    </div>
                    <button class="spectrum-node-link print-hide" data-spectrum-link="N17" type="button" onclick="navigateTo('node-N17')">前往 N17：干涉、繞射與尺度判讀 →</button>
                </div>

                ${maxwellWaveSupplementHtml()}

                <div class="handout-section-title" style="margin-top:1.75rem;">📝 電磁波如何由天線送出</div>
                <div class="info-alert" style="border-left:4px solid var(--accent-orange); background-color:var(--accent-orange-light);">
                    <span class="info-alert-icon">📡</span>
                    <div>手機天線中的高頻交流電，使自由電子持續改變速度大小或方向，也就是做加速度運動，因而向外發射電磁波。接收天線中的電荷受到電磁波作用後振動，將訊號轉回電路中的交流電。</div>
                </div>
                </section>
            `;
        }

        // 光電效應：雷納實驗、古典困境、愛因斯坦解釋——併入模組七
        function photoelectricSectionHtml() {
            const rows = [
                ['存在「底限頻率」：入射光頻率低於某值時，無論光多強、照多久都打不出電子', '光能量與強度（振幅）有關且可連續累積 → 任何頻率只要夠強或照夠久都應能打出電子（不該有底限頻率）', '✗ 矛盾'],
                ['光電子的「最大動能」只由入射光頻率決定，與光強無關', '光越強（能量越大）→ 光電子動能應越大', '✗ 矛盾'],
                ['光一照射就「瞬時」射出電子，沒有時間延遲', '弱光需要一段時間累積足夠能量後才會發射電子', '✗ 矛盾'],
                ['光越強，射出的光電子「數目」越多（光電流越大）', '光越強能量越多，射出電子越多', '✓ 一致']
            ];
            let body = '';
            rows.forEach(r => {
                const ok = r[2].startsWith('✓');
                body += `<tr><td style="font-size:0.85rem;">${r[0]}</td><td style="font-size:0.85rem; color:var(--text-muted);">${r[1]}</td><td style="text-align:center; white-space:nowrap; font-weight:700; color:${ok ? 'var(--accent-green)' : 'var(--accent-rose)'};">${r[2]}</td></tr>`;
            });
            return `
                <div class="handout-section-title">💡 光電效應：雷納實驗、古典的困境與愛因斯坦的解釋</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div>光照射金屬使電子逸出，稱為<b>光電效應</b>。<b>雷納（Lenard）</b>約在 1902 年以實驗仔細研究，歸納出幾個「古典波動說無法解釋」的關鍵事實——正是這些矛盾，催生了愛因斯坦的光量子論。</div>
                </div>

                <div class="formula-card-title" style="margin:1rem 0 0.5rem 0;">🔬 實驗設計：變因分析</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width:28%">探究的問題</th>
                                <th>操縱變因</th>
                                <th>應變變因</th>
                                <th>控制變因</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>入射光「頻率」如何影響光電效應？</b></td>
                                <td>入射光的頻率（更換不同顏色／波長的光源）</td>
                                <td>① 是否產生光電流（能否打出光電子）<br>② 光電子的最大動能 $E_{k,\\text{max}}$（以截止電壓測量）</td>
                                <td>入射光的強度（維持單位時間內的光子數）、光電管金屬靶材質（同一塊金屬）</td>
                            </tr>
                            <tr>
                                <td><b>入射光「強度」如何影響光電效應？</b></td>
                                <td>入射光的強度（改變光源功率，或在功率固定下調整照射距離）</td>
                                <td>飽和光電流大小（代表單位時間射出的光電子數目）</td>
                                <td>入射光的頻率（須高於底限頻率且維持定值）、光電管金屬靶材質（同一塊金屬）</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="formula-card-title" style="margin:1.25rem 0 0.5rem 0;">📊 實驗事實 vs 古典波動說的預測</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width:40%">雷納等人的實驗事實</th>
                                <th style="width:44%">古典波動說的預測</th>
                                <th>是否相符</th>
                            </tr>
                        </thead>
                        <tbody>${body}</tbody>
                    </table>
                </div>

                <div class="formula-card-title" style="margin:1.5rem 0 0.5rem 0;">🔍 深度解析：為什麼古典波動說預測會有「時間延遲」（照射時間）？</div>
                <div class="info-alert" style="background-color: var(--primary-blue-light); border-color: rgba(29, 78, 216, 0.15); color: var(--text-main); line-height: 1.6; margin-bottom: 1.5rem;">
                    <div>
                        <strong>1. 能量的古典討論（連續波模型）：</strong><br>
                        在古典波動說中，光是連續傳播的電磁波，其能量均勻分布在整個波前上。如果入射光極為微弱（強度很低），這股能量就會被平均分散到金屬表面所有的原子上，每個電子只能接收到其中極小的一小部分。<br>
                        * <strong>時間延遲（照射時間的累積）</strong>：若要讓一個電子累積到足以脫離金屬所需的最低能量（功函數 $W \\approx 2\\text{ eV} \\approx 3.2\\times10^{-19}\\text{ J}$），電子必須像蓄水池一樣，花費數小時、數天甚至數年的<strong>「照射時間」</strong>持續吸收並累積光波能量。因此，波動說預測在弱光照射下，應有明顯的「時間延遲」。<br><br>
                        <strong>2. 能量的近代討論（光量子一對一碰撞）：</strong><br>
                        愛因斯坦的光量子論指出，光的能量不是連續分布的，而是集中在一個個微小的能量包（光子）中。單個光子的能量為 $E = hf$。<br>
                        * <strong>瞬時發射（與照射時間無關）</strong>：光與電子的交互作用是「一對一的碰撞」。一旦入射光的頻率 $f$ 高於底限頻率 $f_0$，代表單個光子的能量 $hf$ 已經大於功函數 $W$。當光子擊中電子時，電子會<strong>瞬間</strong>吸取該光子的全部能量並逸出，整個過程小於 $10^{-9}$ 秒，<strong>完全不需要照射時間的累積</strong>。<br>
                        * <strong>若頻率不足</strong>：若單個光子能量 $hf < W$，不論照射時間多長、光強度多強（光子數再多），電子都無法透過「多次累積」來逸出，因為電子無法儲存零散的光子能量。
                    </div>
                </div>

                <div class="feature-guide-box" style="margin-top:1rem;">
                    <div class="feature-trigger">
                        <span class="feature-trigger-tag">古典的困境</span>
                        <div class="feature-trigger-title">波動說把光能量看成「可連續累積」，因此無法解釋「底限頻率」、「動能只與頻率有關」與「瞬時發射」。</div>
                    </div>
                    <div class="feature-bridge">
                        <div class="feature-bridge-title">➔ 愛因斯坦的光量子（光子）解釋（1905）</div>
                        <div class="feature-bridge-desc">愛因斯坦提出：光是一顆顆能量為 $E=hf$ 的「光子」，與電子進行「一對一」的能量交換。由能量守恆：<br><div class="formula-display" style="margin:0.5rem 0;">$$ hf = W + E_{k,\\text{max}} $$</div>其中 $W$ 為<b>功函數</b>（電子脫離金屬表面所需的最低能量）。<br>① <b>頻率</b>決定每顆光子的能量 $hf$ → 決定能否打出電子（底限頻率 $f_0 = W/h$）與光電子的最大動能；<br>② <b>強度</b>決定光子的「數目」 → 決定射出光電子的「數目」（光電流）；<br>③ <b>瞬時發射</b>：單一光子把能量瞬間交給電子，不需要時間累積。<br>此舉確立光的「粒子性」（波粒二象性），愛因斯坦也因此獲 1921 年諾貝爾物理獎。</div>
                    </div>
                </div>
            `;
        }

        // 普朗克量子論與黑體輻射：黑體概念、古典困境（紫外災難）、量子假說、光譜圖判讀——併入模組七
        function blackbodyQuantumSectionHtml() {
            const rows = [
                ['紫外災難（古典理論的崩潰）', '根據能量均分定理，古典波動說預測黑體發射的電磁波能量密度在短波（紫外光）處趨向無窮大（紫外災難），這與實驗完全不符（短波處能量趨近於 0）。', '古典物理的極限'],
                ['普朗克量子假說（1900）', '普朗克提出：黑體器壁原子諧振子的能量是不連續的，只能以 $E = hf$ 的整數倍（量子）來交換。這解決了紫外災難，並催生了量子力學。', '能量量子化'],
                ['維恩位移定律', '黑體輻射光譜中，能量密度的峰值波長 $\\lambda_{\\max}$ 與絕對溫度 $T$ 成反比：$\\lambda_{\\max} T = 2.898 \\times 10^6 \\text{ nm}\\cdot\\text{K}$。溫度越高，峰值越偏向短波長（高頻）。', '光譜峰值隨溫度移動'],
                ['史蒂芬—波茲曼定律', '黑體表面單位面積所發射的總輻射功率（光譜總面積）與絕對溫度的四次方成正比：$P \\propto T^4$。溫度微升，輻射總功率便會劇烈增大。', '輻射總能量隨 $T^4$ 暴增']
            ];
            let body = '';
            rows.forEach(r => {
                body += `<tr><td style="font-size:0.85rem; font-weight:700;">${r[0]}</td><td style="font-size:0.85rem; color:var(--text-muted);">${r[1]}</td><td style="text-align:center; white-space:nowrap; font-weight:700; color:var(--primary-blue);">${r[2]}</td></tr>`;
            });
            return `
                <div class="handout-section-title">💡 普朗克量子論與黑體輻射</div>
                <div class="info-alert">
                    <span class="info-alert-icon">💡</span>
                    <div>當物體受熱時會向外輻射電磁波。一個能完全吸收所有外來電磁波而不反射的理想吸收體，稱為<b>黑體</b>。黑體所發射的電磁波光譜分布（黑體輻射），是十九世紀末物理學的重大謎題，更是量子物理的起點。</div>
                </div>

                <div class="formula-card-title" style="margin:1.25rem 0 0.5rem 0;">📝 核心觀念對照表</div>
                <div class="edu-table-container">
                    <table class="edu-table">
                        <thead>
                            <tr>
                                <th style="width:25%">概念主題</th>
                                <th style="width:60%">物理意義與公式</th>
                                <th>關鍵焦點</th>
                            </tr>
                        </thead>
                        <tbody>${body}</tbody>
                    </table>
                </div>

                <div class="formula-card-title" style="margin:1.5rem 0 0.5rem 0;">🔍 深度解析：為什麼古典物理會預測出「紫外災難」？</div>
                <div class="info-alert" style="background-color: var(--primary-blue-light); border-color: rgba(29, 78, 216, 0.15); color: var(--text-main); line-height: 1.6; margin-bottom: 1.5rem;">
                    <div>
                        <strong>1. 古典電磁波動說（Rayleigh-Jeans 公式）：</strong><br>
                        在十九世紀末，瑞立與金斯假設空腔壁上的原子諧振子與空腔中的電磁波處於熱平衡。根據古典能量均分定理，每個電磁波簡諧模式（駐波）不論頻率高低，平均能量皆為 $kT$。由於空腔中高頻（短波）駐波的模式數與頻率平方成正比，這導致在短波（紫外光、X 射線）處，空腔壁發射的輻射能量密度將隨波長變短而趨向<strong>無窮大</strong>！<br>
                        * <strong>古典論的失敗（紫外災難）</strong>：任何溫度下的黑體都會在紫外光區釋放無限能量，這顯然是荒謬的。實驗結果表明，在高頻短波處，輻射能量密度其實急遽衰退至零。<br><br>
                        <strong>2. 普朗克的量子假說（不連續能量包）：</strong><br>
                        普朗克在 1900 年放棄了古典物理中能量是連續的假設，大膽提出能量的「量子化假設」：<br>
                        * <strong>能量量子化</strong>：器壁原子諧振子在吸收或放出能量時，不能是連續的，只能以 $E = hf$ 的整數倍（即 $E_n = n h f$）為單位交換。由於高頻短波（$f$ 極高）的單個能量包 $hf$ 太大，遠超過熱運動的平均能量 $kT$，導致這些高頻模式極難被激發，因此短波處的能量密度急遽下降為零，成功消除了紫外災難。<br>
                        * <strong>普朗克常數 $h$</strong>：此常數的引入標誌著現代物理（量子論）的誕生，其數值為 $6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}$。
                    </div>
                </div>

                <div class="feature-guide-box" style="margin-top:1rem;">
                    <div class="feature-trigger">
                        <span class="feature-trigger-tag">光譜圖判讀要點</span>
                        <div class="feature-trigger-title">黑體光譜曲線的兩大規律（學測最常考）：</div>
                    </div>
                    <div class="feature-bridge">
                        <div class="feature-bridge-title">➔ 維恩位移定律與史蒂芬—波茲曼定律的定量判讀</div>
                        <div class="feature-bridge-desc">
                            ① <b>峰值波長與溫度反比</b>：波長峰值 $\\lambda_{\\max} \\propto 1/T$。當物體溫度升高時，它發出最強光的波長會變短。例如：常溫物體（300 K）輻射峰值在紅外線；恆星表面（6000 K）輻射峰值在可見光（呈白黃色）；超高溫星體（20000 K）輻射峰值在紫外光（呈藍色）。<br>
                            ② <b>總出射度與溫度四次方正比</b>：總輻射功率（即圖形曲線下的總面積）為 $M = \\sigma T^4$。溫度如果加倍，發射電磁波的總能量將暴增為原來的 $2^4 = 16$ 倍！<br>
                            * <strong>範例（111 學測 Q7-8）</strong>：太陽表面溫度為 6000 K，地球表面溫度為 300 K。根據 $\\lambda_{\\max} T = b$，太陽輻射最強波長在可見光（約 500 nm），地球輻射最強波長在紅外線（約 10 μm，長波長）。
                        </div>
                    </div>
                </div>
            `;
        }

        // ===== 3D Dipole Antenna & EM Wave Simulation Javascript Logic =====
        function dipoleAntennaHtml() {
            // Wavelength & Amplitude
            const lambda = 160;
            const A = 48;
            const theta = 30 * Math.PI / 180; // Cavalier projection angle
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            const yOrigin = 115;
            const xStart = 120;
            const xEnd = 880;

            // Generate Wave Paths
            // We start drawing from x = 120 - lambda = -40 to x = 880 to ensure seamless translation
            let ePoints = [];
            let bPoints = [];
            
            for (let x = -40; x <= xEnd; x += 4) {
                const relativeX = x - xStart;
                const sine = Math.sin((2 * Math.PI * relativeX) / lambda);
                
                // E-Field wave (vertical XY plane)
                const yE = yOrigin - A * sine;
                ePoints.push(x + "," + yE);
                
                // B-Field wave (tilted XZ plane projection)
                const xB = x - A * sine * cosT;
                const yB = yOrigin + A * sine * sinT;
                bPoints.push(xB + "," + yB);
            }
            
            const pathE = "M " + ePoints.join(" L ");
            const pathB = "M " + bPoints.join(" L ");
            
            // Generate closed paths for filled 2D wave sheets
            const fillPathE = "M -40," + yOrigin + " L " + ePoints.join(" L ") + " L 880," + yOrigin + " Z";
            const fillPathB = "M -40," + yOrigin + " L " + bPoints.join(" L ") + " L 880," + yOrigin + " Z";

            // Generate field vectors (arrows)
            let eArrows = "";
            let bArrows = "";
            
            // Placed every lambda / 8 = 20px
            for (let x = -40; x <= xEnd; x += 20) {
                const relativeX = x - xStart;
                const sine = Math.sin((2 * Math.PI * relativeX) / lambda);
                if (Math.abs(sine) < 0.05) continue; // Skip nodes

                // E Arrow
                const yE = yOrigin - A * sine;
                eArrows += '<line x1="' + x + '" y1="' + yOrigin + '" x2="' + x + '" y2="' + yE + '" class="dipole-vector-e" marker-end="url(#arrow-cyan)" />';

                // B Arrow
                const xB = x - A * sine * cosT;
                const yB = yOrigin + A * sine * sinT;
                bArrows += '<line x1="' + x + '" y1="' + yOrigin + '" x2="' + xB + '" y2="' + yB + '" class="dipole-vector-b" marker-end="url(#arrow-orange)" />';
            }
            
            // 360-degree radial lines for Stage 1 Static Electric Field
            let staticRadialLines = "";
            for (let a = 0; a < 360; a += 30) {
                if (a === 0 || a === 180) continue; // Skip horizontal lines (propagation axis handles right, left is drawn manually below)
                const rad = a * Math.PI / 180;
                const x2 = 70 + 75 * Math.cos(rad);
                const y2 = yOrigin + 75 * Math.sin(rad);
                staticRadialLines += '<line x1="70" y1="' + yOrigin + '" x2="' + x2 + '" y2="' + y2 + '" marker-end="url(#arrow-cyan)" />';
            }
            // Add left radiating line (going to x=10)
            staticRadialLines += '<line x1="70" y1="' + yOrigin + '" x2="10" y2="' + yOrigin + '" marker-end="url(#arrow-cyan)" />';

            let html = "";
            html += "<div class=\"handout-section-title\" style=\"margin-top: 1.75rem;\">🔍 觀念深度剖析：電荷運動與電磁波概念建構模擬</div>";
            
            // Progressive concept building tabs
            html += "<div class=\"dipole-sim-container stage-4\" id=\"dipole-sim-box\">";
            html += "    <div class=\"sim-row\" style=\"margin-bottom: 0.2rem; justify-content: center; gap: 0.5rem; flex-wrap: wrap;\">";
            html += "        <button class=\"bank-chip-btn stage-btn\" id=\"btn-stage-1\" onclick=\"setDipoleStage(1)\">1. 靜止：v = 0</button>";
            html += "        <button class=\"bank-chip-btn stage-btn\" id=\"btn-stage-2\" onclick=\"setDipoleStage(2)\">2. 等速：a = 0</button>";
            html += "        <button class=\"bank-chip-btn stage-btn\" id=\"btn-stage-3\" onclick=\"setDipoleStage(3)\">3. 加速：a ≠ 0</button>";
            html += "        <button class=\"bank-chip-btn stage-btn active\" id=\"btn-stage-4\" onclick=\"setDipoleStage(4)\">4. 完整電磁波</button>";
            html += "    </div>";

            html += "    <div class=\"dipole-svg-wrap\">";
            html += "        <svg viewBox=\"0 0 900 230\" xmlns=\"http://www.w3.org/2000/svg\">";
            html += "            <defs>";
            html += "                <marker id=\"arrow-cyan\" viewBox=\"0 0 10 10\" refX=\"5\" refY=\"5\" markerWidth=\"5\" markerHeight=\"5\" orient=\"auto-start-reverse\">";
            html += "                    <path d=\"M 0 1.5 L 10 5 L 0 8.5 z\" fill=\"#22d3ee\" />";
            html += "                </marker>";
            html += "                <marker id=\"arrow-orange\" viewBox=\"0 0 10 10\" refX=\"5\" refY=\"5\" markerWidth=\"5\" markerHeight=\"5\" orient=\"auto-start-reverse\">";
            html += "                    <path d=\"M 0 1.5 L 10 5 L 0 8.5 z\" fill=\"#f97316\" />";
            html += "                </marker>";
            html += "                <clipPath id=\"wave-clip\">";
            html += "                    <rect x=\"110\" y=\"0\" width=\"770\" height=\"230\" />";
            html += "                </clipPath>";
            html += "            </defs>";
            html += "            <g class=\"dipole-grid\">";
            html += "                <line x1=\"50\" y1=\"115\" x2=\"880\" y2=\"115\" class=\"dipole-axis-solid\" />";
            html += "                <line x1=\"120\" y1=\"20\" x2=\"120\" y2=\"210\" class=\"dipole-e-axis\" style=\"stroke:#22d3ee; stroke-width:1; stroke-dasharray: 2 2;\" />";
            html += "                <line x1=\"85\" y1=\"135\" x2=\"155\" y2=\"95\" class=\"dipole-b-axis\" style=\"stroke:#f97316; stroke-width:1; stroke-dasharray: 2 2;\" />";
            html += "                <text x=\"875\" y=\"130\" fill=\"#294b55\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"end\" class=\"dipole-c-axis\">傳播方向 c</text>";
            html += "                <text x=\"125\" y=\"25\" fill=\"#22d3ee\" font-size=\"11\" font-weight=\"bold\" class=\"dipole-e-axis\">E (電場)</text>";
            html += "                <text x=\"160\" y=\"92\" fill=\"#f97316\" font-size=\"11\" font-weight=\"bold\" class=\"dipole-b-axis\">B (磁場)</text>";
            html += "            </g>";
            html += "            <g clip-path=\"url(#wave-clip)\">";
            html += "                <g style=\"transform: scaleX(var(--dipole-scale)); transform-origin: 120px 115px;\">";
            html += "                    <g class=\"dipole-wave-group\">";
            html += "                        <!-- E-Field 2D Shading sheet -->";
            html += "                        <path d=\"" + fillPathE + "\" class=\"dipole-wave-e-fill\" />";
            html += "                        <!-- B-Field 2D Shading sheet -->";
            html += "                        <path d=\"" + fillPathB + "\" class=\"dipole-wave-b-fill\" />";
            
            html += "                        <path d=\"" + pathE + "\" class=\"dipole-wave-e\" vector-effect=\"non-scaling-stroke\" />";
            html += eArrows;
            html += "                        <path d=\"" + pathB + "\" class=\"dipole-wave-b\" vector-effect=\"non-scaling-stroke\" />";
            html += bArrows;
            html += "                    </g>";
            html += "                </g>";
            html += "            </g>";
            // Stage 1 Static Elements: 360-degree radial field lines + horizontal propagation line
            html += "            <g class=\"static-radial-fields\" style=\"display:none;\">" + staticRadialLines + "</g>";
            
            html += "            <g class=\"dipole-wave-static\" style=\"display:none;\">";
            html += "                <line x1=\"70\" y1=\"115\" x2=\"880\" y2=\"115\" class=\"dipole-wave-static\" />";
            html += "            </g>";
            
            html += "            <g class=\"static-wave-arrows\" style=\"display:none;\">";
            html += "                <line x1=\"200\" y1=\"115\" x2=\"210\" y2=\"115\" stroke=\"rgba(34, 211, 238, 0.5)\" stroke-width=\"1.2\" marker-end=\"url(#arrow-cyan)\" />";
            html += "                <line x1=\"360\" y1=\"115\" x2=\"370\" y2=\"115\" stroke=\"rgba(34, 211, 238, 0.5)\" stroke-width=\"1.2\" marker-end=\"url(#arrow-cyan)\" />";
            html += "                <line x1=\"520\" y1=\"115\" x2=\"530\" y2=\"115\" stroke=\"rgba(34, 211, 238, 0.5)\" stroke-width=\"1.2\" marker-end=\"url(#arrow-cyan)\" />";
            html += "                <line x1=\"680\" y1=\"115\" x2=\"690\" y2=\"115\" stroke=\"rgba(34, 211, 238, 0.5)\" stroke-width=\"1.2\" marker-end=\"url(#arrow-cyan)\" />";
            html += "                <line x1=\"840\" y1=\"115\" x2=\"850\" y2=\"115\" stroke=\"rgba(34, 211, 238, 0.5)\" stroke-width=\"1.2\" marker-end=\"url(#arrow-cyan)\" />";
            html += "            </g>";

            // Stage 2: a charge and its nearby E/B fields translate together at constant velocity.
            html += "            <line x1=\"150\" y1=\"115\" x2=\"760\" y2=\"115\" class=\"charge-track uniform-track\" />";
            html += "            <g class=\"uniform-charge-group\">";
            html += "                <circle cx=\"190\" cy=\"115\" r=\"14\" fill=\"#0f9eaa\" />";
            html += "                <text x=\"190\" y=\"115\" fill=\"white\" font-size=\"14\" font-weight=\"bold\" text-anchor=\"middle\" dominant-baseline=\"central\">+q</text>";
            html += "                <g stroke=\"#0f9eaa\" stroke-width=\"1.6\" opacity=\"0.72\">";
            html += "                    <line x1=\"170\" y1=\"115\" x2=\"145\" y2=\"115\" marker-end=\"url(#arrow-cyan)\"/><line x1=\"210\" y1=\"115\" x2=\"235\" y2=\"115\" marker-end=\"url(#arrow-cyan)\"/>";
            html += "                    <line x1=\"190\" y1=\"95\" x2=\"190\" y2=\"70\" marker-end=\"url(#arrow-cyan)\"/><line x1=\"190\" y1=\"135\" x2=\"190\" y2=\"160\" marker-end=\"url(#arrow-cyan)\"/>";
            html += "                    <line x1=\"176\" y1=\"101\" x2=\"157\" y2=\"82\" marker-end=\"url(#arrow-cyan)\"/><line x1=\"204\" y1=\"101\" x2=\"223\" y2=\"82\" marker-end=\"url(#arrow-cyan)\"/>";
            html += "                    <line x1=\"176\" y1=\"129\" x2=\"157\" y2=\"148\" marker-end=\"url(#arrow-cyan)\"/><line x1=\"204\" y1=\"129\" x2=\"223\" y2=\"148\" marker-end=\"url(#arrow-cyan)\"/>";
            html += "                </g>";
            html += "                <ellipse cx=\"190\" cy=\"115\" rx=\"48\" ry=\"17\" fill=\"none\" stroke=\"#e86f2d\" stroke-width=\"2\" stroke-dasharray=\"5 3\" />";
            html += "                <line x1=\"245\" y1=\"82\" x2=\"310\" y2=\"82\" stroke=\"#294b55\" stroke-width=\"2.4\" marker-end=\"url(#arrow-cyan)\" />";
            html += "                <text x=\"278\" y=\"70\" fill=\"#294b55\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\">v 恆定，a = 0</text>";
            html += "                <text x=\"190\" y=\"190\" fill=\"#355f6b\" font-size=\"11\" text-anchor=\"middle\">局部 E、B 場跟著電荷移動；沒有向外脫離的輻射波</text>";
            html += "            </g>";

            // Accelerating single charge structure: vertical guide track + glowing +q charge ball in SHM
            html += "            <g id=\"charge-oscillator\">";
            html += "                <!-- Vertical guide track representing SHM boundaries -->";
            html += "                <line x1=\"70\" y1=\"25\" x2=\"70\" y2=\"205\" class=\"charge-track\" />";
            html += "                <line x1=\"60\" y1=\"25\" x2=\"80\" y2=\"25\" stroke=\"#475569\" stroke-width=\"1.5\" />";
            html += "                <line x1=\"60\" y1=\"205\" x2=\"80\" y2=\"205\" stroke=\"#475569\" stroke-width=\"1.5\" />";
            html += "                <text x=\"70\" y=\"15\" fill=\"#94a3b8\" font-size=\"10\" text-anchor=\"middle\">y (位置)</text>";
            
            html += "                <!-- Glowing single +q charge ball animating up and down -->";
            html += "                <g class=\"charge-group\">";
            html += "                    <circle cx=\"70\" cy=\"115\" r=\"14\" fill=\"#22d3ee\" filter=\"drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))\" />";
            html += "                    <text x=\"70\" y=\"115\" fill=\"#0f172a\" font-size=\"15\" font-weight=\"bold\" text-anchor=\"middle\" dominant-baseline=\"central\">+q</text>";
            html += "                </g>";
            html += "            </g>";
            html += "        </svg>";
            html += "    </div>";
            html += "    <div class=\"sim-controls\">";
            html += "        <div class=\"sim-row\" style=\"justify-content: space-between; align-items: center;\">";
            html += "            <div style=\"display: flex; gap: 0.5rem;\">";
            html += "                <button class=\"bank-chip-btn active\" id=\"btn-dipole-play\" onclick=\"toggleDipolePlay()\">⏸ 暫停</button>";
            html += "            </div>";
            html += "            <div style=\"display: flex; gap: 1rem; align-items: center;\">";
            html += "                <label style=\"font-size:0.85rem; color:var(--text-main); font-weight:700;\">顯示通道：</label>";
            html += "                <label style=\"font-size:0.82rem; color:var(--text-muted); cursor:pointer;\">";
            html += "                    <input type=\"checkbox\" checked onchange=\"toggleDipoleField('e', this.checked)\"> 電場 E";
            html += "                </label>";
            html += "                <label style=\"font-size:0.82rem; color:var(--text-muted); cursor:pointer;\">";
            html += "                    <input type=\"checkbox\" checked onchange=\"toggleDipoleField('b', this.checked)\"> 磁場 B";
            html += "                </label>";
            html += "            </div>";
            html += "        </div>";
            html += "        <div class=\"sim-row\">";
            html += "            <span class=\"sim-label\">電荷運動快慢 (簡諧運動頻率 f)</span>";
            html += "            <input id=\"dipole-frequency\" type=\"range\" min=\"1\" max=\"3\" step=\"1\" value=\"2\" oninput=\"changeDipoleFreq(this)\">";
            html += "            <span class=\"sim-val\" id=\"dipole-val-freq\" style=\"font-weight:bold;\">中頻 (標準波長)</span>";
            html += "        </div>";
            html += "    </div>";
            html += "    <div class=\"sim-readout\" id=\"dipole-sim-readout\">";
            html += "        <span class=\"sim-chip\">幾何：<b>E ⊥ B</b></span>";
            html += "        <span class=\"sim-chip\">方向：<b>E × B</b></span>";
            html += "        <span class=\"sim-chip\">真空波速：<b>c = fλ</b></span>";
            html += "    </div>";
            html += "    <div class=\"sim-note\">";
            html += "        💡 <b>物理觀念導引：</b><br>";
            html += "        1. <b>先分清楚場與輻射</b>：靜止電荷有靜電場；等速電荷的電場與磁場跟著它一起移動，但不形成向遠方帶走能量的輻射場。<br>";
            html += "        2. <b>有加速度才會輻射</b>：只要速度大小或方向改變（包含一段等加速運動或往復振動），電場資訊便無法整體同步調整，擾動會以電磁波向外傳播。<br>";
            html += "        3. <b>完整幾何關係</b>：遠離波源的電磁波滿足 $\\vec E\\perp\\vec B$，且傳播方向沿 $\\vec E\\times\\vec B$；真空中仍有 $c=f\\lambda$。";
            html += "    </div>";
            html += "</div>";
            return html;
        }

        function emWaveDirectionRuleHtml() {
            return `
                <section class="edu-card" id="em-wave-direction-rule" style="margin-top:1.5rem;">
                    <div class="formula-card-title">🖐️ 右手開掌判斷電磁波方向</div>
                    <div class="em-direction-grid">
                        <svg class="em-direction-figure" viewBox="0 0 560 320" role="img" aria-labelledby="em-hand-title em-hand-desc" shape-rendering="geometricPrecision">
                            <title id="em-hand-title">以右手判斷電場、磁場與電磁波傳播方向</title>
                            <desc id="em-hand-desc">一隻張開的右手。拇指朝上對準電場 E，併攏的四根手指朝左下對準磁場 B，掌心推出的方向朝右，代表電磁波傳播方向 c。</desc>
                            <defs>
                                <marker id="em-arrow-e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="18" markerHeight="18" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,1 L9,5 L0,9 Z" fill="#0797a3"/></marker>
                                <marker id="em-arrow-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="18" markerHeight="18" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,1 L9,5 L0,9 Z" fill="#e86f2d"/></marker>
                                <marker id="em-arrow-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="18" markerHeight="18" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,1 L9,5 L0,9 Z" fill="#315b78"/></marker>
                                <filter id="em-hand-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#315b78" flood-opacity="0.16"/></filter>
                            </defs>
                            <image href="assets/images/em-wave-right-hand.png" x="70" y="8" width="350" height="306" preserveAspectRatio="xMidYMid meet" filter="url(#em-hand-shadow)"/>

                            <line x1="270" y1="56" x2="270" y2="13" stroke="#0797a3" stroke-width="7" stroke-linecap="round" marker-end="url(#em-arrow-e)"/>
                            <rect x="292" y="10" width="148" height="32" rx="16" fill="#e8f8f9" stroke="#94d9de"/>
                            <text x="366" y="31" text-anchor="middle" fill="#087e88" font-size="17" font-weight="800">拇指＝電場 E</text>

                            <line x1="156" y1="216" x2="67" y2="270" stroke="#e86f2d" stroke-width="7" stroke-linecap="round" marker-end="url(#em-arrow-b)"/>
                            <rect x="17" y="278" width="176" height="32" rx="16" fill="#fff1e9" stroke="#f4bd9f"/>
                            <text x="105" y="299" text-anchor="middle" fill="#b95322" font-size="17" font-weight="800">四指＝磁場 B</text>

                            <circle cx="298" cy="157" r="15" fill="#fff" stroke="#315b78" stroke-width="4"/>
                            <circle cx="298" cy="157" r="5" fill="#315b78"/>
                            <line x1="313" y1="157" x2="522" y2="157" stroke="#315b78" stroke-width="8" stroke-linecap="round" marker-end="url(#em-arrow-c)"/>
                            <rect x="351" y="111" width="184" height="34" rx="17" fill="#edf5fb" stroke="#afc9da"/>
                            <text x="443" y="133" text-anchor="middle" fill="#264b66" font-size="17" font-weight="800">掌心推出＝方向 c</text>
                        </svg>
                        <div class="em-direction-instruction">
                            <div class="em-direction-lead">只要對準兩個箭頭，第三個方向就由掌心決定。</div>
                            <div class="em-direction-step" style="--step-color:#0797a3;">
                                <span class="em-direction-step-num">1</span>
                                <div>把右手的<strong>拇指</strong>對準題目的<strong>電場 E</strong>。</div>
                            </div>
                            <div class="em-direction-step" style="--step-color:#d85c20;">
                                <span class="em-direction-step-num">2</span>
                                <div>轉動整隻右手，讓<strong>併攏四指</strong>對準<strong>磁場 B</strong>。</div>
                            </div>
                            <div class="em-direction-step" style="--step-color:#315b78;">
                                <span class="em-direction-step-num">3</span>
                                <div><strong>掌心推出去</strong>的方向，就是電磁波的<strong>傳播方向 c</strong>。</div>
                            </div>
                            <div class="em-direction-check">
                                <b>固定對應：</b>拇指 E、四指 B、掌面法向 c。若 E 或 B 反向，就把整隻右手重新轉到兩個箭頭都吻合。
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        window.setDipoleStage = function(stage) {
            const box = document.getElementById('dipole-sim-box');
            if (!box) return;

            stage = Math.max(1, Math.min(4, Number(stage) || 1));
            box.classList.remove('stage-1', 'stage-2', 'stage-3', 'stage-4');
            box.classList.add('stage-' + stage);

            document.querySelectorAll('.stage-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.getElementById('btn-stage-' + stage);
            if (activeBtn) activeBtn.classList.add('active');

            const playBtn = document.getElementById('btn-dipole-play');
            const freqSlider = document.getElementById('dipole-frequency');
            const readout = document.getElementById('dipole-sim-readout');
            const reduceMotion = PhysicsRuntime.prefersReducedMotion();
            const readouts = {
                1: ['速度：<b>v = 0</b>', '加速度：<b>a = 0</b>', '結果：<b>只有靜電場，不輻射</b>'],
                2: ['速度：<b>v 恆定</b>', '加速度：<b>a = 0</b>', '結果：<b>有局部 E、B 場，不輻射</b>'],
                3: ['速度：<b>正在改變</b>', '加速度：<b>a ≠ 0</b>', '結果：<b>場的擾動向外輻射</b>'],
                4: ['幾何：<b>E ⊥ B</b>', '方向：<b>E × B</b>', '真空波速：<b>c = fλ</b>']
            };

            if (readout) {
                readout.innerHTML = readouts[stage].map(text => `<span class="sim-chip">${text}</span>`).join('');
            }

            if (stage === 1) {
                if (playBtn) {
                    playBtn.disabled = false;
                    playBtn.textContent = '▶ 播放加速示範';
                    playBtn.classList.remove('active');
                }
                if (freqSlider) freqSlider.disabled = true;
                box.classList.add('paused');
            } else {
                const userEnabledMotion = box.classList.contains('user-motion-enabled');
                box.classList.toggle('paused', reduceMotion && !userEnabledMotion);
                if (playBtn) {
                    playBtn.disabled = false;
                    const isPaused = box.classList.contains('paused');
                    playBtn.textContent = isPaused ? '▶ 播放動畫' : '⏸ 暫停';
                    playBtn.classList.toggle('active', !isPaused);
                }
                if (freqSlider) freqSlider.disabled = stage === 2;
            }
        };

        window.toggleDipolePlay = function() {
            const box = document.getElementById('dipole-sim-box');
            const btn = document.getElementById('btn-dipole-play');
            if (!box || !btn) return;
            
            if (box.classList.contains('stage-1')) {
                box.classList.add('user-motion-enabled');
                setDipoleStage(3);
                return;
            }

            if (PhysicsRuntime.prefersReducedMotion() && !box.classList.contains('user-motion-enabled')) {
                box.classList.add('user-motion-enabled');
                box.classList.remove('paused');
                btn.textContent = '⏸ 暫停';
                btn.classList.add('active');
                return;
            }
            
            const isPaused = box.classList.toggle('paused');
            btn.textContent = isPaused ? '▶ 播放' : '⏸ 暫停';
            btn.classList.toggle('active', !isPaused);
        };

        window.changeDipoleFreq = function(el) {
            const val = parseInt(el.value);
            const textSpan = document.getElementById('dipole-val-freq');
            const root = document.documentElement;
            
            let freqText = "中頻 (標準波長)";
            let scale = "1.0";
            let duration = "1.6s";
            
            if (val === 1) {
                freqText = "慢速擺動 (低頻、長波長 λ)";
                scale = "2.0";
                duration = "3.2s";
            } else if (val === 3) {
                freqText = "快速擺動 (高頻、短波長 λ)";
                scale = "0.5";
                duration = "0.8s";
            }
            
            if (textSpan) textSpan.textContent = freqText;
            root.style.setProperty('--dipole-scale', scale);
            root.style.setProperty('--dipole-dur', duration);
        };

        window.toggleDipoleField = function(field, isChecked) {
            const box = document.getElementById('dipole-sim-box');
            if (!box) return;
            
            if (field === 'e') {
                box.classList.toggle('hide-e', !isChecked);
            } else if (field === 'b') {
                box.classList.toggle('hide-b', !isChecked);
            }
        };

        function initDipoleConceptLab() {
            if (!document.getElementById('dipole-sim-box')) return;
            document.documentElement.style.setProperty('--dipole-scale', '1.0');
            document.documentElement.style.setProperty('--dipole-dur', '1.6s');
            setDipoleStage(4);
            registerViewDisposer(() => {
                document.documentElement.style.removeProperty('--dipole-scale');
                document.documentElement.style.removeProperty('--dipole-dur');
            });
        }

