import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface InteractiveChartProps {
  title: string;
  data: DataPoint[];
  xLabel: string;
  yLabel: string;
  type?: 'line' | 'scatter';
  color?: string;
  showLegend?: boolean;
  height?: number;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  title,
  data,
  xLabel,
  yLabel,
  type = 'line',
  color = '#3b82f6',
  showLegend = true,
  height = 400
}) => {
  const chartRef = useRef(null);

  const chartData = {
    datasets: [
      {
        label: title,
        data: data,
        backgroundColor: `${color}20`,
        borderColor: color,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointBorderColor: '#ffffff',
        borderWidth: 3,
        tension: 0.4,
        fill: type === 'line'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500' as const
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: xLabel,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yLabel,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ height: `${height}px` }}>
        <Chart ref={chartRef} type={type} data={chartData} options={options} />
      </div>
    </motion.div>
  );
};