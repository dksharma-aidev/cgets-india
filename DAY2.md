# Day 2 – L1 Generation

## Integrate
Replace `index.html`, `style.css`, `app.js`, `sw.js`, `data.json` with the new versions and add `l1.js`. Commit and push. Pages redeploys in about a minute.

## Offline
1. Download once (online): `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` and `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`. Save them as `lib/leaflet.js` and `lib/chart.umd.min.js`. Leaflet's CSS and marker images are not needed locally for the circle pins, but save `leaflet.css` to `lib/` too if you want to be fully offline.
2. Open the live URL online, visit L1 once (this caches the libraries and the map tiles you view), then go offline and reload.

## Test
- Defaults: total 259.6 GW, gap 240.4 GW, about 633 TWh/yr.
- Set utility solar to 0: total drops by 129 GW and the stacked bar shrinks.
- Check one row by hand: 58.14 GW x 28% x 8760 = 142,610 GWh.
- Set total above 500: the label changes to "Above 500 GW target".
- Click each of the 9 pins. Resize to phone width: columns stack.
- Hard-refresh after deploying (the service worker caches files).

## Screenshot (Attachment A2)
Open the live URL on L1, set a clear scenario, and capture sliders, stats, chart and map together (desktop width, two screenshots if needed).

## Quick wins for later
Export scenario as CSV, share-by-URL (sliders in the hash), a "2030 pathway" preset, nuclear and ocean as read-only items, a per-state map layer.