"use client";

import "@/lib/chart-defaults";
import { Line } from "react-chartjs-2";
import { supplyDepletion } from "@/data/crisis-overview";
import type { ChartOptions, ScriptableContext } from "chart.js";

export function SupplyChart() {
  const data = {
    labels: supplyDepletion.labels,
    datasets: [
      {
        // Actual data — bright cyan-blue, solid, prominent (ground truth)
        label: "Actual",
        data: supplyDepletion.actual,
        borderColor: "#38BDF8",
        backgroundColor: (ctx: ScriptableContext<"line">) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(56, 189, 248, 0.1)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.25)");
          gradient.addColorStop(1, "rgba(56, 189, 248, 0.02)");
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#38BDF8",
        pointBorderColor: "#0F1B2D",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3,
        spanGaps: false,
      },
      {
        // Projected — amber/orange, dashed (uncertainty, forecast)
        label: "Projected (no new procurement)",
        data: supplyDepletion.projected,
        borderColor: "#F59E0B",
        backgroundColor: (ctx: ScriptableContext<"line">) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(245, 158, 11, 0.05)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.15)");
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.01)");
          return gradient;
        },
        borderWidth: 2.5,
        borderDash: [8, 4],
        pointRadius: 4,
        pointBackgroundColor: "#F59E0B",
        pointBorderColor: "#0F1B2D",
        pointBorderWidth: 2,
        fill: true,
        tension: 0.3,
        spanGaps: false,
      },
      {
        // Minimum requirement — red, the danger threshold
        label: "Minimum requirement (15 days)",
        data: Array(supplyDepletion.labels.length).fill(supplyDepletion.minimum),
        borderColor: "rgba(239, 68, 68, 0.6)",
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
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
            borderColor: "rgba(255,255,255,0.5)",
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: supplyDepletion.todayLabel,
              position: "start" as const,
              backgroundColor: "rgba(245, 158, 11, 0.9)",
              color: "#fff",
              font: { size: 11, weight: "bold" as const },
              padding: 6,
            },
          },
          dangerZone: {
            type: "box" as const,
            yMin: 0,
            yMax: supplyDepletion.minimum,
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            borderWidth: 0,
            label: {
              display: true,
              content: "CRITICAL ZONE",
              position: { x: "end" as const, y: "center" as const },
              color: "rgba(239, 68, 68, 0.5)",
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
          label: (ctx) => {
            if (ctx.parsed.y === null) return "";
            return `${ctx.dataset.label}: ${ctx.parsed.y} days`;
          },
        },
      },
    },
  };

  return (
    <div className="glass p-5">
      <h3 className="font-serif text-base font-semibold text-white mb-1">Supply Depletion Trajectory</h3>
      <p className="text-xs text-white-50 mb-4">Projected days of national fuel supply without new procurement</p>
      <div className="h-[300px] md:h-[350px]" role="img" aria-label="Supply depletion forecast chart">
        <Line data={data} options={options} />
      </div>
      <p className="text-[10px] text-white-20 mt-3">
        Source:{" "}
        <a href="https://doe.gov.ph/articles/group/reports-information-resources?category=Downstream+Oil+and+Natural+Gas&display_type=Card" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white-50 transition-colors">DOE weekly supply monitoring reports</a>
        {"; "}
        <a href="https://www.philstar.com/business/2026/03/27/2517009/philippines-fuel-supply-guaranteed-only-until-may-oil-firms-say" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white-50 transition-colors">Senate Energy Committee testimony (Mar 2026)</a>
      </p>
    </div>
  );
}
