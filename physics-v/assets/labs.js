(() => {
  const P = PVPhysics;
  const W = 560, H = 326, tau = 2 * Math.PI;
  const colors = { ink: "#e9f4fa", muted: "#aac3d0", grid: "#31505f", teal: "#7de0cc", amber: "#f4be73", blue: "#9cbdf6", rose: "#f4979b" };
  const f = (n, d = 2) => (!Number.isFinite(n) ? "—" : (Math.abs(n) < 0.5 * 10 ** (-d) ? 0 : n).toLocaleString("en-US", { maximumFractionDigits: d }));
  const sci = (n, d = 2) => !Number.isFinite(n) || n === 0 ? "0" : n.toExponential(d);
  const l = (x, y, a, b, c = colors.grid, w = 1, dash = "") => `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${a.toFixed(1)}" y2="${b.toFixed(1)}" stroke="${c}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  const t = (x, y, s, c = colors.muted, anchor = "start", size = 15) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${c}" text-anchor="${anchor}" font-size="${size}">${s}</text>`;
  const circ = (x, y, r, fill, stroke = "none", sw = 1) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const box = (x, y, w, h, fill, stroke = "none", r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  const path = (points, c = colors.teal, w = 2.2, dash = "") => points.length ? `<polyline points="${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` : "";
  const arrow = (x, y, a, b, c = colors.teal, w = 2.2, head = 8) => {
    const dx = a - x, dy = b - y, mag = Math.hypot(dx, dy);
    if (mag < 0.5) return "";
    const u = dx / mag, v = dy / mag, h = Math.min(head, mag * 0.6);
    return l(x, y, a, b, c, w) + `<path d="M ${a.toFixed(1)} ${b.toFixed(1)} L ${(a - h * u - h * 0.5 * v).toFixed(1)} ${(b - h * v + h * 0.5 * u).toFixed(1)} L ${(a - h * u + h * 0.5 * v).toFixed(1)} ${(b - h * v - h * 0.5 * u).toFixed(1)} Z" fill="${c}"/>`;
  };
  const sample = (n, fn) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
  const svg = (label, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${inner}</svg>`;
  const caption = s => t(28, 316, s, colors.muted, "start", 13.5);
  const range = (id, name, min, max, step, value, unit = "") => ({ id, name, min, max, step, value, unit });
  const select = (id, name, choices, value) => ({ id, name, choices, value });
  const output = (label, value) => [label, value];

  function chart({ xMin = 0, xMax, yMin = 0, yMax, xLabel, yLabel, xTicks, yTicks, series, origin = [68, 42], size = [446, 214] }) {
    const [x0, y0] = origin, [width, height] = size, [xEnd, yEnd] = [x0 + width, y0 + height];
    const x = n => x0 + ((n - xMin) / (xMax - xMin)) * width;
    const y = n => yEnd - ((n - yMin) / (yMax - yMin)) * height;
    let s = box(x0, y0, width, height, "none", colors.grid);
    for (const [v, label] of xTicks) s += l(x(v), y0, x(v), yEnd) + t(x(v), yEnd + 20, label, colors.muted, "middle", 13.5);
    for (const [v, label] of yTicks) s += l(x0, y(v), xEnd, y(v), v === 0 ? colors.muted : colors.grid) + t(x0 - 8, y(v) + 5, label, colors.muted, "end", 13.5);
    s += t(x0, y0 - 12, yLabel, colors.muted, "start", 14) + t(xEnd, yEnd + 42, xLabel, colors.muted, "end", 14);
    for (const { points, color, marks = false, dashed = false, w = 2.5 } of series) {
      const clipped = points.map(([a, b]) => [x(Math.max(xMin, Math.min(xMax, a))), y(Math.max(yMin, Math.min(yMax, b)))]);
      s += path(clipped, color, w, dashed ? "7 5" : "");
      if (marks) clipped.forEach(([px, py]) => { s += circ(px, py, 3.8, color); });
    }
    return { s, x, y, x0, y0, xEnd, yEnd };
  }

  const lab = (id, name, controls, guide, draw, animate = null) => ({ id, name, controls, guide, draw, animate });

  const labs = [
    lab("ohm-circuit", "歐姆元件、非歐姆元件與內電阻", [
      select("kind", "負載元件", [["ohmic", "固定電阻（歐姆元件）"], ["bulb", "白熾燈泡（非歐姆）"], ["diode", "二極體（非線性）"]], "ohmic"),
      range("eps", "電池電動勢 ε", 1.5, 12, 0.5, 9, "V"),
      range("rInt", "電池內電阻 r", 0.5, 6, 0.5, 2, "Ω"),
      range("rLoad", "參考電阻 R", 2, 20, 1, 8, "Ω")
    ], [
      "在「固定電阻」模式下調大內電阻 r，觀察工作點如何沿著特性曲線往左下移動，比較端電壓 V 與電動勢 ε。",
      "切換為「白熾燈泡」或「二極體」，觀察負載線 V = ε − Ir 與元件 I–V 曲線的交點（實際工作點）。"
    ], p => {
      const res = P.ivCurve(p.kind, p.eps, p.rInt, p.rLoad);
      const yMax = 2.0;
      const { s, x, y } = chart({
        xMax: 12, yMax, xLabel: "端電壓 V (V)", yLabel: "電流 I (A)",
        xTicks: [[0, "0"], [3, "3"], [6, "6"], [9, "9"], [12, "12"]],
        yTicks: [[0, "0"], [0.5, "0.5"], [1.0, "1.0"], [1.5, "1.5"], [2.0, "2.0"]],
        series: [
          { points: res.pts.filter(([, i]) => i <= yMax), color: colors.teal },
          { points: res.loadPts, color: colors.amber, dashed: true }
        ]
      });
      const px = x(res.vOp), py = y(Math.min(yMax, res.iOp));
      return [
        s + circ(px, py, 6, colors.rose, colors.ink, 1.5) + t(px + 10, py - 8, `工作點 (${f(res.vOp, 2)}V, ${f(res.iOp, 2)}A)`, colors.ink, "start", 13.5) +
        caption("青綠：元件 I–V 特性曲線　琥珀虛線：電源負載線 V = ε − Ir"),
        [
          output("端電壓 V", `${f(res.vOp, 2)} V（ε = ${f(p.eps, 1)} V）`),
          output("電路電流 I", `${f(res.iOp, 3)} A`),
          output("工作點等效電阻 V/I", Number.isFinite(res.rEff) ? `${f(res.rEff, 2)} Ω` : "∞"),
          output("負載消耗功率 P = IV", `${f(res.pLoad, 2)} W`)
        ]
      ];
    }),

    lab("series-parallel", "串並聯電路與克希荷夫守恆", [
      select("topo", "電路接法", [["series", "串聯 (R₁ + R₂ + R₃)"], ["parallel", "並聯 (R₁ ∥ R₂ ∥ R₃)"], ["mixed", "混聯 R₁ + (R₂ ∥ R₃)"]], "mixed"),
      range("eps", "電動勢 ε", 3, 24, 1, 12, "V"),
      range("rInt", "內電阻 r", 0, 4, 0.5, 1, "Ω"),
      range("r1", "電阻 R₁", 1, 12, 1, 2, "Ω"),
      range("r2", "電阻 R₂", 1, 12, 1, 6, "Ω"),
      range("r3", "電阻 R₃", 1, 12, 1, 3, "Ω")
    ], [
      "切換三種接法並比較總等效電阻 R_eq：並聯時 R_eq 必小於最小支路，串聯時等於總和。",
      "檢查總輸出功率 εI 是否永遠等於「內阻熱功率 + R₁ + R₂ + R₃ 功率」的總和（能量守恆）。"
    ], p => {
      const m = P.solveCircuit(p.topo, p.eps, p.rInt, p.r1, p.r2, p.r3);
      let s = box(36, 44, 488, 232, "none", colors.grid, 10);
      const drawR = (x1, y1, w, h, lbl, v, i, pw, c) =>
        box(x1, y1, w, h, "#162d38", c, 6) +
        t(x1 + w / 2, y1 + 20, lbl, c, "middle", 14) +
        t(x1 + w / 2, y1 + 38, `${f(v, 2)}V · ${f(i, 2)}A · ${f(pw, 2)}W`, colors.ink, "middle", 12.5);
      // Battery at left
      s += box(54, 118, 86, 86, "#2a201b", colors.amber, 8) +
        t(97, 146, `ε = ${p.eps} V`, colors.amber, "middle", 14.5) +
        t(97, 166, `r = ${p.rInt} Ω`, colors.muted, "middle", 13) +
        t(97, 186, `V端=${f(m.vTerm, 2)}V`, colors.ink, "middle", 12.5);
      if (p.topo === "series") {
        s += l(97, 118, 97, 72, colors.teal, 2) + l(97, 72, 494, 72, colors.teal, 2) + l(494, 72, 494, 248, colors.teal, 2) + l(494, 248, 97, 248, colors.teal, 2) + l(97, 248, 97, 204, colors.teal, 2);
        s += drawR(152, 46, 102, 52, `R₁=${p.r1}Ω`, m.v1, m.i1, m.p1, colors.teal);
        s += drawR(268, 46, 102, 52, `R₂=${p.r2}Ω`, m.v2, m.i2, m.p2, colors.blue);
        s += drawR(384, 46, 102, 52, `R₃=${p.r3}Ω`, m.v3, m.i3, m.p3, colors.amber);
      } else if (p.topo === "parallel") {
        s += l(97, 118, 97, 68, colors.teal, 2) + l(97, 68, 460, 68, colors.teal, 2) + l(460, 68, 460, 252, colors.teal, 2) + l(460, 252, 97, 252, colors.teal, 2) + l(97, 252, 97, 204, colors.teal, 2);
        s += l(220, 68, 220, 252, colors.grid, 1.5) + l(340, 68, 340, 252, colors.grid, 1.5);
        s += drawR(164, 92, 112, 50, `R₁=${p.r1}Ω`, m.v1, m.i1, m.p1, colors.teal);
        s += drawR(284, 134, 112, 50, `R₂=${p.r2}Ω`, m.v2, m.i2, m.p2, colors.blue);
        s += drawR(404, 178, 112, 50, `R₃=${p.r3}Ω`, m.v3, m.i3, m.p3, colors.amber);
      } else {
        s += l(97, 118, 97, 82, colors.teal, 2) + l(97, 82, 330, 82, colors.teal, 2) + l(330, 82, 330, 240, colors.teal, 2) + l(330, 240, 97, 240, colors.teal, 2) + l(97, 240, 97, 204, colors.teal, 2);
        s += l(330, 82, 460, 82, colors.teal, 2) + l(460, 82, 460, 240, colors.teal, 2) + l(460, 240, 330, 240, colors.teal, 2);
        s += drawR(168, 56, 120, 52, `R₁=${p.r1}Ω`, m.v1, m.i1, m.p1, colors.teal);
        s += drawR(270, 136, 120, 52, `R₂=${p.r2}Ω`, m.v2, m.i2, m.p2, colors.blue);
        s += drawR(400, 136, 120, 52, `R₃=${p.r3}Ω`, m.v3, m.i3, m.p3, colors.amber);
      }
      s += caption(`總電流 I = ${f(m.iTot, 3)} A｜電池提供 εI = ${f(m.pTotal, 2)} W = 內阻 ${f(m.pInt, 2)} W + 外電路 ${f(m.pExt, 2)} W`);
      return [s, [
        output("外電路等效電阻 R_eq", `${f(m.rExt, 2)} Ω`),
        output("總電流 I", `${f(m.iTot, 3)} A`),
        output("電池端電壓 V", `${f(m.vTerm, 2)} V`),
        output("能量守恆驗算", `εI = ${f(m.pTotal, 2)} W（殘差 ${f(m.powerResidual, 4)} W）`)
      ]];
    }),

    lab("thomson-em", "湯木生陰極射線管與荷質比", [
      select("mode", "操作模式", [["select", "交叉電場磁場（速度選擇）"], ["mag", "純磁場偏轉（測荷質比）"]], "select"),
      range("Va", "加速電壓 Vₐ", 200, 2000, 50, 800, "V"),
      range("Efield", "平行板電場 E", 0, 50000, 1000, 24000, "V/m"),
      range("Bfield", "均勻磁場 B", 0.5, 4.0, 0.1, 1.4, "mT")
    ], [
      "在「速度選擇」模式下調整電場 E 與磁場 B，使綠色電子束恰好筆直通過正交場區（F_E = F_B）。",
      "改切換為「純磁場偏轉」，觀察加速電壓變大 4 倍時偏轉半徑是否變為 2 倍。"
    ], p => {
      const m = P.thomson(p.Va, p.Efield, p.Bfield, p.mode);
      let s = box(40, 44, 480, 224, "#10222b", colors.grid, 10);
      // Plates
      s += box(140, 74, 240, 12, colors.amber) + box(140, 226, 240, 12, colors.blue);
      s += t(260, 66, p.mode === "select" ? "上正板（電場向下 E）" : "電場關閉（純磁場 ⊗）", colors.muted, "middle", 13);
      s += box(48, 138, 60, 36, "#2a201b", colors.teal, 6) + t(78, 161, "電子槍", colors.teal, "middle", 13);
      // Beam path
      const deflect = p.mode === "mag" ? -Math.min(58, 1.2 / Math.max(0.05, m.radius)) : Math.max(-55, Math.min(55, (m.fB - m.fE) * 1.4e15));
      const beamPts = sample(30, u => {
        const x = 108 + u * 365;
        const tField = Math.max(0, (x - 140) / 240);
        const y = 156 + deflect * tField * (tField < 1 ? tField : (2 * tField - 1));
        return [x, Math.max(88, Math.min(224, y))];
      });
      s += path(beamPts, colors.teal, 3);
      s += l(473, 74, 473, 238, colors.ink, 3) + t(488, 160, "螢光幕", colors.muted, "start", 13);
      s += caption(Math.abs(deflect) < 2 && p.mode === "select" ? "電力與磁力平衡！電子束筆直通過：v = E / B" : "磁力或電力未抵消，電子束發生偏轉");
      return [s, [
        output("電子入射速率 v", `${sci(m.v, 2)} m/s`),
        output("速度選擇速率 E/B", `${sci(m.vSelect, 2)} m/s`),
        output("磁場圓周半徑 r", `${f(m.radius * 100, 2)} cm`),
        output("測得荷質比 e/m", `${sci(m.inferredEM, 2)} C/kg`)
      ]];
    }),

    lab("millikan", "密立坎油滴實驗與電荷量子化", [
      range("V", "平行極板電壓 V", 100, 1500, 10, 600, "V"),
      range("d", "極板間距 d", 4, 15, 1, 10, "mm"),
      range("r", "油滴半徑 r", 0.5, 2.0, 0.1, 1.0, "μm"),
      range("n", "油滴所帶基本電荷數 n", 1, 8, 1, 3, "個 e")
    ], [
      "調整電壓 V 使其接近平衡電壓 V_bal，讓向上的靜電力 qE 恰等於向下的重力 mg。",
      "改變基本電荷數 n，觀察平衡電壓是否總是以分立的整數比例跳變（電荷量子化）。"
    ], p => {
      const m = P.millikan(p.V, p.d, p.r, p.n);
      const balanced = Math.abs(p.V - m.vBal) < 15;
      let s = box(100, 56, 360, 14, colors.amber) + box(100, 246, 360, 14, colors.blue);
      s += t(280, 48, `上極板 (+)　V = ${p.V} V`, colors.amber, "middle", 14);
      s += t(280, 280, `下極板 (−)　間距 d = ${p.d} mm`, colors.blue, "middle", 14);
      const y = 158 - Math.max(-45, Math.min(45, m.a * 4));
      s += circ(280, y, 12, balanced ? colors.teal : colors.amber, colors.ink, 1.5);
      s += arrow(280, y - 14, 280, y - 14 - Math.min(55, (m.fElec / m.weight) * 32), colors.teal, 2.5);
      s += arrow(280, y + 14, 280, y + 46, colors.rose, 2.5);
      s += t(296, y - 28, "靜電力 qE", colors.teal, "start", 13) + t(296, y + 38, "重力 mg", colors.rose, "start", 13);
      s += caption(balanced ? "✔ 達到懸浮平衡：q = mgd / V = n·e" : `提示：使本油滴懸浮的平衡電壓為 ${f(m.vBal, 1)} V`);
      return [s, [
        output("油滴帶電量 q = ne", `${sci(m.q, 2)} C`),
        output("靜電力 F_E = qV/d", `${sci(m.fElec, 2)} N`),
        output("油滴重力 mg", `${sci(m.weight, 2)} N`),
        output("懸浮平衡電壓 V_bal", `${f(m.vBal, 1)} V`)
      ]];
    }),

    lab("xray-spectrum", "X 射線光譜與最短波長極限", [
      range("kV", "加速電壓 V", 10, 80, 2, 35, "kV"),
      select("target", "金屬靶材", [["Mo", "鉬 (Mo, E_K=20 kV)"], ["Cu", "銅 (Cu, E_K=9.0 kV)"], ["W", "鎢 (W, E_K=69.5 kV)"]], "Mo")
    ], [
      "把加速電壓從 15 kV 升高到 35 kV：注意連續譜的最短波長 λ_min 會往左縮短，且超過 20 kV 後才激發出鉬的特徵峰。",
      "在相同 35 kV 下切換靶材為銅或鎢，觀察 λ_min 是否完全不變。"
    ], p => {
      const m = P.xraySpectrum(p.kV, p.target);
      const yMax = Math.max(4, ...m.pts.map(pt => pt[1])) * 1.15;
      const { s, x, y } = chart({
        xMin: 0, xMax: 0.24, yMax, xLabel: "波長 λ (nm)", yLabel: "相對強度",
        xTicks: [[0, "0"], [0.05, "0.05"], [0.10, "0.10"], [0.15, "0.15"], [0.20, "0.20"]],
        yTicks: [[0, "0"]],
        series: [{ points: m.pts, color: colors.teal }]
      });
      s += "";
      return [
        s + l(x(m.lambdaMin), y(0), x(m.lambdaMin), y(yMax * 0.8), colors.amber, 1.8, "5 4") +
        t(x(m.lambdaMin) + 4, y(yMax * 0.72), `λ_min=${f(m.lambdaMin, 3)} nm`, colors.amber, "start", 13) +
        caption(m.hasChar ? `${m.target.name}：已達激發門檻 (${m.target.eK} kV)，出現 K_α / K_β 特徵譜線` : `${m.target.name}：尚未達內層激發門檻 (${m.target.eK} kV)，僅有連續制動輻射`),
        [
          output("最短波長 λ_min = hc/eV", `${f(m.lambdaMin, 4)} nm`),
          output("最大光子能量", `${f(p.kV, 1)} keV`),
          output("特徵譜線狀態", m.hasChar ? `已激發 (K_α=${m.target.kAlpha} nm)` : "未達門檻")
        ]
      ];
    }),

    lab("blackbody", "黑體輻射與普朗克量子論", [
      range("T", "黑體絕對溫度 T", 3000, 7000, 200, 5400, "K"),
      select("showRJ", "對照古典瑞利－金斯曲線", [[1, "顯示（紫外災難）"], [0, "隱藏"]], 1)
    ], [
      "觀察古典理論（橘色虛線）在短波長區域發散，形成與實驗不符的「紫外災難」。",
      "提高溫度 T：峰值波長往短波長移動（維恩位移定律），且總輻射強度大幅增加。"
    ], p => {
      const ls = []; for (let nm = 150; nm <= 2000; nm += 25) ls.push(nm);
      const ptsP = ls.map(nm => [nm, P.planckRadiance(nm, p.T)]);
      const peak = Math.max(...ptsP.map(pt => pt[1])) || 1;
      const normP = ptsP.map(([nm, v]) => [nm, v / peak]);
      const normRJ = ls.map(nm => [nm, Math.min(2.5, P.rayleighJeans(nm, p.T) / peak)]);
      const series = [{ points: normP, color: colors.teal }];
      if (p.showRJ) series.push({ points: normRJ, color: colors.amber, dashed: true });
      const { s, x, y } = chart({
        xMin: 0, xMax: 2000, yMax: 1.3, xLabel: "波長 λ (nm)", yLabel: "輻射強度（歸一化）",
        xTicks: [[0, "0"], [500, "500"], [1000, "1000"], [1500, "1500"], [2000, "2000"]],
        yTicks: [[0, "0"], [0.5, "0.5"], [1.0, "1.0"]],
        series
      });
      const wNm = P.wienPeakNm(p.T);
      return [
        s + box(x(380), 42, x(750) - x(380), 214, "rgba(125,224,204,0.09)") +
        l(x(wNm), y(0), x(wNm), y(1.05), colors.rose, 1.5, "4 4") +
        t(x(wNm) + 6, y(1.12), `λ_max≈${f(wNm, 0)} nm`, colors.rose, "start", 13) +
        caption("青綠區為可見光波段（380–750 nm）；普朗克能量量子化消除短波長發散"),
        [
          output("峰值波長 λ_max", `${f(wNm, 0)} nm`),
          output("相對總強度 (T/5800)⁴", `${f(Math.pow(p.T / 5800, 4), 2)} 倍`),
          output("光色趨勢", wNm < 480 ? "偏藍白" : wNm < 620 ? "接近日光白" : "偏紅橙")
        ]
      ];
    }),

    lab("photoelectric", "光電效應與愛因斯坦光電方程式", [
      select("metal", "金屬靶材", [["Cs", "銫 Cs (W=2.14 eV)"], ["Na", "鈉 Na (W=2.28 eV)"], ["Zn", "鋅 Zn (W=4.31 eV)"], ["Pt", "鉑 Pt (W=5.65 eV)"]], "Na"),
      range("lam", "入射光波長 λ", 180, 680, 10, 400, "nm"),
      range("inten", "光源強度（光子通量）", 20, 100, 10, 60, "%"),
      range("bias", "兩極外加電壓 V", -4.0, 4.0, 0.2, 0.0, "V")
    ], [
      "把鈉的波長調至 550 nm 以上（低於底限頻率），即使把光源強度拉到 100%，光電流依然為零。",
      "波長固定在 350 nm 時調整光源強度：飽和光電流成正比上升，但截止電壓 V_s 完全不變。"
    ], p => {
      const m = P.photoelectric(p.metal, p.lam, p.inten, p.bias);
      const pts = [];
      for (let v = -4; v <= 4; v += 0.2) {
        pts.push([v, P.photoelectric(p.metal, p.lam, p.inten, v).current]);
      }
      const { s, x, y } = chart({
        xMin: -4, xMax: 4, yMax: 110, xLabel: "外加電壓 V (V)", yLabel: "光電流 I (相對值)",
        xTicks: [[-4, "-4"], [-2, "-2"], [0, "0"], [2, "+2"], [4, "+4"]],
        yTicks: [[0, "0"], [50, "50"], [100, "100"]],
        series: [{ points: pts, color: colors.teal }]
      });
      const opX = x(p.bias), opY = y(m.current);
      return [
        s + circ(opX, opY, 5.5, colors.amber, colors.ink, 1.5) +
        (m.emitted ? l(x(-m.vs), y(0), x(-m.vs), y(35), colors.rose, 1.6, "4 4") + t(x(-m.vs), y(42), `−V_s=${f(-m.vs, 2)}V`, colors.rose, "middle", 12.5) : "") +
        caption(m.emitted ? `✔ hf = ${f(m.photonE, 2)} eV ≥ W (${m.metal.W} eV)，成功打出光電子` : `✘ hf = ${f(m.photonE, 2)} eV < 功函數 W (${m.metal.W} eV)，無光電子`),
        [
          output("光子能量 hf", `${f(m.photonE, 2)} eV`),
          output("底限波長 λ₀ = hc/W", `${f(m.lambda0, 0)} nm`),
          output("最大動能 K_max", `${f(m.kMax, 2)} eV`),
          output("截止電壓 V_s", `${f(m.vs, 2)} V`)
        ]
      ];
    }),

    lab("bohr-hydrogen", "波耳氫原子能階與光譜躍遷", [
      range("ni", "初始量子數 n_i", 1, 6, 1, 3, ""),
      range("nf", "末態量子數 n_f", 1, 6, 1, 2, "")
    ], [
      "設 n_i = 3 → n_f = 2，驗證發出的巴耳末 H_α 光子能量 1.89 eV 與波長 ~656 nm。",
      "把 n_f 設為 1（萊曼系），比較放出的光子波長屬於哪個波段。"
    ], p => {
      const m = P.bohrTransition(p.ni, p.nf);
      let s = box(36, 36, 488, 246, "#10222b", colors.grid, 10);
      const yOf = n => 256 - (1 - 1 / (n * n)) * 186;
      for (let n = 1; n <= 6; n++) {
        const yy = yOf(n);
        const hi = n === p.ni || n === p.nf;
        s += l(86, yy, 340, yy, hi ? colors.amber : colors.grid, hi ? 2.4 : 1.2);
        s += t(76, yy + 4, `n=${n}`, hi ? colors.ink : colors.muted, "end", 13);
        s += t(352, yy + 4, `${f(-13.6 / (n * n), 2)} eV`, hi ? colors.teal : colors.muted, "start", 13);
      }
      if (p.ni !== p.nf) {
        s += arrow(213, yOf(p.ni), 213, yOf(p.nf), p.ni > p.nf ? colors.teal : colors.amber, 3);
      }
      s += caption(p.ni === p.nf ? "請選擇不同的 n_i 與 n_f 觀察躍遷" : `${m.kind}：${m.series}`);
      return [s, [
        output("能階差 |ΔE|", `${f(m.absE, 3)} eV`),
        output("光子波長 λ", Number.isFinite(m.lambdaNm) ? `${f(m.lambdaNm, 1)} nm` : "—"),
        output("初態半徑 r_i", `${f(m.rI, 3)} nm`),
        output("光譜系列", p.ni === p.nf ? "—" : m.series)
      ]];
    }),

    lab("matter-wave", "德布羅意物質波與軌道駐波", [
      range("Va", "電子加速電壓 Vₐ", 20, 400, 10, 100, "V"),
      range("nOrbit", "波耳軌道量子數 n", 1, 5, 1, 3, "")
    ], [
      "改變加速電壓 Vₐ，觀察電子物質波波長 λ = h/√(2meVₐ) 如何隨電壓升高而縮短。",
      "在右側駐波軌道示意中，只有周長恰為整數倍波長（2πr = nλ）才不會相消干涉。"
    ], p => {
      const m = P.deBroglie(p.Va, p.nOrbit);
      let s = box(36, 40, 488, 236, "#10222b", colors.grid, 10);
      // Left: accelerating electron wave
      const k = 28 / Math.max(0.05, m.lambdaNm);
      const wavePts = sample(90, u => [60 + u * 185, 158 + 26 * Math.sin(k * u * 2.5)]);
      s += path(wavePts, colors.teal, 2.4) + t(152, 74, `加速電子 λ = ${f(m.lambdaNm, 3)} nm`, colors.ink, "middle", 14);
      // Right: standing wave on Bohr orbit n
      const cx = 390, cy = 158, R = 68;
      s += circ(cx, cy, R, "none", colors.grid, 1.2) + circ(cx, cy, 5, colors.amber);
      const ringPts = sample(160, u => {
        const ang = u * tau;
        const dr = 11 * Math.sin(p.nOrbit * ang);
        return [cx + (R + dr) * Math.cos(ang), cy + (R + dr) * Math.sin(ang)];
      });
      s += path(ringPts, colors.amber, 2.2) + t(cx, 74, `第 n=${p.nOrbit} 態駐波（2πr = ${p.nOrbit}λ）`, colors.amber, "middle", 14);
      s += caption("物質波形成駐波條件 2πr = nλ，可直接推得波耳角動量量子化 mvr = nħ");
      return [s, [
        output("電子動量 p", `${sci(m.p, 2)} kg·m/s`),
        output("物質波波長 λ", `${f(m.lambdaNm, 4)} nm`),
        output("第 n 態軌道半徑 r_n", `${f(m.rNm, 3)} nm`),
        output("第 n 態駐波波長", `${f(m.bohrLambdaNm, 3)} nm`)
      ]];
    }),

    lab("nuclear-decay", "原子核衰變、守恆律與半衰期", [
      select("mode", "衰變類型", [["alpha", "α 衰變 (⁴₂He)"], ["beta-", "β⁻ 衰變 (⁰₋₁e + ν̄)"], ["beta+", "β⁺ 衰變 (⁰₊₁e + ν)"], ["gamma", "γ 衰變 (高能光子)"]], "alpha"),
      range("A", "母核質量數 A", 12, 238, 2, 238, ""),
      range("Z", "母核原子序 Z", 6, 92, 1, 92, ""),
      range("half", "半衰期 T₁/₂", 1, 20, 1, 5, "天"),
      range("t", "經過時間 t", 0, 40, 1, 10, "天")
    ], [
      "比較 α 衰變（A−4, Z−2）與 β⁻ 衰變（A 不變, Z+1）前後總質量數與總電荷數是否守恆。",
      "調整經過時間 t 為半衰期的 1 倍、2 倍、3 倍，觀察未衰變比例依 (1/2)^(t/T₁/₂) 遞減。"
    ], p => {
      const safeZ = Math.min(p.Z, p.A - 1);
      const m = P.nuclearDecay(p.mode, p.A, safeZ, p.half, p.t);
      const pts = sample(40, u => {
        const tt = u * 40;
        return [tt, Math.pow(0.5, tt / p.half) * 100];
      });
      const { s, x, y } = chart({
        xMin: 0, xMax: 40, yMax: 105, xLabel: "時間 t (天)", yLabel: "剩餘比例 (%)",
        xTicks: [[0, "0"], [10, "10"], [20, "20"], [30, "30"], [40, "40"]],
        yTicks: [[0, "0%"], [25, "25%"], [50, "50%"], [100, "100%"]],
        series: [{ points: pts, color: colors.teal }]
      });
      const px = x(p.t), py = y(m.fraction * 100);
      return [
        s + circ(px, py, 6, colors.amber, colors.ink, 1.5) +
        t(290, 68, `${p.A}/${safeZ} X → ${m.daughterA}/${m.daughterZ} Y + ${m.emitted}`, colors.ink, "middle", 14.5) +
        caption(`守恆律檢驗：ΔA = 0 (${m.conservedA ? "✔" : "✘"})・ΔZ = 0 (${m.conservedZ ? "✔" : "✘"})`),
        [
          output("子核質量數 A′", `${m.daughterA}`),
          output("子核原子序 Z′", `${m.daughterZ}（中子數 ${m.daughterN}）`),
          output("放出粒子", m.emitted),
          output("剩餘未衰變比例", `${f(m.fraction * 100, 2)} %`)
        ]
      ];
    })
  ];

  const fig = (label, draw) => ({ label, draw });
  const figures = {
    examCircuit: fig("串並聯混聯電路圖：電池 12 V 串聯內阻 1 Ω 與 R₁=3 Ω，後接 R₂=6 Ω 與 R₃=3 Ω 並聯。", () => {
      let s = box(40, 40, 480, 238, "#10222b", colors.grid, 10);
      s += l(90, 90, 450, 90, colors.teal, 2) + l(450, 90, 450, 236, colors.teal, 2) + l(450, 236, 90, 236, colors.teal, 2) + l(90, 236, 90, 90, colors.teal, 2);
      s += l(330, 90, 330, 236, colors.teal, 2);
      s += box(54, 134, 72, 58, "#2a201b", colors.amber, 6) + t(90, 158, "ε=12V", colors.amber, "middle", 13) + t(90, 178, "r=1Ω", colors.muted, "middle", 12);
      s += box(164, 70, 96, 40, "#162d38", colors.teal, 6) + t(212, 95, "R₁ = 3.0 Ω", colors.ink, "middle", 13.5);
      s += box(284, 142, 92, 42, "#162d38", colors.blue, 6) + t(330, 168, "R₂ = 6.0 Ω", colors.ink, "middle", 13.5);
      s += box(404, 142, 92, 42, "#162d38", colors.amber, 6) + t(450, 168, "R₃ = 3.0 Ω", colors.ink, "middle", 13.5);
      return s + caption("電池電動勢 12 V、內電阻 1.0 Ω，外接混聯電阻組");
    }),
    examPhoto: fig("光電效應實驗中，甲、乙兩種金屬之光電子最大動能對入射光頻率直線圖。", () => {
      const { s, x, y } = chart({
        xMin: 0, xMax: 12, yMin: 0, yMax: 4.0, xLabel: "頻率 f (×10¹⁴ Hz)", yLabel: "K_max (eV)",
        xTicks: [[0, "0"], [4, "4"], [6, "6"], [8, "8"], [10, "10"], [12, "12"]],
        yTicks: [[0, "0"], [1, "1.0"], [2, "2.0"], [3, "3.0"], [4, "4.0"]],
        series: [
          { points: [[5, 0], [11, 2.48]], color: colors.teal, marks: true },
          { points: [[8, 0], [12, 1.65]], color: colors.amber, marks: true }
        ]
      });
      return s + t(x(10.2), y(2.75), "甲金屬", colors.teal, "middle", 14) + t(x(11.3), y(1.1), "乙金屬", colors.amber, "middle", 14);
    }),
    examBohr: fig("氫原子 n = 1, 2, 3, 4 能階圖與三條躍遷箭頭 a, b, c。", () => {
      let s = box(40, 36, 480, 246, "#10222b", colors.grid, 10);
      const ys = { 1: 250, 2: 145, 3: 100, 4: 75 };
      const es = { 1: "−13.6 eV", 2: "−3.40 eV", 3: "−1.51 eV", 4: "−0.85 eV" };
      for (const n of [1, 2, 3, 4]) {
        s += l(90, ys[n], 370, ys[n], colors.grid, 1.8) + t(78, ys[n] + 5, `n=${n}`, colors.ink, "end", 13) + t(384, ys[n] + 5, es[n], colors.teal, "start", 13);
      }
      s += arrow(150, ys[3], 150, ys[1], colors.amber, 2.5) + t(136, 178, "a", colors.amber, "end", 15);
      s += arrow(225, ys[4], 225, ys[2], colors.teal, 2.5) + t(211, 114, "b", colors.teal, "end", 15);
      s += arrow(300, ys[3], 300, ys[2], colors.rose, 2.5) + t(286, 126, "c", colors.rose, "end", 15);
      return s + caption("氫原子部分能階與躍遷（未依能量比例繪製）");
    }),
    examIvBlank: fig("空白直角坐標格線，供手寫繪製歐姆元件與燈泡的 V–I 曲線。", () => {
      return chart({
        xMin: 0, xMax: 6, yMin: 0, yMax: 1.5, xLabel: "V (V)", yLabel: "I (A)",
        xTicks: [[0, "0"], [2, "2"], [4, "4"], [6, "6"]],
        yTicks: [[0, "0"], [0.5, "0.5"], [1.0, "1.0"], [1.5, "1.5"]],
        series: []
      }).s + caption("請依題意繪製歐姆元件與白熾燈泡的 I–V 特性示意曲線");
    }),
    examLevelBlank: fig("空白能階水平線圖，供手寫標記衰變與躍遷方向。", () => {
      let s = box(40, 36, 480, 246, "#10222b", colors.grid, 10);
      [90, 155, 235].forEach((yy, i) => {
        s += l(100, yy, 440, yy, colors.grid, 1.8) + t(84, yy + 5, ["E₃", "E₂", "E₁"][i], colors.ink, "end", 14);
      });
      return s + caption("空白能階示意圖，可於列印紙上作答標註");
    })
  };

  const defaults = config => Object.fromEntries(config.controls.map(c => [c.id, c.value]));
  PV.labs = labs;
  PV.defaults = defaults;
  PV.labOutput = (config, p) => {
    const [drawing, values] = config.draw(p);
    return { diagram: svg(config.name + "示意圖", drawing), values };
  };
  PV.figure = id => (figures[id] ? svg(figures[id].label, figures[id].draw()) : "");
})();
