// client/src/components/common/ForecastChart.tsx
import React, { useState, useEffect } from 'react';
import ReactApexCharts from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ForecastData {
  historical: Array<{ date: string; amount: number }>;
  forecast: number[];
  seasonalFactors: any;
}

interface ForecastChartProps {
  title: string;
  type: 'sales' | 'expense' | 'procurement' | 'demand';
}

const ForecastChart: React.FC<ForecastChartProps> = ({ title, type }) => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/${type}/forecast`);
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching forecast data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  if (loading || !data) {
    return <div>Loading forecast data...</div>;
  }

  // Prepare data series
  const historicalDates = data.historical.map(item => new Date(item.date).toLocaleDateString());
  const historicalValues = data.historical.map(item => item.amount);

  // Generate forecast dates (next 3 months)
  const lastDate = new Date(data.historical[data.historical.length - 1].date);
  const forecastDates = Array.from({ length: data.forecast.length }, (_, i) => {
    const date = new Date(lastDate);
    date.setMonth(date.getMonth() + i + 1);
    return date.toLocaleDateString();
  });

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 400,
      zoom: {
        enabled: true
      }
    },
    title: {
      text: title,
      align: 'left'
    },
    xaxis: {
      categories: [...historicalDates, ...forecastDates],
      title: {
        text: 'Date'
      }
    },
    yaxis: {
      title: {
        text: type === 'demand' ? 'Quantity' : 'Amount ($)'
      }
    },
    colors: ['#2E93fA', '#FF9800'],
    stroke: {
      width: [3, 3],
      dashArray: [0, 5]
    },
    legend: {
      labels: {
        colors: '#333'
      }
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      }
    },
    markers: {
      size: 1
    }
  };

  const series = [
    {
      name: 'Historical',
      data: historicalValues
    },
    {
      name: 'Forecast',
      data: Array(historicalValues.length - 1).fill(null).concat([
        historicalValues[historicalValues.length - 1],
        ...data.forecast
      ])
    }
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <ReactApexCharts
        options={chartOptions}
        series={series}
        type="line"
        height={400}
      />
      {type === 'demand' && data.seasonalFactors && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Seasonal Factors</h3>
          <div className="grid grid-cols-4 gap-4">
            {data.seasonalFactors.map((factor: number, index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <span className="font-medium">Month {index + 1}:</span>
                <span className="ml-2">{factor.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastChart;