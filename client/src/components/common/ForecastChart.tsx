// client/src/components/common/ForecastChart.tsx
import React, { useEffect, useState } from 'react';
import ReactApexCharts from 'react-apexcharts';
import { Box, Typography, CircularProgress } from '@pankod/refine-mui';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

interface ForecastChartProps {
    endpoint: string;  // This will be the API endpoint like "procurement", "parts-demand", etc.
    title: string;     // This is the title displayed above the chart
}

const ForecastChart: React.FC<ForecastChartProps> = ({ endpoint, title }) => {
    const [data, setData] = useState<number[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8080${endpoint}`);
                const result = response.data;

                // Handle different endpoints' data format
                if (endpoint === 'parts-demand') {
                    const partNames = Object.keys(result);
                    const demandValues = Object.values(result);
                    setCategories(partNames);
                    setData(demandValues as number[]);
                } else {
                    // For timeline forecasts (like procurement, sales, expenses, etc.)
                    setCategories(Array(result.length).fill('').map((_, i) => `Month ${i + 1}`)); // E.g., "Month 1", "Month 2", etc.
                    setData(result);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching forecast:', error);
                setLoading(false);
            }
        };

        fetchForecast();
    }, [endpoint]);

    const chartOptions: ApexOptions = {
        chart: {
            type: 'line',
            toolbar: { show: false },
        },
        xaxis: {
            categories,
        },
        yaxis: {
            title: { text: 'Values' },
        },
        tooltip: {
            y: {
                formatter: (value: number) => value.toFixed(2),
            },
        },
        theme: {
            palette: 'palette1',
        },
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
                {title}
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : (
                <ReactApexCharts options={chartOptions} series={[{ name: title, data }]} type="line" height={350} />
            )}
        </Box>
    );
};

export default ForecastChart;
