"use strict";
/* 24-hour dispatch engine. Pure maths: no DOM, so it can be read, tested and audited on its own.
   Units: power in GW, energy in GWh, time step = 1 hour (so GW and GWh per hour are numerically equal).
   L3 inputs (all optional): amiPct, forecastErrPct, and a V2G store (v2gEnergyGWh, v2gPowerGW). */
const Dispatch = (() => {

  /* Hourly profiles. All shapes are illustrative modelling assumptions (tagged in data.json). */
  function profiles(p){
    const solar = [], wind = [], other = [], demand = [];
    const avg = p.peakGW / p.peakToAvg;                       // average demand so that peak = peakToAvg x average
    for(let t = 0; t < 24; t++){
      solar.push(t >= 6 && t <= 18 ? p.solarGW * 0.75 * Math.sin(Math.PI * (t - 6) / 12) : 0);
      wind.push(p.windGW * (0.25 + 0.10 * Math.cos(2 * Math.PI * (t - 2) / 24)));
      other.push(p.otherGW * p.otherCF);
      demand.push(avg * (1 + (p.peakToAvg - 1) * Math.cos(2 * Math.PI * (t - 19.5) / 24))); // evening peak ~19:30
    }
    return {solar, wind, other, demand};
  }

  function run(p){
    // L3: smart-meter coverage trims the effective peak (the whole demand curve is scaled with it).
    const peak = p.peakGW * (1 - (p.amiPct || 0) * (p.amiPeakCutPerPct || 0));
    const pr = profiles({...p, peakGW: peak});
    const eta = Math.sqrt(p.rte);                             // one-way efficiency; eta x eta = round-trip
    const on = p.storageOn;
    // Stores are used in this order: BESS, pumped hydro, then V2G. SoC is energy held inside the store.
    const stores = [
      {cap: on ? p.bessGWh : 0,             pow: on ? p.bessGWh / p.bessHours : 0, soc: 0},
      {cap: on ? p.pshGW * p.pshHours : 0,  pow: on ? p.pshGW : 0,                 soc: 0}
    ];
    // V2G is its own store, independent of the storage switch. It may only discharge in the evening window.
    if(p.v2gEnergyGWh > 0 && p.v2gPowerGW > 0)
      stores.push({cap: p.v2gEnergyGWh, pow: p.v2gPowerGW, soc: 0, win: [p.v2gFrom ?? 18, p.v2gTo ?? 21]});
    const reservePerUnit = (p.forecastErrPct || 0) * (p.forecastPenaltyPerPct || 0);   // extra fossil backup per unit of gap
    let hours;
    // Three passes over the same day: the first two let stored energy carry over from "yesterday",
    // so the reported day starts with a realistic state of charge rather than empty stores.
    for(let pass = 0; pass < 3; pass++){
      hours = [];
      for(let t = 0; t < 24; t++){
        const gen = pr.solar[t] + pr.wind[t] + pr.other[t], d = pr.demand[t];
        let charge = 0, discharge = 0, el = 0, curt = 0, unserved = 0;
        if(gen > d){
          let s = gen - d;                                    // surplus
          for(const st of stores){
            const room = Math.max(0, (st.cap - st.soc) / eta);          // grid-side energy that still fits
            const inP = Math.max(0, Math.min(s, st.pow, room));
            st.soc += inP * eta; s -= inP; charge += inP;
          }
          el = Math.min(s, p.electrolyserGW); s -= el;        // leftover surplus makes hydrogen
          curt = s;                                           // anything still left is curtailed
        } else {
          let def = d - gen;                                  // deficit
          for(const st of stores){
            if(st.win && (t < st.win[0] || t > st.win[1])) continue;   // V2G only discharges in its window
            const out = Math.max(0, Math.min(def, st.pow, st.soc * eta)); // delivered energy
            st.soc -= out / eta; def -= out; discharge += out;
          }
          unserved = def;                                     // fossil gap before forecast-error reserve
        }
        const reserve = unserved * reservePerUnit;            // L3: poor forecasts mean extra fossil held in reserve
        hours.push({t, solar: pr.solar[t], wind: pr.wind[t], other: pr.other[t], demand: d,
                    charge, discharge, el, curt, unserved, reserve, fossil: unserved + reserve,
                    socBess: stores[0].soc, socPsh: stores[1].soc});
      }
    }
    const sum = k => hours.reduce((a, h) => a + h[k], 0);
    const demand = sum("demand"), fossil = sum("fossil");
    return {hours, totals: {
      demand, fossil,
      share: 1 - fossil / demand,                             // non-fossil share of daily energy
      curtailed: sum("curt"),
      h2kt: sum("el") / p.kWhPerKg,                           // GWh x 1e6 kWh/GWh / kWhPerKg / 1e6 kg/kt
      co2Mt: (demand - fossil) * p.ef * 365 / 1000,           // GWh x t/MWh x 365 / 1000 = Mt per year
      peakCharge: Math.max(...hours.map(h => h.charge)),
      peakDischarge: Math.max(...hours.map(h => h.discharge)),
      peakEffective: peak,
      storagePower: stores[0].pow + stores[1].pow,
      storageEnergy: stores[0].cap + stores[1].cap
    }};
  }
  return {run, profiles};
})();
if(typeof module !== "undefined") module.exports = Dispatch;
