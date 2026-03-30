"use client";

import "@/lib/chart-defaults";
import { Bar } from "react-chartjs-2";
import { aseanComparison } from "@/data/crisis-overview";
import type { ChartOptions } from "chart.js";

export function AseanComparisonChart() {
  // Highlight Philippines (index 0)
  const phIndex = 0;

  const data = {
    labels: aseanComparison.countries,
    datasets: [
      {
        label: "Diesel (₱ equiv/L)",
        data: aseanComparison.diesel,
        backgroundColor: aseanComparison.countries.map((_, i) =>
          i === phIndex ? "rgba(239, 68, 68, 0.85)" : "rgba(239, 68, 68, 0.4)"
        ),
        borderColor: aseanComparison.countries.map((_, i) =>
          i === phIndex ? "#EF4444" : "rgba(239, 68, 68, 0.6)"
        ),
        borderWidth: aseanComparison.countries.map((_, i) => (i === phIndex ? 2 : 1)),
        borderRadius: 4,
      },
      {
        label: "Gasoline (₱ equiv/L)",
        data: aseanComparison.gasoline,
        backgroundColor: aseanComparison.countries.map((_, i) =>
          i === phIndex ? "rgba(59, 130, 246, 0.85)" : "rgba(59, 130, 246, 0.4)"
        ),
        borderColor: aseanComparison.countries.map((_, i) =>
          i === phIndex ? "#3B82F6" : "rgba(59, 130, 246, 0.6)"
        ),
        borderWidth: aseanComparison.countries.map((_, i) => (i === phIndex ? 2 : 1)),
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    scales: {
      x: {
        title: { display: true, text: "₱ equivalent per liter", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        grid: { display: false },
        ticks: {
          font: (ctx) => ({
            weight: ctx.index === phIndex ? ("bold" as const) : ("normal" as const),
            size: ctx.index === phIndex ? 13 : 12,
          }),
          color: (ctx) =>
            ctx.index === phIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 20 },
      },
      datalabels: {
        display: true,
        anchor: "end" as const,
        align: "right" as const,
        color: "rgba(255,255,255,0.7)",
        font: { size: 10, family: "var(--font-geist-mono)" },
        formatter: (value: number) => `₱${value}`,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₱${ctx.parsed.x}/L`,
        },
      },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">ASEAN Pump Price Comparison</h3>
      <p className="text-xs text-white-50 mb-4">Philippines and Singapore highest; others have price freezes or subsidies</p>
      <div className="h-[280px] md:h-[320px]">
        <Bar data={data} options={options} />
      </div>
      <p className="text-[10px] text-white-20 mt-3">Source: GlobalPetrolPrices.com; converted at current FX rates (Mar 2026)</p>
    </div>
  );
}
