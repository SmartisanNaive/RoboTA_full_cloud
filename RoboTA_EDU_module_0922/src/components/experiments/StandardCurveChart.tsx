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
import { TrendingUp, BarChart3 } from 'lucide-react';

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
  concentration: number;
  fluorescence: number;
}

interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  equation: string;
}

interface StandardCurveChartProps {
  data: DataPoint[];
  showRegression: boolean;
  regressionResult?: RegressionResult | null;
}

export const StandardCurveChart: React.FC<StandardCurveChartProps> = ({ 
  data, 
  showRegression, 
  regressionResult 
}) => {
  const chartRef = useRef(null);

  const calculateRegression = (points: DataPoint[]) => {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.concentration, 0);
    const sumY = points.reduce((sum, p) => sum + p.fluorescence, 0);
    const sumXY = points.reduce((sum, p) => sum + p.concentration * p.fluorescence, 0);
    const sumXX = points.reduce((sum, p) => sum + p.concentration * p.concentration, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const meanY = sumY / n;
    const ssRes = points.reduce((sum, p) => {
      const predicted = slope * p.concentration + intercept;
      return sum + Math.pow(p.fluorescence - predicted, 2);
    }, 0);
    const ssTot = points.reduce((sum, p) => sum + Math.pow(p.fluorescence - meanY, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { slope, intercept, rSquared };
  };

  const regression = regressionResult || calculateRegression(data);
  const minX = Math.min(...data.map(d => d.concentration));
  const maxX = Math.max(...data.map(d => d.concentration));

  const chartData = {
    datasets: [
      {
        label: 'Experimental Data',
        data: data.map(d => ({ x: d.concentration, y: d.fluorescence })),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBorderWidth: 2,
        pointBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
      ...(showRegression ? [{
        label: 'Linear Regression',
        data: [
          { x: minX, y: regression.slope * minX + regression.intercept },
          { x: maxX, y: regression.slope * maxX + regression.intercept }
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderColor: 'rgba(168, 85, 247, 1)',
        type: 'line' as const,
        pointRadius: 0,
        borderWidth: 3,
        borderDash: [5, 5],
        tension: 0,
      }] : [])
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
        text: 'Standard Curve: Concentration vs Fluorescence',
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
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Data Point: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(1)})`;
            } else {
              return `Regression Line: y = ${regression.slope.toFixed(4)}x + ${regression.intercept.toFixed(2)}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Concentration (ng/μL)',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Fluorescence Intensity',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 11
          }
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Enhanced Standard Curve</h3>
      </div>
      
      <div className="relative h-96 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-4 border border-gray-200">
        <Chart ref={chartRef} type="scatter" data={chartData} options={options} />
      </div>
      
      {showRegression && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
        >
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-green-800">Statistical Analysis</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-gray-600 text-xs uppercase tracking-wide">Equation</div>
              <div className="font-mono text-green-700 font-semibold mt-1">
                {regression.slope >= 0 ? 'y = ' : 'y = -'}{Math.abs(regression.slope).toFixed(4)}x + {regression.intercept.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-gray-600 text-xs uppercase tracking-wide">R-squared</div>
              <div className="font-mono text-green-700 font-semibold mt-1 text-lg">
                {regression.rSquared.toFixed(4)}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-gray-600 text-xs uppercase tracking-wide">Correlation</div>
              <div className={`font-semibold mt-1 ${
                regression.rSquared > 0.95 ? 'text-green-600' : 
                regression.rSquared > 0.90 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {regression.rSquared > 0.95 ? 'Excellent' : 
                 regression.rSquared > 0.90 ? 'Good' : 'Fair'}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-gray-600 text-xs uppercase tracking-wide">Data Points</div>
              <div className="font-semibold text-blue-700 mt-1 text-lg">
                {data.length}
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-white rounded-lg shadow-sm">
            <div className="text-gray-600 text-xs uppercase tracking-wide mb-2">Interpretation</div>
            <p className="text-sm text-gray-700">
              {regression.rSquared > 0.95 ? 
                'Excellent linear relationship. This standard curve is highly reliable for quantification.' :
                regression.rSquared > 0.90 ?
                'Good linear relationship. This standard curve is suitable for quantification with minor uncertainty.' :
                'Fair linear relationship. Consider optimizing experimental conditions or removing outliers.'
              }
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};