#!/usr/bin/env node
/*
 * 全站物理概念與實驗搜尋索引產生器
 *   node assets/tools/build_search_index.js
 * 輸出：assets/search-index.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'assets', 'search-index.json');

require(path.join(ROOT, 'assets', 'node-sections.js'));
const NS = globalThis.GP_NODE_SEC;

const items = [];
const push = (t, sub, book, url, kw) => items.push({ t, sub, book, url, kw: kw || '' });

// 1. 必修物理（gsat/）：knowledgeNodes
{
  const reviewDir = path.join(ROOT, 'gsat', 'assets', 'js', 'review');   // 頁面程式碼拆在這裡
  const html = fs.readdirSync(reviewDir).filter(f => f.endsWith('.js')).sort()
    .map(f => fs.readFileSync(path.join(reviewDir, f), 'utf8')).join('\n');
  const m = html.match(/const knowledgeNodes\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error('找不到 gsat knowledgeNodes');
  const nodes = new Function(`return ${m[1]};`)();
  nodes.forEach(n => {
    const sec = NS.tag('gsat', n.id);
    const title = NS.title('gsat', n.id);
    push(
      `必修 ${sec} ${n.name}`,
      title && title !== n.name ? `${title}｜${n.code}` : n.code,
      '必修物理',
      `gsat/gsat_physics_review.html#node-${n.id}`,
      `${n.id} ${sec} ${n.name} ${title} ${n.detail || ''}`
    );
  });
}

// 2. 選修物理Ⅲ 波動與光學（wave-optics/）：nodeMeta + labMeta
{
  const src = fs.readFileSync(path.join(ROOT, 'wave-optics', 'data', 'modulesData.js'), 'utf8');
  const { nodeMeta, labMeta } = new Function(`${src}; return { nodeMeta, labMeta };`)();
  Object.keys(nodeMeta).forEach(code => {
    const m = nodeMeta[code];
    const sec = NS.tag('wave', code);
    push(
      `${/^必修/.test(sec) ? sec : '選修Ⅲ ' + sec} ${m.title}`,
      m.section || '',
      '選修物理Ⅲ',
      `wave-optics/wave_optics_review.html#node-${code}`,
      `${code} ${sec} ${m.title}`
    );
  });
  Object.keys(labMeta || {}).forEach(id => {
    const l = labMeta[id];
    push(
      `實驗：${l.name}`,
      l.desc || '',
      '波動與光學實驗',
      `wave-optics/wave_optics_review.html#lab-${id}`,
      `${id} ${l.name} ${l.desc || ''}`
    );
  });
}

// 3. 選修物理Ⅳ 電磁學（electromag/）：course.js + workbenches.js
{
  const courseSrc = fs.readFileSync(path.join(ROOT, 'electromag', 'data', 'course.js'), 'utf8');
  const pmSrc = fs.readFileSync(path.join(ROOT, 'electromag', 'assets', 'physics-models.js'), 'utf8');
  const wbSrc = fs.readFileSync(path.join(ROOT, 'electromag', 'assets', 'workbenches.js'), 'utf8');
  const ctx = { window: {} };
  new Function('window', courseSrc)(ctx.window);
  const EM = ctx.window.EM;
  const EMPhysics = new Function('window', `${pmSrc}; return typeof EMPhysics !== 'undefined' ? EMPhysics : window.EMPhysics;`)(ctx.window);
  new Function('window', 'EM', 'EMPhysics', wbSrc)(ctx.window, EM, EMPhysics);
  EM.sections.forEach(s => {
    const topicNames = (s.topics || []).map(t => t[0]).join('、');
    push(
      `選修Ⅳ ${s.id} ${s.name}`,
      `${s.goal || ''}（課本 pp. ${s.pages}）`,
      '選修物理Ⅳ',
      `electromag/#course/${s.id}`,
      `${s.id} ${s.name} ${topicNames} ${s.formula || ''} ${s.goal || ''}`
    );
  });
  (EM.workbenches || []).forEach(b => {
    push(
      `3D 工作臺：${b.title}`,
      b.description || '',
      '電磁學工作臺',
      `electromag/#labs/${b.id}`,
      `${b.id} ${b.title} ${(b.modes || []).map(m => m.title).join(' ')} ${b.description || ''}`
    );
  });
}

// 3.4. 選修物理Ⅰ（physics-i/）：course.js + labs.js
{
  const courseSrc = fs.readFileSync(path.join(ROOT, 'physics-i', 'data', 'course.js'), 'utf8');
  const pmSrc = fs.readFileSync(path.join(ROOT, 'physics-i', 'assets', 'physics-models.js'), 'utf8');
  const labsSrc = fs.readFileSync(path.join(ROOT, 'physics-i', 'assets', 'labs.js'), 'utf8');
  const ctx = { window: {} };
  new Function('window', courseSrc)(ctx.window);
  const PI = ctx.window.PI;
  const PIPhysics = new Function('window', `${pmSrc}; return typeof PIPhysics !== 'undefined' ? PIPhysics : window.PIPhysics;`)(ctx.window);
  new Function('window', 'PI', 'PIPhysics', labsSrc)(ctx.window, PI, PIPhysics);
  PI.sections.forEach(s => {
    const topicNames = (s.topics || []).map(t => t[0]).join('、');
    push(
      `選修Ⅰ ${s.id} ${s.name}`,
      `${s.goal || ''}（課本 pp. ${s.pages}）`,
      '選修物理Ⅰ',
      `physics-i/#course/${s.id}`,
      `${s.id} ${s.name} ${topicNames} ${s.formula || ''} ${s.goal || ''}`
    );
  });
  (PI.labs || []).forEach(l => {
    push(
      `實驗：${l.name}`,
      (l.guide && l.guide[0]) || '',
      '選修Ⅰ實驗室',
      `physics-i/#labs/${l.id}`,
      `${l.id} ${l.name} ${(l.guide || []).join(' ')}`
    );
  });
}

// 3.5. 選修物理Ⅴ（physics-v/）：course.js + labs.js
{
  const courseSrc = fs.readFileSync(path.join(ROOT, 'physics-v', 'data', 'course.js'), 'utf8');
  const pmSrc = fs.readFileSync(path.join(ROOT, 'physics-v', 'assets', 'physics-models.js'), 'utf8');
  const labsSrc = fs.readFileSync(path.join(ROOT, 'physics-v', 'assets', 'labs.js'), 'utf8');
  const ctx = { window: {} };
  new Function('window', courseSrc)(ctx.window);
  const PV = ctx.window.PV;
  const PVPhysics = new Function('window', `${pmSrc}; return typeof PVPhysics !== 'undefined' ? PVPhysics : window.PVPhysics;`)(ctx.window);
  new Function('window', 'PV', 'PVPhysics', labsSrc)(ctx.window, PV, PVPhysics);
  PV.sections.forEach(s => {
    const topicNames = (s.topics || []).map(t => t[0]).join('、');
    push(
      `選修Ⅴ ${s.id} ${s.name}`,
      `${s.goal || ''}（課本 pp. ${s.pages}）`,
      '選修物理Ⅴ',
      `physics-v/#course/${s.id}`,
      `${s.id} ${s.name} ${topicNames} ${s.formula || ''} ${s.goal || ''}`
    );
  });
  (PV.labs || []).forEach(l => {
    push(
      `實驗：${l.name}`,
      (l.guide && l.guide[0]) || '',
      '選修Ⅴ實驗室',
      `physics-v/#labs/${l.id}`,
      `${l.id} ${l.name} ${(l.guide || []).join(' ')}`
    );
  });
}

// 4. 互動實驗室（assets/topic-labs.js + index.html 卡片）
{
  const tlSrc = fs.readFileSync(path.join(ROOT, 'assets', 'topic-labs.js'), 'utf8');
  const m = tlSrc.match(/const LABS\s*=\s*(\{[\s\S]*?\n\s*\});/);
  if (m) {
    const labs = new Function(`return ${m[1]};`)();
    Object.values(labs).forEach(([url, title, desc]) => {
      push(`互動實驗：${title}`, desc, '互動實驗室', url, `${title} ${desc}`);
    });
  }
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const seenUrls = new Set(items.map(i => i.url));
  const cardRe = /<a class="card[^"]*" href="([^"]+)">\s*<span class="tag">([^<]+)<\/span>\s*<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>/g;
  let cm;
  while ((cm = cardRe.exec(idx))) {
    const [, url, tag, title, desc] = cm;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    push(title, desc, tag, url, `${tag} ${title} ${desc}`);
  }
}

fs.writeFileSync(OUT, JSON.stringify(items), 'utf8');
console.log(`Built ${path.relative(ROOT, OUT)}: ${items.length} entries (${fs.statSync(OUT).size} bytes)`);
