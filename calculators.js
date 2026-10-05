"use strict";
/* Calculators panel (rooftop solar, V2G potential, storage firming) and the policy timeline.
   CalcMath holds the pure formulas so they can be read and tested without the page. */
const CalcMath = {
  // Rooftop solar. p: kw, psh (h/day), pr, tariff, costPerKw, sub1, sub3, cap, ef (kg CO2 per kWh)
  rooftop(p){
    const annual = p.kw * p.psh * 365 * p.pr;                                   // kWh per year
    const sub = Math.min(p.cap, p.sub1 * Math.min(p.kw, 2) + p.sub3 * Math.min(Math.max(p.kw - 2, 0), 1));
    const net = p.kw * p.costPerKw - sub;
    const savings = annual * p.tariff;
    return {annual, sub, net, savings, payback: savings > 0 ? net / savings : Infinity, co2kg: annual * p.ef};
  },
  // V2G. EVs x kWh x available x DoD / 1000 gives MWh; power is that energy spread over the evening window.
  v2g(p){
    const eMWh = p.evs * p.kwh * (p.availPct / 100) * (p.dodPct / 100) / 1000;
    return {eMWh, pMW: eMWh / p.windowH, pilotMW: p.evs * p.pilotMWPerEv};
  },
  // Firming: BESS power scales with variable-renewable capacity and the target share (linear, illustrative).
  firming(p){
    const gw = p.refGW * ((p.solarPct + p.windPct) / 100) * (p.targetPct / 100) * p.factor;
    return {gw, gwh: gw * p.hours};
  }
};
if(typeof module !== "undefined") module.exports = CalcMath;

const Calc = (() => {
  const SL = {
    c1:[{key:"kw",    name:"System size",          unit:"kW",      min:1,   max:10,     step:0.5,  id:"calc_rooftop_kw"},
        {key:"psh",   name:"Peak sun hours",       unit:"h/day",   min:3.5, max:6,      step:0.1,  id:"calc_rooftop_psh"},
        {key:"pr",    name:"Performance ratio",    unit:"",        min:0.6, max:0.9,    step:0.01, id:"calc_rooftop_pr"},
        {key:"tariff",name:"Consumer tariff",      unit:"₹/kWh",   min:4,   max:12,     step:0.5,  id:"calc_rooftop_tariff"}],
    c2:[{key:"evs",   name:"V2G-enabled EVs",      unit:"vehicles",min:100, max:100000, step:100,  id:"v2g_pilot_evs"},
        {key:"kwh",   name:"Average battery",      unit:"kWh",     min:20,  max:100,    step:1,    id:"l3_v2g_battery_kwh"},
        {key:"avail", name:"Available at peak",    unit:"%",       min:10,  max:100,    step:5,    id:"l3_v2g_available_pct"},
        {key:"dod",   name:"Depth of discharge",   unit:"%",       min:10,  max:50,     step:1,    id:"l3_v2g_dod_pct"}],
    c3:[{key:"solar", name:"Solar share of installed capacity", unit:"%", min:10, max:50, step:1, id:"calc_firm_solar_pct"},
        {key:"wind",  name:"Wind share of installed capacity",  unit:"%", min:10, max:50, step:1, id:"calc_firm_wind_pct"},
        {key:"target",name:"Target non-fossil share",           unit:"%", min:40, max:90, step:1, id:"calc_firm_target_pct"}]};
  const COLORS = {c1:"#e0a21b", c2:"#2f6fb0", c3:"#1f8a70"};
  let D, S = {}, chart, ready = false;
  const $ = id => document.getElementById(id);
  const fig = id => D.figures.find(f => f.id === id);
  const val = id => fig(id).value;
  const esc = x => String(x).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const f = (v, d = 0) => v.toLocaleString("en-IN", {maximumFractionDigits: d});

  function buildSliders(k){
    S[k] = {};
    $(k + "Controls").innerHTML = SL[k].map(c => {
      S[k][c.key] = val(c.id);
      return `<div class="tech" style="--c:${COLORS[k]}">
        <div class="t-head"><b>${esc(c.name)}</b><span class="tag sm ${fig(c.id).status}" title="${esc(fig(c.id).source)}">${fig(c.id).status}</span></div>
        <input type="range" id="${k}r-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${S[k][c.key]}" aria-label="${esc(c.name)}">
        <div class="t-row"><label>${c.unit} <input type="number" id="${k}n-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${S[k][c.key]}"></label></div></div>`;
    }).join("");
    SL[k].forEach(c => {
      const r = $(`${k}r-${c.key}`), n = $(`${k}n-${c.key}`);
      r.addEventListener("input", () => { S[k][c.key] = +r.value; n.value = r.value; render(k); });
      n.addEventListener("input", () => {
        S[k][c.key] = Math.min(c.max, Math.max(c.min, +n.value || c.min)); r.value = S[k][c.key]; render(k); });
    });
  }

  function render(k){
    if(k === "c1"){
      const s = S.c1, o = CalcMath.rooftop({kw:s.kw, psh:s.psh, pr:s.pr, tariff:s.tariff, costPerKw:val("rooftop_cost_per_kw"),
        sub1:val("pm_surya_ghar_subsidy_per_kw"), sub3:val("pm_surya_ghar_subsidy_third_kw"), cap:val("pm_surya_ghar_subsidy_cap"), ef:val("cea_emission_factor")});
      $("c1-annual").textContent = f(o.annual);
      $("c1-sub").textContent = "₹" + f(o.sub);
      $("c1-net").textContent = "₹" + f(o.net);
      $("c1-save").textContent = "₹" + f(o.savings);
      $("c1-pay").textContent = isFinite(o.payback) ? f(o.payback, 1) : "–";
      $("c1-co2").textContent = f(o.co2kg);
      if(chart){ chart.data.datasets[0].data = [o.sub, Math.max(0, o.net)]; chart.update("none"); }
    } else if(k === "c2"){
      const s = S.c2, o = CalcMath.v2g({evs:s.evs, kwh:s.kwh, availPct:s.avail, dodPct:s.dod, windowH:val("l3_v2g_window_h"),
        pilotMWPerEv:val("v2g_pilot_power") / val("v2g_pilot_evs")});
      $("c2-e").textContent = f(o.eMWh, 1);
      $("c2-p").textContent = f(o.pMW, 2);
      $("c2-pilot").textContent = f(o.pilotMW, 1);
    } else {
      const s = S.c3, o = CalcMath.firming({refGW:val("calc_firm_ref_gw"), solarPct:s.solar, windPct:s.wind, targetPct:s.target,
        factor:val("calc_firm_factor"), hours:val("l2_bess_hours")});
      const cG = val("bess_outlook_power"), cE = val("bess_outlook_energy");
      $("c3-gw").textContent = f(o.gw, 1);
      $("c3-gwh").textContent = f(o.gwh, 0);
      $("m-gw").style.width = Math.min(100, o.gw / cG * 100) + "%";
      $("m-gwh").style.width = Math.min(100, o.gwh / cE * 100) + "%";
      $("m-gw-t").textContent = `${f(o.gw / cG * 100)}% of ${cG}`;
      $("m-gwh-t").textContent = `${f(o.gwh / cE * 100)}% of ${cE}`;
      $("c3Note").textContent = `CEA NEP-2023 projects ~${cG} GW / ${cE} GWh of BESS by 2032. Model: ${val("calc_firm_ref_gw")} GW reference capacity × (solar + wind share) × target share × ${val("calc_firm_factor")}. The factor is an illustrative calibration, so treat the result as an order of magnitude.`;
    }
  }

  function buildChart(){
    if(!window.Chart){ $("c1Chart").parentElement.textContent = "Chart library not loaded. Connect once to the internet or add lib/chart.umd.min.js."; return; }
    chart = new Chart($("c1Chart"), {type:"doughnut",
      data:{labels:["PM Surya Ghar subsidy","Net cost to household"], datasets:[{data:[0,0], backgroundColor:["#1f8a70","#e0a21b"], borderWidth:1}]},
      options:{responsive:true, maintainAspectRatio:false, cutout:"55%",
        plugins:{title:{display:true, text:"Capital cost split"}, legend:{position:"right", labels:{boxWidth:12}},
                 tooltip:{callbacks:{label:c => `${c.label}: ₹${f(c.parsed)}`}}}}});
  }

  function buildTimeline(){
    $("timeline").innerHTML = D.timeline.map(t => `<li><span class="yr">${t.year}</span><b>${esc(t.name)}</b><p>${esc(t.text)}</p><span class="tag sm ${t.status}">${t.status}</span></li>`).join("");
    const tl = $("timeline"), step = () => Math.max(240, tl.clientWidth * 0.8);
    $("tlPrev").addEventListener("click", () => tl.scrollBy({left:-step(), behavior:"smooth"}));
    $("tlNext").addEventListener("click", () => tl.scrollBy({left: step(), behavior:"smooth"}));
  }

  return {
    init(data){
      D = data; ["c1","c2","c3"].forEach(buildSliders); buildChart(); buildTimeline();
      ["c1","c2","c3"].forEach(render); ready = true;
    },
    onShow(){ if(ready && chart) chart.resize(); }
  };
})();