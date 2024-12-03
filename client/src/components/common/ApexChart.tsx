// ApexChart.tsx
import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

interface ApexChartProps {
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut';
  series: any; // This allows for both array of objects and array of numbers
  options?: ApexOptions;
  colors?: string[];
}

const ApexChart: React.FC<ApexChartProps> = ({ type, series, options = {}, colors }) => {
  const defaultOptions: ApexOptions = {
    chart: {
      type,
      toolbar: {
        show: false,
      },
    },
    colors,
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: type === 'pie' || type === 'donut' ? 'bottom' : 'top',
    },
    stroke: {
      curve: 'smooth',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  return (
    <Chart
      options={mergedOptions}
      series={series}
      type={type}
      height={350}
    />
  );
};

export default ApexChart;