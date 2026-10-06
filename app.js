"use strict";
const VIEWS = ["overview","l1","l2","l34","calc","evidence","assumptions"];
let DATA = null, filter = "all";

function show(id){
  if(!VIEWS.includes(id)) id = "overview";
  VIEWS.forEach(v => document.getElementById(v).classList.toggle("on", v === id));
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("on", a.dataset.view === id));
  document.getElementById("nav").classList.remove("open");
  document.getElementById("menuBtn").setAttribute("aria-expanded","false");
  window.scrollTo({top:0, behavior:"instant"});
  if(id === "l1" && typeof L1 !== "undefined") L1.onShow();
  if(id === "l2" && typeof L2 !== "undefined") L2.onShow();
  if(id === "l34" && typeof L34 !== "undefined") L34.onShow();
  if(id === "calc" && typeof Calc !== "undefined") Calc.onShow();
  document.getElementById("kpiNote").hidden = !(id === "evidence" || id === "assumptions");   // frozen-state note
}
window.addEventListener("hashchange", () => show(location.hash.slice(1)));
document.getElementById("menuBtn").addEventListener("click", e => {
  const open = document.getElementById("nav").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});

const fig = id => DATA.figures.find(f => f.id === id);
const fmt = v => typeof v === "number" ? v.toLocaleString("en-IN") : v;

function renderKPIs(){
  const share = fig("nonfossil_share");
  document.getElementById("kpi-share").textContent = share.value + share.unit;
  // Placeholders until the generation model is built (Day 2-3)
  ["kpi-gap","kpi-co2","kpi-fossil"].forEach(id => document.getElementById(id).textContent = "–");
}

function renderFilters(){
  const box = document.getElementById("filters");
  box.innerHTML = "";
  ["all","verified","unconfirmed","illustrative"].forEach(s => {
    const b = document.createElement("button");
    b.textContent = s === "all" ? "All" : s;
    b.setAttribute("aria-pressed", s === filter);
    b.onclick = () => { filter = s; renderFilters(); renderTable(); };
    box.appendChild(b);
  });
}

function renderTable(){
  const tb = document.querySelector("#dataTable tbody");
  tb.innerHTML = "";
  DATA.figures.filter(f => filter === "all" || f.status === filter).forEach(f => {
    const tr = document.createElement("tr");
    [f.label, fmt(f.value) + " " + f.unit, f.year, f.source].forEach(t => {
      const td = document.createElement("td"); td.textContent = t; tr.appendChild(td);
    });
    const td = document.createElement("td"), s = document.createElement("span");
    s.className = "tag " + f.status; s.textContent = f.status; td.appendChild(s); tr.appendChild(td);
    tb.appendChild(tr);
  });
}

async function init(){
  show(location.hash.slice(1));
  try{
    const r = await fetch("data.json");
    if(!r.ok) throw new Error(r.status);
    DATA = await r.json();
    renderKPIs(); renderFilters(); renderTable();
    L1.init(DATA);
    L34.init(DATA);   // must come before L2: L2 reads the L3 settings
    L2.init(DATA);
    Calc.init(DATA); Assump.init(DATA); Evidence.init(DATA); Context.init(DATA);
    renderOverview(DATA);
    Share.init(DATA);          // snapshot defaults, then apply any scenario found in the URL
    paintRanges();
    if(DATA.meta.repo_url){ const rl = document.getElementById("repoLink"); rl.href = DATA.meta.repo_url; rl.hidden = false; }
    if(location.hash === "#l1") L1.onShow();
    if(location.hash === "#l2") L2.onShow();
  }catch(e){
    const el = document.getElementById("dataError");
    el.hidden = false;
    el.textContent = "Could not load data.json. If you opened index.html from a folder, run a local server (python -m http.server) or use the hosted URL.";
  }
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))
    navigator.serviceWorker.register("sw.js").catch(() => {});
}
init();

/* ---------- Polish helpers ---------- */
// Overview preset buttons: apply a preset in L2, then jump to the dispatch view.
function renderOverview(D){
  const box = document.getElementById("ovPresets");
  box.innerHTML = D.presets.map(p => `<button type="button" class="btn" data-preset="${p.id}">${p.label}</button>`).join("");
  box.addEventListener("click", e => {
    const b = e.target.closest("[data-preset]"); if(!b) return;
    L2.applyPresetId(b.dataset.preset); location.hash = "#l2";
  });
}
// Fill the coloured part of every range slider (CSS reads --pct).
function paintRanges(){
  document.querySelectorAll("input[type=range]").forEach(r => {
    const mn = +r.min, mx = +r.max;
    r.style.setProperty("--pct", (mx > mn ? (r.value - mn) / (mx - mn) * 100 : 0) + "%");
  });
}
["input","click","change"].forEach(ev => document.addEventListener(ev, () => setTimeout(paintRanges, 0)));
// Keep the sticky KPI row directly under the header, whatever height the header has.
(function(){
  const hd = document.querySelector(".top");
  const set = () => document.documentElement.style.setProperty("--nav-h", hd.offsetHeight + "px");
  set(); window.addEventListener("resize", set);
  if(window.ResizeObserver) new ResizeObserver(set).observe(hd);
})();
