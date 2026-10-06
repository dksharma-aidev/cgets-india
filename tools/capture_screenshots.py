"""Capture the report screenshots (A1-A10, A4b, S1) from the running app at 2x resolution.

Setup (once):   pip install playwright   then   playwright install chromium
Run:            python tools/capture_screenshots.py https://YOUR-LIVE-URL/
Output:         assets/report_screenshots/*.png

These are screenshots of YOUR app, so they are genuine. The social-media evidence screenshots (Evidence view cards)
must still be captured by hand from the real posts: this script does not and must not create them.
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/"
OUT = pathlib.Path("assets/report_screenshots"); OUT.mkdir(parents=True, exist_ok=True)

def go(pg, view, wait=1300):
    pg.evaluate(f"location.hash='#{view}'"); pg.wait_for_timeout(wait)      # wait for chart animations

with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=2).new_page()
    pg.goto(URL)
    pg.wait_for_function("document.getElementById('kpi-share').textContent.trim() !== '–'")
    pg.wait_for_timeout(1500)

    # A1: stack together with the KPI header (taken before the header is un-stuck below)
    go(pg, "overview", 600)
    bottom = pg.evaluate("document.querySelector('.layers').getBoundingClientRect().bottom + window.scrollY")
    pg.screenshot(path=OUT / "A1_CGETS_Stack.png", clip={"x": 0, "y": 0, "width": 1280, "height": bottom + 24})

    # From here on, stop the header and KPI row overlapping element captures
    pg.add_style_tag(content=".top,.kpis-wrap{position:static!important}")

    go(pg, "l1")
    pg.locator("#l1 .chart-box").screenshot(path=OUT / "A2_Capacity_Chart.png")
    pg.evaluate("L1.openPin('p_bhadla')"); pg.wait_for_timeout(2500)          # map tiles need a moment
    pg.locator("#l1MapWrap").screenshot(path=OUT / "A3_Project_Map.png")

    pg.evaluate("L2.applyPresetId('target2030')")                             # 2030 Target preset for the L2 shots
    go(pg, "l2")
    pg.locator("#l2 .chart-box.tall").screenshot(path=OUT / "A4b_Dispatch_Chart.png")
    pg.locator("#l2 .chart-box.short").screenshot(path=OUT / "A4_Storage_Readiness.png")

    go(pg, "calc", 800)
    pg.locator("details.calc").nth(1).screenshot(path=OUT / "A5_V2G_Calculator.png")
    pg.locator("#ctxDeep").screenshot(path=OUT / "A7_DeepTech.png")
    pg.locator("#ctxTest").screenshot(path=OUT / "A8_TestBeds.png")
    pg.locator("#ctxPli").screenshot(path=OUT / "A9_PLI.png")
    pg.add_style_tag(content="#timeline{flex-wrap:wrap!important;overflow:visible!important}")   # show every milestone
    pg.locator("#timeline").screenshot(path=OUT / "A10_Policy_Timeline.png")

    go(pg, "l34")
    pg.locator("#l34 .chart-box").first.screenshot(path=OUT / "A6_EV_Mix.png")

    go(pg, "evidence")
    pg.locator("#evChart").locator("..").screenshot(path=OUT / "S1_Engagement.png")
    browser.close()
print("Saved to", OUT.resolve())
