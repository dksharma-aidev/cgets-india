"use strict";
/* L2 Conversion & Storage panel: controls, dispatch chart, outputs, KPI header.
   The maths lives in dispatch.js; solar and wind totals come from the L1 panel. */
const L2 = (() => {
  // id points at the data.json entry that supplies the default value.
  const CTRL = [
    {key:"bess", name:"BESS capacity",         unit:"GWh", min:0,   max:400, step:0.1, id:"l2_bess_gwh",         color:"#2f6fb0"},
    {key:"psh",  name:"Pumped-hydro capacity", unit:"GW",  min:0,   max:60,  step:0.1, id:"psh_operational",     color:"#6a5bb5"},
    {key:"el",   name:"Electrolyser capacity", unit:"GW",  min:0,   max:60,  step:0.5, id:"l2_electrolyser_gw",  color:"#4fb3c8"},
    {key:"peak", name:"Peak demand",           unit:"GW",  min:150, max:450, step:5,   id:"l2_peak_demand_gw",   color:"#16241f"}
  ];
  let D, chart, bench, ready = false, state = {}, lastRes = null;
  const listeners = [];                     // L3/L4 panel subscribes to results
  const $ = id => document.getElementById(id);
  const fig = id => D.figures.find(f => f.id === id);
  const val = id => fig(id).value;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const n0 = v => v.toLocaleString("en-IN", {maximumFractionDigits: 0});
  const n1 = v => v.toLocaleString("en-IN", {maximumFractionDigits: 1});

  function defaults(){
    state = {on: true};
    CTRL.forEach(c => state[c.key] = val(c.id));
  }

  function buildControls(){
    $("l2Presets").innerHTML = D.presets.map(p => `<button type="button" class="btn" data-preset="${p.id}" title="${esc(p.source)}">${esc(p.label)}</button>`).join("");
    $("l2Presets").addEventListener("click", e => {
      const b = e.target.closest("[data-preset]"); if(b) applyPreset(D.presets.find(p => p.id === b.dataset.preset));
    });
    $("l2Controls").innerHTML = CTRL.map(c => {
      const st = fig(c.id).status;
      return `<div class="tech" style="--c:${c.color}">
        <div class="t-head"><b>${esc(c.name)}</b><span class="tag sm ${st}" title="${esc(fig(c.id).source)}">${st}</span></div>
        <input type="range" id="l2r-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" aria-label="${esc(c.name)} in ${c.unit}">
        <div class="t-row"><label>${c.unit} <input type="number" id="l2n-${c.key}" min="${c.min}" step="${c.step}"></label></div></div>`;
    }).join("");
    CTRL.forEach(c => {
      const r = $("l2r-"+c.key), n = $("l2n-"+c.key);
      r.addEventListener("input", () => { state[c.key] = +r.value; n.value = r.value; update(); });
      n.addEventListener("input", () => { state[c.key] = Math.max(c.min, +n.value || 0); r.value = state[c.key]; update(); });
    });
    $("l2Storage").addEventListener("change", e => { state.on = e.target.checked; update(); });
  }

  function syncInputs(){
    CTRL.forEach(c => { $("l2r-"+c.key).value = state[c.key]; $("l2n-"+c.key).value = state[c.key]; });
    $("l2Storage").checked = state.on;
  }

  function applyPreset(p){
    state.bess = p.bess_gwh; state.psh = p.psh_gw; state.on = p.storage_on;
    syncInputs();
    L1.setTotals(p.solar_gw, p.wind_gw);      // this also triggers update() through the L1 listener
    update();
  }

  const params = () => {
    const t = L1.getTotals();
    const l3 = (typeof L34 !== "undefined" && L34.ready) ? L34.getParams() : {};   // AMI, forecast error, V2G
    return {...l3, solarGW:t.solar, windGW:t.wind, otherGW:val("l2_other_nonfossil_gw"), otherCF:val("l2_other_nonfossil_cf") / 100,
      peakGW:state.peak, peakToAvg:val("l2_peak_to_avg"), bessGWh:state.bess, bessHours:val("l2_bess_hours"),
      pshGW:state.psh, pshHours:val("l2_psh_hours"), storageOn:state.on, rte:val("l2_rte") / 100,
      electrolyserGW:state.el, kWhPerKg:val("l2_h2_kwh_per_kg"), ef:val("l2_ef")};
  };

  function buildCharts(){
    if(!window.Chart){ ["l2Chart","l2Bench"].forEach(i => $(i).parentElement.textContent = "Chart library not loaded. Connect once to the internet or add lib/chart.umd.min.js."); return; }
    const labels = Array.from({length:24}, (_, t) => String(t).padStart(2, "0") + ":00");
    const bar = (label, color, key, sign = 1) => ({label, color, key, sign});
    // Above zero: supply + fossil gap. Below zero: where surplus goes. Both sides sum to demand + surplus uses.
    const spec = [bar("Solar","#e0a21b","solar"), bar("Wind","#1f8a70","wind"), bar("Other non-fossil","#8a9a91","other"),
      bar("Storage discharge","#2f6fb0","discharge"), bar("Fossil gap","#b3541e","fossil"),
      bar("Storage charge","#7fb2e0","charge",-1), bar("Electrolyser","#4fb3c8","el",-1), bar("Curtailed","#c9c9c9","curt",-1)];
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#16241f";
    chart = new Chart($("l2Chart"), {
      data:{labels, datasets:[
        {type:"line", label:"Demand", data:[], borderColor:ink, backgroundColor:ink, borderWidth:2.5, pointRadius:0, tension:.3, order:0},
        ...spec.map(s => ({type:"bar", label:s.label, data:[], backgroundColor:s.color, stack:"s", order:1, _key:s.key, _sign:s.sign}))]},
      options:{responsive:true, maintainAspectRatio:false, interaction:{mode:"index", intersect:false},
        scales:{x:{stacked:true, ticks:{maxTicksLimit:12}}, y:{stacked:true, title:{display:true, text:"Power (GW)"}}},
        plugins:{legend:{position:"bottom", labels:{boxWidth:12}},
          tooltip:{callbacks:{label:c => Math.abs(c.parsed.y) < 0.05 ? null : `${c.dataset.label}: ${n1(Math.abs(c.parsed.y))} GW`}}}}
    });
    bench = new Chart($("l2Bench"), {
      type:"bar",
      data:{labels:["BESS energy (GWh)","BESS power (GW)"], datasets:[
        {label:"Modelled", data:[0,0], backgroundColor:"#2f6fb0"},
        {label:"CEA 2032 outlook", data:[val("bess_outlook_energy"), val("bess_outlook_power")], backgroundColor:"#9aa59f"}]},
      options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:"bottom", labels:{boxWidth:12}}},
        scales:{y:{beginAtZero:true}}}
    });
  }

  function update(){
    const t = L1.getTotals(), r = Dispatch.run(params()), T = r.totals;
    $("l2FromL1").textContent = `Solar ${n1(t.solar)} GW and wind ${n1(t.wind)} GW come from the L1 panel.`;
    const share = (T.share * 100).toFixed(1) + "%";
    $("c-share").textContent = share;
    $("c-fossil").textContent = n0(T.fossil);
    $("c-co2").textContent = n0(T.co2Mt);
    $("c-curt").textContent = n0(T.curtailed);
    $("c-h2").textContent = T.h2kt.toFixed(2);
    $("c-pow").textContent = `${n1(T.peakCharge)} / ${n1(T.peakDischarge)}`;
    // KPI header
    $("kpi-share").textContent = share;
    $("kpi-fossil").textContent = n0(T.fossil);
    $("kpi-co2").textContent = n0(T.co2Mt) + " Mt/yr";
    $("kpi-curt").textContent = n0(T.curtailed);
    $("kpi-h2").textContent = state.el > 0 ? T.h2kt.toFixed(2) : "–";
    if(chart){
      chart.data.datasets[0].data = r.hours.map(h => h.demand);
      chart.data.datasets.slice(1).forEach(ds => { ds.data = r.hours.map(h => ds._sign * h[ds._key]); });
      chart.update("none");
    }
    const bessMW = state.on ? state.bess : 0, bessP = state.on ? state.bess / val("l2_bess_hours") : 0;
    if(bench){ bench.data.datasets[0].data = [bessMW, bessP]; bench.update("none"); }
    $("l2BenchNote").textContent = `Modelled BESS: ${n1(bessMW)} GWh / ${n1(bessP)} GW (storage ${state.on ? "on" : "off"}). CEA 2032 outlook: ${val("bess_outlook_energy")} GWh / ${val("bess_outlook_power")} GW. Pumped hydro is modelled separately and not shown here.`;
    lastRes = r; listeners.forEach(f => f(r));
  }

  return {
    params, refresh: () => update(), last: () => lastRes, onChange(f){ listeners.push(f); },
    init(data){
      D = data; defaults(); buildControls(); syncInputs(); buildCharts();
      L1.onChange(update);                    // recalculate whenever L1 capacities change
      update(); ready = true;
    },
    onShow(){ if(ready){ if(chart) chart.resize(); if(bench) bench.resize(); } }
  };
})();
