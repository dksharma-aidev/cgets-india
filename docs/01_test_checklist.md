# 1. End-to-end test checklist (10 Oct)

Tick each box. Values below were produced by running the app; yours should match.

## First load (all views)
- [ ] KPI row: 39.2% | 240.38 GW | 578 Mt/yr | 3,024 | 0 | – (L1 defaults: utility solar 129 GW plus rooftop 15 GW)
- [ ] No red errors in DevTools Console (F12) while visiting all 7 views.

## Overview
- [ ] Four layer cards and four preset buttons show. Clicking a preset opens L2 with the values applied.

## L2 presets (click from Overview or L2; read the KPI row)
| Preset | Non-fossil | Gap to 500 GW | CO₂ Mt/yr | Fossil gap | Curtailment |
|---|---|---|---|---|---|
| India 2025 | 37.4% | 255.66 GW | 551 | 3,116 | 0 |
| 2030 Target | 57.7% | 62.8 GW | 847 | 2,103 | 113 |
| No-storage counterfactual | 37.4% | 255.66 GW | 551 | 3,116 | 0 |
| Storage-heavy | 59.8% | 62.8 GW | 876 | 2,002 | 0 |
- [ ] **Expected surprise:** India 2025 and No-storage give identical numbers. At 129 GW of solar there is no midday surplus to store, so storage has nothing to do.
- [ ] To show the storage effect, load 2030 Target and untick "Storage on": curtailment 113 → 337, fossil gap 2,103 → 2,302, non-fossil 57.7% → 53.7%.
- [ ] Storage-heavy vs 2030 Target: curtailment 113 → 0, fossil gap 2,103 → 2,002.
- [ ] The gap after the India 2025 preset (255.66) is not 240: the preset sets total solar to the verified 129 GW, while the first-load default adds 15 GW of rooftop on top.

## L1
- [ ] Utility solar 129 → 300: total capacity and gap change, stacked bar grows, KPI gap updates.
- [ ] Change a capacity factor: only that row's GWh/yr and the total TWh change.
- [ ] Defaults: total 259.62 GW; wind row 58.14 × 28% × 8760 = 142,610 GWh/yr.
- [ ] Map: 9 pins; click Bhadla → popup shows 2,245 MW; legend visible under the map.

## L2 sliders
- [ ] BESS 1.4 → 150 (with 2030 preset): curtailment falls. Peak 250 → 350: fossil gap rises.
- [ ] Electrolyser 0 → 10 (2030 preset): Green H₂ KPI becomes about 0.76 kt/day.
- [ ] Dispatch chart: demand line peaks near 19:30; solar bars 06:00–18:00.

## L3 + L4
- [ ] AMI 10 → 80: "Effective peak demand" falls (248.8 → 240.0 GW) and fossil gap falls.
- [ ] Forecast error 10 → 20: fossil gap rises.
- [ ] V2G on, 10,000,000 EVs, 2030 preset: energy 40,000 MWh, power 10,000 MW, fossil gap falls. At 1,000 EVs: 4 MWh, 1 MW, no visible effect.
- [ ] Donut: edit a share, chart changes; title reads "FY25 EV Sales Mix (2,037,831 units)".
- [ ] L4 defaults: e-cooking 5 M households → 7.5 Mt CO₂, 60 M cylinders; buses + trucks → 190 M litres diesel, 0.51 Mt CO₂.

## Calculators
- [ ] Rooftop 3 kW, 4.5 h, PR 0.75, ₹7: 3,696 kWh; subsidy ₹78,000; net ₹72,000; savings ₹25,869; payback 2.8 y; 2,624 kg.
- [ ] Extremes (10 kW, ₹12): 12,319 kWh; net ₹4,22,000; payback 2.9 y. No NaN anywhere.
- [ ] V2G 1,000 EVs, 40 kWh, 50%, 20%: 4 MWh, 1 MW, pilot ratio 5 MW. Extreme (100,000, 100, 100%, 50%): 5,000 MWh.
- [ ] Firming 30/20/60: 30 GW, 120 GWh, 64% / 51% of CEA 47 GW / 236 GWh. Extreme 50/50/90: 90 GW, 360 GWh.
- [ ] Timeline: 12 cards, arrows scroll sideways on desktop; vertical list on phone.
- [ ] Context cards: deep-tech (34.85%), 6 test-beds, PLI (1.4 of 50 GWh = 2.8%).

## Evidence
- [ ] 7 cards. Real screenshots load; missing ones show "Screenshot pending".
- [ ] Tags: verified green, unconfirmed amber (illustrative blue appears in tables and sliders).
- [ ] Engagement chart and 6-row table render; disclaimer at the bottom.
- [ ] KPI row shows "Values from last scenario."

## Assumptions
- [ ] Six sections; five equations; 97 rows in the data table; filter buttons work; "Back to top" works.

## Share link and QR
- [ ] Set solar 180/wind 90 via the link `?solar=180&wind=90&bess=60&psh=20&peak=300`; sliders restore.
- [ ] Copy link → new tab → same values and KPIs. QR scanned by phone opens the same scenario (test on the live URL).

## Offline
- [ ] Online: open every view once (this caches the chart, map and QR libraries and the map tiles you look at).
- [ ] DevTools → Application → Service Workers shows an activated worker.
- [ ] Tick Offline (Network tab), reload: all views work, charts draw. Map tiles only appear where you looked before.

## Mobile (DevTools device toolbar, 375 px)
- [ ] Hamburger menu; no sideways scrolling on any view; KPI cards in 3 columns; charts readable; map usable.
