"use client";

import "@/lib/chart-defaults";
import { Line } from "react-chartjs-2";
import { gdpInflation } from "@/data/crisis-overview";

export function GdpInflationChart() {
  const data = {
    labels: gdpInflation.labels,
    datasets: [
      {
        label: "GDP Growth (%)",
        data: gdpInflation.gdp,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: "#3B82F6",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Inflation (%)",
        data: gdpInflation.inflation,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: "#EF4444",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
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
            xMin: gdpInflation.crossoverIndex,
            xMax: gdpInflation.crossoverIndex,
            borderColor: "rgba(245, 158, 11, 0.6)",
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: "We are here",
              position: "start" as const,
              backgroundColor: "rgba(245, 158, 11, 0.9)",
              color: "#fff",
              font: { size: 11, weight: "bold" as const },
              padding: 4,
            },
          },
        },
      },
      legend: {
        position: "bottom" as const,
        labels: { padding: 20 },
      },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">GDP Growth vs. Inflation</h3>
      <p className="text-xs text-white-50 mb-4">Crossover point at current oil prices signals stagflation risk</p>
      <div className="h-[280px] md:h-[320px]">
        <Line data={data} options={options} />
      </div>
      <p className="text-[10px] text-white-20 mt-3">Source: NEDA projections; BSP inflation forecast models</p>
    </div>
  );
}
