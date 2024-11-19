import React, { useState, useMemo } from 'react';
import { useList } from '@pankod/refine-core';
import { Typography, Box, Stack, TextField } from '@pankod/refine-mui';
import Chart from 'react-apexcharts';

const Dashboard = () => {
  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch data from the resources
  const { data: procurements } = useList({ resource: 'procurements' });
  const { data: deployments } = useList({ resource: 'deployments' });
  const { data: sales } = useList({ resource: 'sales' });
  const { data: expenses } = useList({ resource: 'expenses' });

  // Function to filter data based on selected date range
  const isWithinDateRange = (dateString: string) => {
    if (!startDate && !endDate) return true;
    const date = new Date(dateString);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  };

  // Helper function to get month name
  const getMonthName = (dateString: string) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [year, month] = dateString.split('-');
    return monthNames[parseInt(month, 10) - 1];
  };

  // Filter and process procurement data
  const procurementData = useMemo(() => {
    if (!procurements?.data) return [];
    const filteredData = procurements.data.filter((item) => isWithinDateRange(item.date));
    return filteredData.reduce((acc, curr) => {
      const month = getMonthName(curr.date);
      if (!acc[month]) acc[month] = { month, totalAmount: 0, vatAmount: 0, nonVatAmount: 0 };
      acc[month].totalAmount += Number(curr.amount) || 0;
      acc[month].vatAmount += Number(curr.inputVAT) || 0;
      acc[month].nonVatAmount += Number(curr.netOfVAT) || 0;
      return acc;
    }, {});
  }, [procurements, startDate, endDate]);

  // Calculate total procurements
  const totalProcurements = Object.values(procurementData).reduce((sum, item) => sum + item.totalAmount, 0);

  // Filter and process deployment data
  const deploymentData = useMemo(() => {
    if (!deployments?.data) return [];
    const filteredData = deployments.data.filter((item) => isWithinDateRange(item.date));
    return filteredData.reduce((acc, curr) => {
      const month = getMonthName(curr.date);
      if (!acc[month]) acc[month] = { month, deployments: 0, releases: 0 };
      acc[month].deployments += curr.deploymentStatus ? 1 : 0;
      acc[month].releases += curr.releaseStatus ? 1 : 0;
      return acc;
    }, {});
  }, [deployments, startDate, endDate]);

  // Calculate total deployments
  const totalDeployments = Object.values(deploymentData).reduce((sum, item) => sum + item.deployments, 0);

  // Filter and process sales data
  const salesData = useMemo(() => {
    if (!sales?.data) return [];
    const filteredData = sales.data.filter((item) => isWithinDateRange(item.date));
    return filteredData.reduce((acc, curr) => {
      const month = getMonthName(curr.date);
      if (!acc[month]) acc[month] = { month, totalSales: 0, outputVAT: 0 };
      acc[month].totalSales += Number(curr.amount) || 0;
      acc[month].outputVAT += Number(curr.outputVAT) || 0;
      return acc;
    }, {});
  }, [sales, startDate, endDate]);

  // Calculate total sales
  const totalSales = Object.values(salesData).reduce((sum, item) => sum + item.totalSales, 0);
  console.log('Raw Sales:', salesData);
  // Filter and process expense data
  const expenseData = useMemo(() => {
    if (!expenses?.data) return [];
    const filteredData = expenses.data.filter((item) => isWithinDateRange(item.date));
    return filteredData.reduce((acc, curr) => {
      const category = curr.description || 'Other';
      if (!acc[category]) acc[category] = { name: category, value: 0 };
      acc[category].value += Number(curr.amount) || 0;
      return acc;
    }, {});
  }, [expenses, startDate, endDate]);

  // Calculate total expenses
  const totalExpenses = Object.values(expenseData).reduce((sum, item) => sum + item.value, 0);
  console.log('Raw Expenses:', expenseData);
  const renderMiniChart = (data: number[], color: string) => {
    const series = [
        {
            name: 'Trend', // Add a name to match the ApexChartSeries format
            data: data, // Ensure data is an array of numbers
        },
    ];

    return (
        <Chart
            type="line"
            series={series}
            options={{
                chart: {
                    type: 'line',
                    toolbar: { show: false },
                    sparkline: { enabled: true },
                },
                stroke: {
                    curve: 'smooth',
                    width: 2,
                },
                colors: [color],
                xaxis: {
                    categories: Array.from({ length: data.length }, (_, i) => i.toString()), // Generate dummy x-axis categories
                    labels: { show: false },
                },
                yaxis: { show: false },
                tooltip: { enabled: false },
            }}
            height={50}
            width="100%"
        />
    );
};

  return (
    <Box>
      <Typography fontSize={25} fontWeight={700} color="#11142D">
        Dashboard
      </Typography>

      {/* Date Filter Inputs */}
      <Box display="flex" gap={2} mb={4}>
        <TextField
          size="small"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Summary Cards */}
      <Box display="flex" gap={4} mb={4}>
        {[
            { label: 'Total Sales', value: totalSales, data: salesData, color: '#4CAF50' },
            { label: 'Total Expenses', value: totalExpenses, data: expenseData, color: '#FF5722' },
            { label: 'Total Procurements', value: totalProcurements, data: procurementData, color: '#3F51B5' },
            { label: 'Total Deployments', value: totalDeployments, data: deploymentData, color: '#FFC107' },
        ].map((item, index) => (
            <Box key={index} p={4} bgcolor="white" borderRadius="15px" flex={1} minWidth="200px">
                <Typography fontSize={18} fontWeight={600} color="#11142D">
                    {item.label}
                </Typography>
                <Typography fontSize={24} fontWeight={700} color="#11142D">
                    {item.value.toLocaleString()}
                </Typography>
                <Box mt={2}>
                    {renderMiniChart(
                        Object.values(item.data).map(i => Number(i.totalAmount || i.value || i.deployments || 0)), 
                        item.color
                    )}
                </Box>
            </Box>
        ))}
    </Box>

      {/* Charts and Data Display */}
      <Box mt="20px" display="flex" flexWrap="wrap" gap={4}>
        {/* Procurement Chart */}
        <Box flex={1} minWidth="400px" p={4} bgcolor="white" borderRadius="15px">
          <Typography fontSize={18} fontWeight={600} color="#11142D">
            Procurement Overview
          </Typography>
          <Chart
            type="bar"
            series={[
              { name: "Total Amount", data: Object.values(procurementData).map((item) => item.totalAmount) },
              { name: "VAT Amount", data: Object.values(procurementData).map((item) => item.vatAmount) },
              { name: "Non-VAT Amount", data: Object.values(procurementData).map((item) => item.nonVatAmount) }
            ]}
            options={{
              chart: { type: 'bar' },
              xaxis: { categories: Object.keys(procurementData) },
            }}
            height={300}
          />
        </Box>
        
        {/* Deployment Chart with ApexCharts */}
        <Box flex={1} minWidth="400px" p={4} bgcolor="white" borderRadius="15px">
          <Typography fontSize={18} fontWeight={600} color="#11142D">
            Deployment Status
          </Typography>
          <Chart
            type="line"
            series={[
              { name: "Deployments", data: Object.values(deploymentData).map((item) => item.deployments) },
              { name: "Releases", data: Object.values(deploymentData).map((item) => item.releases) }
            ]}
            options={{
              chart: { type: 'line' },
              xaxis: { categories: Object.keys(deploymentData) }
            }}
            height={300}
          />
        </Box>
        </Box>

        <Stack mt="25px" width="100%" direction={{ xs: 'column', lg: 'row' }} gap={4}>
        {/* Sales Performance with ApexCharts */}
          <Box flex={2} p={4} bgcolor="white" borderRadius="15px">
            <Typography fontSize={18} fontWeight={600} color="#11142D">
              Sales Performance
            </Typography>
            <Chart
              type="bar"
              series={[
                { name: "Total Sales", data: Object.values(salesData).map((item) => item.totalSales) },
                { name: "Output VAT", data: Object.values(salesData).map((item) => item.outputVAT) }
              ]}
              options={{
                chart: { type: 'bar' },
                xaxis: { categories: Object.keys(salesData) },
              }}
              height={300}
            />
          </Box>

        {/* Expense Distribution with ApexCharts */}
          <Box flex={1} p={4} bgcolor="white" borderRadius="15px">
            <Typography fontSize={18} fontWeight={600} color="#11142D">
              Expense Distribution
            </Typography>
            <Chart
              type="pie"
              series={Object.values(expenseData).map((item) => item.value)}
              options={{
                labels: Object.keys(expenseData),
                legend: { position: 'bottom' }
              }}
              height={300}
            />
      </Box>
        </Stack>
    </Box>
  );
};

export default Dashboard;
