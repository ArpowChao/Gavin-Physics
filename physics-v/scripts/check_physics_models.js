#!/usr/bin/env node
/*
 * 選修物理Ⅴ 數值模型與課程資料自動化驗收
 *   node physics-v/scripts/check_physics_models.js
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const P = require(path.join(ROOT, 'assets', 'physics-models.js'));

const near = (a, b, tol = 1e-3, msg = '') => {
  assert(Math.abs(a - b) <= tol, `${msg}: expected ~${b}, got ${a}`);
};

// 1. 串並聯電路與能量守恆
{
  const m = P.solveCircuit('mixed', 12, 1.0, 3.0, 6.0, 3.0);
  near(m.rExt, 5.0, 1e-6, 'mixed rExt');
  near(m.iTot, 2.0, 1e-6, 'mixed iTot');
  near(m.vTerm, 10.0, 1e-6, 'mixed vTerm');
  near(m.i2, 2 / 3, 1e-6, 'mixed i2');
  near(m.i3, 4 / 3, 1e-6, 'mixed i3');
  assert(m.kclResidual < 1e-9, 'KCL residual');
  assert(m.powerResidual < 1e-9, 'Power conservation residual');
}

// 2. 歐姆與非歐姆工作點
{
  const m = P.ivCurve('ohmic', 10, 2, 8);
  near(m.vOp, 8.0, 1e-2, 'ohmic vOp');
  near(m.iOp, 1.0, 1e-2, 'ohmic iOp');
}

// 3. 湯木生荷質比與速度選擇器
{
  const m = P.thomson(800, 24000, 8.0, 'select');
  near(m.v, 3.0e6, 1e2, 'thomson v=E/B');
  near(m.fNet, 0, 1e-20, 'thomson force balance');
  near(m.inferredEM, m.trueEM, m.trueEM * 1e-6, 'thomson e/m');
}

// 4. 密立坎油滴平衡
{
  const m = P.millikan(500, 10, 1.0, 2);
  const bal = P.millikan(m.vBal, 10, 1.0, 2);
  near(bal.a, 0, 1e-9, 'millikan balanced');
}

// 5. X 射線最短波長與門檻
{
  const low = P.xraySpectrum(15, 'Mo');
  near(low.lambdaMin, 1239.842 / 15000, 1e-4, 'xray lambda_min 15kV');
  assert.strictEqual(low.hasChar, false, 'Mo 15kV below K threshold');
  const high = P.xraySpectrum(35, 'Mo');
  assert.strictEqual(high.hasChar, true, 'Mo 35kV above K threshold');
}

// 6. 黑體輻射與維恩峰值
{
  const T = 5800;
  const peak = P.wienPeakNm(T);
  near(peak, 499.6, 1.0, 'wien peak 5800K');
  assert(P.planckRadiance(100, T) < P.planckRadiance(peak, T), 'no UV catastrophe');
}

// 7. 光電效應
{
  const sub = P.photoelectric('Na', 600, 100, 2.0);
  assert.strictEqual(sub.emitted, false, 'below threshold no emission');
  assert.strictEqual(sub.current, 0, 'below threshold zero current');
  const above = P.photoelectric('Na', 400, 80, 0);
  assert.strictEqual(above.emitted, true, '400nm emits from Na');
  near(above.kMax, 1239.842 / 400 - 2.28, 1e-2, 'photoelectric K_max');
}

// 8. 波耳氫原子躍遷 (3 -> 2 H_alpha)
{
  const b = P.bohrTransition(3, 2);
  near(b.absE, 1.8889, 1e-3, 'Bohr 3->2 dE');
  near(b.lambdaNm, 656.4, 1.0, 'Bohr H_alpha wavelength');
}

// 9. 德布羅意駐波
{
  const db = P.deBroglie(100, 3);
  near(db.lambdaNm, 0.1226, 1e-3, 'de Broglie 100V');
  near(db.bohrLambdaNm, 2 * Math.PI * 0.0529177 * 3, 1e-4, 'Bohr standing wave n=3');
}

// 10. 核衰變守恆與半衰期
{
  const dec = P.nuclearDecay('alpha', 238, 92, 5, 10);
  assert.strictEqual(dec.daughterA, 234);
  assert.strictEqual(dec.daughterZ, 90);
  assert(dec.conservedA && dec.conservedZ);
  near(dec.fraction, 0.25, 1e-6, '2 half-lives = 25%');
}

// 11. 課程資料、練習題、2.0 教學鷹架與練習卷結構完整性
const ctx = { window: {} };
for (const f of ['data/course.js', 'data/concept-practice.js', 'data/exams.js', 'data/pedagogy.js', 'assets/physics-models.js', 'assets/labs.js']) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  new Function('window', 'PV', 'PVPhysics', code)(ctx.window, ctx.window.PV, ctx.window.PVPhysics || P);
}
const PV = ctx.window.PV;
assert.strictEqual(PV.chapters.length, 3, '3 chapters');
assert.strictEqual(PV.sections.length, 16, '16 sections');
assert.strictEqual(PV.labs.length, 10, '10 labs');

const labIds = new Set(PV.labs.map(l => l.id));
const VALID_ROLES = new Set(['cause', 'effect', 'prop', 'op']);
function assertLatex(tex, label) {
  assert(typeof tex === 'string' && tex.trim().length > 0, `Missing LaTeX on ${label}`);
  assert(!/[\x00-\x1f]/.test(tex), `Control char (broken backslash escape) in LaTeX on ${label}`);
  let depth = 0;
  for (const ch of tex) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    assert(depth >= 0, `Unmatched } in LaTeX on ${label}: ${tex}`);
  }
  assert.strictEqual(depth, 0, `Unclosed { in LaTeX on ${label}: ${tex}`);
}
let totalCp = 0;
PV.sections.forEach(s => {
  assert(labIds.has(s.lab), `Unknown lab ${s.lab} on section ${s.id}`);
  assertLatex(s.formulaLatex, `${s.id}.formulaLatex`);
  s.codes.forEach(c => assert(PV.curriculum[c], `Missing curriculum description for ${c}`));
  const cp = PV.conceptPractice[s.id];
  assert(Array.isArray(cp) && cp.length === s.topics.length, `Concept practice count mismatch on ${s.id}`);
  cp.forEach((topicQs, ti) => {
    assert(topicQs.length === 2, `Expected 2 questions on ${s.id} topic ${ti}`);
    topicQs.forEach(q => {
      assert(q.choices.length === 4, `Expected 4 choices on ${s.id}`);
      assert(q.key >= 0 && q.key < 4, `Invalid key on ${s.id}`);
      assert(q.explanation && q.explanation.length > 5, `Empty explanation on ${s.id}`);
      assert(q.ability, `Missing ability code on ${s.id}`);
      assert(q.cue && q.cue.length > 8, `Missing GRR cue on ${s.id}`);
      assert(!/答案[是為]\s*[ABCD]/i.test(q.cue), `Cue spoils answer on ${s.id}`);
      totalCp++;
    });
  });

  // 12. 檢核 Gavin Physics 2.0 pedagogy 完整性（含 KaTeX 完整方程式）
  const ped = PV.pedagogy && PV.pedagogy[s.id];
  assert(ped, `Missing pedagogy data for ${s.id}`);
  assert(ped.prelab && ped.prelab.title && ped.prelab.analogy && ped.prelab.opts.length >= 2, `Invalid prelab on ${s.id}`);
  assert(ped.prelab.ans >= 0 && ped.prelab.ans < ped.prelab.opts.length, `Invalid prelab ans on ${s.id}`);
  assert(ped.equation && ped.equation.causal && Array.isArray(ped.equation.tokens) && ped.equation.tokens.length >= 3, `Invalid equation on ${s.id}`);
  assertLatex(ped.equation.latex, `${s.id}.equation.latex`);
  ped.equation.tokens.forEach((tok, idx) => {
    assert(VALID_ROLES.has(tok.role), `Invalid token role ${tok.role} on ${s.id}`);
    assert(tok.sym && tok.name && tok.meaning, `Incomplete token on ${s.id}`);
    assertLatex(tok.latex, `${s.id}.token[${idx}].latex`);
    assert(ped.equation.latex.includes(`{i=${idx}}`), `Missing \\htmlData{i=${idx}} hook in ${s.id}.equation.latex`);
  });
  assert(ped.equation.limit && ped.equation.limit.length === 2, `Invalid equation limit on ${s.id}`);
  assert(ped.solver && ped.solver.stem && Array.isArray(ped.solver.steps) && ped.solver.steps.length >= 3, `Invalid solver on ${s.id}`);
  ped.solver.steps.forEach(st => {
    assert(st.green && st.blue && Array.isArray(st.distractors) && st.distractors.length === 2 && st.cue, `Incomplete solver step on ${s.id}`);
  });
  assert(ped.solver.branch && ped.solver.branch.opts.length >= 2 && ped.solver.branch.ans >= 0 && ped.solver.branch.ans < ped.solver.branch.opts.length, `Invalid solver branch on ${s.id}`);
  assert(ped.contrast && ped.contrast.aTitle && ped.contrast.bTitle && ped.contrast.rule, `Invalid contrast on ${s.id}`);
  assert(ped.collaborate && ped.collaborate.prompt && ped.collaborate.tip, `Invalid collaborate on ${s.id}`);
  assert(ped.closure && ped.closure.prompt && Array.isArray(ped.closure.points) && ped.closure.points.length >= 2, `Invalid closure on ${s.id}`);
  assert(Array.isArray(ped.labFurther) && ped.labFurther.length >= 2, `Invalid labFurther on ${s.id}`);
});
assert.strictEqual(totalCp, 64, '64 concept practice questions');

assert.strictEqual(PV.exams.length, 3, '3 chapter exams');
PV.exams.forEach(ex => {
  assert.strictEqual(ex.questions.length, 12, `Chapter ${ex.chapter} must have 12 questions`);
  const pts = ex.questions.reduce((a, q) => a + q.points, 0);
  assert.strictEqual(pts, 100, `Chapter ${ex.chapter} total points must be 100`);
  if (ex.figure) assert(PV.figure(ex.figure).startsWith('<svg'), `Missing exam figure ${ex.figure}`);
  ex.questions.forEach(q => {
    if (q.figure) assert(PV.figure(q.figure).startsWith('<svg'), `Missing q figure ${q.figure}`);
  });
});

console.log('PASS: physics-v verified 10 numerical models, 16 sections + 2.0 pedagogy, 10 labs, 64 cued concept Qs, and 3x12 chapter exams.');
