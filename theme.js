"use strict";
/* Chart.js look and feel: soft gridlines, system font, white tooltips. Loaded before any chart is created. */
if(window.Chart){
  const C = Chart.defaults;
  C.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif';
  C.font.size = 12;
  C.color = "#475569";
  C.borderColor = "#F1F5F9";                                  // gridlines
  C.plugins.legend.labels.boxWidth = 12;
  Object.assign(C.plugins.tooltip, {backgroundColor:"#FFFFFF", titleColor:"#0F172A", bodyColor:"#475569",
    borderColor:"#E2E8F0", borderWidth:1, padding:10, cornerRadius:8});
}
