"use client";

import "@/lib/chart-defaults";
import { Bar } from "react-chartjs-2";
import { aseanComparison } from "@/data/crisis-overview";

export function AseanComparisonChart() {
  const data = {
    labels: aseanComparison.countries,
    datasets: [
      {
        label: "Diesel (₱ equiv/L)",
        data: aseanComparison.diesel,
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderColor: "#EF4444",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Gasoline (₱ equiv/L)",
        data: aseanComparison.gasoline,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "#3B82F6",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    scales: {
      x: {
        title: { display: true, text: "₱ equivalent per liter", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 20 },
      },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">ASEAN Pump Price Comparison</h3>
      <p className="text-xs text-white-50 mb-4">Philippines and Singapore highest; others have price freezes or subsidies</p>
      <div className="h-[260px] md:h-[300px]">
        <Bar data={data} options={options} />
      </div>
      <p className="text-[10px] text-white-20 mt-3">Source: GlobalPetrolPrices.com; converted at current FX rates (Mar 2026)</p>
    </div>
  );
}
