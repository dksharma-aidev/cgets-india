"use strict";
/* Scenario share links and QR code.
   Only values that differ from the defaults go into the URL, so links and QR codes stay short.
   Keys: cap_<tech>, cf_<tech> (L1); bess, psh, el, peak, stor (L2); ami, err, v2g, evs, kwh, avail, dod, ecook, ebus, etruck, h2 (L3/L4).
   Also accepted when opening a link: solar and wind (GW totals), e.g. ?solar=180&wind=90&bess=60&psh=20&peak=300 */
const Share = (() => {
  let defaults = {};
  const $ = id => document.getElementById(id);
  const collect = () => Object.assign({}, L1.getState(), L2.getState(), L34.getState());

  function buildUrl(){
    const cur = collect(), p = new URLSearchParams();
    Object.keys(cur).forEach(k => { if(Math.abs(cur[k] - defaults[k]) > 1e-9) p.set(k, +cur[k].toFixed(6)); });
    const base = location.href.split(/[?#]/)[0], qs = p.toString();
    return base + (qs ? "?" + qs : "") + location.hash;
  }

  function applyFromUrl(){
    const o = {};
    new URLSearchParams(location.search).forEach((v, k) => { const n = parseFloat(v); if(Number.isFinite(n)) o[k] = Math.max(0, n); });
    if(!Object.keys(o).length) return;
    L1.setState(o);
    if("solar" in o || "wind" in o){ const t = L1.getTotals(); L1.setTotals(o.solar ?? t.solar, o.wind ?? t.wind); }
    L2.setState(o); L34.setState(o);
    paintRanges();
  }

  function toast(msg){
    const t = $("toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("on"), 2200);
  }

  async function copy(text){
    try{ await navigator.clipboard.writeText(text); return true; }
    catch(e){                                                   // fallback for older browsers / non-secure pages
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
      let ok = false; try{ ok = document.execCommand("copy"); }catch(_){} ta.remove(); return ok;
    }
  }

  function showQR(){
    const url = buildUrl(), box = $("qrBox");
    $("shareUrl").value = url; box.innerHTML = "";
    if(window.QRCode) new QRCode(box, {text:url, width:200, height:200, correctLevel:QRCode.CorrectLevel.L});
    else box.textContent = "QR library not loaded. Connect once to the internet or add lib/qrcode.min.js.";
    $("shareModal").showModal();
  }

  return {
    init(){
      defaults = collect();                                     // snapshot before any URL values are applied
      applyFromUrl();
      document.addEventListener("click", async e => {
        if(e.target.closest(".js-copy")) toast(await copy(buildUrl()) ? "Scenario link copied" : "Copy failed: select the link in the QR window");
        if(e.target.closest(".js-qr")) showQR();
      });
      $("shareCopy").addEventListener("click", async () => toast(await copy($("shareUrl").value) ? "Link copied" : "Copy failed"));
      $("shareClose").addEventListener("click", () => $("shareModal").close());
      $("shareModal").addEventListener("click", e => { if(e.target === $("shareModal")) $("shareModal").close(); });   // click on backdrop
    },
    buildUrl
  };
})();