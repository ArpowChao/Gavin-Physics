(() => {
  const P = PIPhysics;
  const W = 560, H = 326, DEG = Math.PI / 180;
  const colors = { ink: "#e9f4fa", muted: "#aac3d0", grid: "#31505f", teal: "#7de0cc", amber: "#f4be73", blue: "#9cbdf6", rose: "#f4979b" };
  const f = (n, d = 2) => (!Number.isFinite(n) ? "—" : (Math.abs(n) < 0.5 * 10 ** (-d) ? 0 : n).toLocaleString("en-US", { maximumFractionDigits: d }));
  const l = (x, y, a, b, c = colors.grid, w = 1, dash = "") => `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${a.toFixed(1)}" y2="${b.toFixed(1)}" stroke="${c}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  const t = (x, y, s, c = colors.muted, anchor = "start", size = 15) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${c}" text-anchor="${anchor}" font-size="${size}">${s}</text>`;
  const circ = (x, y, r, fill, stroke = "none", sw = 1) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const box = (x, y, w, h, fill, stroke = "none", r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  const path = (points, c = colors.teal, w = 2.2, dash = "") => points.length ? `<polyline points="${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` : "";
  const poly = (points, fill, stroke = "none", sw = 1) => `<polygon points="${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const arrow = (x, y, a, b, c = colors.teal, w = 2.2, head = 8) => {
    const dx = a - x, dy = b - y, mag = Math.hypot(dx, dy);
    if (mag < 0.5) return "";
    const u = dx / mag, v = dy / mag, h = Math.min(head, mag * 0.6);
    return l(x, y, a, b, c, w) + `<path d="M ${a.toFixed(1)} ${b.toFixed(1)} L ${(a - h * u - h * 0.5 * v).toFixed(1)} ${(b - h * v + h * 0.5 * u).toFixed(1)} L ${(a - h * u + h * 0.5 * v).toFixed(1)} ${(b - h * v - h * 0.5 * u).toFixed(1)} Z" fill="${c}"/>`;
  };
  const svg = (label, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${inner}</svg>`;
  const caption = s => t(28, 316, s, colors.muted, "start", 13.5);
  const range = (id, name, min, max, step, value, unit = "") => ({ id, name, min, max, step, value, unit });
  const select = (id, name, choices, value) => ({ id, name, choices, value });
  const output = (label, value) => [label, value];

  function chart({ xMin = 0, xMax, yMin = 0, yMax, xLabel, yLabel, xTicks, yTicks, series, origin = [68, 42], size = [446, 214] }) {
    const [x0, y0] = origin, [width, height] = size, [xEnd, yEnd] = [x0 + width, y0 + height];
    const x = n => x0 + ((n - xMin) / (xMax - xMin || 1)) * width;
    const y = n => yEnd - ((n - yMin) / (yMax - yMin || 1)) * height;
    let s = box(x0, y0, width, height, "#10222b", colors.grid);
    for (const [v, label] of xTicks) s += l(x(v), y0, x(v), yEnd) + t(x(v), yEnd + 20, label, colors.muted, "middle", 13.5);
    for (const [v, label] of yTicks) s += l(x0, y(v), xEnd, y(v), v === 0 ? colors.muted : colors.grid) + t(x0 - 8, y(v) + 5, label, colors.muted, "end", 13.5);
    s += t(x0, y0 - 12, yLabel, colors.muted, "start", 14) + t(xEnd, yEnd + 42, xLabel, colors.muted, "end", 14);
    for (const { points, color, marks = false, dashed = false, w = 2.5 } of series) {
      const clipped = points.map(([a, b]) => [x(Math.max(xMin, Math.min(xMax, a))), y(Math.max(yMin, Math.min(yMax, b)))]);
      s += path(clipped, color, w, dashed ? "7 5" : "");
      if (marks) clipped.forEach(([px, py]) => { s += circ(px, py, 3.6, color); });
    }
    return { s, x, y, x0, y0, xEnd, yEnd };
  }

  const lab = (id, name, controls, guide, draw) => ({ id, name, controls, guide, draw });

  const labs = [
    // 1. 不確定度與組合 (1-1, 1-2)
    lab("uncertainty-lab", "不確定度組合與有效位數分析", [
      select("op", "運算類型", [["+", "加減組合 z = x + y"], ["-", "加減組合 z = x − y"], ["*", "乘除組合 z = x × y"], ["/", "乘除組合 z = x / y"]], "*"),
      range("x", "測量值 X", 4, 20, 0.5, 10, ""),
      range("ux", "標準不確定度 u_x", 0.1, 2.0, 0.1, 0.3, ""),
      range("y", "測量值 Y", 2, 20, 0.5, 20, ""),
      range("uy", "標準不確定度 u_y", 0.1, 2.0, 0.1, 0.8, "")
    ], [
      "比較「加減運算」（直接用絕對不確定度平方和開根號）與「乘除運算」（必須用相對不確定度平方和開根號）的差異。",
      "調整其中一項不確定度為另一項的 5 倍以上，觀察較大誤差項如何主導合成不確定度 u_z。"
    ], p => {
      const m = P.uncertaintyCombine(p.x, p.ux, p.y, p.uy, p.op);
      const cx = 280, cy = 148, sc = 90;
      const isRel = p.op === "*" || p.op === "/";
      const a = isRel ? p.ux / p.x : p.ux;
      const b = isRel ? p.uy / p.y : p.uy;
      const hyp = Math.hypot(a, b) || 1e-6;
      const maxTerm = Math.max(a, b, hyp, 0.01);
      const ax = (a / maxTerm) * sc, by = (b / maxTerm) * sc;
      let s = box(34, 34, 492, 246, "#10222b", colors.grid, 10);
      // Right-triangle visual showing quadrature combination (u_x^2 + u_y^2)^0.5
      const ox = 110, oy = 212;
      s += arrow(ox, oy, ox + ax * 1.4, oy, colors.teal, 3) + t(ox + ax * 0.7, oy + 20, isRel ? `u_x/X = ${f(a * 100, 1)}%` : `u_x = ${f(a, 2)}`, colors.teal, "middle", 13.5);
      s += arrow(ox + ax * 1.4, oy, ox + ax * 1.4, oy - by * 1.4, colors.amber, 3) + t(ox + ax * 1.4 + 10, oy - by * 0.7, isRel ? `u_y/Y = ${f(b * 100, 1)}%` : `u_y = ${f(b, 2)}`, colors.amber, "start", 13.5);
      s += arrow(ox, oy, ox + ax * 1.4, oy - by * 1.4, colors.rose, 3.2) + t(ox + ax * 0.5 - 8, oy - by * 0.75 - 8, isRel ? `u_z/Z = ${f(hyp * 100, 1)}%` : `u_z = ${f(hyp, 3)}`, colors.rose, "end", 14);
      // 68.3% normal interval bar on right
      s += box(315, 76, 186, 138, "#162d38", colors.grid, 8);
      s += t(408, 102, "組合測量結果 (68.3% 區間)", colors.muted, "middle", 13.5);
      s += t(408, 136, `${f(m.val, 3)} ± ${f(m.u, 3)}`, colors.ink, "middle", 17);
      s += l(340, 178, 476, 178, colors.teal, 3) + circ(408, 178, 5, colors.amber, colors.ink, 1.5);
      s += t(340, 198, `${f(m.val - m.u, 2)}`, colors.muted, "middle", 12) + t(476, 198, `${f(m.val + m.u, 2)}`, colors.muted, "middle", 12);
      s += caption("獨立測量值誤差不直接相加，而是像畢氏定理直角邊一樣以平方和開根號組合");
      return [s, [
        output("最佳估計值 Z", `${f(m.val, 4)}`),
        output("合成標準不確定度 u_z", `${f(m.u, 4)}`),
        output("相對不確定度 u_z / |Z|", `${f(m.relU * 100, 2)} %`),
        output("組合法則", isRel ? "相對不確定度直角合成" : "絕對不確定度直角合成")
      ]];
    }),

    // 2. 因次分析 (1-3)
    lab("dimension-lab", "因次檢驗與常見錯式排雷", [
      select("fid", "選擇待檢公式", [
        ["pendulum", "單擺週期 T = 2π √(L / g)"],
        ["kinematics-v2", "等加速式 v² = v₀² + 2aS"],
        ["centripetal", "向心力 F = m v² / R"],
        ["gravity", "萬有引力 F = G M m / R²"],
        ["wrong-period", "錯式 T = 2π √(g / L)"],
        ["wrong-force", "錯式 F = m v / R²"]
      ], "pendulum")
    ], [
      "切換正確公式與常見錯式，觀察 [M]、[L]、[T] 三個基本因次的次方柱狀圖是否完全對齊。",
      "思考為什麼無因次常數（如 2π 或 1/2）無法靠因次分析檢驗出來。"
    ], p => {
      const m = P.dimensionCheck(p.fid);
      const dims = ["M（質量）", "L（長度）", "T（時間）"];
      let s = box(34, 34, 492, 246, "#10222b", colors.grid, 10);
      s += t(280, 62, m.name, m.consistent ? colors.teal : colors.rose, "middle", 16);
      s += t(280, 86, `左式 ${m.lhsExpr}　｜　右式 ${m.rhsExpr}`, colors.ink, "middle", 13.5);
      dims.forEach((lbl, idx) => {
        const bx = 92 + idx * 140, base = 198, stepH = 22;
        const lv = m.lhs[idx], rv = m.rhs[idx];
        s += l(bx - 34, base, bx + 64, base, colors.muted, 1.4);
        s += box(bx - 20, lv >= 0 ? base - lv * stepH : base, 24, Math.max(4, Math.abs(lv) * stepH), colors.teal, colors.ink, 3);
        s += box(bx + 16, rv >= 0 ? base - rv * stepH : base, 24, Math.max(4, Math.abs(rv) * stepH), m.consistent ? colors.amber : colors.rose, colors.ink, 3);
        s += t(bx - 8, base - lv * stepH + (lv >= 0 ? -6 : 16), `${lv}`, colors.teal, "middle", 12.5);
        s += t(bx + 28, base - rv * stepH + (rv >= 0 ? -6 : 16), `${rv}`, m.consistent ? colors.amber : colors.rose, "middle", 12.5);
        s += t(bx + 10, 256, lbl, colors.muted, "middle", 13);
      });
      s += caption(m.detail);
      return [s, [
        output("左式因次 [M, L, T]", `[${m.lhs.join(", ")}]`),
        output("右式因次 [M, L, T]", `[${m.rhs.join(", ")}]`),
        output("因次一致性", m.consistent ? "✔ 一致（通過檢驗）" : "✘ 矛盾（公式必有誤）"),
        output("說明", m.lhsExpr)
      ]];
    }),

    // 3. 一維運動學與函數圖形 (2-1 ~ 2-4)
    lab("kinematics-1d", "直線等加速運動：x–t 與 v–t 雙圖對照", [
      range("v0", "初速度 v₀", -10, 12, 1, 6, "m/s"),
      range("a", "加速度 a", -6, 6, 0.5, -2, "m/s²"),
      range("tMax", "觀察時間 Δt", 2, 8, 0.5, 5, "s")
    ], [
      "把初速 v₀ 設正、加速度 a 設負，觀察何時出現折返點（v = 0，x–t 圖切線水平），並比較「位移」與「路徑長」的差異。",
      "把 a 調成 0，確認 x–t 圖變成斜直線、v–t 圖成為面積等於位移的水平長方形。"
    ], p => {
      const m = P.kinematics1D(0, p.v0, p.a, p.tMax);
      const xVals = m.pts.map(pt => pt.x), vVals = m.pts.map(pt => pt.v);
      const yMaxX = Math.max(10, ...xVals.map(v => Math.abs(v))) * 1.15;
      const yMaxV = Math.max(8, ...vVals.map(v => Math.abs(v))) * 1.2;
      const cx = chart({
        xMin: 0, xMax: p.tMax, yMin: -yMaxX, yMax: yMaxX,
        xLabel: "t (s)", yLabel: "位置 x (m)", origin: [60, 42], size: [195, 210],
        xTicks: [[0, "0"], [p.tMax / 2, f(p.tMax / 2, 1)], [p.tMax, f(p.tMax, 1)]],
        yTicks: [[-yMaxX, f(-yMaxX, 0)], [0, "0"], [yMaxX, f(yMaxX, 0)]],
        series: [{ points: m.pts.map(pt => [pt.t, pt.x]), color: colors.teal }]
      });
      const cv = chart({
        xMin: 0, xMax: p.tMax, yMin: -yMaxV, yMax: yMaxV,
        xLabel: "t (s)", yLabel: "速度 v (m/s)", origin: [325, 42], size: [195, 210],
        xTicks: [[0, "0"], [p.tMax / 2, f(p.tMax / 2, 1)], [p.tMax, f(p.tMax, 1)]],
        yTicks: [[-yMaxV, f(-yMaxV, 0)], [0, "0"], [yMaxV, f(yMaxV, 0)]],
        series: [{ points: m.pts.map(pt => [pt.t, pt.v]), color: colors.amber }]
      });
      // Shade v-t displacement area
      const areaPts = [[cv.x(0), cv.y(0)], ...m.pts.map(pt => [cv.x(pt.t), cv.y(pt.v)]), [cv.x(p.tMax), cv.y(0)]];
      let s = cx.s + cv.s + `<polygon points="${areaPts.map(pt => pt.map(z => z.toFixed(1)).join(",")).join(" ")}" fill="rgba(244,190,115,0.18)"/>`;
      if (m.tTurn !== null) {
        const tx = m.x0 + p.v0 * m.tTurn + 0.5 * p.a * m.tTurn * m.tTurn;
        s += circ(cx.x(m.tTurn), cx.y(tx), 5, colors.rose, colors.ink, 1.5);
        s += circ(cv.x(m.tTurn), cv.y(0), 5, colors.rose, colors.ink, 1.5);
      }
      s += caption("紅點為折返時刻 (v = 0)；v–t 圖斜率＝加速度 a，面積正負代數和＝位移 Δx");
      return [s, [
        output("末速度 v", `${f(m.vEnd, 2)} m/s`),
        output("位移 Δx（向量和）", `${f(m.dx, 2)} m`),
        output("路徑長 l（總里程）", `${f(m.pathLen, 2)} m`),
        output("折返時刻 t（v = 0）", m.tTurn !== null ? `${f(m.tTurn, 2)} s` : "過程未折返")
      ]];
    }),

    // 4. 自由落體與上拋 (2-5)
    lab("freefall-lab", "自由落體與鉛直上拋：時間與對稱性", [
      range("y0", "出發高度 y₀", 0, 50, 2, 20, "m"),
      range("v0y", "鉛直初速 v₀（上為正）", -10, 25, 1, 10, "m/s"),
      range("g", "重力加速度 g", 1.6, 12, 0.2, 10, "m/s²")
    ], [
      "將 v₀ 設為 +10 m/s、y₀ = 0 m，比較上升時間與落回地面時間是否完全相等。",
      "把 g 改為月球（1.6 m/s²），觀察最高點高度與飛行時間會放大為地球的幾倍。"
    ], p => {
      const m = P.freeFall(p.y0, p.v0y, p.g);
      const yMaxPlot = Math.max(25, m.yPeak * 1.15);
      const ch = chart({
        xMin: 0, xMax: Math.max(1, m.tLand * 1.05), yMin: 0, yMax: yMaxPlot,
        xLabel: "時間 t (s)", yLabel: "高度 y (m)", origin: [195, 42], size: [320, 212],
        xTicks: [[0, "0"], [m.tLand / 2, f(m.tLand / 2, 1)], [m.tLand, f(m.tLand, 1)]],
        yTicks: [[0, "0"], [yMaxPlot / 2, f(yMaxPlot / 2, 0)], [yMaxPlot, f(yMaxPlot, 0)]],
        series: [{ points: m.pts.map(pt => [pt.t, pt.y]), color: colors.teal, marks: false }]
      });
      // Left vertical tower diagram
      let s = box(40, 42, 106, 212, "#10222b", colors.grid, 8) + l(48, 254, 138, 254, colors.muted, 2);
      const yToPx = y => 254 - (y / yMaxPlot) * 195;
      s += circ(93, yToPx(p.y0), 6, colors.amber, colors.ink, 1.5);
      if (p.v0y !== 0) s += arrow(93, yToPx(p.y0), 93, yToPx(p.y0) - Math.sign(p.v0y) * 28, colors.amber, 2.5);
      if (m.tPeak > 0) s += l(56, yToPx(m.yPeak), 130, yToPx(m.yPeak), colors.rose, 1.2, "4 3") + t(93, yToPx(m.yPeak) - 6, `最高 ${f(m.yPeak, 1)}m`, colors.rose, "middle", 12);
      s += ch.s + circ(ch.x(m.tPeak), ch.y(m.yPeak), 5, colors.rose, colors.ink, 1.5);
      s += caption("即使最高點瞬間速度 v = 0，加速度仍恆為 −g（向下），並非平衡狀態");
      return [s, [
        output("到達最高點時間", `${f(m.tPeak, 2)} s`),
        output("最大高度 y_max", `${f(m.yPeak, 2)} m`),
        output("落地總時間 T", `${f(m.tLand, 2)} s`),
        output("著地速度 v_y", `${f(m.vLand, 2)} m/s`)
      ]];
    }),

    // 5. 相對運動 (2-6)
    lab("relative-lab", "一維相對速度與參考坐標切換", [
      range("vA", "車 A 速度 v_A（對地）", -15, 25, 1, 10, "m/s"),
      range("vB", "車 B 速度 v_B（對地）", -15, 25, 1, 18, "m/s"),
      range("gap", "t = 0 時 B 領先 A 距離", -40, 40, 4, -24, "m"),
      range("t", "經過時間 t", 0, 10, 0.5, 3, "s")
    ], [
      "把 t = 0 時兩車位置調成 B 在 A 後方（負值）且 v_B > v_A，拖動時間 t 看何時追上（相對位置 = 0）。",
      "比較上圖「地面觀察者」與下圖「車 A 上觀察者（A 永遠靜止）」看到的速度箭頭差別。"
    ], p => {
      const m = P.relativeMotion1D(p.vA, p.vB, 0, p.gap, p.t);
      let s = box(34, 34, 492, 114, "#10222b", colors.grid, 8);
      s += t(48, 56, "地面參考系（O 點固定）", colors.muted, "start", 13.5);
      s += l(56, 102, 504, 102, colors.grid, 1.5);
      const mapX = val => Math.max(70, Math.min(490, 220 + val * 1.8));
      const ax = mapX(m.xA), bx = mapX(m.xB);
      s += box(ax - 16, 86, 32, 16, colors.teal, colors.ink, 3) + t(ax, 80, "A", colors.teal, "middle", 13);
      s += box(bx - 16, 110, 32, 16, colors.amber, colors.ink, 3) + t(bx, 140, "B", colors.amber, "middle", 13);
      s += arrow(ax, 94, ax + p.vA * 2.2, 94, colors.teal, 2.4) + arrow(bx, 118, bx + p.vB * 2.2, 118, colors.amber, 2.4);

      s += box(34, 162, 492, 114, "#10222b", colors.grid, 8);
      s += t(48, 184, "車 A 參考系（把 A 當作靜止原點，看 B 的相對運動 v_BA = v_B − v_A）", colors.muted, "start", 13.5);
      s += l(56, 228, 504, 228, colors.grid, 1.5);
      const rbx = Math.max(70, Math.min(490, 280 + m.relX * 2.0));
      s += box(264, 212, 32, 16, colors.teal, colors.ink, 3) + t(280, 206, "A (v=0)", colors.teal, "middle", 12.5);
      s += box(rbx - 16, 236, 32, 16, colors.rose, colors.ink, 3) + t(rbx, 266, `B (相距 ${f(m.relX, 1)}m)`, colors.rose, "middle", 12.5);
      s += arrow(rbx, 244, rbx + m.vBA * 2.5, 244, colors.rose, 2.6);
      s += caption(`v_BA = v_B − v_A = ${f(p.vB, 1)} − (${f(p.vA, 1)}) = ${f(m.vBA, 1)} m/s`);
      return [s, [
        output("B 對 A 相對速度 v_BA", `${f(m.vBA, 2)} m/s`),
        output("A 對 B 相對速度 v_AB", `${f(m.vAB, 2)} m/s`),
        output("目前相距 x_B − x_A", `${f(m.relX, 2)} m`),
        output("相遇時間 t_meet", m.tMeet !== null ? `${f(m.tMeet, 2)} s` : "不會相遇")
      ]];
    }),

    // 6. 平面向量分解與合成 (3-1, 3-2, 4-1)
    lab("vector-lab", "平面向量與力的合成、分解", [
      select("mode", "向量運算", [["add", "合力／合成向量 A + B"], ["sub", "變化量 Δv = B − A（或 A − B）"], ["equil", "平衡力 C = −(A + B)（三力平衡）"]], "add"),
      range("magA", "向量 A 量值", 1, 10, 0.5, 6, ""),
      range("degA", "向量 A 角度 θ_A", 0, 360, 15, 0, "°"),
      range("magB", "向量 B 量值", 1, 10, 0.5, 8, ""),
      range("degB", "向量 B 角度 θ_B", 0, 360, 15, 90, "°")
    ], [
      "將 A 設 6（0°）、B 設 8（90°），驗證合成量值是否為 10（3-4-5 直角三角形），再切換「平衡力」看三力閉合。",
      "把角度改為對稱（如 30° 與 150°），檢查合力水平分量相互抵銷的現象。"
    ], p => {
      const m = P.vectorOps(p.magA, p.degA, p.magB, p.degB, p.mode);
      const cx = 280, cy = 158, sc = 10;
      let s = box(34, 30, 492, 252, "#10222b", colors.grid, 10);
      s += l(60, cy, 500, cy, colors.grid, 1.2) + l(cx, 44, cx, 268, colors.grid, 1.2);
      const pxA = cx + m.ax * sc, pyA = cy - m.ay * sc;
      const pxB = cx + m.bx * sc, pyB = cy - m.by * sc;
      const pxR = cx + m.rx * sc, pyR = cy - m.ry * sc;
      // Parallelogram guide in add mode
      if (p.mode === "add") {
        s += l(pxA, pyA, pxR, pyR, colors.amber, 1.2, "4 3") + l(pxB, pyB, pxR, pyR, colors.teal, 1.2, "4 3");
      }
      s += arrow(cx, cy, pxA, pyA, colors.teal, 2.8) + t(pxA + 6, pyA - 6, "A", colors.teal, "start", 14);
      s += arrow(cx, cy, pxB, pyB, colors.amber, 2.8) + t(pxB + 6, pyB - 6, "B", colors.amber, "start", 14);
      const rLbl = p.mode === "sub" ? "A−B" : p.mode === "equil" ? "C" : "R=A+B";
      s += arrow(cx, cy, pxR, pyR, colors.rose, 3.2) + t(pxR + 8, pyR + 4, rLbl, colors.rose, "start", 14);
      s += caption(`分量計算：Rx = Ax ${p.mode === "sub" ? "−" : "+"} Bx = ${f(m.rx, 2)}，Ry = ${f(m.ry, 2)}`);
      return [s, [
        output("A 分量 (Ax, Ay)", `(${f(m.ax, 2)}, ${f(m.ay, 2)})`),
        output("B 分量 (Bx, By)", `(${f(m.bx, 2)}, ${f(m.by, 2)})`),
        output("結果向量量值 |R|", `${f(m.rMag, 2)}`),
        output("結果方向角 θ", `${f(m.rDeg, 1)}°`)
      ]];
    }),

    // 7. 水平與斜向拋射 (3-3, 3-4)
    lab("projectile-lab", "水平與斜向拋射：運動獨立性頻閃圖", [
      range("v0", "初速 v₀", 5, 30, 1, 20, "m/s"),
      range("deg", "仰角 θ（0° 為平拋）", 0, 85, 5, 45, "°"),
      range("h0", "拋出高度 h₀", 0, 30, 2, 0, "m"),
      range("g", "重力加速度 g", 9.8, 10, 0.2, 10, "m/s²")
    ], [
      "把仰角設為 0°、高度調成 20 m（水平拋射），調整不同初速 v₀，確認落地時間 T 是否只看高度而不受初速影響。",
      "在平地（h₀ = 0 m）把仰角分別設為 30° 與 60°、速率相同，比較兩者水平射程 R 與飛行時間 T 的關係。"
    ], p => {
      const m = P.projectile2D(p.v0, p.deg, p.h0, p.g);
      const xMax = Math.max(20, m.range * 1.1), yMax = Math.max(12, m.hMax * 1.2);
      const ch = chart({
        xMin: 0, xMax, yMin: 0, yMax, xLabel: "水平距離 x (m)", yLabel: "高度 y (m)",
        xTicks: [[0, "0"], [xMax / 2, f(xMax / 2, 0)], [xMax, f(xMax, 0)]],
        yTicks: [[0, "0"], [yMax / 2, f(yMax / 2, 0)], [yMax, f(yMax, 0)]],
        series: [{ points: m.pts.map(pt => [pt.x, pt.y]), color: colors.teal }]
      });
      // Strobe points every 4th sample
      let s = ch.s;
      m.pts.filter((_, i) => i % 5 === 0).forEach(pt => {
        s += circ(ch.x(pt.x), ch.y(pt.y), 4.2, colors.amber, colors.ink, 1);
      });
      if (m.tPeak > 0) {
        s += circ(ch.x(m.vx * m.tPeak), ch.y(m.hMax), 5.5, colors.rose, colors.ink, 1.5);
        s += t(ch.x(m.vx * m.tPeak), ch.y(m.hMax) - 10, `H=${f(m.hMax, 1)}m (vy=0, vx=${f(m.vx, 1)})`, colors.rose, "middle", 12.5);
      }
      s += caption("頻閃黃點間隔代表相等時間：水平距離等距（aₓ=0），鉛直等同自由落體（a_y=−g）");
      return [s, [
        output("水平初速 vₓ（全程不變）", `${f(m.vx, 2)} m/s`),
        output("最大高度 H", `${f(m.hMax, 2)} m`),
        output("飛行總時間 T", `${f(m.tFlight, 2)} s`),
        output("水平射程 R", `${f(m.range, 2)} m`)
      ]];
    }),

    // 8. 牛頓第二定律與實驗 2 (4-2, 4-3, 4-4)
    lab("newton2-lab", "牛頓定律受力圖（FBD）與系統加速度", [
      select("mode", "裝置類型", [["table-pulley", "實驗 2：桌面滑車 M + 吊重 m"], ["atwood", "阿特伍德機（M vs m）"], ["incline", "光滑斜面下滑（傾角 θ）"]], "table-pulley"),
      range("M", "主物體質量 M", 1, 10, 0.5, 4, "kg"),
      range("m", "懸吊砝碼 m", 0.5, 8, 0.5, 1, "kg"),
      range("theta", "斜面傾角 θ", 15, 60, 5, 30, "°")
    ], [
      "在「實驗 2 桌面滑車」中比較吊重重力 mg 與實際繩張力 T：只有當 M ≫ m 時，T 才接近 mg。",
      "切換到「光滑斜面」，觀察正向力 N = Mg cosθ 隨傾角增大而減小、下滑加速度 g sinθ 增大。"
    ], p => {
      const res = P.newton2System(p.mode, p.M, p.m, p.theta, 10);
      let s = box(34, 34, 492, 246, "#10222b", colors.grid, 10);
      if (p.mode === "incline") {
        const rad = p.theta * DEG;
        const bx = 130, by = 236, L = 240, tx = bx + L * Math.cos(rad), ty = by - L * Math.sin(rad);
        s += poly([[bx, by], [bx + L * Math.cos(rad), by], [tx, ty]], "#1b3644", colors.teal, 2);
        const mx = (bx + tx) / 2, my = (by + ty) / 2;
        s += circ(mx, my - 14, 14, colors.amber, colors.ink, 1.5);
        s += arrow(mx, my - 14, mx, my + 56, colors.rose, 2.6) + t(mx + 10, my + 48, `W=${f(p.M * 10, 0)}N`, colors.rose, "start", 13);
        const nx = mx - 44 * Math.sin(rad), ny = my - 14 - 44 * Math.cos(rad);
        s += arrow(mx, my - 14, nx, ny, colors.teal, 2.6) + t(nx - 6, ny - 6, `N=${f(res.normal, 1)}N`, colors.teal, "end", 13);
      } else if (p.mode === "table-pulley") {
        s += box(64, 152, 270, 20, "#1b3644", colors.grid, 2) + circ(344, 146, 12, colors.muted, colors.ink, 1.5);
        s += box(130, 104, 72, 48, colors.teal, colors.ink, 6) + t(166, 134, `M=${p.M}kg`, "#0d1b22", "middle", 14);
        s += l(202, 128, 344, 134, colors.amber, 2) + l(356, 146, 356, 204, colors.amber, 2);
        s += box(334, 204, 44, 34, colors.amber, colors.ink, 5) + t(356, 226, `m=${p.m}`, "#0d1b22", "middle", 13);
        s += arrow(202, 128, 274, 128, colors.amber, 2.6) + t(240, 118, `T=${f(res.tension, 1)}N`, colors.amber, "middle", 13);
        s += arrow(356, 238, 356, 272, colors.rose, 2.6) + t(366, 268, `mg=${f(p.m * 10, 0)}N`, colors.rose, "start", 13);
      } else {
        s += circ(280, 74, 18, colors.muted, colors.ink, 1.5);
        s += l(262, 74, 262, 178, colors.amber, 2) + l(298, 74, 298, 178, colors.amber, 2);
        s += box(238, 178, 48, 44, colors.teal, colors.ink, 6) + t(262, 205, `M=${p.M}`, "#0d1b22", "middle", 13);
        s += box(274, 178, 48, 44, colors.amber, colors.ink, 6) + t(298, 205, `m=${p.m}`, "#0d1b22", "middle", 13);
        s += arrow(262, 178, 262, 136, colors.rose, 2.4) + arrow(298, 178, 298, 136, colors.rose, 2.4);
        s += t(330, 152, `T = ${f(res.tension, 2)} N`, colors.rose, "start", 14);
      }
      s += caption(p.mode === "incline" ? "合力沿斜面向下 Mg sinθ，垂直斜面方向力平衡 N = Mg cosθ" : "滑車加速度方向水平、砝碼重力方向鉛直，必須透過繩張力 T 傳遞作用");
      return [s, [
        output("系統加速度量值 |a|", `${f(Math.abs(res.a), 2)} m/s²`),
        output("繩張力 T（或斜面合力）", p.mode === "incline" ? `${f(res.fNet, 2)} N` : `${f(res.tension, 2)} N`),
        output("正向力 N", res.normal > 0 ? `${f(res.normal, 2)} N` : "—"),
        output("T / (mg) 比值", res.ratioTmg > 0 ? `${f(res.ratioTmg * 100, 1)} %` : "—")
      ]];
    }),

    // 9. 等速圓周運動 (4-5)
    lab("circular-lab", "等速圓周運動：切線速度與向心加速度", [
      range("m", "質點質量 m", 0.5, 5, 0.5, 2, "kg"),
      range("R", "圓軌道半徑 R", 1, 8, 0.5, 4, "m"),
      range("T", "旋轉週期 T", 1, 10, 0.5, 3, "s"),
      range("deg", "目前相位角 θ", 0, 330, 30, 45, "°")
    ], [
      "把週期 T 減半，觀察速率 v 變幾倍、向心加速度 a_c 又會暴增為幾倍。",
      "移動角度 θ，留意速度箭頭（切線）與向心力箭頭（指向圓心）永遠互相垂直 90°。"
    ], p => {
      const m = P.circularMotion(p.m, p.R, p.T);
      const cx = 280, cy = 154, pxR = 45 + p.R * 6;
      const rad = p.deg * DEG, px = cx + pxR * Math.cos(rad), py = cy - pxR * Math.sin(rad);
      let s = box(34, 30, 492, 252, "#10222b", colors.grid, 10);
      s += circ(cx, cy, pxR, "none", colors.grid, 2) + circ(cx, cy, 4, colors.muted);
      s += l(cx, cy, px, py, colors.grid, 1.2, "4 3");
      // Tangential v & inward a_c
      const vLen = Math.min(72, 18 + m.v * 4), aLen = Math.min(72, 16 + m.ac * 1.4);
      const vx = px - vLen * Math.sin(rad), vy = py - vLen * Math.cos(rad);
      const ax = px - aLen * Math.cos(rad), ay = py + aLen * Math.sin(rad);
      s += arrow(px, py, vx, vy, colors.teal, 3) + t(vx + 6, vy, "v⃗（切線）", colors.teal, "start", 13);
      s += arrow(px, py, ax, ay, colors.rose, 3) + t((px + ax) / 2 - 6, (py + ay) / 2 + 14, "a_c, F_c", colors.rose, "end", 13);
      s += circ(px, py, 7, colors.amber, colors.ink, 1.5);
      s += caption("向心力不是額外多出來的力，而是讓速度「轉彎」所需的指向圓心合力");
      return [s, [
        output("角速率 ω = 2π/T", `${f(m.omega, 2)} rad/s`),
        output("切線速率 v = Rω", `${f(m.v, 2)} m/s`),
        output("向心加速度 a_c = v²/R", `${f(m.ac, 2)} m/s²`),
        output("所需向心力 F_c = ma_c", `${f(m.fc, 2)} N`)
      ]];
    }),

    // 10. 簡諧運動與參考圓 (4-6)
    lab("shm-lab", "簡諧運動：參考圓投影與能量轉換", [
      range("m", "木塊質量 m", 0.5, 4, 0.5, 1, "kg"),
      range("k", "彈簧力常數 k", 10, 100, 10, 40, "N/m"),
      range("A", "振幅 A", 0.1, 0.5, 0.05, 0.3, "m"),
      range("deg", "參考圓相位 θ = ωt", 0, 360, 15, 60, "°")
    ], [
      "把相位 θ 調到 0°（端點）與 90°（平衡點），比較何時速度最大、何時加速度與回復力最大。",
      "把質量 m 增為 4 倍，驗證簡諧運動週期 T = 2π √(m/k) 會變為幾倍；再改變振幅 A，確認週期是否受影響。"
    ], p => {
      const s0 = P.shmSpring(p.m, p.k, p.A, p.deg, 0);
      let s = box(34, 30, 492, 252, "#10222b", colors.grid, 10);
      const cx = 148, cy = 128, R = 64, rad = p.deg * DEG;
      const px = cx + R * Math.cos(rad), py = cy - R * Math.sin(rad);
      s += circ(cx, cy, R, "none", colors.grid, 1.8) + l(cx - R - 12, cy, cx + R + 12, cy, colors.grid, 1);
      s += l(px, py, px, 226, colors.amber, 1.3, "4 3");
      s += circ(px, py, 6, colors.teal, colors.ink, 1.5);
      // Spring + block below
      s += l(56, 226, px - 14, 226, colors.teal, 2.5) + box(px - 14, 212, 28, 28, colors.amber, colors.ink, 4);
      s += l(cx, 200, cx, 252, colors.rose, 1.2, "3 3") + t(cx, 266, "平衡點 x=0", colors.muted, "middle", 12);
      // Energy bars on right
      const bx = 300, maxBar = 180;
      s += t(bx, 68, "力學能分配（總能守恆 E = ½kA²）", colors.ink, "start", 13.5);
      s += t(bx, 104, `動能 K = ${f(s0.K, 3)} J`, colors.teal, "start", 13);
      s += box(bx, 112, Math.max(2, (s0.K / (s0.E || 1)) * maxBar), 18, colors.teal, "none", 4);
      s += t(bx, 156, `彈力位能 U_s = ${f(s0.Us, 3)} J`, colors.amber, "start", 13);
      s += box(bx, 164, Math.max(2, (s0.Us / (s0.E || 1)) * maxBar), 18, colors.amber, "none", 4);
      s += t(bx, 210, `位移 x = ${f(s0.x, 3)} m｜a = ${f(s0.a, 2)} m/s²`, colors.rose, "start", 13);
      s += caption("水平簡諧運動可視為等速圓周運動在水平直徑上的投影，a = −ω²x 恆指向平衡點");
      return [s, [
        output("週期 T = 2π √(m/k)", `${f(s0.T, 3)} s`),
        output("即時位置 x", `${f(s0.x, 3)} m`),
        output("即時速度 v_x", `${f(s0.v, 2)} m/s（v_max=${f(s0.vMax, 2)}）`),
        output("即時加速度 a_x", `${f(s0.a, 2)} m/s²`)
      ]];
    }),

    // 11. 萬有引力與地表重力加速度 (5-1, 5-2)
    lab("gravity-lab", "萬有引力平方反比與離地重力場 g(r)", [
      range("mMult", "星球質量 M（地球倍數）", 0.5, 4, 0.5, 1, "M_e"),
      range("rMult", "星球半徑 R（地球倍數）", 0.5, 2, 0.25, 1, "R_e"),
      range("hKm", "距星球表面高度 h", 0, 12800, 400, 400, "km")
    ], [
      "把高度設到與地球半徑相當（約 6400 km，距離地心 2R_e），驗證重力加速度是否剛好降為地表的 1/4。",
      "調整星球質量為 4 倍、半徑為 2 倍，檢驗星球表面的重力加速度 g₀ = GM/R² 會如何變化。"
    ], p => {
      const m = P.gravityOrbit(p.mMult, p.rMult, p.hKm);
      const rRatio = m.r / m.R;
      const pts = [];
      for (let rr = 1; rr <= 3.5; rr += 0.1) pts.push([rr, m.g0 / (rr * rr)]);
      const ch = chart({
        xMin: 1, xMax: 3.5, yMin: 0, yMax: Math.max(12, m.g0 * 1.15),
        xLabel: "距球心距離 r / R", yLabel: "重力加速度 g (m/s²)",
        xTicks: [[1, "1R"], [2, "2R"], [3, "3R"]],
        yTicks: [[0, "0"], [m.g0 / 4, f(m.g0 / 4, 1)], [m.g0, f(m.g0, 1)]],
        series: [{ points: pts, color: colors.teal }]
      });
      let s = ch.s;
      const rrClamped = Math.min(3.5, rRatio);
      s += circ(ch.x(rrClamped), ch.y(m.g0 / (rrClamped * rrClamped)), 6, colors.amber, colors.ink, 1.5);
      s += caption(`距離球心 r = ${f(rRatio, 2)} R 時，重力減弱為地表的 1/(${f(rRatio, 2)})² = ${f(m.ratioG * 100, 1)}%`);
      return [s, [
        output("星球表面重力 g₀", `${f(m.g0, 2)} m/s²`),
        output("高度 h 處重力 g(h)", `${f(m.gH, 2)} m/s²`),
        output("距離球心倍數 r / R", `${f(rRatio, 2)} 倍`),
        output("g(h) / g₀ 比例", `${f(m.ratioG * 100, 1)} %`)
      ]];
    }),

    // 12. 行星、人造衛星與克卜勒第三定律 (5-3, 5-4)
    lab("orbit-lab", "人造衛星圓軌道與克卜勒週期定律", [
      range("mMult", "中心天體質量 M（地球倍數）", 0.5, 4, 0.5, 1, "M_e"),
      range("hKm", "人造衛星軌道高度 h", 400, 36000, 400, 35600, "km")
    ], [
      "將地球高度調至約 35800 km，檢驗衛星週期 T 是否接近 24 小時（地球同步衛星）。",
      "比較低軌道（400 km，如太空站）與同步軌道的繞行速率 v 與週期 T，驗證 R³/T² 是否為定值。"
    ], p => {
      const m = P.gravityOrbit(p.mMult, 1, p.hKm);
      const cx = 280, cy = 152, pxOrbit = 38 + (p.hKm / 36000) * 78;
      let s = box(34, 30, 492, 252, "#10222b", colors.grid, 10);
      s += circ(cx, cy, pxOrbit, "none", colors.teal, 1.8);
      s += circ(cx, cy, 22, colors.blue, colors.ink, 1.5) + t(cx, cy + 5, "地球", "#0b1a24", "middle", 11);
      const sx = cx + pxOrbit, sy = cy;
      s += circ(sx, sy, 6, colors.amber, colors.ink, 1.5);
      s += arrow(sx, sy, cx + 28, cy, colors.rose, 2.4) + t((sx + cx + 28) / 2, cy - 8, "萬有引力 = 向心力", colors.rose, "middle", 12);
      s += arrow(sx, sy, sx, sy - 46, colors.teal, 2.4) + t(sx + 8, sy - 34, `v = ${f(m.vOrbKmS, 2)} km/s`, colors.teal, "start", 12.5);
      s += caption(`克卜勒常數 r³/T² = ${m.keplerFromRT.toExponential(3)} m³/s²（僅由中心天體質量 M 決定）`);
      return [s, [
        output("軌道半徑 r = R_e + h", `${f(m.r / 1000, 0)} km`),
        output("衛星軌道速率 v", `${f(m.vOrbKmS, 2)} km/s`),
        output("繞行週期 T", m.THour >= 2 ? `${f(m.THour, 2)} 小時` : `${f(m.TMin, 1)} 分鐘`),
        output("R³/T² 驗證", `${m.keplerFromRT.toExponential(3)} m³/s²`)
      ]];
    })
  ];

  const fig = (label, draw) => ({ label, draw });
  const figures = {
    "ch1-data": fig("等時落下時間 4 次測量比較圖與誤差範圍示意。", () => {
      const { s, x, y } = chart({
        xMin: 0, xMax: 5, yMin: 0.5, yMax: 0.9, xLabel: "測量次別", yLabel: "落下時間 t (s)",
        xTicks: [[1, "第1次"], [2, "第2次"], [3, "第3次"], [4, "第4次"]],
        yTicks: [[0.5, "0.50"], [0.6, "0.60"], [0.7, "0.70"], [0.8, "0.80"], [0.9, "0.90"]],
        series: [
          { points: [[1, 0.72], [2, 0.68], [3, 0.75], [4, 0.65]], color: colors.amber, marks: true },
          { points: [[1, 0.64], [2, 0.65], [3, 0.64], [4, 0.63]], color: colors.teal, marks: true }
        ]
      });
      return s + t(x(3.8), y(0.84), "甲（碼錶手動）", colors.amber, "end", 13) + t(x(3.8), y(0.56), "乙（光電計時）", colors.teal, "end", 13);
    }),
    "ch2-vt": fig("質點沿直線運動之速度—時間 (v–t) 折線圖（t = 0 至 8 s）。", () => {
      return chart({
        xMin: 0, xMax: 8, yMin: -6, yMax: 12, xLabel: "時間 t (s)", yLabel: "速度 v (m/s)",
        xTicks: [[0, "0"], [2, "2"], [4, "4"], [6, "6"], [8, "8"]],
        yTicks: [[-6, "−6"], [0, "0"], [6, "6"], [12, "12"]],
        series: [{ points: [[0, 0], [2, 12], [5, 12], [7, 0], [8, -6]], color: colors.teal, marks: true }]
      }).s + caption("0–2 s 加速，2–5 s 等速，5–8 s 負加速度並於 t = 7 s 折返");
    }),
    "ch3-proj": fig("自高 20 m 處以水平初速 15 m/s 拋出與高樓自由落體比較軌跡圖。", () => {
      const m = P.projectile2D(15, 0, 20, 10);
      const ch = chart({
        xMin: 0, xMax: 35, yMin: 0, yMax: 24, xLabel: "水平距離 x (m)", yLabel: "高度 y (m)",
        xTicks: [[0, "0"], [15, "15"], [30, "30"]],
        yTicks: [[0, "0"], [10, "10"], [20, "20"]],
        series: [{ points: m.pts.map(pt => [pt.x, pt.y]), color: colors.teal }]
      });
      return ch.s + arrow(ch.x(0), ch.y(20), ch.x(8), ch.y(20), colors.amber, 2.5) + t(ch.x(4), ch.y(22.2), "v₀ = 15 m/s", colors.amber, "middle", 13) + caption("高度 20 m，g = 10 m/s²");
    }),
    "ch4-pulley": fig("光滑水平桌面上質量 M = 3.0 kg 滑車透過輕繩與定滑輪連接懸吊 m = 2.0 kg 砝碼。", () => {
      let s = box(40, 36, 480, 244, "#10222b", colors.grid, 10);
      s += box(70, 156, 280, 18, "#1b3644", colors.grid, 2) + circ(362, 150, 13, colors.muted, colors.ink, 1.5);
      s += box(146, 106, 86, 50, colors.teal, colors.ink, 6) + t(189, 136, "M = 3.0 kg", "#0d1b22", "middle", 14);
      s += l(232, 131, 362, 137, colors.amber, 2) + l(375, 150, 375, 205, colors.amber, 2);
      s += box(350, 205, 50, 42, colors.amber, colors.ink, 5) + t(375, 231, "m=2kg", "#0d1b22", "middle", 13);
      return s + caption("光滑桌面與定滑輪皆不計摩擦與繩重，g = 10 m/s²");
    }),
    "ch5-orbit": fig("甲、乙兩顆人造衛星繞地球作圓周運動之軌道半徑 R 與 4R 示意圖。", () => {
      let s = box(40, 36, 480, 244, "#10222b", colors.grid, 10);
      const cx = 280, cy = 154;
      s += circ(cx, cy, 42, "none", colors.teal, 1.8) + circ(cx, cy, 96, "none", colors.amber, 1.8);
      s += circ(cx, cy, 18, colors.blue, colors.ink, 1.5) + t(cx, cy + 4, "地球", "#0b1a24", "middle", 11);
      s += circ(cx + 42, cy, 5, colors.teal, colors.ink, 1.2) + t(cx + 50, cy - 6, "甲 (R)", colors.teal, "start", 13);
      s += circ(cx + 96, cy, 5, colors.amber, colors.ink, 1.2) + t(cx + 104, cy + 16, "乙 (4R)", colors.amber, "start", 13);
      return s + caption("衛星軌道半徑比 r_甲 : r_乙 = 1 : 4");
    })
  };

  const defaults = config => Object.fromEntries(config.controls.map(c => [c.id, c.value]));
  PI.labs = labs;
  PI.defaults = defaults;
  PI.labOutput = (config, p) => {
    const [drawing, values] = config.draw(p);
    return { diagram: svg(config.name + "示意圖", drawing), values };
  };
  PI.figure = id => (figures[id] ? svg(figures[id].label, figures[id].draw()) : "");
})();
