// 互動實驗：楊氏雙狹縫干涉
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 12. 光的干涉實驗（楊氏雙狹縫） ------------------------------------ */
        LABS.young = {
            name: '光的干涉實驗（楊氏雙狹縫）',
            floating: true,
            cycle: 1.85,
            tag: 'N19',
            hint: '「實驗裝置」模式＝楊氏 1801 年的原始裝置：平行光先過單狹縫 S₀ 成為新線光源，使 S₁、S₂ 落在同一波前上而成為同相同調光。「幾何與公式」模式則把課本圖 (a) 畫出來——拖動 P 點，看波程差 Δℓ = d sinθ 在整數倍與半整數倍波長之間變化，即時判定亮紋或暗紋。',
            hintFor: (p) => ({
                inquiry: '<b>比較模型預測：</b>用直線和分岔模型數亮點，分岔模型可左右拖曳屏幕。切到繩波或 Wi‑Fi，在同一個 P 遮住一條縫，觀察兩列波疊加造成的變化。',
                geometry: '<b>幾何關係（真實比例）</b>：L 約是 d 的一萬倍，一開始兩道光疊成一條線。用滾輪、雙指或「放大倍率」往狹縫放大：兩道光分開，看得出它們<b>平行</b>；再放大到 A 點，從 S₂ 作垂線，另一道光多走的 Δℓ = d sinθ，綠色刻度每格 1 λ。拖曳可移動畫面，雙擊回到中心。改「P 點高度」看 Δℓ 在整數倍與半整數倍波長之間變化。',
                colors: '<b>不只一種顏色時，屏幕上會怎樣？</b>每一種波長各自形成一組條紋（Δy = Lλ/d），不同顏色之間沒有固定相位差，所以屏幕上是<b>強度相加</b>。選「雙色光」找兩色亮紋第一次重合的位置 n₁λ₁ = n₂λ₂；選「白光」看中央白、內紫外紅、外圈級次重疊；選「兩個獨立光源」看兩組條紋錯開時，亮暗對比怎麼消失。「顯示方式」可以先<b>分開</b>看每一色（每一個光源）各自的條紋，再看<b>合併</b>後的結果，上下對齊方便比較。',
                view3d: '<b>3D 立體模擬</b>：拖曳畫面旋轉、滾輪或雙指縮放，「視角」可切到正對屏幕或從上往下看。狹縫沿上下方向很長，水平面上看得到兩縫發出的子波疊加，屏幕上則是與狹縫平行的直條紋。可改成多色光，「比例」預設是<b>遠看（L ≫ d）</b>：整排狹縫小到像一個點，從各縫到屏幕的光幾乎平行；切到<b>近看</b>才放大看得到每一道波。縫數 N 可以一路加到 150，看亮紋怎麼變細（光柵）。雙色光可切「只看 λ₁／只看 λ₂／兩色合併」；「只開 1 條縫」則可對照：同一道光通過兩條縫時，合併後<b>不是</b>亮度相加，而會出現干涉條紋。'
            })[p.mode] || '「實驗裝置」模式＝楊氏 1801 年的原始裝置：平行光先過單狹縫 S₀ 成為新線光源，使 S₁、S₂ 落在同一波前上而成為同相同調光。「幾何與公式」模式則把課本圖 (a) 畫出來——拖動 P 點，看波程差 Δℓ = d sinθ 在整數倍與半整數倍波長之間變化，即時判定亮紋或暗紋。',
            note: '圖中尺寸未按實際比例。遠屏條件 L ≫ d，加上中央附近 |y| ≪ L，才可用 sinθ ≈ tanθ ≈ y/L。兩同相點光源模型下，亮紋波程差為整數倍 λ，暗紋為半整數倍 λ；忽略單縫包絡時亮紋近似等亮。',
            noteFor: (p) => ({
                inquiry: '<b>如何讀圖：</b>橙色對應 S₁，藍色對應 S₂。分岔模型用相隔 12 mm 的兩縫作示意，每縫五條固定方向的射線，只計落在固定大小屏幕內的亮點。繩波以位移相加表示增強或抵消。Wi‑Fi 用同一個 2.4 GHz 發射源，兩窄縫寬各 6 cm、相隔 45 cm，接收面上的顏色深淺代表相對接收強度。',
                colors: '<b>為什麼是強度相加</b>：兩列波的合成強度 = I₁ + I₂ + 干涉項；干涉項取決於兩者的相位差。不同顏色頻率不同，相位差每秒變化約 10¹⁴ 次，眼睛看到的是平均值，干涉項平均為 0；兩盞各自發光的燈也一樣。只有同一光源分出來的光（例如穿過兩條縫的同一道光）才有固定相位差，才會干涉。<br><b>重合條件</b>：λ₁ 的第 n₁ 亮紋與 λ₂ 的第 n₂ 亮紋重合 ⇔ 光程差 d sinθ 同時是兩者的整數倍：n₁λ₁ = n₂λ₂。例：600 nm 與 450 nm，3 × 600 = 4 × 450 = 1800 nm。<br><b>白光</b>：只有中央亮紋是白色；第 1 級內紫外紅；第 2 級紅光已和第 3 級紫光重疊，愈外面顏色愈混雜。<br><b>光源要窄</b>：寬的光源 = 許多個彼此不同調的點光源，各自的條紋互相錯開，加起來就糊掉了，這也是楊氏要先讓光通過單狹縫 S₀ 的原因。本模式忽略單縫繞射包絡。',
                view3d: '<b>比例</b>：「遠看」接近真實比例（L ≫ d），狹縫小到看不見，另附放大圖；「近看」為了看得到波，把波長放大、L 縮短，λ₀ 表示 550 nm 對應的示意長度。數值請用「實驗裝置」「多波長疊加」模式的實際單位。<br><b>屏幕條紋與水平面一致</b>：屏幕上的亮度和水平面用同一套計算，水平面上的亮帶一定打在屏幕的亮紋上。<br><b>縫寬 a</b>：每條縫本身也會繞射，亮紋亮度受單縫包絡 sin²β/β² 調節，a sinθ = λ 的方向附近，雙縫亮紋也會變暗。<br><b>縫數 N</b>：N 條等間距縫的主亮紋位置仍是 d sinθ = nλ，但 N 愈多亮紋愈細，兩主亮紋之間有 N − 1 個暗紋（光柵的原理）。遠看時最多 150 條；近看因為要逐點計算波，最多畫 8 條。<br><b>遠看與近看</b>：遠看用夫朗和斐近似（L ≫ d），亮度只由方向 θ 決定，亮紋細到小於一個像素時，依像素涵蓋的角度範圍取平均，所以細亮紋不會漏掉。'
            })[p.mode] || '圖中尺寸未按實際比例。遠屏條件 L ≫ d，加上中央附近 |y| ≪ L，才可用 sinθ ≈ tanθ ≈ y/L。兩同相點光源模型下，亮紋波程差為整數倍 λ，暗紋為半整數倍 λ；忽略單縫包絡時亮紋近似等亮。',
            teach: `
                <h4>小組探究：用證據選模型</h4>
                <p>搭配上方「操作與討論」模式。先各自畫出光通過一條縫後可能的樣子，再選一個小組模型，寫下它對雙縫的預測。</p>
                <ol>
                    <li><b>數亮點。</b>兩縫都開，先看直線模型的兩點。再切到分岔模型，固定屏幕範圍為 ±20 mm，比較屏幕在 0.6 m 與 2.0 m 時有幾個亮點。</li>
                    <li><b>看位移疊加。</b>切到繩波，依序選屏幕中央和雙縫第一暗紋的位置。觀察兩列繩波疊加後的位移，再遮住一條縫，看抵消會怎麼變。</li>
                    <li><b>看繞射再干涉。</b>切到 Wi‑Fi，先開一條縫，沿圓弧看波如何往外展開，再打開第二條縫，比較接收面上訊號強弱的分布。</li>
                </ol>
                <details class="lesson-disclosure"><summary>比對模型的證據（操作後再打開）</summary>
                    <div class="disclosure-content">
                    <ul>
                        <li><b>直線模型。</b>兩條光路各在狹縫的正後方留一個亮點。</li>
                        <li><b>分岔模型。</b>每條線打到屏幕才留一個亮點。固定屏幕往後移，部分光線的落點會移到屏幕外，亮點數就會變少。</li>
                        <li><b>繩波模型。</b>兩列波可以到達同一處。波峰遇波峰會增強，波峰遇同樣大小的波谷會抵消。</li>
                        <li><b>Wi‑Fi 模型。</b>波穿過各窄縫後繞射展開。同一發射源的兩道波重疊，接收面上會出現強弱相間的訊號。</li>
                    </ul>
                    <p>用「只加亮度」的規則，兩縫各自都照到的地方，合起來只會更亮。若雙縫同開反而變暗，就需要能說明抵消的規則。請用一個屏幕位置和整體圖樣作為證據。</p>
                    <p>最後用一句話說清楚：「我們原先猜＿＿；當我們只改＿＿，看到＿＿；因此保留或修正＿＿模型。」若做實體實驗，請另記錄單縫亮帶的形狀與暗紋是否全暗。</p></div>
                </details>
                <h4>討論：多種波長、多個光源疊在一起時</h4>
                <h5>1. 先問：這兩道光會不會干涉？</h5>
                <p>兩列波疊加後的亮度 = I₁ + I₂ + <b>干涉項</b>；干涉項的正負由兩者的相位差決定。要看到穩定的亮暗紋，相位差必須固定不變（同調）。</p>
                <ul>
                    <li><b>同一道光穿過 S₁、S₂</b>：來自同一個光源、同一個波前，相位差固定 → 會干涉，形成條紋。</li>
                    <li><b>不同顏色</b>：頻率不同，相位差每秒變化約 10¹⁴ 次，干涉項一下正一下負，平均為 0 → 不會互相干涉。</li>
                    <li><b>兩盞各自發光的燈（即使同色）</b>：燈裡的原子各自隨機發光，相位差也一直亂跳 → 不會互相干涉。</li>
                </ul>
                <p>所以「多波長」「多光源」的規則只有一條：<b>每一組同調的光各自干涉、各自形成條紋，屏幕上再把強度相加</b>。上方「多波長疊加」模式的黑色曲線就是 I₁ + I₂。</p>
                <p class="teach-tip"><b>課堂上可以這樣對照「分開」與「合併」</b>：① 「多波長疊加」選「分開＋合併」，上面幾條是每一色（或每一個光源）單獨的條紋，最下面是合併結果，同一個位置上下對齊，合併 = 各條亮度直接相加。② 3D 模式選「只開 1 條縫」：只有寬寬的單縫亮帶；改回「所有縫都打開」卻出現細條紋——同一道光穿過兩條縫是<b>振幅相加</b>（會干涉），和不同顏色的<b>強度相加</b>正好形成對比。</p>
                <h5>2. 雙色光：亮紋什麼時候重合？</h5>
                <p>每一色仍然滿足 Δy = Lλ/d，波長長的條紋間距大。兩色的亮紋要落在同一點，那裡的光程差 d sinθ 必須同時是兩個波長的整數倍：</p>
                <p class="teach-tip"><b>n₁λ₁ = n₂λ₂</b>。例：λ₁ = 600 nm、λ₂ = 450 nm，λ₁ : λ₂ = 4 : 3，所以 3 × 600 = 4 × 450 = 1800 nm：λ₁ 的第 3 亮紋與 λ₂ 的第 4 亮紋第一次重合，位置 y = 3·Lλ₁/d。中央（n = 0）則永遠重合。</p>
                <p>同樣的想法也能找「λ₁ 的暗紋落在 λ₂ 的亮紋上」的位置：那裡只看得到 λ₂ 的顏色。</p>
                <h5>3. 白光：中央白、內紫外紅、愈外面愈糊</h5>
                <ul>
                    <li>中央 n = 0：每一色光程差都是 0，全部是亮紋 → <b>白色</b>，這也是用白光找中央亮紋的方法。</li>
                    <li>第 1 級：紫光（400 nm）的亮紋最靠近中央，紅光（700 nm）最遠 → <b>內紫外紅</b>的一小段光譜。</li>
                    <li>第 2 級的紅光光程差 2 × 700 = 1400 nm，已經超過第 3 級紫光的 3 × 400 = 1200 nm：<b>級次互相重疊</b>，顏色混在一起，再往外幾級就幾乎變成均勻的白色，看不到條紋。</li>
                </ul>
                <h5>4. 為什麼楊氏要先用單狹縫 S₀？</h5>
                <p>寬的燈泡可以看成許多個彼此不同調的點光源。每個點光源都讓雙縫產生一組條紋，但光源位置不同，條紋就跟著平移；許多組錯開的條紋強度相加，亮暗就被抹平了（「兩個獨立光源」模式中，平移 0.5 Δy 時條紋完全消失）。先讓光通過很窄的 S₀，等於只留下一個點光源，條紋才清楚。</p>
                <h5>5. 3D：為什麼屏幕上是直條紋？</h5>
                <p>狹縫沿上下方向很長，每一個高度的光都以同樣的方式干涉，所以屏幕上同一條鉛直線的亮度都相同 → 與狹縫平行的直條紋。3D 模式也可以把縫數一路加到 150 條：主亮紋的位置仍是 d sinθ = nλ，但縫愈多亮紋愈細愈銳利，之間多出 N − 1 個暗紋與 N − 2 個小亮紋，這就是光柵的原理（延伸）；白光加上 100 條縫，各色亮紋就分成一道道光譜。</p>
                <h5>6. 3D：為什麼要「遠看」？</h5>
                <p>真實實驗中 d 約 0.1 mm、L 約 1 m，L 大約是 d 的一萬倍。從屏幕上看，兩條縫幾乎在同一點，連到屏幕同一點的兩條光線幾乎<b>平行</b>，所以波程差可以寫成 d sinθ，亮紋只由<b>方向</b>決定：水平面上的亮帶都是從狹縫處射出去的直線。「近看」則把狹縫附近放大，讓你看得到每一道波怎麼疊加，但那時 L 只有 d 的幾倍，亮帶還帶點彎曲，屬於放大示意。</p>`,
            height: (p, w) => p.mode === 'inquiry' ? (w >= 640 ? 258 : 426) : p.mode === 'colors' ? (w >= 640 ? 600 : 680) : p.mode === 'view3d' ? (w >= 640 ? 520 : 440) : 470,
            modes: [
                { key: 'setup', label: '實驗裝置與干涉場' },
                { key: 'inquiry', label: '操作與討論' },
                { key: 'geometry', label: '幾何關係與公式' },
                { key: 'colors', label: '多波長疊加' },
                { key: 'view3d', label: '3D 立體模擬' }
            ],
            onReset: (p) => { SlitOptics.setView(p, 'oblique'); p._gz = { panX: 0, panY: 0 }; },
            setup: (env) => {
                SlitOptics.bind3D(env, (p) => p.mode === 'view3d');
                SlitOptics.bindGeom(env, (p) => p.mode === 'geometry');
                SlitOptics.bindYoungInquiry(env);
            },
            controls: [
                { key: 'inquiryPoint', label: '觀察點 P', value: 'center', fmt: () => '', only: ['inquiry'], options: [
                    { value: 'center', label: '屏幕中央' }, { value: 'dark', label: '雙縫第一暗紋的位置' },
                    { value: 'bright', label: '雙縫第一側亮紋的位置' }, { value: 'manual', label: '手動移動 P' }] },
                { key: 'inquirySlits', label: '開哪條縫', value: 'both', fmt: () => '', only: ['inquiry'], options: [
                    { value: 'both', label: 'S₁、S₂ 都開' }, { value: 's1', label: '只開 S₁（遮 S₂）' }, { value: 's2', label: '只開 S₂（遮 S₁）' }] },
                { key: 'inquiryModel', label: '要檢驗的模型', value: 'parallel', fmt: () => '', only: ['inquiry'], options: [
                    { value: 'parallel', label: '1. 直線模型' }, { value: 'fan', label: '2. 分岔模型' },
                    { value: 'rope', label: '3. 繩波疊加' }, { value: 'wifi', label: '4. Wi‑Fi 繞射與干涉' },
                    { value: 'add', label: '對照：均勻照明只加亮度' }] },
                { key: 'inquiryY', label: 'P 的位置', min: -1000, max: 1000, step: 0.0005, value: 0,
                  fmt: (v, p) => p.inquiryModel === 'wifi' ? `${(v / 10).toFixed(1)} cm` : `${v.toFixed(p.inquiryModel === 'parallel' || p.inquiryMm <= 1 ? 4 : 2)} mm`,
                  only: ['inquiry'], showIf: (p) => p.inquiryPoint === 'manual' },
                { key: 'inquiryMm', label: '固定屏幕範圍', value: 20, fmt: () => '', only: ['inquiry'], showIf: (p) => !['parallel', 'wifi'].includes(p.inquiryModel),
                  options: [0.25, 1, 5, 10, 20, 40, 80, 160].map((v) => ({ value: v, label: `±${v} mm` })) },
                { key: 'src', label: '光源', value: 'two', only: ['colors'], fmt: () => '', options: [
                    { value: 'mono', label: '單色光（對照組）' }, { value: 'two', label: '雙色光（λ₁ ＋ λ₂）' },
                    { value: 'white', label: '白光（400–700 nm）' }, { value: 'pair', label: '兩個同色、各自獨立的光源' }] },
                { key: 'src3', label: '光源', value: 'mono', only: ['view3d'], fmt: () => '', options: [
                    { value: 'mono', label: '單色光' }, { value: 'two', label: '雙色光（λ₁ ＋ λ₂）' }, { value: 'white', label: '白光' }] },
                { key: 'lam', label: '波長 λ (nm)', min: 400, max: 700, step: 5, value: 550, fmt: (v) => `${v} nm`,
                  showIf: (p) => p.mode === 'colors' ? ['mono', 'pair'].includes(p.src) : p.mode === 'view3d' ? p.src3 === 'mono' : p.mode !== 'inquiry' || p.inquiryModel === 'rope' },
                { key: 'layout', label: '顯示方式', value: 'both', only: ['colors'], fmt: () => '', showIf: (p) => p.src !== 'mono', options: [
                    { value: 'both', label: '分開＋合併（並列對照）' }, { value: 'split', label: '只看分開' }, { value: 'merge', label: '只看合併' }] },
                { key: 'comp3', label: '分開／合併', value: 'all', only: ['view3d'], fmt: () => '', showIf: (p) => p.src3 === 'two', options: [
                    { value: 'all', label: '兩色合併' }, { value: 'l1', label: '只看 λ₁' }, { value: 'l2', label: '只看 λ₂' }] },
                { key: 'lam1', label: '波長 λ₁ (nm)', min: 400, max: 700, step: 5, value: 600, fmt: (v) => `${v} nm`, only: ['colors', 'view3d'],
                  showIf: (p) => (p.mode === 'colors' ? p.src : p.src3) === 'two' },
                { key: 'lam2', label: '波長 λ₂ (nm)', min: 400, max: 700, step: 5, value: 450, fmt: (v) => `${v} nm`, only: ['colors', 'view3d'],
                  showIf: (p) => (p.mode === 'colors' ? p.src : p.src3) === 'two' },
                { key: 'shift', label: '光源 B 的條紋相對 A 平移', min: 0, max: 1, step: 0.05, value: 0.25, fmt: (v) => `${v.toFixed(2)} Δy`, only: ['colors'],
                  showIf: (p) => p.src === 'pair' },
                { key: 'd', label: '狹縫間距 d (μm)', min: 20, max: 400, step: 5, value: 120, fmt: (v) => `${v} μm`, only: ['setup', 'inquiry', 'geometry', 'colors'],
                  showIf: (p) => p.mode !== 'inquiry' || ['parallel', 'rope'].includes(p.inquiryModel) },
                { key: 'L', label: '屏幕距離 L (m)', min: 0.3, max: 2.5, step: 0.1, value: 1.2, fmt: (v) => `${v.toFixed(1)} m`, only: ['setup', 'inquiry', 'geometry', 'colors'] },
                { key: 'yn', label: 'P 點高度（以 Δy 為單位）', min: -300, max: 300, step: 5, value: 100, fmt: (v) => `${(v / 100).toFixed(2)} Δy`, only: ['geometry'] },
                { key: 'gz', label: '放大倍率（往狹縫放大）', min: 0, max: 6.5, step: 0.05, value: 0, fmt: (v) => `×${SlitOptics.fmtZ(Math.pow(10, v))}`, only: ['geometry'] },
                { key: 'open3', label: '狹縫', value: 'all', only: ['view3d'], fmt: () => '', options: [
                    { value: 'all', label: '所有縫都打開' }, { value: 'one', label: '只開 1 條縫（其餘遮住）' }] },
                { key: 'n3', label: '縫數 N', min: 2, max: 150, step: 1, value: 2, fmt: (v) => v === 2 ? '2（雙狹縫）' : `${v} 條`, only: ['view3d'] },
                { key: 'dl', label: '縫距 d（λ₀ = 550 nm 的倍數）', min: 2, max: 20, step: 0.5, value: 18, fmt: (v) => `${v} λ₀`, only: ['view3d'] },
                { key: 'al', label: '縫寬 a（λ₀ 的倍數；a 夠大才看得到單縫包絡）', min: 0.3, max: 6, step: 0.1, value: 3, fmt: (v, p) => `${v.toFixed(1)} λ₀${v > p.dl * 0.95 ? `（不能超過 d，以 ${(p.dl * 0.95).toFixed(1)} λ₀ 計）` : ''}`, only: ['view3d'] },
                { key: 'L3', label: '屏幕距離 L（示意；愈小，屏幕涵蓋的角度愈大）', min: 6, max: 26, step: 1, value: 8, fmt: (v) => `${v}`, only: ['view3d'] },
                { key: 'gain3', label: '亮度增強（像拍照曝光；上方強度曲線仍是真實比例）', min: 1, max: 60, step: 1, value: 1, fmt: (v) => v === 1 ? '1×（真實比例）' : `${v}×`, only: ['view3d'] },
                { key: 'scale3', label: '比例', value: 'far', only: ['view3d'], fmt: () => '', options: [
                    { value: 'far', label: '遠看：L ≫ d（接近真實比例）' }, { value: 'near', label: '近看：放大看波怎麼疊加' }] },
                { key: 'show3', label: '水平面上顯示', value: 'instant', only: ['view3d'], showIf: (p) => p.scale3 === 'near', fmt: () => '', options: [
                    { value: 'instant', label: '瞬間的波（動畫）' }, { value: 'average', label: '平均亮度（眼睛看到的）' }] },
                { key: 'cam', label: '視角', value: 'oblique', only: ['view3d'], fmt: () => '', onChange: (v, p) => SlitOptics.setView(p, v), options: [
                    { value: 'oblique', label: '斜上方' }, { value: 'top', label: '從上往下看' }, { value: 'screen', label: '正對屏幕' }, { value: 'side', label: '側面' }, { value: 'slits', label: '看狹縫（放大）' }] },
                { key: 'curve', label: '屏幕上方畫強度曲線', type: 'checkbox', value: true, only: ['view3d'] }
            ],
            readouts: (p) => {
                if (p.mode === 'inquiry') return SlitOptics.youngInquiryReadouts(p);
                if (p.mode === 'colors') return SlitOptics.youngColorReadouts(p);
                if (p.mode === 'view3d') return SlitOptics.young3DReadouts(p);
                const lam = p.lam * 1e-9, d = p.d * 1e-6;
                const dy = p.L * lam / d;
                if (p.mode === 'geometry') {
                    const q = p.yn / 100;                                   // Δℓ / λ
                    const y = q * dy;
                    const near = (x) => Math.abs(x - Math.round(x));
                    const bright = near(q) < 0.03, dark = Math.abs(Math.abs(q % 1) - 0.5) < 0.03;
                    return [
                        { label: 'Δℓ / λ', value: q.toFixed(2) },
                        { label: 'P 點高度 y（實際角度）', value: `${(y * 100).toFixed(2)} cm（θ = ${(Math.atan(Math.abs(y) / p.L) * 180 / Math.PI).toFixed(2)}°）` },
                        { label: '判定', value: bright ? `亮紋（n = ${Math.abs(Math.round(q))}）` : (dark ? `暗紋（m = ${Math.round(Math.abs(q) + 0.5)}）` : '介於亮紋與暗紋之間') },
                        { label: '條紋間距 Δy = Lλ/d', value: `${(dy * 1000).toFixed(2)} mm` }
                    ];
                }
                return [
                    { label: '條紋間距 Δy = Lλ/d', value: `${(dy * 1000).toFixed(2)} mm` },
                    { label: '理想點光源亮紋', value: '中央附近等距・忽略包絡時等亮' },
                    { label: '中央亮紋', value: '只有 1 條（n = 0）' },
                    { label: '浸入水中 n = 1.33', value: `Δy → ${(dy * 1000 / 1.33).toFixed(2)} mm（變 1/n 倍）` }
                ];
            },
            draw: (ctx, w, h, p, t) => {
                if (p.mode === 'inquiry') { SlitOptics.youngInquiryDraw(ctx, w, h, p, t, LABS.young.cycle); return; }
                if (p.mode === 'colors') { SlitOptics.youngColors(ctx, w, h, p); return; }
                if (p.mode === 'view3d') { SlitOptics.young3D(ctx, w, h, p, t, LABS.young); return; }
                const lam = p.lam * 1e-9, dd = p.d * 1e-6;
                const dy = p.L * lam / dd;                                  // 條紋間距（公尺）
                // 依波長取近似色
                const wl = p.lam;
                let rgb;
                if (wl < 440) rgb = [130, 0, 200];
                else if (wl < 490) rgb = [0, 90, 235];
                else if (wl < 510) rgb = [0, 180, 190];
                else if (wl < 580) rgb = [70, 200, 60];
                else if (wl < 645) rgb = [235, 160, 0];
                else rgb = [225, 40, 40];
                const col = (a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

                /* ================= 模式一：實驗裝置與干涉場 ================= */
                if (p.mode === 'setup') {
                    const y0 = 8, y1 = h - 74, cy = (y0 + y1) / 2, TH = y1 - y0;
                    const xSrc = 16, xA = Math.max(66, w * 0.10), xB = Math.max(xA + 60, w * 0.26);
                    const xS = Math.max(xB + 120, w - 132);               // 屏幕位置
                    const dPix = Math.max(16, Math.min(TH * 0.30, 26 + p.d * 0.10));
                    const s1 = { x: xB, y: cy + dPix / 2 };
                    const s2 = { x: xB, y: cy - dPix / 2 };
                    const lamPix = Math.max(9, Math.min(30, 3200 * lam / dd * 0.5 + 8));
                    const k = 2 * Math.PI / lamPix;
                    const om = 3.4;

                    // 干涉場（S1、S2 之後）
                    const step = 4;
                    const fw = xS - xB, fh = TH;
                    if (fw > 20) {
                        const iw = Math.ceil(fw / step) * step, ih = Math.ceil(fh / step) * step;
                        const img = ctx.createImageData(iw, ih);
                        for (let yy = 0; yy < ih; yy += step) {
                            for (let xx = 0; xx < iw; xx += step) {
                                const gx = xB + xx, gy = y0 + yy;
                                const r1 = Math.hypot(gx - s1.x, gy - s1.y);
                                const r2 = Math.hypot(gx - s2.x, gy - s2.y);
                                const a1 = Math.cos(k * r1 - om * t) / Math.sqrt(Math.max(r1, 12));
                                const a2 = Math.cos(k * r2 - om * t) / Math.sqrt(Math.max(r2, 12));
                                const v = Math.max(0, Math.min(1, Math.abs((a1 + a2) * 5.2)));
                                for (let ddy = 0; ddy < step; ddy++) {
                                    const row = (yy + ddy) * iw;
                                    for (let ddx = 0; ddx < step; ddx++) {
                                        const idx = (row + xx + ddx) * 4;
                                        img.data[idx] = rgb[0] * v + 10 * (1 - v);
                                        img.data[idx + 1] = rgb[1] * v + 16 * (1 - v);
                                        img.data[idx + 2] = rgb[2] * v + 22 * (1 - v);
                                        img.data[idx + 3] = 255;
                                    }
                                }
                            }
                        }
                        const off = getOffscreen(iw, ih);
                        off.ctx.putImageData(img, 0, 0);
                        ctx.drawImage(off.canvas, 0, 0, iw, ih, xB, y0, fw, fh);
                    }

                    // 光源與 S0 之前的區域
                    ctx.fillStyle = 'rgba(11,111,146,0.05)';
                    ctx.fillRect(0, y0, xB, TH);
                    for (let i = 0; i < 7; i++) {
                        const yy = y0 + TH * (i + 0.5) / 7;
                        arrow(ctx, xSrc, yy, xA - 12, yy, col(0.8), 1.6);
                    }
                    label(ctx, '平行光', xSrc, y0 + 14, C.ink, 11);

                    // 屏 A（單狹縫 S0）
                    ctx.fillStyle = '#3b5a66';
                    ctx.fillRect(xA - 4, y0, 8, TH / 2 - 5);
                    ctx.fillRect(xA - 4, cy + 5, 8, y1 - cy - 5);
                    label(ctx, '屏 A', xA, y1 + 14, C.muted, 10, 'center');
                    label(ctx, 'S₀', xA + 8, cy + 4, C.ink, 12);

                    // S0 → S1、S2 的圓形波前
                    ctx.save(); ctx.beginPath(); ctx.rect(xA, y0, xB - xA, TH); ctx.clip();
                    ctx.strokeStyle = col(0.55); ctx.lineWidth = 1.6;
                    for (let n = 0; n < 26; n++) {
                        const R = ((t * 26) % lamPix) + n * lamPix;
                        if (R > (xB - xA) * 1.6) break;
                        ctx.beginPath(); ctx.arc(xA, cy, R, -Math.PI / 2.4, Math.PI / 2.4); ctx.stroke();
                    }
                    ctx.restore();

                    // 屏 B（雙狹縫）
                    ctx.fillStyle = '#3b5a66';
                    ctx.fillRect(xB - 4, y0, 8, s2.y - y0 - 4);
                    ctx.fillRect(xB - 4, s2.y + 4, 8, dPix - 8);
                    ctx.fillRect(xB - 4, s1.y + 4, 8, y1 - s1.y - 4);
                    [[s2, 'S₂'], [s1, 'S₁']].forEach(([s, nm]) => {
                        ctx.fillStyle = C.orange;
                        ctx.beginPath(); ctx.arc(s.x, s.y, 3.4, 0, Math.PI * 2); ctx.fill();
                        label(ctx, nm, s.x - 8, s.y + 4, '#ffffff', 11, 'right');
                    });
                    label(ctx, '屏 B', xB, y1 + 14, C.muted, 10, 'center');
                    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2;
                    dashed(ctx, xA, cy, s1.x, s1.y, 'rgba(201,117,15,0.8)');
                    dashed(ctx, xA, cy, s2.x, s2.y, 'rgba(201,117,15,0.8)');
                    label(ctx, 'S₀S₁ = S₀S₂ ⇒ S₁、S₂ 落在同一波前上 ⇒ 同相同調光', 6, y1 + 34, C.orange, 11);

                    // 屏幕上的條紋：直接由畫面上的 S₁、S₂ 幾何算出，才會與左邊的干涉場完全吻合
                    const IatY = (py) => {
                        const r1 = Math.hypot(xS - s1.x, py - s1.y);
                        const r2 = Math.hypot(xS - s2.x, py - s2.y);
                        return Math.pow(Math.cos(k * (r1 - r2) / 2), 2);
                    };
                    for (let py = y0; py <= y1; py++) {
                        const I = IatY(py);
                        ctx.fillStyle = `rgb(${Math.round(rgb[0] * I + 12 * (1 - I))},${Math.round(rgb[1] * I + 18 * (1 - I))},${Math.round(rgb[2] * I + 24 * (1 - I))})`;
                        ctx.fillRect(xS, py, 24, 1);
                    }
                    ctx.strokeStyle = 'rgba(18,49,58,0.3)'; ctx.lineWidth = 1;
                    ctx.strokeRect(xS, y0, 24, TH);
                    label(ctx, '屏幕', xS + 12, y1 + 14, C.muted, 10, 'center');
                    // 強度曲線
                    if (w - (xS + 30) > 40) {
                        const cw = w - (xS + 30) - 6;
                        ctx.strokeStyle = col(0.95); ctx.lineWidth = 2;
                        ctx.beginPath();
                        for (let py = y0; py <= y1; py++) {
                            const X = xS + 30 + IatY(py) * cw;
                            py === y0 ? ctx.moveTo(X, py) : ctx.lineTo(X, py);
                        }
                        ctx.stroke();
                        label(ctx, '強度', xS + 30, y0 + 12, C.muted, 10);
                    }
                    labelFit(ctx, `條紋間距 Δy = Lλ/d = ${(dy * 1000).toFixed(2)} mm`, 6, h - 22, C.ink, 12, 'left', { maxW: w - 12, min: 10, clampW: w });
                    labelFit(ctx, '尺寸未按比例；實驗中 L ≫ d', 6, h - 7, C.muted, 11, 'left', { maxW: w - 12, min: 10, clampW: w });
                    return;
                }

                /* ================= 模式二：幾何關係與公式（真實比例、可一直放大） ================= */
                SlitOptics.geomDraw(ctx, w, h, p);
            }
        };
