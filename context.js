"use strict";
/* Technology and programme context cards: deep-tech milestones (A7), Indian test-beds (A8), PLI progress (A9).
   Entries with a "fig" field read their value, unit, source and status from data.json figures, so they stay in sync. */
const Context = {
  init(D){
    const fig = id => D.figures.find(f => f.id === id);
    const esc = x => String(x).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const show = f => (typeof f.value === "number" ? f.value.toLocaleString("en-IN") : f.value) + (f.unit === "%" ? "%" : " " + f.unit);
    const row = (name, value, detail, status, extra = "") =>
      `<div class="ctx-row"><b>${esc(name)}</b><span class="v${/^Add /.test(value) ? " todo" : ""}">${esc(value)}</span><small>${esc(detail)}</small>${extra}<span class="tag ${status}">${status}</span></div>`;
    const fill = (id, html) => document.querySelector(`#${id} .ctx-body`).innerHTML = html;

    fill("ctxDeep", D.deeptech.map(e => {
      const f = e.fig ? fig(e.fig) : null;
      return row(e.name, f ? show(f) : e.value, f ? `${f.year}. ${f.source}. ${e.detail}` : e.detail, f ? f.status : e.status);
    }).join(""));

    fill("ctxTest", D.testbeds.map(e => row(e.name, e.full, e.area, e.status)).join(""));

    fill("ctxPli", D.pli.map(e => {
      const f = e.fig ? fig(e.fig) : null;
      let extra = "";
      if(f && e.target_fig){                                    // progress bar against the target
        const t = fig(e.target_fig), pct = f.value / t.value * 100;
        extra = `<div class="meter" role="img" aria-label="${pct.toFixed(1)}% of target"><i style="width:${Math.max(pct, 2)}%"></i></div><small>${f.value} of ${t.value} ${t.unit} (${pct.toFixed(1)}%)</small>`;
      }
      return row(e.name, f ? show(f) : e.value, f ? `${e.detail}. ${f.source}` : e.detail, f ? f.status : e.status, extra);
    }).join(""));
  }
};
