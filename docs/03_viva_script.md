# 3. Viva demonstration script (3 minutes)

**Before you start:** open the live URL on the laptop, online, on the Overview. Close other tabs. Have the backup video ready. Speaker A talks, Speaker B drives the mouse (or swap at 1:40).

| Time | Do | Say |
|---|---|---|
| 0:00 | Overview on screen | "This is CGETS India, a working web application that implements our four-layer Clean & Green Energy Technology Stack. It lets us simulate India's energy transition interactively." |
| 0:20 | Point to the four layer cards, then the KPI row. Click **India 2025** | "L1 generation, L2 conversion and storage, L3 grid intelligence, L4 end-use. The KPI row shows non-fossil share, gap to 500 GW, CO₂ avoided, fossil gap, curtailment and green hydrogen. For India 2025 we get 37.4% non-fossil and a 255 GW gap. Every value updates live." |
| 0:50 | L2 opens with India 2025 | "This is the 24-hour dispatch engine. The dark line is demand, peaking around 19:30. Solar stops at 18:00, so evenings and nights are met by a fossil gap of about 3,100 GWh a day. With only 1.4 GWh of battery and 4.7 GW of pumped hydro there is no midday surplus to store." |
| 1:10 | Click **2030 Target**, untick **Storage on** | "Now the 2030 scenario, 280 GW solar and 100 GW wind. Without storage, curtailment is 337 GWh a day and the fossil gap is 2,302." |
| 1:25 | Tick **Storage on** | "With 100 GWh of batteries and 20 GW of pumped hydro, curtailment falls to 113 and the fossil gap to 2,103. That is why storage matters." |
| 1:40 | Go to L3 + L4. Move **AMI** from 10 to 80 | "Grid intelligence. In our model, 80% smart-meter coverage trims the effective peak from 249 to 240 GW. This is an illustrative assumption, 0.5% per 10% coverage. The fossil gap falls to about 1,960." |
| 1:55 | Tick **V2G**, type 10,000,000 EVs | "V2G. At the 1,000-vehicle pilot scale a fleet holds about 4 MWh, roughly 1 MW over the evening window. The ISGF pilot cites up to 5 MW, which is charger power, a different measure. At 10 million vehicles the fossil gap falls further, to about 1,920." |
| 2:10 | Scroll to the donut | "End-use: two-wheelers are 59.4% of FY25 EV sales, out of 2,037,831 units." |
| 2:20 | Go to Calculators, rooftop panel | "A 3 kW rooftop system under PM Surya Ghar gets a ₹78,000 subsidy, a net cost of ₹72,000 and payback of about 2.8 years. These estimates ignore degradation, discounting and site losses." |
| 2:40 | Go to Assumptions, scroll to the data table, then Evidence | "Every number has a source and a tag: verified, unconfirmed or illustrative, and the Assumptions page lists all equations and limits. Our evidence page uses real screenshots from official sources such as PIB, and says clearly where one is still pending." |
| 2:52 | Back to Overview | "The app turns the transition into an operable tool. Generation alone is not enough: storage, grid intelligence and end-use decide whether clean power is reliable." |

## Do not say (these are not what the app shows)
- "Storage off makes things jump" on India 2025: the numbers are identical there. Use 2030.
- "1,000 EVs give 5 MW": the app gives about 1 MW for the 4-hour window; 5 MW is the pilot's own figure.
- "AMI reduces technical losses": the model reduces peak demand only.
- "Non-fossil share is the real 2025 figure": the app shows a one-day model result. The verified 50% is an installed-capacity figure.

## Likely questions
- **Is it a forecast?** No. It is a deterministic scenario model; every assumption is on the Assumptions page.
- **Where do the numbers come from?** `data.json`; each has a source and tag. Illustrative ones are our modelling assumptions.
- **Why is the share 37%, when India reached 50%?** The 50% is installed capacity; the model measures energy over a representative day, where solar produces for only part of it.
- **What does the model leave out?** Transmission, seasons, ramp limits, costs, V2G recharge load.
- **Does it work offline?** Yes, after one online visit (service worker cache).
- **How would you improve it?** Seasonal profiles, state-level data, cost layer.
