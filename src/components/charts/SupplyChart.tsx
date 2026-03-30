"use client";

import "@/lib/chart-defaults";
import { Line } from "react-chartjs-2";
import { supplyDepletion } from "@/data/crisis-overview";

export function SupplyChart() {
  const data = {
    labels: supplyDepletion.labels,
    datasets: [
      {
        label: "Actual",
        data: supplyDepletion.actual,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#EF4444",
        fill: true,
        tension: 0.3,
        spanGaps: false,
      },
      {
        label: "Projected (no new procurement)",
        data: supplyDepletion.projected,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        borderWidth: 2,
        borderDash: [8, 4],
        pointRadius: 3,
        pointBackgroundColor: "#EF4444",
        fill: true,
        tension: 0.3,
        spanGaps: false,
      },
      {
        label: "Minimum requirement (15 days)",
        data: Array(supplyDepletion.labels.length).fill(supplyDepletion.minimum),
        borderColor: "rgba(255,255,255,0.3)",
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        min: 0,
        max: 65,
        title: { display: true, text: "Days of Supply", color: "rgba(255,255,255,0.5)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
    plugins: {
      annotation: {
        annotations: {
          todayLine: {
            type: "line" as const,
            xMin: supplyDepletion.todayIndex,
            xMax: supplyDepletion.todayIndex,
            borderColor: "rgba(255,255,255,0.4)",
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: "Today (Mar 30)",
              position: "start" as const,
              backgroundColor: "rgba(15, 27, 45, 0.9)",
              color: "rgba(255,255,255,0.8)",
              font: { size: 11 },
              padding: 4,
            },
          },
          dangerZone: {
            type: "box" as const,
            yMin: 0,
            yMax: supplyDepletion.minimum,
            backgroundColor: "rgba(239, 68, 68, 0.06)",
            borderWidth: 0,
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
      <h3 className="font-serif text-base font-semibold text-white mb-1">Supply Depletion Trajectory</h3>
      <p className="text-xs text-white-50 mb-4">Projected days of national fuel supply without new procurement</p>
      <div className="h-[300px] md:h-[350px]">
        <Line data={data} options={options} />
      </div>
      <p className="text-[10px] text-white-20 mt-3">Source: DOE weekly supply monitoring reports; Senate Energy Committee testimony (Mar 2026)</p>
    </div>
  );
}
