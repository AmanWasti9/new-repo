"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface QuickStatsDoughnutProps {
  labels: string[];
  data: number[];
}

export default function QuickStatsDoughnut({
  labels,
  data,
}: QuickStatsDoughnutProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Quick Stats",
        data,
        backgroundColor: ["#22c55e", "#3b82f6","#ef4444", "#facc15"],
        borderWidth: 1,
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
  };

  return <Doughnut data={chartData} options={options} />;
}
