# Day 3 – L2 Conversion & Storage

## Integrate
Add `dispatch.js` and `l2.js`. Replace `index.html`, `style.css`, `app.js`, `l1.js`, `sw.js`, `data.json`. Push, wait a minute, hard-refresh.

## How the engine works (for the report, Section 3.3)
Hourly: generation = solar + wind + other. If generation > demand, surplus charges BESS then pumped hydro (85% round trip), then the electrolyser, then is curtailed. If short, BESS then PSH discharge, and the remainder is the fossil gap. The day is run three times so storage starts with carried-over charge.

## Expected results (use to test)
| Scenario | Non-fossil share | Fossil gap GWh/day | Curtailed GWh/day | CO2 Mt/yr |
|---|---|---|---|---|
| India 2025 | 40.2% | 2,992 | 0 | 586 |
| 2030 Target | 59.6% | 2,022 | 107 | 870 |
| 2030 with storage off | 55.8% | 2,211 | 330 | 814 |
| Storage-heavy | 61.4% | 1,930 | 0 | 896 |
India 2025 and No-storage give identical results because there is no midday surplus to store at 129 GW solar. That is a finding, not a bug.
Other checks: demand line peaks near 19:30 at about 250 GW; turning storage off shows curtailment at midday and a bigger fossil gap in the evening; electrolyser 10 GW on the 2030 preset gives about 0.76 kt/day.
Engine check in a terminal: `node dispatch.js` loads without error; the hourly energy balance closes to 1e-13.

## Screenshot (Attachment A4)
Choose the 2030 Target preset, then capture the dispatch chart, output cards and the storage-readiness bar chart together.

## Quick wins for later
Download hourly results as CSV; show SoC as a line on a second axis; a "best storage size" finder; seasonal profiles (monsoon, winter); a morning demand bump.