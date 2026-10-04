# CGETS India – Interactive Clean & Green Energy Simulator

CHE110 project, topic VA05: Modern Technologies for Clean and Green Energy Development in India.
Four layers: L1 Generation, L2 Conversion & Storage, L3 Grid Intelligence, L4 End-use.

Plain HTML, CSS and JavaScript. No build step. All figures live in `data.json` with a source and a status tag (`verified`, `unconfirmed`, `illustrative`).

## Run locally
`python -m http.server 8000`, then open http://localhost:8000

## Files
- `index.html` shell and seven views
- `style.css` layout and theme
- `app.js` navigation, KPI header, data table
- `data.json` every figure with source and status
- `sw.js` offline cache
