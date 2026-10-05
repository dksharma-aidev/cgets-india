"use strict";
/* Evidence view. Cards come from data.json ("evidence"). A card shows the real screenshot from assets/evidence/
   when the file exists, and a clearly marked "pending" placeholder when it does not. Nothing is fabricated. */
const Evidence = {
  init(D){
    const esc = x => String(x).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const when = iso => iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {day:"numeric", month:"long", year:"numeric"}) : "";
    const grid = document.getElementById("evGrid");
    grid.innerHTML = D.evidence.map((e, i) => {
      const link = /^https?:\/\//.test(e.url) ? `<a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.url)}</a>` : "<i>[INSERT POST URL]</i>";
      return `<article class="ev-card">
        <div class="ev-img"><img src="assets/evidence/${esc(e.file)}" alt="Screenshot: ${esc(e.description)}" loading="lazy"></div>
        <div class="ev-body">
          <div class="ev-top"><b>Evidence ${i + 1}</b><span class="tag ${e.status}">${e.status}</span></div>
          <dl><dt>Platform</dt><dd>${esc(e.platform || "to be recorded")}</dd>
              <dt>Post date</dt><dd>${esc(e.date ? when(e.date) : "to be recorded")}</dd>
              <dt>Post URL</dt><dd>${link}</dd></dl>
          <p>${esc(e.description)}</p>
        </div></article>`;
    }).join("");
    // Missing image file -> pending placeholder with instructions for the student
    grid.querySelectorAll(".ev-card").forEach((card, i) => {
      const e = D.evidence[i], img = card.querySelector("img");
      img.addEventListener("error", () => {
        card.querySelector(".ev-img").innerHTML = `<div class="ev-pending" role="img" aria-label="Screenshot pending">
          <b>Screenshot pending — to be captured on ${esc(when(e.capture_by))}</b>
          <span>Open the post, capture the whole post (handle, date, counts), save it as <code>assets/evidence/${esc(e.file)}</code>, then fill the platform, date and URL in <code>data.json</code>.</span></div>`;
      });
    });
    // Engagement table and chart (sample figures from the source document)
    document.querySelector("#evTable tbody").innerHTML = D.engagement.map(r =>
      `<tr><td>${esc(r.cluster)}</td><td>${r.views_m} M</td><td>${r.likes_k} K</td><td>${r.shares_k} K</td><td>${r.comments_k} K</td></tr>`).join("");
    if(window.Chart){
      new Chart(document.getElementById("evChart"), {type:"bar",
        data:{labels:D.engagement.map(r => r.cluster), datasets:[{label:"Approx. views (millions, sample)", data:D.engagement.map(r => r.views_m), backgroundColor:"#0EA5E9", borderRadius:4}]},
        options:{indexAxis:"y", responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{title:{display:true, text:"Approx. views (millions)"}}}}});
    }
  }
};