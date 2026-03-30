"use client";

import "@/lib/chart-defaults";
import { Bar } from "react-chartjs-2";
import { stationsByRegion } from "@/data/infrastructure";

const islandColors: Record<string, string> = {
  luzon: "#3B82F6",
  visayas: "#10B981",
  mindanao: "#F97316",
};

export function StationBarChart() {
  const data = {
    labels: stationsByRegion.map((s) => s.region),
    datasets: [
      {
        label: "Stations",
        data: stationsByRegion.map((s) => s.count),
        backgroundColor: stationsByRegion.map((s) => islandColors[s.island] + "B3"),
        borderColor: stationsByRegion.map((s) => islandColors[s.island]),
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    scales: {
      x: {
        title: { display: true, text: "Number of Stations", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">Station Distribution by Region</h3>
      <p className="text-xs text-white-50 mb-4">
        <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1" style={{ backgroundColor: "#3B82F6" }} /> Luzon{" "}
        <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 ml-3" style={{ backgroundColor: "#10B981" }} /> Visayas{" "}
        <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 ml-3" style={{ backgroundColor: "#F97316" }} /> Mindanao
      </p>
      <div className="h-[420px] md:h-[480px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
