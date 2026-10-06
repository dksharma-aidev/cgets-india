# 5. Cross-check: report vs app

Open the report PDF and the app side by side. Tick when the report number equals the app number.

## A. Section 3.4 data table (22 parameters). App: Assumptions → data table, search the "Figure" column
| # | Report value | data.json id(s) | Tag | OK |
|---|---|---|---|---|
| 1 | 50% non-fossil capacity, June 2025 | nonfossil_share | verified | ☐ |
| 2 | Solar ~129 GW; ~24.5 GW added 2025-26 | solar_pv_capacity, solar_pv_added | verified | ☐ |
| 3 | Wind 58.14 GW; 6.05 GW added | wind_capacity, wind_added | verified | ☐ |
| 4 | Floating solar 278 MW (600 MW plan) | floating_solar_commissioned, floating_solar_plan | verified | ☐ |
| 5 | Agrivoltaics 1.4 MW | agrivoltaic_pilot | verified | ☐ |
| 6 | Biomass ~10.2 GW | biomass_capacity | verified | ☐ |
| 7 | Tidal 12,455 MW | tidal_potential | unconfirmed | ☐ |
| 8 | Wave 40,000–60,000 MW; 750 km | wave_potential, wave_gulf_kutch_coast | unconfirmed | ☐ |
| 9 | Bhadla 2,245 MW; Pavagada 2,050 MW | bhadla_park, pavagada_park | verified | ☐ |
| 10 | 20.85 lakh systems; 26.14 lakh households | surya_ghar_systems (20,85,000), surya_ghar_households (26,14,000) | verified | ☐ |
| 11 | 50 GWh PLI target; 1.4 GWh commissioned | bess_pli_target, bess_commissioned | verified | ☐ |
| 12 | ~47 GW / 236 GWh by 2032 | bess_outlook_power, bess_outlook_energy | verified | ☐ |
| 13 | Pumped hydro ~4.7 GW | psh_operational | verified | ☐ |
| 14 | NGHM ₹19,744 crore; 5 MTPA | nghm_outlay, target_green_h2 | verified | ☐ |
| 15 | ACC PLI ₹18,100 crore | acc_pli_outlay | verified | ☐ |
| 16 | V2G pilot up to 5 MW from 1,000 EVs by 2030 | v2g_pilot_power, v2g_pilot_evs | verified | ☐ |
| 17 | FY25 EV sales 2,037,831; 59.4 / 17.5 / 14.6 / 8.3 / 0.2% | ev_sales_fy25, ev_share_* | verified | ☐ |
| 18 | ~1,460 kWh per capita | per_capita_kwh | verified | ☐ |
| 19 | 34.85% tandem record (LONGi, April 2025) | perovskite_tandem_record | verified | ☐ |
| 20 | 500 GW target, 2030 | target_nonfossil_2030 | verified | ☐ |
| 21 | Net zero 2070 | target_net_zero | verified | ☐ |
| 22 | 5 MTPA green hydrogen, 2030 | target_green_h2 | verified | ☐ |

## B. Section 3.3 equations (Assumptions → section 2)
| Report | In app | Note |
|---|---|---|
| E = P × CF × 8760 | ✓ | |
| R(t) = P_solar p_solar(t) + P_wind p_wind(t) | ✓ | |
| R(t) + discharge = D + charge + curtailed + unserved | ✓ corrected | **Fix the report:** unserved energy belongs on the supply side: R + other + discharge + unserved = D + charge + hydrogen + curtailed |
| 0 ≤ SoC ≤ S_capacity; \|charge\|, \|discharge\| ≤ P_max | ✓ | |
| CO₂e avoided = E_clean × EF_grid | ✓ | |

## C. Section 3.6 assumptions (Assumptions → section 3)
Solar profile ☐ · Wind profile ☐ · Other non-fossil 70 GW at 55% ☐ · Round-trip efficiency 85% ☐ · BESS 4 h, PSH 8 h ☐ · 0.8 t CO₂/MWh ☐ · Peak demand 250 GW ☐ (all present, all tagged illustrative).

## D. Wording in the report that no longer matches the app
| Report section | Says | App does | Suggested fix (report) |
|---|---|---|---|
| 3.2 live KPI header | "renewable share, CO₂ avoided, curtailment, unserved energy, fossil gap" | non-fossil share, gap to 500 GW, CO₂ avoided, fossil gap, curtailment, green H₂ | Use the app's six names |
| 3.3 grid intelligence | AMI, forecast error, V2G "adjust the effective demand shape and the usable storage" | AMI trims peak demand; forecast error adds a fossil reserve; V2G is an extra evening store | Reword to match |
| 3.3 presets | 2030 Target "applies the 500 GW ambition" | modelled L1 capacity is 437 GW, gap 62.8 GW | "approaches the 500 GW ambition" |
| 3.5 A2 | capacity growth 2014–2025 | modelled mix vs 500 GW target | New caption |
| 3.5 A4 | current readiness vs 2030 plans | modelled BESS vs CEA 2032 outlook | New caption |
| 3.5 A10 | 2014–2026 | 2010–2026 | Change years |
| 3.3 "optional" dispatch screenshot | placeholder | A4b available | Replace with A4b |
| 7 Bibliography | [INSERT URL] ×2 | live URL and repo | Fill in |

## E. Section 5 evidence tags
Every card is `unconfirmed` until you have captured and checked the post. Make the report's Section 5 say the same, and list which cards are verified once you have changed their status.
