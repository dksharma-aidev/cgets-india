# Day 1 – 4 October 2026

## Publish (about 10 minutes)
1. On github.com click **New repository**, name it `cgets-india`, set it **Public**, add no files, click Create.
2. Upload the files: **Add file → Upload files**, drag in `index.html`, `style.css`, `app.js`, `sw.js`, `data.json`, `README.md`, then Commit.
   (Command line: `git init && git add . && git commit -m "Day 1 shell" && git branch -M main && git remote add origin https://github.com/<user>/cgets-india.git && git push -u origin main`)
3. **Settings → Pages → Source: Deploy from a branch → main / (root) → Save.**
4. After about a minute the live URL is `https://<user>.github.io/cgets-india/`.
5. Test: all seven tabs open, Assumptions lists 36 figures, KPI shows 50%. Open the URL on your phone, then switch off the internet and reload.
Netlify alternative: app.netlify.com → Add new site → Import from GitHub → pick the repo, leave build command empty, publish directory `/`.

## Statement (about 150 words)
We are building CGETS India, a single-page, offline-capable web application that lets users explore India's clean and green energy transition through a four-layer technology stack: generation, conversion and storage, grid intelligence, and end-use. Users change capacity, storage and demand-side inputs and see the effect on annual generation, a 24-hour dispatch profile, the gap to the 500 GW non-fossil target for 2030, and avoided emissions. We are building it because a static report cannot show how the layers depend on one another, for example how storage firms solar output or how electric vehicles reshape evening demand. Every figure sits in one open data file with its source and a verification tag, and every formula is listed on an assumptions page, so faculty and readers can check the work. It uses only free, open-source tools and runs without a build step.

## Team meeting checklist
- [ ] Confirm hybrid model: report plus live web app, with the app supporting the report's claims
- [ ] Roles: Member 1 report, data, evidence; Member 2 app code, dispatch engine; Member 3 proofreading, cross-checks
- [ ] Agree who owns the GitHub repo and add the others as collaborators
- [ ] Agree status-tag rules: nothing is `verified` without a primary or official source
- [ ] Checkpoints: Day 3 L1 working, Day 5 dispatch engine, Day 7 evidence and calculators, Day 8 freeze and full cross-check, 12 Oct submit
- [ ] Share the live URL with faculty today
- [ ] Risks and fallbacks: dispatch engine slips → ship a simplified fixed profile; map library fails → static SVG map; unconfirmed figures → keep tagged and flag in the report; lost internet at demo → use the ZIP or the cached page; last-day bugs → feature freeze on Day 8

## Offline ZIP note
Browsers block `fetch` from `file://`. For the ZIP, either include a short `run.bat` / `run.sh` that starts `python -m http.server`, or (later) move the data into `data.js` as a script variable. Chart.js and Leaflet should be downloaded into a `lib/` folder from Day 2 so they work offline.