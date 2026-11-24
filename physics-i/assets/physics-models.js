/*
 * 選修物理Ⅰ（力學一）純數值物理模型
 *   ・共 12 個模型，完全與 DOM 解耦，可供瀏覽器與 Node.js 自動測試共用
 */
(function (root) {
  "use strict";

  const G_CONST = 6.6743e-11;
  const M_EARTH = 5.9722e24;
  const R_EARTH = 6.371e6;
  const DEG = Math.PI / 180;

  // 1. 不確定度與誤差傳遞 (1-1, 1-2)
  function stdUncertainty(uA, uB) {
    return Math.hypot(uA, uB);
  }

  function uncertaintyCombine(x, ux, y, uy, op) {
    let val = 0, u = 0;
    if (op === "+") {
      val = x + y;
      u = Math.hypot(ux, uy);
    } else if (op === "-") {
      val = x - y;
      u = Math.hypot(ux, uy);
    } else if (op === "*") {
      val = x * y;
      const rx = x !== 0 ? ux / Math.abs(x) : 0;
      const ry = y !== 0 ? uy / Math.abs(y) : 0;
      u = Math.abs(val) * Math.hypot(rx, ry);
    } else {
      val = y !== 0 ? x / y : NaN;
      const rx = x !== 0 ? ux / Math.abs(x) : 0;
      const ry = y !== 0 ? uy / Math.abs(y) : 0;
      u = Number.isFinite(val) ? Math.abs(val) * Math.hypot(rx, ry) : NaN;
    }
    const relU = val !== 0 && Number.isFinite(val) ? u / Math.abs(val) : NaN;
    return { val, u, relU };
  }

  // 2. 因次分析檢驗 (1-3)
  const DIM_CASES = {
    "pendulum": {
      name: "單擺週期 T = 2π √(L / g)",
      lhs: [0, 0, 1],
      rhs: [0, 0, 1],
      lhsExpr: "[T] = T¹",
      rhsExpr: "[√(L / (L·T⁻²))] = [√(T²)] = T¹",
      detail: "等式兩邊皆為時間因次 T¹，無因次常數 2π 不改變因次，因此等式因次正確。"
    },
    "kinematics-v2": {
      name: "速度位移式 v² = v₀² + 2aS",
      lhs: [0, 2, -2],
      rhs: [0, 2, -2],
      lhsExpr: "[v²] = L²·T⁻²",
      rhsExpr: "[aS] = (L·T⁻²)·L = L²·T⁻²",
      detail: "等號與加號兩側每一項都必須有完全相同的因次 L²·T⁻²，才能相加比較。"
    },
    "centripetal": {
      name: "向心力 F_c = m v² / R",
      lhs: [1, 1, -2],
      rhs: [1, 1, -2],
      lhsExpr: "[F] = M¹·L¹·T⁻²",
      rhsExpr: "[m v² / R] = M·(L²·T⁻²)/L = M¹·L¹·T⁻²",
      detail: "質量乘以加速度的因次為 M·L·T⁻²，與牛頓 N 定義完全一致。"
    },
    "gravity": {
      name: "萬有引力 F = G M m / R²",
      lhs: [1, 1, -2],
      rhs: [1, 1, -2],
      lhsExpr: "[F] = M¹·L¹·T⁻²",
      rhsExpr: "[G M m / R²] = (M⁻¹·L³·T⁻²)·M²·L⁻² = M¹·L¹·T⁻²",
      detail: "引力常數 G 帶有 [G] = M⁻¹·L³·T⁻²，使右側合成為力的因次。"
    },
    "wrong-period": {
      name: "常見誤記 T = 2π √(g / L)（錯式）",
      lhs: [0, 0, 1],
      rhs: [0, 0, -1],
      lhsExpr: "[T] = T¹",
      rhsExpr: "[√(g / L)] = [√(T⁻²)] = T⁻¹",
      detail: "左側為 T¹、右側卻變成頻率的因次 T⁻¹，單憑因次分析即可立刻抓出分子分母寫反！"
    },
    "wrong-force": {
      name: "常見誤記 F = m v / R²（錯式）",
      lhs: [1, 1, -2],
      rhs: [1, -1, -1],
      lhsExpr: "[F] = M¹·L¹·T⁻²",
      rhsExpr: "[m v / R²] = M·(L·T⁻¹)·L⁻² = M¹·L⁻¹·T⁻¹",
      detail: "長度與時間次方都不對：v 漏了平方、R 多了一次方，兩邊無法相等。"
    }
  };

  function dimensionCheck(formulaId) {
    const c = DIM_CASES[formulaId] || DIM_CASES["pendulum"];
    const consistent = c.lhs.every((v, i) => v === c.rhs[i]);
    return Object.assign({ id: formulaId, consistent }, c);
  }

  // 3. 一維直線等加速運動 (2-1 ~ 2-4)
  function kinematics1D(x0, v0, a, tMax) {
    const vEnd = v0 + a * tMax;
    const dx = v0 * tMax + 0.5 * a * tMax * tMax;
    const xEnd = x0 + dx;
    let tTurn = null;
    let pathLen = Math.abs(dx);
    if (a !== 0 && v0 * a < 0) {
      const tr = -v0 / a;
      if (tr > 0 && tr < tMax) {
        tTurn = tr;
        const d1 = Math.abs(v0 * tr + 0.5 * a * tr * tr);
        const d2 = Math.abs(dx - (v0 * tr + 0.5 * a * tr * tr));
        pathLen = d1 + d2;
      }
    }
    const pts = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const t = (tMax * i) / N;
      const v = v0 + a * t;
      const x = x0 + v0 * t + 0.5 * a * t * t;
      pts.push({ t, x, v });
    }
    const residualV2 = Math.abs(vEnd * vEnd - (v0 * v0 + 2 * a * dx));
    return { x0, v0, a, tMax, xEnd, vEnd, dx, pathLen, tTurn, pts, residualV2 };
  }

  // 4. 鉛直自由落體與上拋 (2-5)
  function freeFall(y0, v0y, g) {
    const tPeak = v0y > 0 ? v0y / g : 0;
    const yPeak = v0y > 0 ? y0 + (v0y * v0y) / (2 * g) : y0;
    const disc = v0y * v0y + 2 * g * y0;
    const tLand = (v0y + Math.sqrt(Math.max(0, disc))) / g;
    const vLand = v0y - g * tLand;
    const pts = [];
    const N = 36;
    for (let i = 0; i <= N; i++) {
      const t = (tLand * i) / N;
      const y = y0 + v0y * t - 0.5 * g * t * t;
      const vy = v0y - g * t;
      pts.push({ t, y: Math.max(0, y), vy });
    }
    return { tPeak, yPeak, tLand, vLand, pts };
  }

  // 5. 一維相對運動 (2-6)
  function relativeMotion1D(vA, vB, xA0, xB0, t) {
    const vBA = vB - vA;
    const vAB = vA - vB;
    const xA = xA0 + vA * t;
    const xB = xB0 + vB * t;
    const relX = xB - xA;
    const tMeet = vBA !== 0 ? (xA0 - xB0) / vBA : null;
    return { vBA, vAB, xA, xB, relX, tMeet: tMeet !== null && tMeet >= 0 ? tMeet : null };
  }

  // 6. 平面向量分解與合成 (3-1, 3-2, 4-1)
  function vectorOps(magA, degA, magB, degB, mode) {
    const ax = magA * Math.cos(degA * DEG);
    const ay = magA * Math.sin(degA * DEG);
    const bx = magB * Math.cos(degB * DEG);
    const by = magB * Math.sin(degB * DEG);
    let rx = 0, ry = 0;
    if (mode === "sub") {
      rx = ax - bx; ry = ay - by;
    } else if (mode === "equil") {
      rx = -(ax + bx); ry = -(ay + by);
    } else {
      rx = ax + bx; ry = ay + by;
    }
    const rMag = Math.hypot(rx, ry);
    let rDeg = Math.atan2(ry, rx) / DEG;
    if (rDeg < 0) rDeg += 360;
    return { ax, ay, bx, by, rx, ry, rMag, rDeg };
  }

  // 7. 二維水平／斜向拋射 (3-3, 3-4)
  function projectile2D(v0, deg, h0, g) {
    const rad = deg * DEG;
    const vx = v0 * Math.cos(rad);
    const v0y = v0 * Math.sin(rad);
    const tPeak = v0y > 0 ? v0y / g : 0;
    const hMax = v0y > 0 ? h0 + (v0y * v0y) / (2 * g) : h0;
    const disc = v0y * v0y + 2 * g * h0;
    const tFlight = (v0y + Math.sqrt(Math.max(0, disc))) / g;
    const range = vx * tFlight;
    const vyLand = v0y - g * tFlight;
    const vLand = Math.hypot(vx, vyLand);
    const degLand = Math.atan2(vyLand, vx) / DEG;
    const pts = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const t = (tFlight * i) / N;
      pts.push({
        t,
        x: vx * t,
        y: Math.max(0, h0 + v0y * t - 0.5 * g * t * t),
        vx,
        vy: v0y - g * t
      });
    }
    return { vx, v0y, tPeak, hMax, tFlight, range, vyLand, vLand, degLand, pts };
  }

  // 8. 虎克定律與彈簧串並聯 (4-1)
  function hookeSpring(k, x, m, g) {
    const f = k * x;
    const xEq = k > 0 ? (m * g) / k : NaN;
    return { f, xEq, kSeries2: k / 2, kParallel2: k * 2 };
  }

  // 9. 牛頓第二運動定律雙體／斜面系統 (4-2, 4-3, 4-4)
  function newton2System(mode, M, m, thetaDeg, g) {
    if (mode === "incline") {
      const rad = thetaDeg * DEG;
      const a = g * Math.sin(rad);
      const N = M * g * Math.cos(rad);
      const fParallel = M * a;
      return { mode, a, tension: 0, normal: N, fNet: fParallel, weightPull: fParallel, ratioTmg: 0 };
    }
    if (mode === "atwood") {
      const a = ((m - M) * g) / (M + m);
      const tension = (2 * M * m * g) / (M + m);
      return { mode, a, tension, normal: 0, fNet: M * Math.abs(a), weightPull: (m - M) * g, ratioTmg: tension / (m * g) };
    }
    // table-pulley (課本實驗 2)
    const a = (m * g) / (M + m);
    const tension = (M * m * g) / (M + m);
    return { mode: "table-pulley", a, tension, normal: M * g, fNet: M * a, weightPull: m * g, ratioTmg: tension / (m * g) };
  }

  // 10. 等速圓周運動 (4-5)
  function circularMotion(m, R, T) {
    const omega = (2 * Math.PI) / T;
    const v = omega * R;
    const ac = (v * v) / R;
    const fc = m * ac;
    return { omega, v, ac, fc };
  }

  // 11. 簡諧運動與參考圓投影 (4-6)
  function shmSpring(m, k, A, phaseDeg, t) {
    const omega = Math.sqrt(k / m);
    const T = (2 * Math.PI) / omega;
    const f = 1 / T;
    const theta = omega * t + phaseDeg * DEG;
    const x = A * Math.cos(theta);
    const v = -A * omega * Math.sin(theta);
    const a = -omega * omega * x;
    const K = 0.5 * m * v * v;
    const Us = 0.5 * k * x * x;
    const E = 0.5 * k * A * A;
    const energyResidual = Math.abs(K + Us - E);
    const vMax = A * omega;
    const aMax = A * omega * omega;
    return { omega, T, f, theta, x, v, a, K, Us, E, energyResidual, vMax, aMax };
  }

  // 12. 萬有引力與克卜勒圓軌道 (5-1 ~ 5-4)
  function gravityOrbit(mMult, rMult, hKm) {
    const M = mMult * M_EARTH;
    const R = rMult * R_EARTH;
    const r = R + hKm * 1000;
    const g0 = (G_CONST * M) / (R * R);
    const gH = (G_CONST * M) / (r * r);
    const vOrb = Math.sqrt((G_CONST * M) / r);
    const T = (2 * Math.PI * r) / vOrb;
    const keplerFromRT = (r * r * r) / (T * T);
    const keplerTheory = (G_CONST * M) / (4 * Math.PI * Math.PI);
    return {
      M, R, r, g0, gH, ratioG: gH / g0,
      vOrb, vOrbKmS: vOrb / 1000,
      T, TMin: T / 60, THour: T / 3600,
      keplerFromRT, keplerTheory
    };
  }

  const api = {
    G_CONST, M_EARTH, R_EARTH,
    stdUncertainty, uncertaintyCombine, dimensionCheck,
    kinematics1D, freeFall, relativeMotion1D,
    vectorOps, projectile2D, hookeSpring,
    newton2System, circularMotion, shmSpring, gravityOrbit
  };
  root.PIPhysics = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
