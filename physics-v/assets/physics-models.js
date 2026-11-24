(() => {
  const H = 6.62607015e-34;
  const C = 2.99792458e8;
  const E = 1.602176634e-19;
  const ME = 9.1093837015e-31;
  const KB = 1.380649e-23;
  const HC_EV_NM = 1239.841984;
  const A0_NM = 0.0529177;

  function ivCurve(kind, eps, rInt, rLoad) {
    const pts = [];
    for (let v = 0; v <= 12; v += 0.4) {
      let i = 0;
      if (kind === "ohmic") i = v / rLoad;
      else if (kind === "bulb") i = v / (rLoad * (0.45 + 0.14 * v));
      else i = v < 0.7 ? 0.02 * v : (v - 0.7) / Math.max(1, rLoad * 0.25) + 0.014;
      pts.push([v, i]);
    }
    const loadPts = [[0, eps / Math.max(0.2, rInt)], [eps, 0]];
    // Operating point where load line V = eps - I*rInt meets I(V)
    let vOp = eps / 2, iOp = 0;
    for (let k = 0; k < 60; k++) {
      let f = 0;
      if (kind === "ohmic") f = vOp / rLoad;
      else if (kind === "bulb") f = vOp / (rLoad * (0.45 + 0.14 * vOp));
      else f = vOp < 0.7 ? 0.02 * vOp : (vOp - 0.7) / Math.max(1, rLoad * 0.25) + 0.014;
      const vNext = eps - f * rInt;
      vOp = 0.5 * vOp + 0.5 * Math.max(0, Math.min(eps, vNext));
      iOp = f;
    }
    return { pts, loadPts, vOp, iOp, pLoad: vOp * iOp, rEff: iOp > 1e-6 ? vOp / iOp : Infinity };
  }

  function solveCircuit(topology, eps, rInt, r1, r2, r3) {
    let rExt = 0;
    if (topology === "series") rExt = r1 + r2 + r3;
    else if (topology === "parallel") rExt = 1 / (1 / r1 + 1 / r2 + 1 / r3);
    else rExt = r1 + (r2 * r3) / (r2 + r3);

    const iTot = eps / (rInt + rExt);
    const vTerm = eps - iTot * rInt;
    let i1 = iTot, i2 = iTot, i3 = iTot, v1 = 0, v2 = 0, v3 = 0;

    if (topology === "series") {
      v1 = iTot * r1; v2 = iTot * r2; v3 = iTot * r3;
    } else if (topology === "parallel") {
      v1 = v2 = v3 = vTerm;
      i1 = vTerm / r1; i2 = vTerm / r2; i3 = vTerm / r3;
    } else {
      i1 = iTot; v1 = iTot * r1;
      v2 = v3 = vTerm - v1;
      i2 = v2 / r2; i3 = v3 / r3;
    }

    const pTotal = eps * iTot;
    const pInt = iTot * iTot * rInt;
    const p1 = v1 * i1, p2 = v2 * i2, p3 = v3 * i3;
    const pExt = p1 + p2 + p3;
    return {
      rExt, iTot, vTerm,
      i1, i2, i3, v1, v2, v3,
      pTotal, pInt, p1, p2, p3, pExt,
      kclResidual: topology === "parallel" ? Math.abs(iTot - (i1 + i2 + i3)) : topology === "mixed" ? Math.abs(iTot - (i2 + i3)) : 0,
      powerResidual: Math.abs(pTotal - (pInt + pExt))
    };
  }

  function thomson(Va, Efield, Bfield, mode) {
    const B = Bfield * 1e-3;
    const vAccel = Math.sqrt(2 * E * Va / ME);
    const v = mode === "select" ? (B > 0 ? Efield / B : 0) : vAccel;
    const fE = E * Efield;
    const fB = E * v * B;
    const fNet = mode === "mag" ? fB : fB - fE;
    const radius = B > 0 ? (ME * v) / (E * B) : Infinity;
    const inferredEM = (B > 0 && isFinite(radius) && radius > 0) ? (mode === "select" ? v / (B * radius) : (2 * Va) / (B * B * radius * radius)) : 0;
    return { v, vAccel, vSelect: B > 0 ? Efield / B : 0, fE, fB, fNet, radius, inferredEM, trueEM: E / ME };
  }

  function millikan(V, dMm, radiusUm, nQuanta) {
    const rho = 860;
    const g = 9.8;
    const r = radiusUm * 1e-6;
    const d = dMm * 1e-3;
    const mass = (4 / 3) * Math.PI * r * r * r * rho;
    const weight = mass * g;
    const q = nQuanta * E;
    const eField = V / d;
    const fElec = q * eField;
    const vBal = (weight * d) / q;
    const a = (fElec - weight) / mass;
    return { mass, weight, q, eField, fElec, vBal, a };
  }

  const XRAY_TARGETS = {
    Mo: { name: "鉬 (Mo)", eK: 20.0, kAlpha: 0.0711, kBeta: 0.0632 },
    Cu: { name: "銅 (Cu)", eK: 8.98, kAlpha: 0.1542, kBeta: 0.1392 },
    W:  { name: "鎢 (W)",  eK: 69.5, kAlpha: 0.0209, kBeta: 0.0184 }
  };

  function xraySpectrum(kV, targetKey) {
    const target = XRAY_TARGETS[targetKey] || XRAY_TARGETS.Mo;
    const lambdaMin = HC_EV_NM / (kV * 1000);
    const hasChar = kV > target.eK;
    const pts = [];
    for (let l = 0.01; l <= 0.24; l += 0.002) {
      let intensity = l > lambdaMin ? Math.max(0, (l - lambdaMin) / Math.pow(l, 3)) * 1e-4 : 0;
      if (hasChar) {
        intensity += 2.2 * Math.exp(-Math.pow((l - target.kAlpha) / 0.0024, 2));
        intensity += 0.9 * Math.exp(-Math.pow((l - target.kBeta) / 0.0022, 2));
      }
      pts.push([l, intensity]);
    }
    return { lambdaMin, fMax: C / (lambdaMin * 1e-9), target, hasChar, pts };
  }

  function planckRadiance(lambdaNm, T) {
    const l = lambdaNm * 1e-9;
    const x = (H * C) / (l * KB * T);
    if (x > 700) return 0;
    return (2 * H * C * C) / (Math.pow(l, 5) * (Math.exp(x) - 1));
  }

  function rayleighJeans(lambdaNm, T) {
    const l = lambdaNm * 1e-9;
    return (2 * C * KB * T) / Math.pow(l, 4);
  }

  function wienPeakNm(T) {
    return 2.897771955e6 / T;
  }

  const METALS = {
    Cs: { name: "銫 (Cs)", W: 2.14 },
    Na: { name: "鈉 (Na)", W: 2.28 },
    Zn: { name: "鋅 (Zn)", W: 4.31 },
    Pt: { name: "鉑 (Pt)", W: 5.65 }
  };

  function photoelectric(metalKey, lambdaNm, intensity, biasV) {
    const metal = METALS[metalKey] || METALS.Na;
    const photonE = HC_EV_NM / lambdaNm;
    const f = C / (lambdaNm * 1e-9);
    const f0 = (metal.W * E) / H;
    const lambda0 = HC_EV_NM / metal.W;
    const emitted = photonE >= metal.W;
    const kMax = emitted ? photonE - metal.W : 0;
    const vs = kMax;
    let current = 0;
    if (emitted && biasV > -vs) {
      const ratio = biasV >= 0 ? 1 : (biasV + vs) / Math.max(0.05, vs);
      current = intensity * Math.pow(Math.max(0, Math.min(1, ratio)), 0.75);
    }
    return { metal, photonE, f, f0, lambda0, emitted, kMax, vs, current };
  }

  function bohrTransition(ni, nf) {
    const eI = -13.6 / (ni * ni);
    const eF = -13.6 / (nf * nf);
    const dE = eI - eF;
    const absE = Math.abs(dE);
    const lambdaNm = absE > 1e-9 ? HC_EV_NM / absE : Infinity;
    const rI = A0_NM * ni * ni;
    const rF = A0_NM * nf * nf;
    const low = Math.min(ni, nf);
    const series = low === 1 ? "萊曼系（紫外光）" : low === 2 ? "巴耳末系（可見光為主）" : low === 3 ? "帕申系（紅外光）" : "布拉克系（紅外光）";
    const kind = dE > 0 ? "放光（高階 → 低階）" : dE < 0 ? "吸光（低階 → 高階）" : "無躍遷";
    return { eI, eF, dE, absE, lambdaNm, rI, rF, series, kind };
  }

  function deBroglie(Va, nOrbit) {
    const kJ = Va * E;
    const p = Math.sqrt(2 * ME * kJ);
    const lambdaNm = (H / p) * 1e9;
    const rNm = A0_NM * nOrbit * nOrbit;
    const circNm = 2 * Math.PI * rNm;
    const bohrLambdaNm = nOrbit > 0 ? circNm / nOrbit : 0;
    const wavesOnCircle = circNm / lambdaNm;
    const phaseError = Math.abs(wavesOnCircle - Math.round(wavesOnCircle));
    return { p, lambdaNm, rNm, circNm, bohrLambdaNm, wavesOnCircle, phaseError };
  }

  function nuclearDecay(mode, A, Z, halfLife, t) {
    let dA = 0, dZ = 0, emitted = "";
    if (mode === "alpha") { dA = 4; dZ = 2; emitted = "⁴₂He (α)"; }
    else if (mode === "beta-") { dA = 0; dZ = -1; emitted = "⁰₋₁e (β⁻) + ν̄ₑ"; }
    else if (mode === "beta+") { dA = 0; dZ = 1; emitted = "⁰₊₁e (β⁺) + νₑ"; }
    else { dA = 0; dZ = 0; emitted = "γ 光子"; }
    const daughterA = A - dA;
    const daughterZ = Z - dZ;
    const daughterN = daughterA - daughterZ;
    const fraction = Math.pow(0.5, t / halfLife);
    return {
      daughterA, daughterZ, daughterN, emitted,
      conservedA: daughterA + dA === A,
      conservedZ: daughterZ + dZ === Z,
      fraction, activityRatio: fraction
    };
  }

  const api = {
    H, C, E, ME, KB, HC_EV_NM, A0_NM,
    XRAY_TARGETS, METALS,
    ivCurve, solveCircuit, thomson, millikan, xraySpectrum,
    planckRadiance, rayleighJeans, wienPeakNm,
    photoelectric, bohrTransition, deBroglie, nuclearDecay
  };
  if (typeof window !== "undefined") window.PVPhysics = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
