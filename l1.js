"use strict";
/* L1 Generation panel: sliders, annual generation, capacity chart, India map.
   All defaults are read from data.json (never hard-coded here), so edits to the data file flow through. */
const L1 = (() => {
  const HOURS = 8760;                       // hours per year
  // capId / cfId point at data.json entries. scale converts the stored unit to GW (MW -> 0.001).
  const TECHS = [
    {key:"solar_utility", name:"Utility-scale solar PV", color:"#F59E0B", max:500, step:1,      capId:"solar_pv_capacity",           scale:1,     cfId:"l1_cf_solar_utility"},
    {key:"rooftop",       name:"Rooftop solar",          color:"#FCD34D", max:100, step:0.5,    capId:"l1_rooftop_gw",               scale:1,     cfId:"l1_cf_rooftop"},
    {key:"floating",      name:"Floating solar",         color:"#0284C7", max:20,  step:0.001,  capId:"floating_solar_commissioned", scale:0.001, cfId:"l1_cf_floating"},
    {key:"agri",          name:"Agrivoltaics",           color:"#84CC16", max:5,   step:0.0001, capId:"agrivoltaic_pilot",           scale:0.001, cfId:"l1_cf_agri"},
    {key:"onshore_wind",  name:"Onshore wind",           color:"#10B981", max:250, step:0.5,    capId:"wind_capacity",               scale:1,     cfId:"l1_cf_onshore_wind"},
    {key:"offshore_wind", name:"Offshore wind",          color:"#06B6D4", max:100, step:0.5,    capId:"l1_offshore_wind_gw",         scale:1,     cfId:"l1_cf_offshore_wind"},
    {key:"hydro",         name:"Hydro",                  color:"#6366F1", max:100, step:0.5,    capId:"l1_hydro_gw",                 scale:1,     cfId:"l1_cf_hydro"},
    {key:"biomass",       name:"Biomass / bagasse",      color:"#B45309", max:30,  step:0.1,    capId:"biomass_capacity",            scale:1,     cfId:"l1_cf_biomass"}
  ];
  const PIN_COLOR = {solar:"#F59E0B", floating:"#0284C7", agri:"#84CC16", h2:"#10B981"};
  const listeners = [];                     // other panels (L2) subscribe to capacity changes
  let D, chart, map, mapReady = false, ready = false;
  const state = {};                         // key -> {cap (GW), cf (%)}

  const fig = id => D.figures.find(f => f.id === id);
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmtGW  = v => v.toLocaleString("en-IN", {maximumFractionDigits: v >= 1 ? 2 : 4});
  const fmtGWh = v => v.toLocaleString("en-IN", {maximumFractionDigits: v < 100 ? 1 : 0});

  function defaults(){
    TECHS.forEach(t => { state[t.key] = {cap: +(fig(t.capId).value * t.scale).toFixed(6), cf: fig(t.cfId).value}; });
  }

  function buildControls(){
    $("l1Controls").innerHTML = TECHS.map(t => {
      const cs = fig(t.capId).status, fs = fig(t.cfId).status;
      return `<div class="tech" style="--c:${t.color}">
        <div class="t-head"><b>${esc(t.name)}</b>
          <span><span class="tag sm ${cs}" title="Capacity source: ${esc(fig(t.capId).source)}">GW ${cs}</span><span class="tag sm ${fs}" title="${esc(fig(t.cfId).source)}">CF ${fs}</span></span></div>
        <input type="range" id="rng-${t.key}" min="0" max="${t.max}" step="${t.step}" aria-label="${esc(t.name)} capacity in GW">
        <div class="t-row">
          <label>GW <input type="number" id="cap-${t.key}" min="0" step="${t.step}"></label>
          <label>CF % <input type="number" id="cf-${t.key}" min="0" max="100" step="1"></label>
          <span class="t-out" id="out-${t.key}">–</span>
        </div></div>`;
    }).join("");
    TECHS.forEach(t => {
      const rng = $("rng-"+t.key), cap = $("cap-"+t.key), cf = $("cf-"+t.key);
      rng.addEventListener("input", () => { state[t.key].cap = +rng.value; cap.value = rng.value; update(); });
      cap.addEventListener("input", () => { state[t.key].cap = Math.max(0, +cap.value || 0); rng.value = state[t.key].cap; update(); });
      cf.addEventListener("input",  () => { state[t.key].cf = Math.min(100, Math.max(0, +cf.value || 0)); update(); });
    });
  }

  function syncInputs(){
    TECHS.forEach(t => {
      $("rng-"+t.key).value = state[t.key].cap;
      $("cap-"+t.key).value = state[t.key].cap;
      $("cf-"+t.key).value  = state[t.key].cf;
    });
  }

  function buildChart(){
    if(!window.Chart){ $("l1Chart").parentElement.textContent = "Chart library not loaded. Connect once to the internet or add lib/chart.umd.min.js."; return; }
    const target = fig("target_nonfossil_2030").value;
    const ds = TECHS.map(t => ({label:t.name, data:[0,0], backgroundColor:t.color, stack:"s"}));
    ds.push({label:`2030 target (${target} GW)`, data:[0,target], backgroundColor:"#94A3B8", stack:"s"});
    chart = new Chart($("l1Chart"), {
      type:"bar",
      data:{labels:["Modelled L1 mix","2030 target"], datasets:ds},
      options:{responsive:true, maintainAspectRatio:false,
        scales:{x:{stacked:true}, y:{stacked:true, beginAtZero:true, title:{display:true, text:"Installed capacity (GW)"}}},
        plugins:{legend:{position:"bottom", labels:{boxWidth:12}},
                 tooltip:{callbacks:{label:c => c.parsed.y ? `${c.dataset.label}: ${fmtGW(c.parsed.y)} GW` : null}}}}
    });
  }

  /* E (GWh/yr) = P (GW) x CF x 8760 */
  function update(){
    const target = fig("target_nonfossil_2030").value, ef = fig("l1_grid_emission_factor").value;
    let totalGW = 0, totalGWh = 0;
    TECHS.forEach((t, i) => {
      const {cap, cf} = state[t.key], e = cap * (cf / 100) * HOURS;
      totalGW += cap; totalGWh += e;
      $("out-"+t.key).textContent = fmtGWh(e) + " GWh/yr";
      if(chart) chart.data.datasets[i].data[0] = cap;
    });
    if(chart) chart.update("none");
    const gap = target - totalGW;
    $("l1Total").textContent = fmtGW(totalGW);
    $("l1Gap").textContent = fmtGW(Math.abs(gap));
    $("l1GapLab").textContent = gap > 0 ? `Gap to ${target} GW` : `Above ${target} GW target`;
    $("l1Gen").textContent = (totalGWh / 1000).toLocaleString("en-IN", {maximumFractionDigits: 1});
    // KPI header: gap and CO2 avoided (upper bound: all L1 output displaces grid-average fossil power)
    $("kpi-gap").textContent = gap > 0 ? fmtGW(gap) + " GW" : "Met";
    listeners.forEach(f => f());
  }

  function buildMap(){
    if(mapReady) return;
    if(!window.L){ $("l1Map").textContent = "Map library not loaded. Connect once to the internet or add lib/leaflet.js."; return; }
    map = L.map("l1Map", {scrollWheelZoom:false});
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom:12, attribution:"&copy; OpenStreetMap contributors"})
      .on("tileerror", () => { $("l1MapNote").textContent = "Map tiles unavailable offline. Pins still work."; }).addTo(map);
    const pts = [];
    D.projects.forEach(p => {
      const r = p.capacity_mw ? Math.min(16, 6 + Math.sqrt(p.capacity_mw) / 5) : 7;
      L.circleMarker([p.lat, p.lon], {radius:r, color:"#0F172A", weight:1, fillColor:PIN_COLOR[p.type] || "#888", fillOpacity:.85})
        .bindPopup(`<b>${esc(p.name)}</b><br>${p.capacity_mw ? esc(p.capacity_mw.toLocaleString("en-IN")) + " MW" : "Capacity not stated"}<br><small>${esc(p.status)} · ${esc(p.source)}</small>`)
        .addTo(map);
      pts.push([p.lat, p.lon]);
    });
    map.fitBounds(pts, {padding:[24,24]});
    mapReady = true;
  }

  return {
    get ready(){ return ready; },
    // Scenario sharing: flat key/value snapshot of capacities and capacity factors
    getState(){ const o = {}; TECHS.forEach(t => { o["cap_"+t.key] = state[t.key].cap; o["cf_"+t.key] = state[t.key].cf; }); return o; },
    setState(o){
      let changed = false;
      TECHS.forEach(t => {
        if(("cap_"+t.key) in o){ state[t.key].cap = o["cap_"+t.key]; changed = true; }
        if(("cf_"+t.key) in o){ state[t.key].cf = Math.min(100, o["cf_"+t.key]); changed = true; }
      });
      if(changed){ syncInputs(); update(); }
    },
    onChange(f){ listeners.push(f); },
    // Totals used by the L2 dispatch engine
    getTotals(){
      const s = k => state[k].cap;
      return {solar: s("solar_utility") + s("rooftop") + s("floating") + s("agri"), wind: s("onshore_wind") + s("offshore_wind")};
    },
    // Used by L2 presets: moves utility solar and onshore wind so the totals match; other technologies are left alone.
    setTotals(solar, wind){
      state.solar_utility.cap = Math.max(0, solar - (state.rooftop.cap + state.floating.cap + state.agri.cap));
      state.onshore_wind.cap  = Math.max(0, wind - state.offshore_wind.cap);
      syncInputs(); update();
    },
    init(data){
      D = data; defaults(); buildControls(); syncInputs(); buildChart(); update(); ready = true;
      $("l1Reset").addEventListener("click", () => { defaults(); syncInputs(); update(); });
    },
    // The map needs a visible container, so build it (or resize it) only when the view is shown.
    onShow(){
      if(!ready) return;
      buildMap();
      if(map) setTimeout(() => map.invalidateSize(), 50);
    }
  };
})();
