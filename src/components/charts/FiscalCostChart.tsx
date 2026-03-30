"use client";

import "@/lib/chart-defaults";
import { Bar } from "react-chartjs-2";
import { fiscalCosts } from "@/data/channels";

export function FiscalCostChart() {
  const data = {
    labels: fiscalCosts.map((c) => c.channel),
    datasets: [
      {
        label: "Fiscal Cost (₱ billions)",
        data: fiscalCosts.map((c) => c.max),
        backgroundColor: fiscalCosts.map((c) => c.color + "B3"), // 70% opacity
        borderColor: fiscalCosts.map((c) => c.color),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    scales: {
      x: {
        title: { display: true, text: "₱ Billions", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
        max: 8,
      },
      y: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { dataIndex: number; formattedValue: string }) => {
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
      <p className="text-xs text-white-50 mb-4">Channel 2 is 4–13x more efficient than alternatives</p>
      <div className="h-[180px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
