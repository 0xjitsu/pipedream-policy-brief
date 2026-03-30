"use client";

import "@/lib/chart-defaults";
import { Radar } from "react-chartjs-2";
import { radarMetrics } from "@/data/channels";
import type { ChartOptions } from "chart.js";

export function ChannelRadarChart() {
  const data = {
    labels: radarMetrics.map((m) => m.axis),
    datasets: [
      {
        label: "Ch 1: Wholesale",
        data: radarMetrics.map((m) => m.wholesale),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#F59E0B",
        pointBorderColor: "#0F1B2D",
        pointBorderWidth: 1,
      },
      {
        label: "Ch 2: Targeted ★",
        data: radarMetrics.map((m) => m.targeted),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.18)",
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#0F1B2D",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
      {
        label: "Ch 3: Ayuda",
        data: radarMetrics.map((m) => m.ayuda),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.08)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#0F1B2D",
        pointBorderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"radar"> = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: "rgba(255,255,255,0.3)",
          backdropColor: "transparent",
        },
        grid: { color: "rgba(255,255,255,0.08)" },
        angleLines: { color: "rgba(255,255,255,0.08)" },
        pointLabels: {
          color: "rgba(255,255,255,0.7)",
          font: { size: 11 },
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.r}/5`,
        },
      },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">Channel Comparison</h3>
      <p className="text-xs text-white-50 mb-4">Multi-axis evaluation across six criteria — Channel 2 dominates on efficiency & auditability</p>
      <div className="h-[320px] md:h-[360px]">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
