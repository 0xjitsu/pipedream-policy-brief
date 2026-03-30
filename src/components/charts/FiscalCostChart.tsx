"use client";

import "@/lib/chart-defaults";
import { Bar } from "react-chartjs-2";
import { fiscalCosts } from "@/data/channels";
import type { ChartOptions } from "chart.js";

export function FiscalCostChart() {
  const data = {
    labels: fiscalCosts.map((c) => c.channel),
    datasets: [
      {
        label: "Minimum Cost",
        data: fiscalCosts.map((c) => c.min),
        backgroundColor: fiscalCosts.map((c) => c.color + "4D"), // 30% opacity
        borderColor: fiscalCosts.map((c) => c.color),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "Maximum Cost",
        data: fiscalCosts.map((c) => c.max - c.min),
        backgroundColor: fiscalCosts.map((c) => c.color + "B3"), // 70% opacity
        borderColor: fiscalCosts.map((c) => c.color),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    scales: {
      x: {
        stacked: true,
        title: { display: true, text: "₱ Billions", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
        max: 8,
      },
      y: {
        stacked: true,
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        display: (ctx) => ctx.datasetIndex === 1,
        anchor: "end" as const,
        align: "right" as const,
        color: "rgba(255,255,255,0.8)",
        font: { size: 11, weight: "bold" as const, family: "var(--font-geist-mono)" },
        formatter: (_value: number, ctx) => {
          const item = fiscalCosts[ctx.dataIndex];
          if (item.min === item.max) return `₱${item.max}B`;
          return `₱${item.min}–${item.max}B`;
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const item = fiscalCosts[ctx.dataIndex];
            if (item.min === item.max) return `₱${item.max}B/${item.unit}`;
            return `₱${item.min}–${item.max}B/${item.unit}`;
          },
        },
      },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">Fiscal Cost Comparison</h3>
      <p className="text-xs text-white-50 mb-4">Channel 2 is 4–13× more efficient than alternatives</p>
      <div className="h-[180px]">
        <Bar data={data} options={options} />
      </div>
      <div className="flex gap-4 mt-3 text-[10px] text-white-50">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm opacity-30 bg-white inline-block" /> Min range
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm opacity-70 bg-white inline-block" /> Max range
        </span>
      </div>
    </div>
  );
}
