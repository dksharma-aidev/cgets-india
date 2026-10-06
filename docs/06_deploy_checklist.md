# 6. Final deployment checklist

## Before pushing
- [ ] `data.json`: set `"repo_url"` in `meta` to your GitHub repo URL (the footer link appears when it is set).
- [ ] Evidence cards: fill `platform`, `date`, `url`, and set `status` honestly.
- [ ] Optional for full offline: download `chart.umd.min.js`, `leaflet.js`, `qrcode.min.js` (and `leaflet.css`) into `lib/`.

## Push
```bash
git add .
git commit -m "Day 7: final testing, screenshots, demo prep"
git push origin main
```
- [ ] GitHub → Actions/Pages shows a successful deploy (about 1 minute).
- [ ] Open the live URL in a private window; press Ctrl+Shift+R.

## Live checks
- [ ] All 7 views load; console has no red errors.
- [ ] Footer shows the project line; repo link works.
- [ ] Phone (mobile data, not Wi-Fi): hamburger works, no sideways scroll.
- [ ] QR: Share panel on L2 → scan with phone → same scenario opens.
- [ ] Offline: visit every view online once → DevTools → Application → Service Workers shows "activated" → Network "Offline" → reload → views and charts still work.
- [ ] A QR code for the plain live URL printed on the cover page (generate it from "Show QR code" with no changes).

## Freeze
- [ ] After today's push, change nothing except evidence entries and `repo_url`. Anything else risks breaking a tested app before submission.
- [ ] Keep a copy of the project as a ZIP (offline fallback: unzip, run `python -m http.server`, open http://localhost:8000).
- [ ] Copy `backup_demo.mp4` and the ZIP to a USB stick and your phone.
