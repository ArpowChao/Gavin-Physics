#!/usr/bin/env node
/*
 * 選修物理Ⅰ 數值模型與課程資料自動化驗收
 *   node physics-i/scripts/check_physics_models.js
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const P = require(path.join(ROOT, 'assets', 'physics-models.js'));

const near = (a, b, tol = 1e-3, msg = '') => {
  assert(Math.abs(a - b) <= tol, `${msg}: expected ~${b}, got ${a}`);
};

// 1. 不確定度與誤差傳遞
{
  near(P.stdUncertainty(0.3, 0.4), 0.5, 1e-6, '3-4-5 uncertainty');
  const add = P.uncertaintyCombine(10, 0.3, 5, 0.4, '+');
  near(add.val, 15, 1e-6, 'add val');
  near(add.u, 0.5, 1e-6, 'add u');
  const mul = P.uncertaintyCombine(10, 0.3, 20, 0.8, '*');
  near(mul.val, 200, 1e-6, 'mul val');
  near(mul.u, 10, 1e-6, 'mul u = 200 * sqrt(0.03^2+0.04^2)');
}

// 2. 因次分析
{
  assert.strictEqual(P.dimensionCheck('pendulum').consistent, true);
  assert.strictEqual(P.dimensionCheck('wrong-period').consistent, false);
  assert.strictEqual(P.dimensionCheck('wrong-force').consistent, false);
}

// 3. 一維直線等加速運動（含折返路徑長與 v^2 式殘差）
{
  const m = P.kinematics1D(0, 6, -2, 5);
  near(m.tTurn, 3, 1e-6, 'turning time');
  near(m.dx, 5, 1e-6, 'displacement 6*5 - 0.5*2*25 = 5');
  near(m.pathLen, 13, 1e-6, 'path length 9 + 4 = 13');
  assert(m.residualV2 < 1e-9, 'v^2 = v0^2 + 2aS residual');
}

// 4. 自由落體與上拋
{
  const f = P.freeFall(0, 20, 10);
  near(f.tPeak, 2, 1e-6, 'tPeak');
  near(f.yPeak, 20, 1e-6, 'yPeak');
  near(f.tLand, 4, 1e-6, 'tLand');
  near(f.vLand, -20, 1e-6, 'vLand');
}

// 5. 一維相對運動
{
  const r = P.relativeMotion1D(15, 25, 40, 0, 4);
  near(r.vBA, 10, 1e-6, 'vBA');
  near(r.tMeet, 4, 1e-6, 'tMeet');
  near(r.relX, 0, 1e-6, 'relX at tMeet');
}

// 6. 平面向量分解與合成 (3-4-5)
{
  const v = P.vectorOps(3, 0, 4, 90, 'add');
  near(v.rMag, 5, 1e-6, '3-4-5 vector magnitude');
  const eq = P.vectorOps(3, 0, 4, 90, 'equil');
  near(eq.rx, -3, 1e-6, 'equil x');
  near(eq.ry, -4, 1e-6, 'equil y');
}

// 7. 拋體運動 (45° 最大射程)
{
  const p = P.projectile2D(20, 45, 0, 10);
  near(p.range, 40, 1e-3, 'range at 45 deg');
  near(p.hMax, 10, 1e-3, 'hMax at 45 deg');
}

// 8. 虎克定律
{
  const h = P.hookeSpring(200, 0.05, 1.0, 10);
  near(h.f, 10, 1e-6, 'hooke F=kx');
  near(h.xEq, 0.05, 1e-6, 'hooke equilibrium extension');
}

// 9. 牛頓第二定律系統
{
  const tp = P.newton2System('table-pulley', 3, 2, 30, 10);
  near(tp.a, 4, 1e-6, 'table-pulley a = 20/5 = 4');
  near(tp.tension, 12, 1e-6, 'table-pulley T = 3*4 = 12');
  const aw = P.newton2System('atwood', 2, 3, 30, 10);
  near(aw.a, 2, 1e-6, 'atwood a = 10/5 = 2');
  near(aw.tension, 24, 1e-6, 'atwood T = 24');
}

// 10. 等速圓周運動
{
  const c = P.circularMotion(2, 4, Math.PI);
  near(c.omega, 2, 1e-6, 'omega');
  near(c.v, 8, 1e-6, 'v = R*omega');
  near(c.ac, 16, 1e-6, 'ac = v^2/R');
  near(c.fc, 32, 1e-6, 'fc = m*ac');
}

// 11. 簡諧運動與能量守恆
{
  const s = P.shmSpring(2, 50, 0.2, 30, 0.37);
  near(s.omega, 5, 1e-6, 'shm omega = sqrt(k/m)');
  assert(s.energyResidual < 1e-9, 'shm total mechanical energy conserved');
}

// 12. 萬有引力與克卜勒第三定律
{
  const g = P.gravityOrbit(1, 1, 0);
  near(g.g0, 9.819, 0.05, 'Earth surface g0');
  near(g.keplerFromRT, g.keplerTheory, g.keplerTheory * 1e-6, 'Kepler 3rd law consistency');
}

// 13. 課程資料、練習題、2.0 教學鷹架與練習卷結構完整性
const ctx = { window: {} };
for (const f of ['data/course.js', 'data/concept-practice.js', 'data/exams.js', 'data/pedagogy.js', 'assets/physics-models.js', 'assets/labs.js']) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  new Function('window', 'PI', 'PIPhysics', code)(ctx.window, ctx.window.PI, ctx.window.PIPhysics || P);
}
const PI = ctx.window.PI;
assert.strictEqual(PI.chapters.length, 5, '5 chapters');
assert.strictEqual(PI.sections.length, 23, '23 sections');
assert.strictEqual(PI.labs.length, 12, '12 labs');

const labIds = new Set(PI.labs.map(l => l.id));
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
PI.sections.forEach(s => {
  assert(labIds.has(s.lab), `Unknown lab ${s.lab} on section ${s.id}`);
  assertLatex(s.formulaLatex, `${s.id}.formulaLatex`);
  s.codes.forEach(c => assert(PI.curriculum[c], `Missing curriculum description for ${c}`));
  const cp = PI.conceptPractice[s.id];
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

  // 14. 檢核 Gavin Physics 2.0 pedagogy（含 KaTeX 完整方程式與普物式 callout 標註）
  const ped = PI.pedagogy && PI.pedagogy[s.id];
  assert(ped, `Missing pedagogy data for ${s.id}`);
  assert(ped.prelab && ped.prelab.title && ped.prelab.analogy && ped.prelab.opts.length >= 2, `Invalid prelab on ${s.id}`);
  assert(ped.prelab.ans >= 0 && ped.prelab.ans < ped.prelab.opts.length, `Invalid prelab ans on ${s.id}`);
  assert(ped.equation && ped.equation.causal && Array.isArray(ped.equation.tokens) && ped.equation.tokens.length >= 3, `Invalid equation on ${s.id}`);
  assertLatex(ped.equation.latex, `${s.id}.equation.latex`);
  ped.equation.tokens.forEach((tok, idx) => {
    assert(VALID_ROLES.has(tok.role), `Invalid token role ${tok.role} on ${s.id}`);
    assert(tok.sym && tok.name && tok.meaning, `Incomplete token on ${s.id}`);
    assert(!/^[·\/]|,\s*$/.test(tok.sym), `Broken fragment token sym "${tok.sym}" on ${s.id}`);
    assertLatex(tok.sym.replace(/\[/g, '{').replace(/\]/g, '}').replace(/\(/g, '{').replace(/\)/g, '}'), `${s.id}.sym[${idx}]`);
    assertLatex(tok.latex, `${s.id}.token[${idx}].latex`);
    assert(ped.equation.latex.includes(`{i=${idx}}`), `Missing \\htmlData{i=${idx}} hook in ${s.id}.equation.latex`);
    if (tok.role !== 'op') assert(tok.callout && tok.callout.length >= 2, `Missing annotated callout on ${s.id}:${tok.sym}`);
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
assert.strictEqual(totalCp, 92, '92 concept practice questions');

assert.strictEqual(PI.exams.length, 5, '5 chapter exams');
PI.exams.forEach(ex => {
  assert.strictEqual(ex.questions.length, 12, `Chapter ${ex.chapter} must have 12 questions`);
  const pts = ex.questions.reduce((a, q) => a + q.points, 0);
  assert.strictEqual(pts, 100, `Chapter ${ex.chapter} total points must be 100`);
  if (ex.figure) assert(PI.figure(ex.figure).startsWith('<svg'), `Missing exam figure ${ex.figure}`);
  ex.questions.forEach(q => {
    if (q.figure) assert(PI.figure(q.figure).startsWith('<svg'), `Missing q figure ${q.figure}`);
  });
});

console.log('PASS: physics-i verified 12 numerical models, 23 sections + 2.0 pedagogy, 12 labs, 92 cued concept Qs, and 5x12 chapter exams.');
