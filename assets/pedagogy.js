/*
 * Gavin Physics 2.0 教學鷹架共用引擎
 *   ・mountPreLab(el, data)            ：00 生活暖身與直覺押注
 *   ・mountEquation(el, data)          ：KaTeX 完整方程式＋互動拉線標註＋極端值檢驗
 *   ・mountSolver(el, data)            ：綠字×藍字 雙欄出聲思考解題器（I do / We do / You do 分岔）
 *   ・mountContrast(el, data)          ：易混淆負遷移對照表
 *   ・mountCollab(el, data)            ：課堂小組討論（Think-Pair-Share）
 *   ・mountClosure(el, data)           ：結尾收束檢核（Terminal Closure）
 *   ・attachReadoutMask(btn, readouts) ：MIT 式先估後驗（隱藏讀值開關）
 *   ・renderMath / formatInlineMath    ：KaTeX 與離線備援數學排版
 */
(function (root) {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ROLE_LABEL = { cause: "原因／驅動", effect: "結果／響應", prop: "系統性質", op: "數學／邏輯符號" };
  const ROLE_COLOR = { cause: "#d4962e", effect: "#2b7a75", prop: "#3a6499", op: "#8b786a" };

  function formatInlineMath(str) {
    let out = esc(str);
    out = out.replace(/([A-Za-zΑ-Ωα-ωΔΣΦερηλμρτθω])_([A-Za-z0-9\u4e00-\u9fff→½\/]+)/g, "$1<sub>$2</sub>");
    out = out.replace(/\^\(([^)]+)\)/g, "<sup>$1</sup>");
    return out;
  }

  function renderMath(tex, fallbackText, displayMode) {
    if (root.katex && tex) {
      try {
        return root.katex.renderToString(tex, {
          throwOnError: false,
          displayMode: !!displayMode,
          trust: true,
          strict: false
        });
      } catch (_) {}
    }
    const cls = displayMode ? "gp-math-fb gp-math-fb-disp" : "gp-math-fb";
    return `<span class="${cls}">${formatInlineMath(fallbackText || tex || "")}</span>`;
  }

  function mountPreLab(el, data) {
    if (!el || !data) return;
    el.className = "gp-ped-card gp-prelab";
    el.innerHTML =
      `<span class="gp-ped-kicker">00　生活暖身・先估再學</span>` +
      `<h3>${esc(data.title)}</h3>` +
      `<p>${esc(data.analogy)}</p>` +
      `<div class="gp-prelab-q"><strong>🤔 先猜看看（10 秒直覺押注）：</strong>${esc(data.q)}` +
      `<div class="gp-prelab-opts">${data.opts.map((o, i) => `<button type="button" class="gp-ped-btn" data-i="${i}" aria-pressed="false">${esc(o)}</button>`).join("")}</div>` +
      `<div class="gp-prelab-note" hidden></div></div>`;
    const note = el.querySelector(".gp-prelab-note");
    el.querySelectorAll(".gp-ped-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = +btn.dataset.i, ok = i === data.ans;
        el.querySelectorAll(".gp-ped-btn").forEach((b, k) => {
          b.setAttribute("aria-pressed", String(k === i));
          b.classList.remove("ok", "bad");
          if (k === data.ans) b.classList.add("ok");
          else if (k === i && !ok) b.classList.add("bad");
        });
        note.innerHTML = `<strong>${ok ? "✔ 直覺準確！" : "💡 很好的預測！"}</strong> ${esc(data.note)}`;
        note.hidden = false;
      });
    });
  }

  let eqStageSeq = 0;

  function mountEquation(el, data) {
    if (!el || !data) return;
    el.className = "gp-ped-card gp-eq-card";
    const stageId = ++eqStageSeq;
    const roles = ["cause", "effect", "prop", "op"].filter(r => data.tokens.some(t => t.role === r));
    const fallbackJoined = data.tokens.map(t => t.sym).join(" ");
    const heroHtml = renderMath(data.latex, fallbackJoined, true);

    el.innerHTML =
      `<div class="gp-eq-head">` +
        `<span class="gp-ped-kicker" style="margin-bottom:0">🔬 方程式解剖卡・讀懂因果而非背代號</span>` +
        `<button type="button" class="gp-ped-btn gp-eq-mask-btn" aria-pressed="false">🙈 隱藏標註（口述公式練習）</button>` +
      `</div>` +
      `<div class="gp-eq-causal"><strong>物理一句話：</strong>${esc(data.causal)}</div>` +
      `<div class="gp-eq-role-legend">${roles.map(r => `<span><i style="background:${ROLE_COLOR[r]}"></i>${ROLE_LABEL[r]}</span>`).join("")}<span>（點選上方文字標註或公式內的符號看詳解）</span></div>` +
      `<div class="gp-eq-stage">` +
        `<svg class="gp-eq-wires" data-gp-nostage="1" aria-hidden="true"></svg>` +
        `<div class="gp-eq-lane gp-eq-lane-top"></div>` +
        `<div class="gp-eq-formula-row">${heroHtml}</div>` +
        `<div class="gp-eq-lane gp-eq-lane-bot"></div>` +
      `</div>` +
      `<div class="gp-eq-inspect" aria-live="polite"></div>` +
      (data.limit ? `<details class="gp-eq-limit"><summary>⚖️ 極端值直覺檢驗：${esc(data.limit[0])}</summary><p style="margin-top:6px">${esc(data.limit[1])}</p></details>` : "");

    const stage = el.querySelector(".gp-eq-stage");
    const svgEl = el.querySelector(".gp-eq-wires");
    const topLane = el.querySelector(".gp-eq-lane-top");
    const botLane = el.querySelector(".gp-eq-lane-bot");
    const formulaRow = el.querySelector(".gp-eq-formula-row");
    const insp = el.querySelector(".gp-eq-inspect");
    let activeIdx = 0;

    const labelBtns = data.tokens.map((t, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gp-eq-lbl" + (i === 0 ? " on" : "");
      btn.dataset.i = String(i);
      btn.dataset.role = t.role || "op";
      btn.setAttribute("aria-pressed", String(i === 0));
      btn.textContent = t.callout || t.name;
      return btn;
    });

    const showTok = idx => {
      const t = data.tokens[idx]; if (!t) return;
      const symHtml = renderMath(t.latex, t.sym, false);
      insp.innerHTML =
        `<div class="gp-eq-inspect-head"><span class="gp-eq-inspect-sym">${symHtml}</span><strong>${esc(t.name)}</strong>` +
        (t.unit ? `<span class="gp-eq-unit">單位：${esc(t.unit)}</span>` : "") +
        `<span class="gp-eq-unit">${ROLE_LABEL[t.role] || ""}</span></div>` +
        `<div>${esc(t.meaning)}</div>` +
        (t.trap ? `<div class="gp-eq-trap">⚡ 常見誤讀：${esc(t.trap)}</div>` : "");
    };

    const syncHighlight = idx => {
      activeIdx = idx;
      labelBtns.forEach(b => {
        const active = +b.dataset.i === idx;
        b.classList.toggle("on", active);
        b.setAttribute("aria-pressed", String(active));
      });
      formulaRow.querySelectorAll("[data-i]").forEach(s => {
        s.classList.toggle("on", +s.dataset.i === idx);
      });
      svgEl.querySelectorAll(".gp-eq-wire").forEach(w => {
        const active = +w.dataset.i === idx;
        w.classList.toggle("on", active);
        if (active) w.parentNode.appendChild(w);
      });
    };

    const selectTok = idx => {
      syncHighlight(idx);
      showTok(idx);
    };

    function layoutAndDraw() {
      if (!el.isConnected) return;
      const S = stage.getBoundingClientRect();
      const F = formulaRow.getBoundingClientRect();
      if (S.width < 10 || F.height < 5) return;
      const fMidY = (F.top + F.bottom) / 2;
      const sl = stage.scrollLeft || 0;

      const measured = data.tokens.map((t, i) => {
        const symEl = formulaRow.querySelector(`[data-i="${i}"]`);
        const r = symEl ? symEl.getBoundingClientRect() : null;
        const cx = r ? (r.left + r.right) / 2 : F.left + (F.width * (i + 0.5)) / data.tokens.length;
        const cy = r ? (r.top + r.bottom) / 2 : fMidY;
        return { i, t, r, cx, cy };
      });

      const byX = measured.slice().sort((a, b) => a.cx - b.cx);
      const topItems = [], botItems = [];
      let alt = 0;
      byX.forEach(item => {
        if (item.cy < fMidY - 8) {
          item.side = "top";
          topItems.push(item);
        } else if (item.cy > fMidY + 8) {
          item.side = "bot";
          botItems.push(item);
        } else {
          item.side = (alt++ % 2 === 0) ? "top" : "bot";
          (item.side === "top" ? topItems : botItems).push(item);
        }
      });

      topLane.innerHTML = "";
      botLane.innerHTML = "";
      topItems.forEach(item => topLane.appendChild(labelBtns[item.i]));
      botItems.forEach(item => botLane.appendChild(labelBtns[item.i]));

      const S2 = stage.getBoundingClientRect();
      const W = Math.max(10, stage.clientWidth);
      const H = Math.max(10, stage.clientHeight);
      const ox = S2.left + (stage.clientLeft || 0) - sl;
      const oy = S2.top + (stage.clientTop || 0);
      svgEl.setAttribute("viewBox", `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);

      const defs = ["cause", "effect", "prop", "op"].map(role => {
        const mid = `gp-arr-${stageId}-${role}`;
        return `<marker id="${mid}" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">` +
          `<path d="M 1.5 1.8 L 8 5 L 1.5 8.2" fill="none" stroke="${ROLE_COLOR[role]}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>` +
          `</marker>`;
      }).join("");

      const wires = measured.map(item => {
        const btn = labelBtns[item.i];
        const lRect = btn.getBoundingClientRect();
        const sRect = item.r;
        if (!sRect || lRect.width < 2) return "";
        const role = item.t.role || "op";
        const lCenterX = (lRect.left + lRect.right) / 2 - ox;
        const sx = (sRect.left + sRect.right) / 2 - ox;
        const shift = Math.max(-lRect.width * 0.28, Math.min(lRect.width * 0.28, (sx - lCenterX) * 0.35));
        const lx = lCenterX + shift;
        let y1, y2;
        const isCompactOp = role === "op" && sRect.height < 42;
        const sMidY = (sRect.top + sRect.bottom) / 2 - oy;
        if (item.side === "top") {
          y1 = lRect.bottom - oy + 3;
          y2 = isCompactOp ? sMidY - 12 : sRect.top - oy - 4;
        } else {
          y1 = lRect.top - oy - 3;
          y2 = isCompactOp ? sMidY + 12 : sRect.bottom - oy + 4;
        }
        const cx = lx + (sx - lx) * 0.22;
        const cy = y1 + (y2 - y1) * 0.68;
        const d = `M ${lx.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)}, ${sx.toFixed(1)} ${y2.toFixed(1)}`;
        const onCls = item.i === activeIdx ? " on" : "";
        return `<path class="gp-eq-wire${onCls}" data-i="${item.i}" data-role="${esc(role)}" d="${d}" stroke="${ROLE_COLOR[role]}" marker-end="url(#gp-arr-${stageId}-${role})"/>`;
      }).join("");

      svgEl.innerHTML = `<defs>${defs}</defs>${wires}`;
      syncHighlight(activeIdx);
    }

    selectTok(0);
    labelBtns.forEach(btn => {
      btn.addEventListener("click", () => selectTok(+btn.dataset.i));
    });
    formulaRow.querySelectorAll("[data-i]").forEach(span => {
      span.setAttribute("tabindex", "0");
      span.setAttribute("role", "button");
      span.addEventListener("click", () => selectTok(+span.dataset.i));
      span.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectTok(+span.dataset.i);
        }
      });
    });

    const maskBtn = el.querySelector(".gp-eq-mask-btn");
    if (maskBtn) {
      maskBtn.addEventListener("click", () => {
        const hidden = el.classList.toggle("gp-eq-hide-callouts");
        maskBtn.textContent = hidden ? "👁️ 顯示標註" : "🙈 隱藏標註（口述公式練習）";
        maskBtn.setAttribute("aria-pressed", String(hidden));
      });
    }

    requestAnimationFrame(() => layoutAndDraw());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(layoutAndDraw));
    }
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        if (!el.isConnected) { ro.disconnect(); return; }
        requestAnimationFrame(layoutAndDraw);
      });
      ro.observe(stage);
      ro.observe(formulaRow);
    }
  }

  function mountSolver(el, data) {
    if (!el || !data) return;
    el.className = "gp-ped-card gp-solver";
    let mode = "ido", shown = 1;

    function shuffleChoices(step) {
      const arr = [
        { text: step.green, ok: true },
        ...(step.distractors || []).map(d => ({ text: d, ok: false }))
      ];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function render() {
      const total = data.steps.length;
      const count = mode === "ido" ? shown : Math.min(shown, total);
      const rows = data.steps.slice(0, count).map((st, idx) =>
        `<div class="gp-solver-row">` +
        `<div class="gp-col-green"><span class="gp-step-badge">步驟 ${idx + 1} 依據</span>∵ ${esc(st.green)}</div>` +
        `<div class="gp-col-blue"><span class="gp-step-badge">步驟 ${idx + 1} 列式</span>⇒ ${formatInlineMath(st.blue)}</div>` +
        `</div>`
      ).join("");

      const nextStep = (mode === "wedo" && shown < total) ? data.steps[shown] : null;
      const wedoOpts = nextStep ? shuffleChoices(nextStep) : [];
      const done = shown >= total;

      el.innerHTML =
        `<div class="gp-solver-head">` +
          `<div><span class="gp-ped-kicker">🧠 雙欄出聲思考解題器（綠字依據 × 藍字列式）</span><h3 style="margin:0">跟著專家拆解這題</h3></div>` +
          `<div class="gp-solver-modes">` +
            `<button type="button" class="gp-ped-btn${mode === "ido" ? " on" : ""}" data-m="ido">👀 逐步示範 (I do)</button>` +
            `<button type="button" class="gp-ped-btn${mode === "wedo" ? " on" : ""}" data-m="wedo">🧩 抓思考起手式 (We do)</button>` +
          `</div>` +
        `</div>` +
        `<div class="gp-solver-stem">${esc(data.stem)}</div>` +
        `<div class="gp-solver-cols">${rows}</div>` +
        (mode === "ido" ? `<div class="gp-solver-controls">` +
          (!done ? `<button type="button" class="gp-ped-btn on" id="gp-sv-next">展開下一步 (${shown}/${total}) →</button>` : "") +
          (shown < total ? `<button type="button" class="gp-ped-btn" id="gp-sv-all">一次展開全部</button>` : `<button type="button" class="gp-ped-btn" id="gp-sv-reset">從步驟 1 重新演示</button>`) +
        `</div>` : "") +
        (nextStep ? `<div class="gp-wedoit-box"><strong>🤔 輪到你決定第 ${shown + 1} 步：接下來該根據什麼物理原理列式？</strong>` +
          `<div class="gp-wedoit-opts">${wedoOpts.map(o => `<button type="button" class="gp-ped-btn gp-wedoit-opt" data-ok="${o.ok ? 1 : 0}">${esc(o.text)}</button>`).join("")}</div>` +
          `<div class="gp-cue-box" hidden></div></div>` : "") +
        (done && data.branch ? `<div class="gp-branch-card"><span class="gp-ped-kicker">🔀 臨界條件分岔挑戰（紫字遷移）</span>` +
          `<p style="margin:4px 0 8px"><strong>${esc(data.branch.q)}</strong></p>` +
          `<div class="gp-prelab-opts">${data.branch.opts.map((o, i) => `<button type="button" class="gp-ped-btn gp-br-opt" data-i="${i}">${esc(o)}</button>`).join("")}</div>` +
          `<div class="gp-prelab-note" id="gp-br-note" hidden></div></div>` : "");

      el.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => {
        mode = b.dataset.m;
        shown = mode === "ido" ? 1 : 0;
        render();
      }));
      const nextBtn = el.querySelector("#gp-sv-next");
      if (nextBtn) nextBtn.onclick = () => { shown = Math.min(total, shown + 1); render(); };
      const allBtn = el.querySelector("#gp-sv-all");
      if (allBtn) allBtn.onclick = () => { shown = total; render(); };
      const resetBtn = el.querySelector("#gp-sv-reset");
      if (resetBtn) resetBtn.onclick = () => { shown = 1; render(); };

      el.querySelectorAll(".gp-wedoit-opt").forEach(b => b.addEventListener("click", () => {
        if (b.dataset.ok === "1") {
          shown++;
          render();
        } else {
          b.classList.add("bad");
          const cueBox = el.querySelector(".gp-cue-box");
          cueBox.innerHTML = `💡 <strong>提示線索：</strong>${esc(nextStep.cue)}`;
          cueBox.hidden = false;
        }
      }));

      el.querySelectorAll(".gp-br-opt").forEach(b => b.addEventListener("click", () => {
        const i = +b.dataset.i, ok = i === data.branch.ans;
        el.querySelectorAll(".gp-br-opt").forEach((x, k) => {
          x.classList.remove("ok", "bad");
          if (k === data.branch.ans) x.classList.add("ok");
          else if (k === i && !ok) x.classList.add("bad");
        });
        const bn = el.querySelector("#gp-br-note");
        bn.innerHTML = `<strong>${ok ? "✔ 判斷正確！" : "💡 看這裡的分岔關鍵："}</strong> ${esc(data.branch.explain)}`;
        bn.hidden = false;
      }));
    }
    render();
  }

  function mountContrast(el, data) {
    if (!el || !data) return;
    el.className = "gp-ped-card gp-contrast";
    el.innerHTML =
      `<span class="gp-ped-kicker">⚠️ 易混淆負遷移排雷</span>` +
      `<div class="gp-contrast-grid">` +
        `<div class="gp-contrast-box"><strong>${esc(data.aTitle)}</strong>${esc(data.aText)}</div>` +
        `<div class="gp-contrast-box"><strong>${esc(data.bTitle)}</strong>${esc(data.bText)}</div>` +
      `</div>` +
      `<div class="gp-contrast-rule">🔑 一句話分清楚：${esc(data.rule)}</div>`;
  }

  function mountCollab(el, data) {
    if (!el || !data) return;
    el.className = "gp-ped-card gp-collab";
    el.innerHTML =
      `<span class="gp-ped-kicker">🗣️ 課堂同儕討論（2–5 分鐘 Think–Pair–Share）</span>` +
      `<p><strong>${esc(data.prompt)}</strong></p>` +
      `<details class="gp-eq-limit"><summary>討論切入提示（老師引導／自習參考）</summary><p style="margin-top:6px">${esc(data.tip)}</p></details>`;
  }

  function mountClosure(el, data) {
    if (!el || !data) return;
    el.className = "gp-ped-card gp-closure";
    el.innerHTML =
      `<span class="gp-ped-kicker">✍️ 結尾收束（Terminal Closure）</span>` +
      `<p><strong>${esc(data.prompt)}</strong></p>` +
      `<div class="gp-closure-list">${data.points.map(pt => `<label class="gp-closure-item"><input type="checkbox"><span>${esc(pt)}</span></label>`).join("")}</div>`;
  }

  function attachReadoutMask(btn, readoutsEl) {
    if (!btn || !readoutsEl) return;
    let masked = false;
    const sync = () => {
      readoutsEl.classList.toggle("gp-readout-masked", masked);
      btn.textContent = masked ? "👁️ 顯示讀值核對" : "🙈 隱藏讀值（先估再看）";
      btn.setAttribute("aria-pressed", String(masked));
    };
    btn.addEventListener("click", () => { masked = !masked; sync(); });
    sync();
  }

  root.GPPedagogy = {
    mountPreLab, mountEquation, mountSolver, mountContrast, mountCollab, mountClosure,
    attachReadoutMask, renderMath, formatInlineMath
  };
})(typeof window !== "undefined" ? window : globalThis);
