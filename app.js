"use strict";
const VIEWS = ["overview","l1","l2","l34","calc","evidence","assumptions"];
let DATA = null, filter = "all";

function show(id){
  if(!VIEWS.includes(id)) id = "overview";
  VIEWS.forEach(v => document.getElementById(v).classList.toggle("on", v === id));
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("on", a.dataset.view === id));
  document.getElementById("nav").classList.remove("open");
  document.getElementById("menuBtn").setAttribute("aria-expanded","false");
  window.scrollTo(0,0);
  if(id === "l1" && window.L1) L1.onShow();
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
    if(location.hash === "#l1") L1.onShow();
  }catch(e){
    const el = document.getElementById("dataError");
    el.hidden = false;
    el.textContent = "Could not load data.json. If you opened index.html from a folder, run a local server (python -m http.server) or use the hosted URL.";
  }
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))
    navigator.serviceWorker.register("sw.js").catch(() => {});
}
init();