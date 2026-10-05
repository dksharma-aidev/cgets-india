"use strict";
/* L3 Grid Intelligence + L4 End-use panels.
   L3 settings are passed to the dispatch engine through L2 (see getParams). L4 is a set of simple, transparent
   fuel-saving calculators. Every default comes from data.json. */
const L34 = (() => {
  const L3_SLIDERS = [
    {key:"ami", name:"AMI / smart-meter coverage", unit:"%", min:0, max:100, step:1, id:"ami_coverage", color:"#6a5bb5"},
    {key:"err", name:"Forecast error",             unit:"%", min:0, max:20,  step:1, id:"forecast_error", color:"#6a5bb5"}];
  const V2G_INPUTS = [
    {key:"evs",   label:"V2G-enabled EVs", id:"v2g_pilot_evs",       step:1000},
    {key:"kwh",   label:"Battery (kWh)",   id:"l3_v2g_battery_kwh",  step:1},
    {key:"avail", label:"Available at peak (%)", id:"l3_v2g_available_pct", step:5},
    {key:"dod",   label:"Depth of discharge (%)", id:"l3_v2g_dod_pct",  step:1}];
  const L4_SLIDERS = [
    {key:"ecook",  name:"Households with e-cooking", unit:"million", min:0, max:60,     step:0.5, id:"l4_ecooking_hh_m",  color:"#1f8a70"},
    {key:"ebus",   name:"Electric buses",            unit:"buses",   min:0, max:100000, step:500, id:"l4_ebuses",         color:"#2f6fb0"},
    {key:"etruck", name:"Electric trucks",           unit:"trucks",  min:0, max:100000, step:500, id:"l4_etrucks",        color:"#4fb3c8"},
    {key:"h2",     name:"Green hydrogen offtake",    unit:"kt/day",  min:0, max:50,     step:0.1, id:"l4_h2_offtake_ktd", color:"#e0a21b"}];
  const EV_MIX = [
    {id:"ev_share_2w",  name:"2-wheelers",        color:"#1f8a70"},
    {id:"ev_share_lmd", name:"LMD / goods",       color:"#e0a21b"},
    {id:"ev_share_3w",  name:"3-wheelers",        color:"#2f6fb0"},
    {id:"ev_share_4w",  name:"Passenger 4-wheelers", color:"#6a5bb5"},
    {id:"ev_share_bus", name:"Buses",             color:"#b3541e"}];
  let D, donut, ready = false, s = {}, mix = [], lastRes = null;
  const $ = id => document.getElementById(id);
  const fig = id => D.figures.find(f => f.id === id);
  const val = id => fig(id).value;
  const esc = x => String(x).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt = (v, d = 0) => v.toLocaleString("en-IN", {maximumFractionDigits: d});

  function defaults(){
    s = {v2gOn:false};
    [...L3_SLIDERS, ...L4_SLIDERS].forEach(c => s[c.key] = val(c.id));
    V2G_INPUTS.forEach(c => s[c.key] = val(c.id));
    mix = EV_MIX.map(m => val(m.id));
  }

  const sliderHTML = c => `<div class="tech" style="--c:${c.color}">
      <div class="t-head"><b>${esc(c.name)}</b><span class="tag sm ${fig(c.id).status}" title="${esc(fig(c.id).source)}">${fig(c.id).status}</span></div>
      <input type="range" id="r-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" aria-label="${esc(c.name)} in ${c.unit}">
      <div class="t-row"><label>${c.unit} <input type="number" id="n-${c.key}" min="${c.min}" step="${c.step}"></label></div></div>`;

  // Wires a slider + number box pair to s[key]; onChange runs after every edit.
  function bindSlider(c, onChange){
    const r = $("r-" + c.key), n = $("n-" + c.key);
    r.value = n.value = s[c.key];
    r.addEventListener("input", () => { s[c.key] = +r.value; n.value = r.value; onChange(); });
    n.addEventListener("input", () => { s[c.key] = Math.max(c.min, +n.value || 0); r.value = s[c.key]; onChange(); });
  }

  const l3Changed = () => L2.refresh();          // L2 re-runs the dispatch with the new L3 settings, then calls render()
  const l4Changed = () => render(lastRes);

  function build(){
    $("l3Controls").innerHTML = L3_SLIDERS.map(sliderHTML).join("");
    L3_SLIDERS.forEach(c => bindSlider(c, l3Changed));
    $("l3V2gInputs").className = "v2g";
    $("l3V2gInputs").innerHTML = V2G_INPUTS.map(c => `<label>${c.label}<input type="number" id="v-${c.key}" min="0" step="${c.step}" value="${s[c.key]}"></label>`).join("");
    V2G_INPUTS.forEach(c => $("v-" + c.key).addEventListener("input", e => { s[c.key] = Math.max(0, +e.target.value || 0); l3Changed(); }));
    $("l3V2g").addEventListener("change", e => { s.v2gOn = e.target.checked; l3Changed(); });

    $("l4Controls").innerHTML = L4_SLIDERS.map(sliderHTML).join("");
    L4_SLIDERS.forEach(c => bindSlider(c, l4Changed));
    $("l4UseH2").addEventListener("click", () => {
      const h = lastRes ? Math.round(lastRes.totals.h2kt * 100) / 100 : 0;
      s.h2 = h; $("r-h2").value = $("n-h2").value = h; l4Changed();
    });

    $("l4Mix").innerHTML = EV_MIX.map((m, i) => `<label>${m.name} (%)<input type="number" id="mx-${i}" min="0" step="0.1" value="${mix[i]}"></label>`).join("");
    EV_MIX.forEach((m, i) => $("mx-" + i).addEventListener("input", e => { mix[i] = Math.max(0, +e.target.value || 0); drawDonut(); }));
  }

  function buildDonut(){
    if(!window.Chart){ $("l4Donut").parentElement.textContent = "Chart library not loaded. Connect once to the internet or add lib/chart.umd.min.js."; return; }
    donut = new Chart($("l4Donut"), {
      type:"doughnut",
      data:{labels:[], datasets:[{data:[], backgroundColor:EV_MIX.map(m => m.color), borderWidth:1}]},
      options:{responsive:true, maintainAspectRatio:false, cutout:"55%",
        plugins:{title:{display:true, text:`FY25 EV Sales Mix (${fmt(val("ev_sales_fy25"))} units)`},
                 legend:{position:"bottom", labels:{boxWidth:12}},
                 tooltip:{callbacks:{label:c => `${c.label.split(" (")[0]}: ${c.parsed}%`}}}}
    });
  }

  function drawDonut(){
    const total = mix.reduce((a, b) => a + b, 0);
    $("l4MixNote").textContent = `Shares add up to ${fmt(total, 1)}%. Edit them to test a different mix; the chart shows relative shares.`;
    if(!donut) return;
    donut.data.labels = EV_MIX.map((m, i) => `${m.name} (${mix[i]}%)`);
    donut.data.datasets[0].data = mix;
    donut.update("none");
  }

  /* ---------- L3 ---------- */
  // V2G flexible energy follows the brief's formula: EVs x kWh x available% x DoD / 1000 (gives MWh).
  function v2gEnergyMWh(){ return s.evs * s.kwh * (s.avail / 100) * (s.dod / 100) / 1000; }

  function getParams(){
    const eGWh = v2gEnergyMWh() / 1000, pGW = eGWh / val("l3_v2g_window_h");   // power = energy spread over the 4 h evening window
    return {amiPct:s.ami, forecastErrPct:s.err,
      amiPeakCutPerPct:val("l3_ami_peak_cut_per_10pct") / 1000,                // 0.5% per 10% AMI -> 0.0005 per 1%
      forecastPenaltyPerPct:val("l3_forecast_penalty_per_10pct") / 1000,       // 5% per 10% error -> 0.005 per 1%
      v2gEnergyGWh:s.v2gOn ? eGWh : 0, v2gPowerGW:s.v2gOn ? pGW : 0, v2gFrom:18, v2gTo:21};
  }

  function renderL3(r){
    const p = L2.params(), eMWh = v2gEnergyMWh();
    const noAmiV2g = Dispatch.run({...p, amiPct:0, v2gEnergyGWh:0, v2gPowerGW:0}).totals.fossil;   // same forecast error
    const noErr = Dispatch.run({...p, forecastErrPct:0}).totals.fossil;                              // same AMI and V2G
    $("o-peak").textContent = fmt(r.totals.peakEffective, 1);
    $("o-v2gE").textContent = fmt(eMWh, 1);
    $("o-v2gP").textContent = fmt(eMWh / val("l3_v2g_window_h"), 2);
    $("o-cut").textContent = fmt(noAmiV2g - r.totals.fossil, 1);
    $("o-add").textContent = fmt(r.totals.fossil - noErr, 1);
    $("l3Note").textContent = `Peak is cut by ${fmt(p.amiPct * p.amiPeakCutPerPct * 100, 2)}% at ${s.ami}% AMI. Forecast error of ${s.err}% adds ${fmt(p.forecastErrPct * p.forecastPenaltyPerPct * 100, 1)}% to the fossil gap. V2G is ${s.v2gOn ? "on and dispatched in the 18:00-21:59 window" : "off, so the figures above show what is available, not what is dispatched"}. Power = energy over the 4 h window; the ISGF pilot's 5 MW refers to connected charger power, a different quantity.`;
  }

  /* ---------- L4 ---------- */
  function renderL4(r){
    const dieselL = s.ebus * val("l4_bus_km") * val("l4_bus_l_per_km") + s.etruck * val("l4_truck_km") * val("l4_truck_l_per_km");
    const cylM = s.ecook * val("l4_lpg_cyl_per_hh");                                  // million households x cylinders each = million cylinders
    const co2Cook = s.ecook * val("l4_ecooking_co2_t_per_hh");                        // million households x t = Mt
    const co2Diesel = dieselL * val("l4_diesel_kgco2_per_l") / 1e9;                   // litres x kg/L / 1e9 = Mt
    const gasMm3 = s.h2 * 365 * val("l4_h2_ng_m3_per_kg");                            // kt/day x 365 x 1e6 kg x m3/kg / 1e6 = million m3
    const co2H2 = s.h2 * 365 * val("l4_h2_co2_kg_per_kg") / 1000;                     // kt x kg/kg = kt CO2; /1000 = Mt
    const co2 = co2Cook + co2Diesel + co2H2;
    const gwhYear = (dieselL * val("l4_diesel_kwh_per_l") + cylM * 1e6 * val("l4_lpg_kwh_per_cyl") + gasMm3 * 1e6 * val("l4_ng_kwh_per_m3")) / 1e6;
    $("s-co2").textContent = fmt(co2, 2);
    $("s-diesel").textContent = fmt(dieselL / 1e6, 1);
    $("s-lpg").textContent = fmt(cylM, 1);
    $("s-gas").textContent = s.h2 > 0 ? fmt(gasMm3, 0) : "–";
    $("s-en").textContent = fmt(gwhYear / 365, 1);
    const prod = r.totals.h2kt;
    $("l4H2Note").textContent = `Hydrogen is produced in L2 by the electrolyser: ${fmt(prod, 2)} kt/day at present.` +
      (s.h2 > prod + 1e-6 ? " Offtake is above L2 production; raise the L2 electrolyser or lower the offtake." : "");
    // Global KPI header: power-sector CO2 from L2 plus L4 fuel savings
    $("kpi-co2").textContent = fmt(r.totals.co2Mt + co2, 0) + " Mt/yr";
  }

  function render(r){
    if(!r) return;
    lastRes = r; renderL3(r); renderL4(r);
  }

  return {
    get ready(){ return ready; },
    getParams,
    init(data){
      D = data; defaults(); build(); buildDonut(); drawDonut();
      L2.onChange(render);                    // every L2 result also refreshes L3 and L4 outputs
      ready = true;
    },
    onShow(){ if(donut) donut.resize(); }
  };
})();
