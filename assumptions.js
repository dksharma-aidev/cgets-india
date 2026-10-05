"use strict";
/* Assumptions view: fills every <b data-fig="id"> with the live value and unit from data.json,
   so the text can never drift away from the numbers the app actually uses. */
const Assump = {
  init(D){
    document.querySelectorAll("[data-fig]").forEach(el => {
      const fg = D.figures.find(x => x.id === el.dataset.fig);
      if(!fg) return;
      const v = typeof fg.value === "number" ? fg.value.toLocaleString("en-IN") : fg.value;
      el.textContent = fg.unit === "%" ? v + "%" : fg.unit === "ratio" ? v : v + " " + fg.unit;
    });
    document.getElementById("toTop").addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
  }
};