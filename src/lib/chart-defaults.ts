"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels
);

// Disable datalabels globally — enable per-chart
ChartJS.defaults.plugins.datalabels = { display: false } as never;

// Global dark theme defaults
ChartJS.defaults.color = "rgba(255, 255, 255, 0.7)";
ChartJS.defaults.borderColor = "rgba(255, 255, 255, 0.08)";
ChartJS.defaults.font.family = "var(--font-dm-sans), DM Sans, system-ui, sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.pointStyleWidth = 8;
ChartJS.defaults.plugins.tooltip.backgroundColor = "rgba(15, 27, 45, 0.95)";
ChartJS.defaults.plugins.tooltip.borderColor = "rgba(255, 255, 255, 0.1)";
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.titleFont = { size: 13, weight: "bold" as const };
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
