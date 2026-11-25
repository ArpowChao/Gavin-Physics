// 互動實驗：視差法找像
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* 9c. 視差法找像：平面鏡成像、燒杯視深 ------------------------------ */
        LABS.parallax = {
            name: '視差法找虛像的位置',
            tag: 'N13 / N14',
            hint: '',
            hintFor: (p) => ({
                mirror: '左邊是 3D 裝置圖（拖曳旋轉），右邊是眼睛看到的畫面。大頭針 A 立在平面鏡前。鏡子不透明，鏡後的參考針 B 比鏡子高，只有露出鏡子上緣的上半截看得到。眼睛左右搖擺，比較鏡中的 A′ 和露出的 B，拖曳 3D 圖中綠色的 B 針頭（或用滑桿）前後移動，直到怎麼晃都對得齊——這時 B 的位置就是像的位置。',
                slab: '左邊是 3D 裝置圖（拖曳旋轉），右邊是眼睛看到的畫面。大頭針 A 貼在厚壓克力的背面，眼睛隔著壓克力看 A，A 的像會變近。參考針 B 從上方垂下，針尖在壓克力上方。拖曳 3D 圖中綠色的 B 針頭（或用滑桿）前後移動，直到 B 的針尖和 A 的像沒有視差，量 B 到壓克力前表面的距離就是視深 h′，再用 n = 厚度 ÷ h′ 求壓克力的折射率。',
                convex: '左邊是 3D 裝置圖（拖曳旋轉），右邊是眼睛看到的畫面。大頭針 A 放在凸透鏡後面、焦距以內，隔著透鏡看到的是正立放大的虛像，位置比 A 更遠。參考針 B 和 A 一樣插在桌上，但比透鏡高，露出透鏡上緣的那一截是直接看到的 B 本身。拖曳 3D 圖中綠色的 B 針頭（或用滑桿）前後移動，直到露出的 B 和透鏡裡 A 的像沒有視差，B 到透鏡的距離就是虛像的像距。',
                concave: '左邊是 3D 裝置圖（拖曳旋轉），右邊是眼睛看到的畫面。大頭針 A 放在凹透鏡後面，隔著透鏡看到的是正立縮小的虛像，位置比 A 更靠近透鏡。參考針 B 和 A 一樣插在桌上，但比透鏡高，露出透鏡上緣的那一截是直接看到的 B 本身。拖曳 3D 圖中綠色的 B 針頭（或用滑桿）前後移動，直到露出的 B 和透鏡裡 A 的像沒有視差，B 到透鏡的距離就是虛像的像距。'
            })[p.mode] || '左邊是 3D 裝置圖（拖曳旋轉），右邊是眼睛看到的畫面。硬幣 A 在燒杯底，參考針 B 夾在燒杯外側。從上方往下看，眼睛左右搖擺，比較 A 的像與 B。拖曳 3D 圖中綠色的 B 針頭（或用滑桿）上下移動，直到兩者沒有視差，量 B 到水面的距離就是視深 h′，再用 n = h ÷ h′ 求折射率。',
            noteFor: (p) => ({
                mirror: '<b>判斷口訣</b>：兩個東西沒有重合時，比較靠近眼睛的那個會往眼睛移動的反方向跑。眼睛往右、B 相對往左 → B 太近，往後移；B 跟著眼睛同向跑 → B 太遠，往前移。<br><b>平面鏡的像是精確的</b>：不論眼睛偏多少，B 放在鏡後 d 處都完全沒有視差，所以像距 = 物距。<br><b>為什麼 B 要比鏡子高</b>：鏡子不透明，鏡後的東西看不到；B 只有露出鏡子上緣的那一截看得到，就用這一截去對準鏡中的 A′。',
                slab: '<b>判斷口訣</b>：眼睛往右、B 相對往左 → B 比像近，往後移；B 跟著眼睛同向跑 → B 比像遠，往前移。<br><b>隔著壓克力看，A 會變近</b>：A 貼在背面，實際離前表面一個厚度 t；光從壓克力射入空氣時偏離法線，反向延長交在離前表面約 t ÷ n 處。<br><b>求折射率</b>：n = 厚度 ÷ 視深 = t ÷ h′。搖擺幅度調大時，B 放在 t ÷ n 也會留一點視差，因為斜看時像會再變近一點。',
                convex: '<b>判斷口訣</b>：眼睛往右、B 相對往左 → B 比像近，往後移；B 跟著眼睛同向跑 → B 比像遠，往前移。<br><b>用透鏡公式驗證</b>：1/p + 1/q = 1/f，虛像的像距 q 取負值（像和物在透鏡同一側）。把 B 量到的距離代入，看看是否符合公式。<br><b>分清楚像和物</b>：透鏡裡看到的是「像」，透鏡外直接看到的是「物體本身」。B 下半截被透鏡擋住的部分，在透鏡裡也會成像，看起來和露出的上半截不一樣；要用透鏡外露出的 B（物體本身）去對準透鏡裡 A 的像。<br><b>凸透鏡</b>：物體在焦點以內才會成正立放大的虛像，像比物體離透鏡更遠，所以 B 要放得比 A 還遠。',
                concave: '<b>判斷口訣</b>：眼睛往右、B 相對往左 → B 比像近，往後移；B 跟著眼睛同向跑 → B 比像遠，往前移。<br><b>用透鏡公式驗證</b>：1/p + 1/q = 1/f，虛像的像距 q 取負值（像和物在透鏡同一側）。把 B 量到的距離代入，看看是否符合公式。<br><b>分清楚像和物</b>：透鏡裡看到的是「像」，透鏡外直接看到的是「物體本身」。B 下半截被透鏡擋住的部分，在透鏡裡也會成像，看起來和露出的上半截不一樣；要用透鏡外露出的 B（物體本身）去對準透鏡裡 A 的像。<br><b>凹透鏡</b>：實物一定成正立縮小的虛像，像在透鏡和物體之間，所以 B 要放得比 A 還近。'
            })[p.mode] || '<b>判斷口訣</b>：比較靠近眼睛的那個會往眼睛移動的反方向跑。眼睛往右、B 相對往左 → B 比像高（太靠近水面），往下移；B 跟著眼睛同向跑 → B 太深，往上移。<br><b>視深 h′ = h / n 只是近似</b>：把搖擺幅度調大，會發現 B 放在 h/n 也還有一點點視差，因為斜看時像會再變淺。實驗時眼睛要在正上方附近、小幅度搖擺。<br><b>求折射率</b>：n = 實深 ÷ 視深 = h ÷ h′。',
            /* 實驗下方的教學：為什麼「沒有視差」就是找到像的位置 */
            teach: `
                <h4>教學：為什麼「沒有視差」就找到了像？</h4>
                <h5>1. 什麼是視差</h5>
                <p>伸出一根手指，對準遠處的電線桿，然後頭左右晃一晃：手指會在電線桿前面左右跳動。這種「頭一動，兩個東西就互相錯開」的現象叫做<b>視差</b>。把手指慢慢移近電線桿，跳動愈來愈小；如果兩者在同一個位置，不管頭怎麼晃都不會錯開。</p>
                <figure class="teach-fig">
                    <svg viewBox="0 0 520 300" role="img" aria-label="眼睛在左、右兩個位置看近物與遠物：近物的視線轉得多、在視野中移動得多，遠物轉得少、移動得少">
                        <line x1="180" y1="24" x2="180" y2="44" stroke="#5f6b70" stroke-width="6" stroke-linecap="round"/>
                        <text x="196" y="38" font-size="12" fill="#5f6b70">遠的物體</text>
                        <circle cx="180" cy="100" r="6" fill="#c9750f"/>
                        <text x="194" y="104" font-size="12" fill="#c9750f">近的物體</text>
                        <g stroke-width="1.4" fill="none">
                            <line x1="130" y1="182" x2="180" y2="34" stroke="#5f6b70" stroke-dasharray="4 3"/>
                            <line x1="130" y1="182" x2="180" y2="100" stroke="#c9750f"/>
                            <line x1="230" y1="182" x2="180" y2="34" stroke="#5f6b70" stroke-dasharray="4 3"/>
                            <line x1="230" y1="182" x2="180" y2="100" stroke="#c9750f"/>
                        </g>
                        <!-- 物體處的扇形：眼睛從左移到右，看這個物體的視線方向轉了多少（遠物約 37°、近物約 63°） -->
                        <path d="M180 34 L171.04 60.53 A28 28 0 0 0 188.96 60.53 Z" fill="rgba(95,107,112,0.28)" stroke="#5f6b70" stroke-width="1"/>
                        <path d="M180 100 L168.55 118.78 A22 22 0 0 0 191.45 118.78 Z" fill="rgba(201,117,15,0.32)" stroke="#c9750f" stroke-width="1"/>
                        <text x="158" y="68" font-size="11" fill="#5f6b70" text-anchor="end">視線轉得少</text>
                        <text x="158" y="128" font-size="11" fill="#c9750f" text-anchor="end">視線轉得多</text>
                        <g fill="#fff" stroke="#12313a" stroke-width="1.4">
                            <ellipse cx="130" cy="186" rx="11" ry="6.5"/><ellipse cx="230" cy="186" rx="11" ry="6.5"/>
                        </g>
                        <circle cx="130" cy="187" r="3" fill="#12313a"/><circle cx="230" cy="187" r="3" fill="#12313a"/>
                        <text x="130" y="206" font-size="12" text-anchor="middle" fill="#12313a">眼在左</text>
                        <text x="230" y="206" font-size="12" text-anchor="middle" fill="#12313a">眼在右</text>
                        <path d="M150 196 H210" stroke="#7d949c" stroke-width="1.2" marker-end="url(#teach-arrow)"/>
                        <defs>
                            <marker id="teach-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#7d949c"/></marker>
                            <marker id="teach-arrow-far" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#5f6b70"/></marker>
                            <marker id="teach-arrow-near" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#c9750f"/></marker>
                        </defs>
                        <!-- 右側兩格：視線固定朝正前方（虛線）。兩個物體都會移動，只是近的移得多、遠的移得少。
                             位置依左圖幾何換算：遠物偏 50/148、近物偏 50/82，乘上同一比例 60 -->
                        <g font-size="12" fill="#12313a">
                            <rect x="330" y="10" width="180" height="86" rx="8" fill="#f4f7f8" stroke="#d5dfe2"/>
                            <text x="342" y="28">眼在左時看到</text>
                            <line x1="420" y1="36" x2="420" y2="90" stroke="#7d949c" stroke-dasharray="3 3"/>
                            <text x="416" y="90" font-size="10" fill="#7d949c" text-anchor="end">正前方</text>
                            <!-- 箭頭：從正前方量到物體的偏移（視角），遠的短、近的長 -->
                            <line x1="440" y1="38" x2="440" y2="58" stroke="#5f6b70" stroke-width="6" stroke-linecap="round"/>
                            <line x1="420" y1="48" x2="435" y2="48" stroke="#5f6b70" stroke-width="1.8" marker-end="url(#teach-arrow-far)"/>
                            <text x="448" y="52" font-size="10" fill="#5f6b70">遠</text>
                            <circle cx="457" cy="76" r="6" fill="#c9750f"/>
                            <line x1="420" y1="76" x2="449" y2="76" stroke="#c9750f" stroke-width="1.8" marker-end="url(#teach-arrow-near)"/>
                            <text x="467" y="80" font-size="10" fill="#c9750f">近</text>
                            <rect x="330" y="106" width="180" height="86" rx="8" fill="#f4f7f8" stroke="#d5dfe2"/>
                            <text x="342" y="124">眼在右時看到</text>
                            <line x1="420" y1="132" x2="420" y2="186" stroke="#7d949c" stroke-dasharray="3 3"/>
                            <text x="424" y="186" font-size="10" fill="#7d949c">正前方</text>
                            <line x1="400" y1="134" x2="400" y2="154" stroke="#5f6b70" stroke-width="6" stroke-linecap="round"/>
                            <line x1="420" y1="144" x2="405" y2="144" stroke="#5f6b70" stroke-width="1.8" marker-end="url(#teach-arrow-far)"/>
                            <text x="392" y="148" font-size="10" fill="#5f6b70" text-anchor="end">遠</text>
                            <circle cx="383" cy="172" r="6" fill="#c9750f"/>
                            <line x1="420" y1="172" x2="391" y2="172" stroke="#c9750f" stroke-width="1.8" marker-end="url(#teach-arrow-near)"/>
                            <text x="373" y="176" font-size="10" fill="#c9750f" text-anchor="end">近</text>
                            <!-- 第三格：同一把尺比較兩者移動了多少，箭頭長度就是視角的改變量 -->
                            <rect x="330" y="202" width="180" height="92" rx="8" fill="#fff8ee" stroke="#ecd3ad"/>
                            <text x="342" y="220">從眼在左到眼在右</text>
                            <text x="420" y="238" font-size="10" fill="#5f6b70" text-anchor="middle">遠的：移得少</text>
                            <line x1="440" y1="246" x2="400" y2="246" stroke="#5f6b70" stroke-width="2.4" marker-end="url(#teach-arrow-far)"/>
                            <text x="420" y="266" font-size="10" fill="#c9750f" text-anchor="middle">近的：移得多</text>
                            <line x1="457" y1="276" x2="383" y2="276" stroke="#c9750f" stroke-width="2.4" marker-end="url(#teach-arrow-near)"/>
                        </g>
                    </svg>
                    <figcaption>頭從左移到右，<b>兩個物體在視野裡都往左跑</b>（虛線是視野正前方），只是近的跑得多、遠的跑得少：近的離眼睛近，同樣移動一段距離，看它的視線方向轉得比較多。所以近的物體<b>相對於</b>遠的物體往左偏。箭頭長度就是視角改變的量，近的箭頭比較長，兩者的差就是<b>視差</b>；上方實驗的「眼睛看到的」畫面一直盯著像，像固定在中間，看到的也正是這個相對錯開。</figcaption>
                </figure>
                <h5>2. 為什麼距離相同就不會錯開</h5>
                <p>眼睛橫移 Δx，看距離 D 的物體，視線方向大約轉了 Δx ÷ D。兩個物體看起來的錯開量約為 <b>Δx × (1/D₁ − 1/D₂)</b>：</p>
                <ul>
                    <li>D₁ 比 D₂ 小（第一個比較近）→ 錯開，而且近的往眼睛移動的<b>反方向</b>跑。</li>
                    <li>D₁ = D₂ → 錯開量是 0，不管頭怎麼晃都對得齊，這就叫<b>沒有視差</b>。</li>
                </ul>
                <p>所以「沒有視差」等於「兩個東西離眼睛一樣遠」，這就是視差法量位置的原理。</p>
                <h5>3. 虛像也能這樣找</h5>
                <p>虛像不是真的有東西在那裡，屏幕也接不到。但從硬幣（或大頭針 A）出發、最後進入眼睛的光，<b>反向延長後都交在像點</b>（上方 3D 圖中的粉紅虛線）。對眼睛來說，這些光就像是從像點發出來的，所以頭左右晃時，像的表現和「真的有一個東西放在像點」完全一樣。</p>
                <p>因此拿一個真的物體（參考針 B）去和像比：移到和像沒有視差時，B 和像離眼睛一樣遠，<b>B 所在的位置就是像的位置</b>，直接用尺量 B 就好。</p>
                <h5>4. 怎麼判斷 B 要往哪裡移</h5>
                <ul>
                    <li>眼睛往右、B 相對往左 → B 比像<b>近</b>：燒杯實驗把 B 往下移，平面鏡與壓克力實驗把 B 往後移。</li>
                    <li>眼睛往右、B 也往右 → B 比像<b>遠</b>：燒杯實驗把 B 往上移，平面鏡與壓克力實驗把 B 往前移。</li>
                    <li>把 B 的針尖對準硬幣的對稱軸、讓 B 露出鏡子或透鏡上緣的那一截對準 A′ 或透鏡裡 A 的像、或讓 B 的針尖對準壓克力裡 A 的像，比較好看出有沒有偏。</li>
                </ul>
                <h5>5. 用量到的位置算答案</h5>
                <ul>
                    <li><b>燒杯視深</b>：B 到水面的距離就是視深 h′，折射率 n = 實深 h ÷ 視深 h′。</li>
                    <li><b>平面鏡</b>：B 到鏡面的距離就是像距，會發現像距 = 物距。</li>
                    <li><b>厚壓克力</b>：B 到壓克力前表面的距離就是視深 h′，折射率 n = 厚度 t ÷ 視深 h′。</li>
                    <li><b>凸透鏡、凹透鏡</b>：B 到透鏡的距離就是虛像的像距 |q|，代入 1/p + 1/q = 1/f（虛像 q 取負）驗證透鏡公式。屏幕接不到虛像，視差法正好派上用場。</li>
                </ul>
                <p class="teach-tip">注意：視深公式 h′ = h ÷ n 只在接近正上方觀看時成立。做實驗時眼睛要在正上方附近、小幅度左右晃；晃得太大，即使 B 在 h′ 也會留下一點視差。</p>
                <h5>6. 真實照片：天文學家用視差量恆星的距離（地科）</h5>
                <p>同樣的原理放大到宇宙：地球繞太陽公轉，相隔半年從軌道兩端看同一顆近的恆星，它會相對遠處幾乎不動的背景星移動一點點。量出這個視差角 p（單位：角秒），距離 d（單位：秒差距）= 1 ÷ p。離我們最近的恆星比鄰星，視差也只有約 0.77 角秒，用肉眼完全看不出來。</p>
                <p>2020 年，NASA 的新視野號探測器飛到離地球約 69 億公里遠的地方，和地球上的望遠鏡在同一時間拍同一片星空。兩個拍攝點相隔這麼遠，近的恆星跳動大到直接看得出來。下面兩張動畫在「從地球看」和「從新視野號看」之間切換：<b>正中央那顆近的恆星會跳，背景星幾乎不動</b>。這和實驗裡一樣：背景星像遠處的電線桿，近的恆星像手指。</p>
                <div class="teach-photos">
                    <figure>
                        <img src="assets/images/real/proxima-parallax-new-horizons.gif" alt="比鄰星的視差：從地球與新視野號拍攝的影像交替切換，中央的比鄰星相對背景星跳動" loading="lazy">
                        <figcaption><b>比鄰星（距離約 4.2 光年）</b>：畫面下方的字標示目前是從地球（Earth）還是新視野號（New Horizons）拍的。看正中央最亮的那顆星。
                            <small>NASA／JHUAPL／SwRI／Brian May／Las Cumbres Observatory／Siding Spring Observatory，公有領域，<a href="https://commons.wikimedia.org/wiki/File:New_Horizons_Proxima_Centauri_Parallax_Animation.gif" target="_blank" rel="noopener">Wikimedia Commons</a></small></figcaption>
                    </figure>
                    <figure>
                        <img src="assets/images/real/wolf359-parallax-new-horizons.gif" alt="沃夫 359 的視差：從地球與新視野號拍攝的影像交替切換，中央的沃夫 359 相對背景星跳動" loading="lazy">
                        <figcaption><b>沃夫 359（距離約 7.9 光年）</b>：一樣是兩個位置交替，中央的恆星相對背景星跳動。
                            <small>NASA／JHUAPL／SwRI／Brian May／Las Cumbres Observatory／Siding Spring Observatory，公有領域，<a href="https://commons.wikimedia.org/wiki/File:New_Horizons_Wolf_359_parallax_blinking_animation.gif" target="_blank" rel="noopener">Wikimedia Commons</a></small></figcaption>
                    </figure>
                </div>`,
            height: (p, w) => w >= 640 ? 420 : 680,
            cycle: 4,
            modes: [
                { key: 'depth', label: '燒杯視深：測液體折射率' },
                { key: 'mirror', label: '平面鏡：找像距' },
                { key: 'slab', label: '厚壓克力：測壓克力折射率' },
                { key: 'convex', label: '凸透鏡：放大虛像' },
                { key: 'concave', label: '凹透鏡：縮小虛像' }
            ],
            controls: [
                { key: 'h', label: '硬幣實深 h', min: 4, max: 20, step: 0.5, value: 12, only: ['depth'], fmt: (v) => `${v} cm` },
                { key: 'n', label: '液體折射率 n', min: 1, max: 1.8, step: 0.01, value: 1.33, only: ['depth'], showIf: (p) => !p.hideN, fmt: (v) => Number(v).toFixed(2) },
                { key: 'tk', label: '壓克力厚度 t', min: 2, max: 8, step: 0.5, value: 6, only: ['slab'], fmt: (v) => `${v} cm` },
                { key: 'na', label: '壓克力折射率 n', min: 1.3, max: 1.8, step: 0.01, value: 1.49, only: ['slab'], showIf: (p) => !p.hideN, fmt: (v) => Number(v).toFixed(2) },
                { key: 'fv', label: '凸透鏡焦距 f', min: 15, max: 25, step: 0.5, value: 18, only: ['convex'], fmt: (v) => `${v} cm` },
                { key: 'pv', label: '大頭針 A 的物距 p', min: 2, max: 10, step: 0.5, value: 8, only: ['convex'], fmt: (v) => `透鏡後 ${v} cm` },
                { key: 'fc', label: '凹透鏡焦距 |f|', min: 6, max: 20, step: 0.5, value: 10, only: ['concave'], fmt: (v) => `${v} cm` },
                { key: 'pc', label: '大頭針 A 的物距 p', min: 4, max: 20, step: 0.5, value: 12, only: ['concave'], fmt: (v) => `透鏡後 ${v} cm` },
                { key: 'hideN', label: '隱藏折射率（自己測出來）', type: 'checkbox', value: false, only: ['depth', 'slab'] },
                { key: 'd', label: '大頭針 A 的物距 d', min: 3, max: 14, step: 0.5, value: 8, only: ['mirror'], fmt: (v) => `鏡前 ${v} cm` },
                { key: 'zb', label: '參考針 B 的位置', min: 0, max: 40, step: 0.1, value: 4, fmt: (v, p) => `${({ mirror: '鏡後', slab: '前表面後', convex: '透鏡後', concave: '透鏡後' })[p.mode] || '水面下'} ${Number(v).toFixed(1)} cm` },
                { key: 'amp', label: '眼睛左右搖擺幅度', min: 0, max: 8, step: 0.5, value: 4, fmt: (v) => `±${v} cm` },
                { key: 'H', label: '眼睛到水面／鏡面／壓克力／透鏡', min: 15, max: 40, step: 1, value: 20, fmt: (v) => `${v} cm` }
            ],
            extraButtons: [
                {
                    action: 'liquid', label: '🎲 隨機未知折射率',
                    onClick: (p, api) => {
                        const key = p.mode === 'slab' ? 'na' : 'n';
                        p[key] = Math.round((p.mode === 'slab' ? 1.4 + Math.random() * 0.3 : 1.3 + Math.random() * 0.35) * 100) / 100;
                        p.hideN = true;
                        [key, 'hideN'].forEach((k) => {
                            const el = api.host.querySelector(`[id$="parallax-${k}"]`);
                            if (el) { if (k === 'hideN') el.checked = true; else el.value = p[key]; }
                        });
                        api.syncOutputs(); api.paint();
                    }
                }
            ],
            eyeX: (p, t) => p.amp * Math.sin(2 * Math.PI * t / 4),
            /* 燒杯半徑 R；硬幣放在靠後杯壁附近（原點），杯心在 y = bcY。
             * 參考針 B 在杯外後方，針身沿 y 方向（和眼睛左右搖擺的方向垂直）指向硬幣，針尖在 y = pinY；
             * 從上往下看時針尖正對著硬幣，有視差時針尖會左右偏離硬幣中心 */
            R: 5, bcY: -3.5, pinY: 1.6,
            // 平面鏡模式：鏡子高度、A 與 B 的針高；B 比鏡子高，上半截露出鏡子上緣來對齊 A′
            plateTop: 5, pinA: 4, pinB: 8,
            // 厚壓克力模式：壓克力半寬、高度；A 貼在背面、針高 pinAS；B 從上方垂下，針尖高 bTip、針長 bLen
            blockW: 6, blockTop: 5, pinAS: 4, bTip: 5.6, bLen: 3.4,
            // 透鏡模式：透鏡中心高 lensZ（與眼睛同高）、半徑 lensR；A、B 都插在桌上，B 比透鏡高（針高 pinBL），上半截露出透鏡上緣
            lensZ: 3, lensR: 2.5, pinAL: 4.5, pinBL: 8.5,
            /* 薄透鏡成像：物在透鏡後 po，1/po + 1/q = 1/f。凸透鏡焦內、凹透鏡都得到虛像（q < 0），
             * 回傳像到透鏡的距離 qa（在物體同一側）與放大率 m = qa / po */
            lensImage: (p) => {
                const convex = p.mode === 'convex', fl = convex ? Number(p.fv) : -Number(p.fc), po = Number(convex ? p.pv : p.pc);
                const q = 1 / (1 / fl - 1 / po);
                return { fl, po, qa: -q, m: -q / po };
            },
            /* 隔著厚度 tk 的平行板看橫向距離 rho 的點：解 tanθ·H + tk·tanθ′ = rho（sinθ = n·sinθ′），回傳空氣中的角 θ */
            slabTheta: (p, rho) => {
                const tk = Number(p.tk), na = Number(p.na);
                let lo = 0, hi = Math.PI / 2 - 1e-6;
                for (let i = 0; i < 50; i++) {
                    const th = (lo + hi) / 2;
                    if (Math.tan(th) * p.H + tk * Math.tan(Math.asin(Math.sin(th) / na)) > rho) hi = th; else lo = th;
                }
                return (lo + hi) / 2;
            },
            /* 眼睛在 (x, 0)，水面在 z = H，硬幣在 (0, H + h)。
             * 找水面上的折射點 s：水中 n·sinθw = 空氣中 sinθa。回傳折射點與「沿硬幣正上方鉛直線」的像深。 */
            coinRay: (p, x) => {
                const H = p.H, h = p.h, n = Number(p.n);
                if (Math.abs(x) < 1e-6) return { s: 0, img: h / n };
                // f(s) 對 s 單調遞增：s = 0 時為負、s = x 時為正（x 為負時兩端互換仍成立）
                const f = (s) => n * Math.sin(Math.atan(s / h)) - Math.sin(Math.atan((x - s) / H));
                let lo = Math.min(0, x), hi = Math.max(0, x);
                for (let i = 0; i < 60; i++) {
                    const mid = (lo + hi) / 2;
                    if (f(mid) > 0) hi = mid; else lo = mid;
                }
                const s = (lo + hi) / 2;
                return { s, img: H * s / (x - s) };
            },
            /* 眼睛看到 B 相對於 A 的像的方向變化（弧度，扣掉眼睛在正中時的差）；
             * B 比像近時，眼睛往右 B 相對往左（負值） */
            offset: (p, x) => {
                const L = LABS.parallax;
                const raw = (xx) => {
                    const toB = Math.atan(-xx / (p.H + p.zb));
                    if (p.mode === 'mirror') return toB - Math.atan(-xx / (p.H + p.d));
                    if (p.mode === 'slab') return toB + Math.sign(xx) * L.slabTheta(p, Math.abs(xx));
                    if (p.mode === 'convex' || p.mode === 'concave') return toB - Math.atan(-xx / (p.H + L.lensImage(p).qa));
                    return toB - Math.atan((L.coinRay(p, xx).s - xx) / p.H);
                };
                return raw(x) - raw(0);
            },
            imageDepth: (p) => ({ mirror: p.d, slab: Number(p.tk) / Number(p.na), convex: LABS.parallax.lensImage(p).qa, concave: LABS.parallax.lensImage(p).qa })[p.mode] ?? p.h / Number(p.n),
            verdict: (p) => {
                const L = LABS.parallax;
                if (p.amp === 0) return { ok: false, text: '眼睛不動就看不出視差，先把搖擺幅度調大' };
                const dz = p.zb - L.imageDepth(p);
                const shift = deg(Math.abs(L.offset(p, p.amp)));
                if (shift < 0.12) return { ok: true, text: '無視差 ✓ B 就在像的位置' };
                return dz < 0
                    ? { ok: false, text: p.mode !== 'depth' ? 'B 比像近：眼睛往右時 B 相對往左 → 把 B 往後移' : 'B 比像高：眼睛往右時 B 相對往左 → 把 B 往下移' }
                    : { ok: false, text: p.mode !== 'depth' ? 'B 比像遠：B 跟著眼睛同向跑 → 把 B 往前移' : 'B 比像深：B 跟著眼睛同向跑 → 把 B 往上移' };
            },
            readouts: (p) => {
                const L = LABS.parallax, v = L.verdict(p);
                const shift = `${deg(Math.abs(L.offset(p, p.amp))).toFixed(2)}°`;
                if (p.mode === 'mirror') return [
                    { label: '物距 d', value: `鏡前 ${p.d} cm` },
                    { label: '參考針 B', value: `鏡後 ${p.zb.toFixed(1)} cm` },
                    { label: '眼睛移到最右時 B 與 A′ 錯開', value: shift },
                    { label: '判斷', value: v.text }
                ];
                if (p.mode === 'convex' || p.mode === 'concave') {
                    const li = L.lensImage(p);
                    return [
                        { label: '焦距 f', value: `${li.fl > 0 ? '+' : '−'}${Math.abs(li.fl)} cm（${li.fl > 0 ? '凸' : '凹'}透鏡）` },
                        { label: '物距 p', value: `透鏡後 ${li.po} cm` },
                        { label: '參考針 B（量到的像距）', value: `透鏡後 ${p.zb.toFixed(1)} cm` },
                        { label: '眼睛移到最右時 B 與像錯開', value: shift },
                        { label: '判斷', value: v.text },
                        { label: '公式算出的像距 |q|', value: v.ok ? `${li.qa.toFixed(1)} cm（${li.m > 1 ? '放大' : '縮小'} ${li.m.toFixed(2)} 倍）` : '對齊後揭曉' }
                    ];
                }
                if (p.mode === 'slab') return [
                    { label: '壓克力厚度 t', value: `${p.tk} cm` },
                    { label: '參考針 B（視深 h′）', value: `前表面後 ${p.zb.toFixed(1)} cm` },
                    { label: '眼睛移到最右時 B 與像錯開', value: shift },
                    { label: '判斷', value: v.text },
                    { label: '由 B 推算 n = t ÷ h′', value: p.zb > 0.05 ? (p.tk / p.zb).toFixed(2) : '—' },
                    { label: '實際折射率 n', value: p.hideN ? (v.ok ? `${Number(p.na).toFixed(2)}（對齊後揭曉）` : '？對齊後揭曉') : Number(p.na).toFixed(2) }
                ];
                return [
                    { label: '硬幣實深 h', value: `${p.h} cm` },
                    { label: '參考針 B（視深 h′）', value: `水面下 ${p.zb.toFixed(1)} cm` },
                    { label: '眼睛移到最右時 B 與像錯開', value: shift },
                    { label: '判斷', value: v.text },
                    { label: '由 B 推算 n = h ÷ h′', value: p.zb > 0.05 ? (p.h / p.zb).toFixed(2) : '—' },
                    { label: '實際折射率 n', value: p.hideN ? (v.ok ? `${Number(p.n).toFixed(2)}（對齊後揭曉）` : '？對齊後揭曉') : Number(p.n).toFixed(2) }
                ];
            },
            setup: ({ host, canvas, params, disposers, syncOutputs, paint }) => {
                const liquidBtn = host.querySelector('[data-action="liquid"]');
                const sync = () => { if (liquidBtn) liquidBtn.style.display = params.mode === 'depth' || params.mode === 'slab' ? '' : 'none'; };
                host.querySelectorAll('[data-mode]').forEach((b) => disposers.addEventListener(b, 'click', sync));
                sync();
                canvas.style.touchAction = 'none';
                const input = host.querySelector('[id$="parallax-zb"]');
                // 3D 圖上兩種拖曳：抓住綠色針頭移動 B；拖其他地方旋轉視角
                let dragging = null, last = null, zbRaw = 0;
                const local = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
                const inPanel = ([x, y]) => { const b = params._panel; return b && x >= b.x0 && x <= b.x0 + b.w && y >= b.y0 && y <= b.y0 + b.h; };
                const onPin = ([x, y]) => { const b = params._bHandle; return b && Math.hypot(x - b.u, y - b.v) < 16; };
                const move = (e) => {
                    const [x, y] = local(e), dx = x - last[0], dy = y - last[1];
                    last = [x, y];
                    if (dragging === 'rotate') {
                        const v = params._view3d;
                        if (v) {
                            v.yaw += dx * 0.01;
                            v.pitch = Math.max(rad(5), Math.min(rad(80), v.pitch + dy * 0.01));
                        }
                        paint(); return;
                    }
                    // 把滑鼠位移投影到「B 往後（往下）移 1 cm」在畫面上的方向
                    const b = params._bHandle, len2 = b.du * b.du + b.dv * b.dv;
                    if (len2 < 1e-6) return;
                    zbRaw = Math.max(0, Math.min(Number(input ? input.max : 25), zbRaw + (dx * b.du + dy * b.dv) / len2));
                    params.zb = Math.round(zbRaw * 10) / 10;
                    if (input) input.value = params.zb;
                    syncOutputs(); paint();
                };
                disposers.addEventListener(canvas, 'pointerdown', (e) => {
                    const pt = local(e);
                    if (onPin(pt)) { dragging = 'pin'; zbRaw = params.zb; }
                    else if (inPanel(pt)) dragging = 'rotate';
                    else return;
                    last = pt;
                    canvas.style.cursor = 'grabbing';
                    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* 不支援時略過 */ }
                });
                disposers.addEventListener(canvas, 'pointermove', (e) => {
                    if (dragging) { move(e); return; }
                    const pt = local(e);
                    canvas.style.cursor = onPin(pt) ? 'pointer' : inPanel(pt) ? 'grab' : '';
                });
                const end = () => { dragging = null; canvas.style.cursor = ''; };
                disposers.addEventListener(canvas, 'pointerup', end);
                disposers.addEventListener(canvas, 'pointercancel', end);
            },
            draw: (ctx, w, h, p, t) => {
                const L = LABS.parallax, mirror = p.mode === 'mirror';
                const wide = w >= 640, xe = L.eyeX(p, t), v = L.verdict(p);
                // 左（窄螢幕在上）：3D 裝置圖；右（窄螢幕在下）：眼睛看到的畫面
                const aw = wide ? Math.round(w * 0.58) : w, ah = wide ? h : Math.round(h * 0.56);
                p._panel = { x0: 0, y0: 0, w: aw, h: ah };
                L.draw3d(ctx, 0, 0, aw, ah, p, xe);
                labelWrap(ctx, `橘實線：${p.mode === 'depth' ? '硬幣' : 'A'}的光真正走的路　粉紅虛線：往回延長，交到的就是像　綠點線：眼睛直接看 B`,
                          10, ah - 26, C.muted, 10, 13, aw - 20);

                // ── 眼睛看到的畫面：從眼睛位置做真正的透視，眼睛一直盯著 A 的像
                const px0 = wide ? aw + 10 : 0, py0 = wide ? 0 : ah + 10;
                const pw = wide ? w - aw - 10 : w, ph = wide ? h : h - ah - 10;
                L.drawEye(ctx, px0, py0, pw, ph - 44, p, xe);
                ctx.fillStyle = '#fff'; ctx.fillRect(px0, py0 + ph - 44, pw, 44);
                ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(px0, py0, pw, ph);
                labelWrap(ctx, v.text, px0 + 10, py0 + ph - 26, v.ok ? C.green : C.rose, 11, 14, pw - 20, '：');
            },
            /* 眼睛真正看到的畫面。世界座標同 3D 裝置圖（x 搖擺方向、y 前後、z 高度，桌面 z = 0）。
             * 視線對準 A 的像，視野只涵蓋像附近約 ±6 cm，就像實驗時湊近盯著看；
             * 水中的點逐點解司乃耳定律，取它從水面射出、進入眼睛的方向。 */
            drawEye: (ctx, x0, y0, pw, ph, p, xe) => {
                const L = LABS.parallax, mirror = p.mode === 'mirror', slab = p.mode === 'slab';
                const lens = p.mode === 'convex' || p.mode === 'concave', flat = mirror || slab || lens;
                const H = p.H, n = Number(p.n), li = lens ? L.lensImage(p) : null;
                const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
                const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
                const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
                const unit = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
                const h = p.h, E = flat ? [xe, 0, 3] : [xe, 0, H + h];
                /* 隔著厚度 tk、折射率 na 的平行板（前表面 y = H）看板後一點 Q：
                 * 在含法線（y 方向）的平面內解入射角 θ，回傳眼睛真正看到它的方向（出射光的反方向） */
                const tk = Number(p.tk), na = Number(p.na);
                const viaSlab = (Q) => {
                    const dx = Q[0] - E[0], dz = Q[2] - E[2], rho = Math.hypot(dx, dz), Ly = Q[1] - E[1];
                    if (rho < 1e-6) return [0, 1, 0];
                    let lo = 0, hi = Math.PI / 2 - 1e-6;
                    for (let i = 0; i < 40; i++) {
                        const th = (lo + hi) / 2;
                        if (Math.tan(th) * (Ly - tk) + tk * Math.tan(Math.asin(Math.sin(th) / na)) > rho) hi = th; else lo = th;
                    }
                    const th = (lo + hi) / 2;
                    return [dx / rho * Math.sin(th), Math.cos(th), dz / rho * Math.sin(th)];
                };
                // 水中一點 Q：在「眼睛—Q」的鉛直面內找水面出射點 S，眼睛沿 S 的方向看到 Q
                const viaWater = (Q) => {
                    const dx = Q[0] - E[0], dy = Q[1] - E[1], rho = Math.hypot(dx, dy), dw = h - Q[2];
                    if (rho < 1e-6) return [E[0], E[1], h];
                    let lo = 0, hi = rho;
                    for (let i = 0; i < 32; i++) {
                        const s = (lo + hi) / 2;
                        if (Math.sin(Math.atan(s / H)) > n * Math.sin(Math.atan((rho - s) / dw))) hi = s; else lo = s;
                    }
                    const s = (lo + hi) / 2;
                    return [E[0] + dx / rho * s, E[1] + dy / rho * s, h];
                };
                // 視線方向：燒杯模式對準硬幣的像（硬幣中心射出水面的方向），平面鏡模式對準鏡中 A′
                const yA = H + tk + 0.1;
                const target = lens ? [0, H + li.qa, L.lensZ] : mirror ? [0, H + p.d, 3.5] : slab ? (() => { const d = viaSlab([0, yA, 3.5]); return [E[0] + d[0], E[1] + d[1], E[2] + d[2]]; })() : viaWater([0, 0, 0]);
                const f = unit(sub(target, E));
                const upRef = flat ? [0, 0, 1] : [0, 1, 0];
                const u = unit(sub(upRef, f.map((c) => c * dot(upRef, f))));
                const r = cross(f, u);
                const dist = lens ? H + li.qa : mirror ? H + p.d : slab ? H + tk / na : Math.hypot(...sub(target, E)) + h / n;
                const F = Math.min(pw, ph) * 0.46 * dist / (lens ? 12 : flat ? 9 : 6);
                const cx = x0 + pw / 2, cy = y0 + (flat ? ph / 2 : ph * 0.64);   // 燒杯模式把像放低，上方留給 B
                const proj = (dir) => { const z = dot(dir, f); return [cx + F * dot(dir, r) / z, cy - F * dot(dir, u) / z]; };
                const air = (Q) => proj(sub(Q, E));
                const wet = (Q) => proj(sub(viaWater(Q), E));
                const path = (pts) => { ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); };
                const ring = (map, ox, oy, r0, z) => Array.from({ length: 72 }, (_, i) => {
                    const a = i / 72 * Math.PI * 2;
                    return map([ox + r0 * Math.cos(a), oy + r0 * Math.sin(a), z]);
                });
                const ball = (Q, rcm, color) => {
                    const [a, b] = air(Q), rr = Math.max(2.5, F * rcm / Math.hypot(...sub(Q, E)));
                    const g = ctx.createRadialGradient(a - rr * 0.35, b - rr * 0.35, rr * 0.1, a, b, rr);
                    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, color); g.addColorStop(1, 'rgba(0,0,0,0.55)');
                    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a, b, rr, 0, Math.PI * 2); ctx.fill();
                };
                const rod = (A, B, wcm, color) => {
                    const a = air(A), b = air(B);
                    ctx.strokeStyle = color; ctx.lineCap = 'round';
                    ctx.lineWidth = Math.max(1.2, F * wcm / Math.hypot(...sub(A, E)));
                    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.lineCap = 'butt';
                };
                // 強調外暈：要互相比對的兩樣東西（B 與像）包一圈黃色光暈，學生才知道要盯哪裡
                const glow = (pts, widthPx) => {
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255,200,40,0.55)'; ctx.lineWidth = widthPx; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                    ctx.shadowColor = 'rgba(255,190,0,0.95)'; ctx.shadowBlur = 16;
                    ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke();
                    ctx.restore();
                };

                ctx.save();
                ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
                if (!flat) {
                    const R = L.R, bcY = L.bcY, yb = L.pinY, zB = h - p.zb, rodY = yb + 5;
                    // 桌面（木紋色）
                    ctx.fillStyle = '#e6d5bb'; ctx.fillRect(x0, y0, pw, ph);
                    ctx.strokeStyle = 'rgba(140,105,60,0.10)'; ctx.lineWidth = 1;
                    for (let k = -40; k <= 40; k += 1.5) { const a = air([k, -40, 0]), b = air([k, 40, 0]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
                    // 杯底（透過水看）與硬幣
                    path(ring(wet, 0, bcY, R, 0)); ctx.fillStyle = '#d3e6e8'; ctx.fill();
                    const coin = ring(wet, 0, 0, 1.2, 0.05), c0 = wet([0, 0, 0.05]);
                    const gc = ctx.createRadialGradient(c0[0] - 6, c0[1] - 6, 2, c0[0], c0[1], Math.abs(coin[0][0] - c0[0]) + 2);
                    gc.addColorStop(0, '#f4d27a'); gc.addColorStop(0.7, '#d39b2f'); gc.addColorStop(1, '#9c6a17');
                    const halo = ring(wet, 0, 0, 1.3, 0.05);
                    glow(halo.concat([halo[0]]), 10);
                    path(coin); ctx.fillStyle = gc; ctx.fill(); ctx.strokeStyle = '#8a5a12'; ctx.lineWidth = 1.2; ctx.stroke();
                    path(ring(wet, 0, 0, 0.85, 0.05)); ctx.strokeStyle = 'rgba(138,90,18,0.55)'; ctx.stroke();
                    // 硬幣上刻一條對稱軸（朝向 B），對齊時 B 的針尖要落在這條線的延長線上；軸上各點同樣逐點折射
                    const axisPts = Array.from({ length: 13 }, (_, i) => wet([0, -1.2 + i * 0.2, 0.06]));
                    ctx.beginPath(); axisPts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
                    ctx.strokeStyle = '#6e4508'; ctx.lineWidth = 2; ctx.stroke();
                    // 水面（淡藍）與玻璃杯壁：水面圈、杯口圈
                    path(ring(air, 0, bcY, R, h)); ctx.fillStyle = 'rgba(90,170,185,0.22)'; ctx.fill();
                    ctx.strokeStyle = 'rgba(14,139,147,0.55)'; ctx.lineWidth = 1.4; ctx.stroke();
                    path(ring(air, 0, bcY, R + 0.15, h + 2)); ctx.strokeStyle = 'rgba(30,60,70,0.55)'; ctx.lineWidth = 3; ctx.stroke();
                    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1; ctx.stroke();
                    // 杯外的參考針 B 與鐵架（直接看到）；針尖那一段加光暈
                    glow([air([0, yb, zB]), air([0, yb + 1.4, zB])], 12);
                    rod([0, rodY, zB], [0, yb + 3.5, zB], 0.25, '#6f7b80');
                    rod([0, yb, zB], [0, yb + 3.5, zB], 0.1, '#8e9ca1');
                    ball([0, yb + 3.5, zB], 0.45, C.green);
                    rod([0, rodY, 0], [0, rodY, h + 6], 0.4, '#5f6b70');
                    const ca = wet([0, 0, 0.05]), tb = air([0, yb, zB]);
                    labelFit(ctx, 'A 的像', ca[0], ca[1] + Math.abs(coin[18][1] - ca[1]) + 18, C.rose, 11, 'center', { clampW: x0 + pw - 2, plate: 1 });
                    labelFit(ctx, 'B 的針尖', tb[0] + 10, tb[1] + 4, C.green, 11, 'left', { clampW: x0 + pw - 2, plate: 1 });
                } else {
                    ctx.fillStyle = '#f2f5f6'; ctx.fillRect(x0, y0, pw, ph);
                    // 桌面只取眼前一段，太近或太寬的點投影後座標過大，canvas 會畫不出來
                    const yNear = Math.max(4, H - (mirror ? p.d : 0) - 6), yFar = H + 40;
                    const table = () => {
                        const tbl = [air([-25, yNear, 0]), air([25, yNear, 0]), air([25, yFar, 0]), air([-25, yFar, 0])];
                        path(tbl); ctx.fillStyle = '#e6d5bb'; ctx.fill();
                        ctx.strokeStyle = 'rgba(140,105,60,0.16)'; ctx.lineWidth = 1;
                        for (let k = -24; k <= 24; k += 3) { const a = air([k, yNear, 0]), b = air([k, yFar, 0]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
                        for (let y = Math.ceil(yNear / 3) * 3; y <= yFar; y += 3) { const a = air([-25, y, 0]), b = air([25, y, 0]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
                    };
                    table();
                    const opts = { clampW: x0 + pw - 2, plate: 1 };
                    if (lens) {
                        const lz = L.lensZ, lr = L.lensR, zAh = L.pinAL, zBh = L.pinBL, yA = H + li.po, yB = H + p.zb;
                        const rim = Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2; return air([lr * Math.cos(a), H, lz + lr * Math.sin(a)]); });
                        /* 薄透鏡把透鏡後 po 處的一點 Q 成像到 I：1/po + 1/q = 1/f、m = −q/po（q < 0 為虛像，在物體同一側）。
                         * 透鏡範圍內眼睛看到的是像 I；若像落在眼睛後方（看不到清楚的像），回傳 null */
                        const imageOf = (Q, po) => {
                            const q = 1 / (1 / li.fl - 1 / po), m = -q / po;
                            const I = [m * Q[0], H - q, lz + m * (Q[2] - lz)];
                            return I[1] - E[1] > 1 ? { pt: air(I), m, dist: I[1] - E[1] } : null;
                        };
                        const pinImage = (y, zTop, color, glowFrom) => {
                            const a = imageOf([0, y, 0], y - H), b = imageOf([0, y, zTop], y - H);
                            if (!a || !b) return null;
                            if (glowFrom != null) { const g = imageOf([0, y, glowFrom], y - H); if (g) glow([g.pt, b.pt], 14); }
                            ctx.strokeStyle = '#7d8c91'; ctx.lineCap = 'round';
                            ctx.lineWidth = Math.min(14, Math.max(1.2, F * 0.12 * Math.abs(b.m) / b.dist));
                            ctx.beginPath(); ctx.moveTo(a.pt[0], a.pt[1]); ctx.lineTo(b.pt[0], b.pt[1]); ctx.stroke(); ctx.lineCap = 'butt';
                            const r = Math.min(26, Math.max(2.5, F * 0.45 * Math.abs(b.m) / b.dist));
                            const g = ctx.createRadialGradient(b.pt[0] - r * 0.35, b.pt[1] - r * 0.35, r * 0.1, b.pt[0], b.pt[1], r);
                            g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, color); g.addColorStop(1, 'rgba(0,0,0,0.55)');
                            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.pt[0], b.pt[1], r, 0, Math.PI * 2); ctx.fill();
                            return b.pt;
                        };
                        // 透鏡外直接看到的兩根針（物體本身）：B 比透鏡高，視線越過透鏡上緣的那一截加光暈
                        const zCut = Math.min(zBh, E[2] + (lz + lr - E[2]) * (yB - E[1]) / (H - E[1]));
                        const draw2 = [[yA, () => { rod([0, yA, 0], [0, yA, zAh], 0.12, '#7d8c91'); ball([0, yA, zAh], 0.45, C.orange); }],
                                       [yB, () => { if (zCut < zBh) glow([air([0, yB, zCut]), air([0, yB, zBh])], 14);
                                                    rod([0, yB, 0], [0, yB, zBh], 0.12, '#7d8c91'); ball([0, yB, zBh], 0.45, C.green); }]]
                            .sort((a, b) => b[0] - a[0]);
                        draw2.forEach(([, fn]) => fn());
                        // 透鏡裡：先重畫背景，再由遠到近畫兩根針經透鏡成的像
                        ctx.save(); path(rim); ctx.clip();
                        ctx.fillStyle = '#f2f5f6'; ctx.fillRect(x0, y0, pw, ph); table();
                        let ihA = null, ihB = null;
                        [[yA, () => { ihA = pinImage(yA, zAh, C.orange, zAh - 1.2); }], [yB, () => { ihB = pinImage(yB, zBh, C.green, null); }]]
                            .sort((a, b) => b[0] - a[0]).forEach(([, fn]) => fn());
                        ctx.restore();
                        // 透鏡：淡淡的玻璃色、鏡框與支架
                        rod([0, H, 0], [0, H, lz - lr], 0.3, '#5f6b70');
                        path(rim); ctx.fillStyle = 'rgba(150,205,225,0.14)'; ctx.fill();
                        ctx.strokeStyle = '#4f5b60'; ctx.lineWidth = 3; ctx.stroke();
                        const bh = air([0, yB, zBh]);
                        if (ihA) labelFit(ctx, `A 的虛像（${li.m > 1 ? '放大' : '縮小'}）`, ihA[0] + 12, ihA[1] + 18, C.rose, 11, 'left', opts);
                        labelFit(ctx, 'B（露出透鏡上緣：物體本身）', bh[0] + 10, bh[1] + 4, C.green, 11, 'left', opts);
                        if (ihB && ihB[1] > y0 + 56 && ihB[1] < y0 + ph - 10) labelFit(ctx, 'B 在透鏡裡的像', ihB[0] - 12, ihB[1] + 4, C.muted, 10, 'right', opts);
                        labelFit(ctx, p.mode === 'convex' ? '凸透鏡' : '凹透鏡', rim[54][0], rim[54][1] + 16, C.blue, 10, 'center', opts);
                    } else if (mirror) {
                        const pt = L.plateTop, zA = L.pinA, zB = L.pinB, yB = H + p.zb;
                        const mir = [air([-9, H, 0]), air([9, H, 0]), air([9, H, pt]), air([-9, H, pt])];
                        // 鏡後的參考針 B：視線越過鏡子上緣的那一截才看得到（加光暈），其餘被不透明的鏡子擋住
                        const zCut = Math.min(zB, E[2] + (pt - E[2]) * (yB - E[1]) / (H - E[1]));
                        if (zCut < zB) glow([air([0, yB, zCut]), air([0, yB, zB])], 14);
                        rod([0, yB, 0], [0, yB, zB], 0.12, '#7d8c91');
                        ball([0, yB, zB], 0.45, C.green);
                        // 不透明的鏡面（銀色）
                        const gm = ctx.createLinearGradient(0, mir[3][1], 0, mir[0][1]);
                        gm.addColorStop(0, '#eef2f4'); gm.addColorStop(0.55, '#c9d3d8'); gm.addColorStop(1, '#dfe5e8');
                        path(mir); ctx.fillStyle = gm; ctx.fill();
                        // 鏡中的 A′：只出現在鏡面上
                        ctx.save(); path(mir); ctx.clip();
                        glow([air([0, H + p.d, 0.2]), air([0, H + p.d, zA])], 14);
                        rod([0, H + p.d, 0], [0, H + p.d, zA], 0.12, '#7d8c91');
                        ball([0, H + p.d, zA], 0.45, C.orange);
                        ctx.restore();
                        path(mir); ctx.strokeStyle = '#4f5b60'; ctx.lineWidth = 2.5; ctx.stroke();
                        // 鏡前的大頭針 A（離眼睛最近，畫最後）
                        rod([0, H - p.d, 0], [0, H - p.d, zA], 0.12, '#7d8c91');
                        ball([0, H - p.d, zA], 0.45, C.orange);
                        const ia = air([0, H + p.d, zA]), ib = air([0, yB, zB]), ra = air([0, H - p.d, zA]);
                        labelFit(ctx, 'A′（鏡中）', ia[0] + 10, ia[1] + 18, C.rose, 11, 'left', opts);
                        labelFit(ctx, 'B（露出鏡子上緣）', ib[0] + 10, ib[1] + 4, C.green, 11, 'left', opts);
                        labelFit(ctx, 'A（鏡前）', ra[0] - 12, ra[1] + 4, C.orange, 11, 'right', opts);
                        labelFit(ctx, '平面鏡（不透明）', x0 + 10, Math.max(mir[2][1], mir[3][1]) + 16, C.muted, 10, 'left', opts);
                    } else {
                        const bw = L.blockW, bt = L.blockTop, zAh = L.pinAS, yB = H + p.zb, tip = L.bTip;
                        const front = [air([-bw, H, 0]), air([bw, H, 0]), air([bw, H, bt]), air([-bw, H, bt])];
                        const back = [air([-bw, H + tk, 0]), air([bw, H + tk, 0]), air([bw, H + tk, bt]), air([-bw, H + tk, bt])];
                        const seen = (Q) => proj(viaSlab(Q));
                        // 壓克力背面
                        path(back); ctx.strokeStyle = 'rgba(11,111,146,0.35)'; ctx.lineWidth = 1; ctx.stroke();
                        // 背面的大頭針 A：隔著壓克力看，逐點折射（看起來變近、變大）
                        const aPts = Array.from({ length: 41 }, (_, i) => seen([0, yA, i * zAh / 40]));
                        glow([aPts[28], aPts[40]], 14);
                        ctx.strokeStyle = '#7d8c91'; ctx.lineWidth = Math.max(1.2, F * 0.12 / (H + tk / na)); ctx.lineCap = 'round';
                        ctx.beginPath(); aPts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.lineCap = 'butt';
                        const ah = aPts[40], ar = Math.max(2.5, F * 0.45 / (H + tk / na));
                        const ga = ctx.createRadialGradient(ah[0] - ar * 0.35, ah[1] - ar * 0.35, ar * 0.1, ah[0], ah[1], ar);
                        ga.addColorStop(0, '#ffffff'); ga.addColorStop(0.35, C.orange); ga.addColorStop(1, 'rgba(0,0,0,0.55)');
                        ctx.fillStyle = ga; ctx.beginPath(); ctx.arc(ah[0], ah[1], ar, 0, Math.PI * 2); ctx.fill();
                        // 壓克力：頂面（斷面帶點綠）、側面、正面
                        path([front[3], front[2], back[2], back[3]]); ctx.fillStyle = 'rgba(110,175,160,0.5)'; ctx.fill();
                        ctx.strokeStyle = 'rgba(11,111,146,0.6)'; ctx.stroke();
                        path(front); ctx.fillStyle = 'rgba(150,205,225,0.22)'; ctx.fill();
                        ctx.strokeStyle = 'rgba(11,111,146,0.8)'; ctx.lineWidth = 2; ctx.stroke();
                        // 從上方垂下的參考針 B：針尖在壓克力上方，直接看到
                        glow([air([0, yB, tip]), air([0, yB, tip + 1.2])], 12);
                        rod([0, yB + 4, tip + L.bLen + 1.5], [0, yB, tip + L.bLen], 0.25, '#5f6b70');
                        rod([0, yB, tip], [0, yB, tip + L.bLen], 0.1, '#8e9ca1');
                        ball([0, yB, tip + L.bLen], 0.45, C.green);
                        const tb = air([0, yB, tip]);
                        labelFit(ctx, 'A 的像（隔著壓克力）', ah[0] + 12, ah[1] + 18, C.rose, 11, 'left', opts);
                        labelFit(ctx, 'B 的針尖', tb[0] + 10, tb[1] + 4, C.green, 11, 'left', opts);
                        labelFit(ctx, '厚壓克力', front[0][0] + 8, front[0][1] - 8, C.blue, 10, 'left', opts);
                    }
                }
                labelFit(ctx, '眼睛看到的（盯著像，左右晃頭）', x0 + 10, y0 + 18, C.ink, 12, 'left', { plate: 1, clampW: x0 + pw - 2 });
                labelFit(ctx, '黃色光暈：要互相比對的兩樣東西', x0 + 10, y0 + 38, '#9a6b00', 11, 'left', { plate: 1, clampW: x0 + pw - 2 });
                ctx.restore();
            },
            /* 3D 裝置圖：從斜上方看整套實驗，拖曳可旋轉。
             * 世界座標 x = 眼睛搖擺方向、y = 前後、z = 高度（桌面 z = 0）；光線都在 y = 0 的鉛直面上。 */
            draw3d: (ctx, x0, y0, pw, ph, p, xe) => {
                const L = LABS.parallax, mirror = p.mode === 'mirror', slab = p.mode === 'slab';
                const lens = p.mode === 'convex' || p.mode === 'concave', flat = mirror || slab || lens, H = p.H;
                const li = lens ? L.lensImage(p) : null;
                const tk = Number(p.tk), na = Number(p.na);
                // 各模式各自記住視角；平面鏡模式預設從側面看，眼睛—鏡子—B 才會左右攤開
                const views = p._views || (p._views = { depth: { yaw: rad(-55), pitch: rad(24) }, mirror: { yaw: rad(-72), pitch: rad(30) }, slab: { yaw: rad(-62), pitch: rad(28) }, convex: { yaw: rad(-62), pitch: rad(26) }, concave: { yaw: rad(-62), pitch: rad(26) } });
                const view = p._view3d = views[p.mode];
                const cyw = Math.cos(view.yaw), syw = Math.sin(view.yaw), cp = Math.cos(view.pitch), sp = Math.sin(view.pitch);
                // 場景中心與大小：燒杯模式是高的（眼睛在上方），平面鏡模式是長的（沿桌面往前看）
                const far = lens ? Math.max(li.po, li.qa, p.zb) : mirror ? Math.max(p.d, p.zb) : Math.max(tk, p.zb);
                const T = flat ? [0, (H + far) / 2, 3] : [0, -1, (H + p.h) / 2];
                const span = flat ? H + far + 8 : H + p.h + 8;
                const D = span * 2.4, F = Math.min(pw, ph - 50) * 0.92 * D / span;
                const cx = x0 + pw / 2, cy = y0 + 22 + (ph - 62) / 2;
                const P = (x, y, z) => {
                    const dx = x - T[0], dy = y - T[1], dz = z - T[2];
                    const x1 = cyw * dx - syw * dy, y1 = syw * dx + cyw * dy;
                    const depth = y1 * cp - dz * sp + D;
                    return [cx + F * x1 / depth, cy - F * (y1 * sp + dz * cp) / depth];
                };
                const path = (pts, close) => {
                    ctx.beginPath(); pts.forEach(([u, v], i) => (i ? ctx.lineTo(u, v) : ctx.moveTo(u, v)));
                    if (close) ctx.closePath();
                };
                const fillPoly = (pts, fill, stroke, lw) => {
                    path(pts, true);
                    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
                    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
                };
                const line = (a, b, color, w, dash) => {
                    ctx.save(); if (dash) ctx.setLineDash(dash);
                    ctx.strokeStyle = color; ctx.lineWidth = w || 1.6;
                    path([P(...a), P(...b)]); ctx.stroke(); ctx.restore();
                };
                const ring = (cx0, cy0, r, z) => Array.from({ length: 48 }, (_, i) => {
                    const a = i / 48 * Math.PI * 2;
                    return P(cx0 + r * Math.cos(a), cy0 + r * Math.sin(a), z);
                });
                const ring3 = (r, y, zc) => Array.from({ length: 48 }, (_, i) => {
                    const a = i / 48 * Math.PI * 2;
                    return P(r * Math.cos(a), y, zc + r * Math.sin(a));
                });
                const ball = (pt, r, color) => {
                    const [u, v] = P(...pt);
                    const g = ctx.createRadialGradient(u - r * 0.35, v - r * 0.35, r * 0.1, u, v, r);
                    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, color); g.addColorStop(1, 'rgba(0,0,0,0.5)');
                    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(u, v, r, 0, Math.PI * 2); ctx.fill();
                };
                const tag = (text, pt, color, dx = 8, dy = 4, align) => {
                    const [u, v] = P(...pt);
                    labelFit(ctx, text, u + dx, v + dy, color, 11, align || 'left', { clampW: x0 + pw - 2, plate: 1 });
                };
                // 記下 B 針頭在畫面上的位置，以及「B 往後（往下）移 1 cm」時針頭在畫面上移動的方向，供拖曳使用
                const handle = (at, next) => {
                    const a = P(...at), b = P(...next);
                    p._bHandle = { u: a[0], v: a[1], du: b[0] - a[0], dv: b[1] - a[1] };
                    ctx.strokeStyle = 'rgba(18,128,92,0.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
                    ctx.beginPath(); ctx.arc(a[0], a[1], 11, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
                };
                const eye = (pt) => {
                    const [u, v] = P(...pt);
                    ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
                    ctx.beginPath(); ctx.ellipse(u, v, 11, 6.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(u, v + 1, 3, 0, Math.PI * 2); ctx.fill();
                };

                ctx.save();
                ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
                ctx.fillStyle = '#f4f7f8'; ctx.fillRect(x0, y0, pw, ph);
                const tx = flat ? [-14, 14] : [-11, 11], ty = flat ? [-4, H + far + 6] : [-12, 12];
                fillPoly([P(tx[0], ty[0], 0), P(tx[1], ty[0], 0), P(tx[1], ty[1], 0), P(tx[0], ty[1], 0)], '#eadcc6', 'rgba(120,90,50,0.25)');

                if (!flat) {
                    const R = L.R, bcY = L.bcY, h = p.h, yb = L.pinY, zB = h - p.zb;
                    const g = L.coinRay(p, xe), imgZ = h - g.img, eyeZ = H + h;
                    // 鐵架與參考針 B（杯外，夾在右側）
                    const rodY = yb + 5;
                    fillPoly([P(-2.5, rodY - 2, 0), P(2.5, rodY - 2, 0), P(2.5, rodY + 2, 0), P(-2.5, rodY + 2, 0)], '#9aa6aa', '#6f7b80');
                    line([0, rodY, 0], [0, rodY, h + 6], '#6f7b80', 3);
                    line([0, rodY, zB], [0, yb + 3.5, zB], '#6f7b80', 2.4);
                    // 燒杯：水體、杯底、硬幣、水面、杯口、杯壁輪廓
                    const rx = cyw, ry = -syw;   // 畫面右方在世界中的方向，用來找圓柱的左右輪廓
                    const side = (z0, z1) => [P(-R * rx, bcY - R * ry, z0), P(-R * rx, bcY - R * ry, z1), P(R * rx, bcY + R * ry, z1), P(R * rx, bcY + R * ry, z0)];
                    fillPoly(ring(0, bcY, R, 0), 'rgba(170,215,222,0.55)');
                    fillPoly(side(0, h), 'rgba(170,215,222,0.55)');
                    fillPoly(ring(0, 0, 1.2, 0.05), '#d9a441', '#9c6a17', 1.2);
                    line([0, -1.2, 0.06], [0, 1.2, 0.06], '#6e4508', 1.6);   // 硬幣的對稱軸，朝向 B
                    fillPoly(ring(0, bcY, R, h), 'rgba(120,195,205,0.45)', 'rgba(14,139,147,0.7)', 1.2);
                    // 光線：硬幣 → 水面折射 → 眼睛；粉紅虛線往回延長到像；綠點線直接看 B
                    line([0, 0, 0], [g.s, 0, h], C.orange, 2);
                    line([g.s, 0, h], [xe, 0, eyeZ], C.orange, 2);
                    line([g.s, 0, h], [0, 0, imgZ], C.rose, 1.6, [5, 4]);
                    line([0, yb, zB], [xe, 0, eyeZ], C.green, 1.3, [2, 4]);
                    const [iu, iv] = P(0, 0, imgZ);
                    ctx.strokeStyle = C.rose; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(iu, iv, 5, 0, Math.PI * 2); ctx.stroke();
                    path(ring(0, bcY, R, h + 2), true); ctx.strokeStyle = 'rgba(18,49,58,0.55)'; ctx.lineWidth = 1.6; ctx.stroke();
                    const s0 = side(0, h + 2);
                    ctx.strokeStyle = 'rgba(18,49,58,0.45)'; ctx.lineWidth = 1.4;
                    path([s0[0], s0[1]]); ctx.stroke(); path([s0[3], s0[2]]); ctx.stroke();
                    path(ring(0, bcY, R, 0), true); ctx.stroke();
                    // 參考針 B 的針與針頭畫在杯子前面（它在杯外）
                    line([0, yb, zB], [0, yb + 3.5, zB], '#7d8c91', 2.2);
                    ball([0, yb + 3.5, zB], 5.5, C.green);
                    handle([0, yb + 3.5, zB], [0, yb + 3.5, zB - 1]);
                    // 眼睛與搖擺範圍
                    if (p.amp > 0) line([-p.amp, 0, eyeZ], [p.amp, 0, eyeZ], C.muted, 1, [4, 4]);
                    eye([xe, 0, eyeZ]);
                    tag('眼睛', [xe, 0, eyeZ], C.ink, 14);
                    tag('硬幣 A', [0, 0, 0], C.orange, -10, 16, 'right');
                    tag('A 的像', [0, 0, imgZ], C.rose, 9);
                    tag('參考針 B（拖曳針頭）', [0, yb + 3.5, zB], C.green, 14, -10);
                    tag('水面', [-R * 0.7, bcY - R * 0.7, h], C.cyan, 0, 0, 'center');
                    label(ctx, '3D 裝置圖（拖曳空白處旋轉）', x0 + 10, y0 + 18, C.ink, 12);
                } else if (lens) {
                    const ez = L.lensZ, lr = L.lensR, zAh = L.pinAL, zBh = L.pinBL, yA = H + li.po, yB = H + p.zb;
                    // 光線在 z = ez 的水平面上：A → 透鏡上的點 → 眼睛；粉紅虛線把出射光往回延長，交在虛像
                    const xl = xe * li.qa / (H + li.qa);
                    const pin = (y, top, color, alpha) => {
                        ctx.globalAlpha = alpha || 1;
                        line([0, y, 0], [0, y, top], '#7d8c91', 2);
                        ball([0, y, top], 4, color);
                        ctx.globalAlpha = 1;
                    };
                    // 兩根針都插在桌上；虛像只畫淡色示意。由遠到近畫
                    [[yA, () => pin(yA, zAh, C.orange)],
                     [yB, () => { pin(yB, zBh, C.green); ball([0, yB, zBh], 5.5, C.green); handle([0, yB, zBh], [0, yB + 1, zBh]); }],
                     [H + li.qa, () => { ctx.globalAlpha = 0.4; line([0, H + li.qa, ez - li.m * ez], [0, H + li.qa, ez + li.m * (zAh - ez)], '#7d8c91', 2);
                                         ball([0, H + li.qa, ez + li.m * (zAh - ez)], 4, C.orange); ctx.globalAlpha = 1;
                                         line([0, H + li.qa, 0], [0, H + li.qa, ez + li.m * (zAh - ez)], C.rose, 1, [3, 3]); }]]
                        .sort((a, b) => b[0] - a[0]).forEach(([, fn]) => fn());
                    line([0, yA, ez], [xl, H, ez], C.orange, 2);
                    line([xl, H, ez], [xe, 0, ez], C.orange, 2);
                    line([xl, H, ez], [0, H + li.qa, ez], C.rose, 1.6, [5, 4]);
                    line([0, yB, ez + lr + 1.5], [xe, 0, ez], C.green, 1.3, [2, 4]);
                    // 透鏡與支架
                    line([0, H, 0], [0, H, ez - lr], '#5f6b70', 3);
                    fillPoly(ring3(lr, H, ez), 'rgba(150,205,225,0.3)', '#4f5b60', 2);
                    if (p.amp > 0) line([-p.amp, 0, ez], [p.amp, 0, ez], C.muted, 1, [4, 4]);
                    eye([xe, 0, ez]);
                    tag('眼睛', [xe, 0, ez], C.ink, 14);
                    tag('大頭針 A', [0, yA, zAh], C.orange, 8, -6);
                    tag('A 的虛像', [0, H + li.qa, ez + li.m * (zAh - ez)], C.rose, -8, -8, 'right');
                    tag('參考針 B（拖曳針頭）', [0, yB, zBh], C.green, 14, -10);
                    tag(p.mode === 'convex' ? '凸透鏡' : '凹透鏡', [lr, H, ez + lr], C.blue, 4, -6);
                    label(ctx, '3D 裝置圖（拖曳空白處旋轉）', x0 + 10, y0 + 18, C.ink, 12);
                } else if (mirror) {
                    const ez = 3, zA = L.pinA, zB = L.pinB, m = xe * p.d / (H + p.d), pt3 = L.plateTop;
                    const pin = (y, top, color, alpha) => {
                        ctx.globalAlpha = alpha || 1;
                        line([0, y, 0], [0, y, top], '#7d8c91', 2);
                        ball([0, y, top], 4, color);
                        ctx.globalAlpha = 1;
                    };
                    // 由遠到近：B、不透明的鏡子、鏡中的像 A′（虛像，只畫淡色示意）、光線、A、眼睛
                    pin(H + p.zb, zB, C.green);
                    ball([0, H + p.zb, zB], 5.5, C.green);
                    handle([0, H + p.zb, zB], [0, H + p.zb + 1, zB]);
                    fillPoly([P(-9, H + 0.4, 0), P(9, H + 0.4, 0), P(9, H + 0.4, pt3), P(-9, H + 0.4, pt3)], '#7c868b', '#4f5b60', 1);
                    fillPoly([P(-9, H, pt3), P(9, H, pt3), P(9, H + 0.4, pt3), P(-9, H + 0.4, pt3)], '#9aa4a9', '#4f5b60', 1);
                    fillPoly([P(-9, H, 0), P(9, H, 0), P(9, H, pt3), P(-9, H, pt3)], 'rgba(214,224,229,0.96)', '#4f5b60', 1.6);
                    pin(H + p.d, zA, C.orange, 0.4);
                    line([0, H + p.d, 0], [0, H + p.d, zA], C.rose, 1, [3, 3]);
                    line([0, H - p.d, ez], [m, H, ez], C.orange, 2);
                    line([m, H, ez], [xe, 0, ez], C.orange, 2);
                    line([m, H, ez], [0, H + p.d, ez], C.rose, 1.6, [5, 4]);
                    line([0, H + p.zb, zB - 1], [xe, 0, ez], C.green, 1.3, [2, 4]);
                    pin(H - p.d, zA, C.orange);
                    if (p.amp > 0) line([-p.amp, 0, ez], [p.amp, 0, ez], C.muted, 1, [4, 4]);
                    eye([xe, 0, ez]);
                    tag('眼睛', [xe, 0, ez], C.ink, 14);
                    tag('大頭針 A', [0, H - p.d, zA], C.orange, 8, -6);
                    tag('像 A′', [0, H + p.d, zA], C.rose, 8, -6);
                    tag('參考針 B（拖曳針頭）', [0, H + p.zb, zB], C.green, 14, -10);
                    tag('平面鏡', [9, H, pt3], C.muted, -4, -6, 'right');
                    label(ctx, '3D 裝置圖（拖曳空白處旋轉）', x0 + 10, y0 + 18, C.ink, 12);
                } else {
                    const ez = 3, bw = L.blockW, bt = L.blockTop, yA = H + tk + 0.1, zAh = L.pinAS, yB = H + p.zb, tip = L.bTip;
                    const top = tip + L.bLen;
                    // 光線在 z = ez 的水平面上：A → 壓克力內 → 前表面出射點 S → 眼睛；粉紅虛線把出射光往回延長到像
                    const th = L.slabTheta(p, Math.abs(xe)), xs = xe - Math.sign(xe) * H * Math.tan(th);
                    const img = Math.abs(xe - xs) < 1e-6 ? tk / na : H * xe / (xe - xs) - H;
                    // 由遠到近：A、壓克力背面與側面、像、B 與支架、光線、正面、眼睛
                    line([0, yA, 0], [0, yA, zAh], '#7d8c91', 2);
                    ball([0, yA, zAh], 4, C.orange);
                    fillPoly([P(-bw, H + tk, 0), P(bw, H + tk, 0), P(bw, H + tk, bt), P(-bw, H + tk, bt)], 'rgba(150,205,225,0.18)', 'rgba(11,111,146,0.45)', 1);
                    fillPoly([P(bw, H, 0), P(bw, H + tk, 0), P(bw, H + tk, bt), P(bw, H, bt)], 'rgba(110,175,160,0.35)', 'rgba(11,111,146,0.6)', 1);
                    fillPoly([P(-bw, H, bt), P(bw, H, bt), P(bw, H + tk, bt), P(-bw, H + tk, bt)], 'rgba(110,175,160,0.45)', 'rgba(11,111,146,0.6)', 1);
                    line([0, H + img, 0], [0, H + img, zAh], C.rose, 1, [3, 3]);
                    ball([0, H + img, zAh], 3.5, 'rgba(194,38,74,0.55)');
                    line([0, yA, ez], [xs, H, ez], C.orange, 2);
                    line([xs, H, ez], [xe, 0, ez], C.orange, 2);
                    line([xs, H, ez], [0, H + img, ez], C.rose, 1.6, [5, 4]);
                    fillPoly([P(-bw, H, 0), P(bw, H, 0), P(bw, H, bt), P(-bw, H, bt)], 'rgba(150,205,225,0.22)', 'rgba(11,111,146,0.8)', 1.6);
                    // 支架與從上方垂下的參考針 B
                    line([bw + 3, yB, 0], [bw + 3, yB, top + 1.5], '#6f7b80', 3);
                    line([bw + 3, yB, top + 1.5], [0, yB, top + 1.5], '#6f7b80', 2.4);
                    line([0, yB, top + 1.5], [0, yB, top], '#6f7b80', 2.4);
                    line([0, yB, tip], [0, yB, top], '#7d8c91', 2.2);
                    ball([0, yB, top], 5.5, C.green);
                    handle([0, yB, top], [0, yB + 1, top]);
                    line([0, yB, tip], [xe, 0, ez], C.green, 1.3, [2, 4]);
                    if (p.amp > 0) line([-p.amp, 0, ez], [p.amp, 0, ez], C.muted, 1, [4, 4]);
                    eye([xe, 0, ez]);
                    tag('眼睛', [xe, 0, ez], C.ink, 14);
                    tag('大頭針 A（貼背面）', [0, yA, zAh], C.orange, 8, -6);
                    tag('A 的像', [0, H + img, zAh], C.rose, -8, -8, 'right');
                    tag('參考針 B（拖曳針頭）', [0, yB, top], C.green, 14, -10);
                    tag('厚壓克力', [-bw, H, bt], C.blue, 4, -6);
                    label(ctx, '3D 裝置圖（拖曳空白處旋轉）', x0 + 10, y0 + 18, C.ink, 12);
                }
                ctx.restore();
            }
        };

