"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register necessary elements for bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface QuickStatsBarProps {
  labels: string[];
  data: number[];
}

export default function BarChart({ labels, data }: QuickStatsBarProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Bookings Stats",
        data,
        backgroundColor: ["rgba(54, 235, 72, 0.42)", "rgba(54, 163, 235, 0.38)", "rgba(255, 99, 133, 0.41)", "#facc15"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}