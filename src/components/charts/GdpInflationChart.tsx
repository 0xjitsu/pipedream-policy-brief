"use client";

import "@/lib/chart-defaults";
import { Line } from "react-chartjs-2";
import { gdpInflation, computeOilPriceIndex } from "@/data/crisis-overview";
import type { ChartOptions, ScriptableContext } from "chart.js";

export function GdpInflationChart({ currentOilPrice }: { currentOilPrice?: number }) {
  const dynamicIndex = currentOilPrice ? computeOilPriceIndex(currentOilPrice) : gdpInflation.crossoverIndex;
  const data = {
    labels: gdpInflation.labels,
    datasets: [
      {
        label: "GDP Growth (%)",
        data: gdpInflation.gdp,
        borderColor: "#3B82F6",
        backgroundColor: (ctx: ScriptableContext<"line">) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(59, 130, 246, 0.1)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.01)");
          return gradient;
        },
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#0F1B2D",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3,
      },
      {
        label: "Inflation (%)",
        data: gdpInflation.inflation,
        borderColor: "#EF4444",
        backgroundColor: (ctx: ScriptableContext<"line">) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(239, 68, 68, 0.1)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.2)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.01)");
          return gradient;
        },
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: "#EF4444",
        pointBorderColor: "#0F1B2D",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    scales: {
      y: {
        min: 0,
        max: 10,
        title: { display: true, text: "Percentage (%)", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      x: {
        title: { display: true, text: "Crude Oil Price ($/bbl)", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
    plugins: {
      annotation: {
        annotations: {
          crossover: {
            type: "line" as const,
            xMin: dynamicIndex,
            xMax: dynamicIndex,
            borderColor: "rgba(245, 158, 11, 0.7)",
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: currentOilPrice ? `⚠ We are here ($${Math.round(currentOilPrice)}/bbl)` : "⚠ We are here",
              position: "start" as const,
              backgroundColor: "rgba(245, 158, 11, 0.95)",
              color: "#fff",
              font: { size: 11, weight: "bold" as const },
              padding: 6,
            },
          },
          stagflationZone: {
            type: "box" as const,
            xMin: dynamicIndex,
            xMax: gdpInflation.labels.length - 1,
            backgroundColor: "rgba(239, 68, 68, 0.04)",
            borderWidth: 0,
            label: {
              display: true,
              content: "Stagflation Risk Zone",
              position: { x: "center" as const, y: "start" as const },
              color: "rgba(239, 68, 68, 0.4)",
              font: { size: 10, weight: "bold" as const },
            },
          },
        },
      },
      legend: {
        position: "bottom" as const,
        labels: { padding: 20 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
        },
      },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">GDP Growth vs. Inflation</h3>
      <p className="text-xs text-white-50 mb-4">Crossover point at current oil prices signals stagflation risk</p>
      <div className="h-[280px] md:h-[320px]" role="img" aria-label="GDP growth vs. inflation crossover chart">
        <Line data={data} options={options} />
      </div>
      {/* Sources & Methodology */}
      <div className="mt-4 pt-3 border-t border-white-05">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[10px]">
          <div className="flex justify-between">
            <span className="text-white-40">GDP projections</span>
            <a href="https://business.inquirer.net/567526/dbcc-cuts-targets-gdp-for-2026-now-at-5-6" target="_blank" rel="noopener noreferrer" className="text-white-40 hover:text-white-60 underline underline-offset-2 transition-colors">DBCC/NEDA →</a>
          </div>
          <div className="flex justify-between">
            <span className="text-white-40">Inflation model</span>
            <a href="https://www.bsp.gov.ph/Price%20Stability/MonetaryPolicyReport/EconomicOutlook-February2026.pdf" target="_blank" rel="noopener noreferrer" className="text-white-40 hover:text-white-60 underline underline-offset-2 transition-colors">BSP MPR Feb 2026 →</a>
          </div>
          <div className="flex justify-between">
            <span className="text-white-40">Impact analysis</span>
            <a href="https://think.ing.com/articles/oil-price-shock-raises-inflation-and-policy-risks-in-philippines/" target="_blank" rel="noopener noreferrer" className="text-white-40 hover:text-white-60 underline underline-offset-2 transition-colors">ING Research →</a>
          </div>
          <div className="flex justify-between">
            <span className="text-white-40">Oil price data</span>
            <a href="https://finance.yahoo.com/quote/BZ=F/" target="_blank" rel="noopener noreferrer" className="text-white-40 hover:text-white-60 underline underline-offset-2 transition-colors">Yahoo Finance (live) →</a>
          </div>
        </div>
        <p className="text-[9px] text-white-15 mt-2">
          Methodology: Each $10/bbl oil increase → −0.2pp GDP, +0.6pp inflation (ING Research, Mar 2026)
        </p>
      </div>
    </div>
  );
}
