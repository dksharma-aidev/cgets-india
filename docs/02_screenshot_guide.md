# 2. Screenshot guide (A1–A10, A4b, S1, and the social-media evidence)

## Fastest route: automatic capture (about 2 minutes)
These are screenshots of your own app, so they are genuine. They are not the social-media evidence.
1. Install once: `pip install playwright` then `playwright install chromium`
2. In the project folder run: `python tools/capture_screenshots.py https://YOUR-LIVE-URL/`
3. Open every image in `assets/report_screenshots/` and check the list at the bottom of this page.
The script uses the 2030 Target preset for the L2 shots, shows all timeline cards in a wrapped grid, and hides the sticky header so it never covers a chart. It needs internet (chart, map and tile libraries).

## Manual route (if the script fails)
Set the browser window to 1280 px wide, zoom 100–125%, press F11, use Win + Shift + S, and capture only the box named below.

| Image | View | Setup | Capture |
|---|---|---|---|
| A1_CGETS_Stack | Overview | none | KPI row, hero and the four layer cards |
| A2_Capacity_Chart | L1 | defaults | The stacked bar "Modelled L1 mix" vs "2030 target" |
| A3_Project_Map | L1 | click the Bhadla pin | Map with popup, plus the legend below it |
| A4b_Dispatch_Chart | L2 | click Overview → 2030 Target | The large 24-hour chart with its legend |
| A4_Storage_Readiness | L2 | same | The small BESS vs CEA 2032 bar chart |
| A5_V2G_Calculator | Calculators | defaults | The whole "2. V2G potential" panel |
| A6_EV_Mix | L3 + L4 | none | Donut with title and legend |
| A7_DeepTech | Calculators, bottom | none | "Deep-tech milestones" card |
| A8_TestBeds | Calculators, bottom | none | "Indian test-beds" card |
| A9_PLI | Calculators, bottom | none | "PLI progress" card |
| A10_Policy_Timeline | Calculators | scroll the timeline so 2010 to 2026 are all visible, or zoom the browser out to 50% | All 12 cards |
| S1_Engagement | Evidence | none | The engagement bar chart |

## Social-media evidence (by hand, from the real posts)
Capture into `assets/evidence/` using the file names in `data.json`.
1. Open the real post in a browser. Do not use a repost, a news article about it, or a mock-up.
2. Capture the whole post: account name and handle, date, text, and the like/share counts.
3. Save as the exact file name (S1_pib_nonfossil.png … S7_evreporter_ev_sales.png). Do not edit or crop out the date.
4. Copy the post link into the card's `url`, enter `platform` and `date` (YYYY-MM-DD) in `data.json`.
5. Change `status` to `verified` only after you have checked the claim against the official source.
6. If a post cannot be found, leave the card as "Screenshot pending" and say so in the report. Do not substitute anything.

## Image check before using each one
- [ ] Text readable at 100% zoom; key figure visible.
- [ ] No browser tabs, taskbar, notifications or bookmarks bar.
- [ ] Right scenario on screen (2030 Target for A4 and A4b) and the caption says so.
- [ ] Chart legends not cut off; map tiles loaded (no grey squares).

## Caption fixes the report needs (the app does not match the draft captions)
- **A2** draft says "solar and wind capacity growth 2014 to 2025". The app shows the modelled L1 capacity mix against the 500 GW target. Reword the caption.
- **A4** draft says "current storage readiness with 2030 plans". The chart compares modelled BESS with the CEA 2032 outlook. Reword.
- **A10** draft says "2014–2026". The timeline runs 2010–2026.
- **A5** shows the Calculators V2G panel (it contains the pilot comparison).
