// client/src/pages/forecast.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Tab, Tabs, useTheme } from '@pankod/refine-mui';
import { useList } from '@pankod/refine-core';
import ForecastChart from '../components/common/ForecastChart';
import PartDemandForecastChart from 'components/common/PartDemandForecast';
import TurnaroundAnalysis from 'components/common/TurnaroundAnalysis';

const Forecast: React.FC = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" sx={{ marginBottom: 3 }}>
                Forecast Dashboard
            </Typography>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab label="Part Demand Forecast" />
                <Tab label="Procurement Forecast" />
                <Tab label="Sales Forecast" />
                <Tab label="Expenses Forecast" />
                <Tab label="Turnaround Analysis" />
            </Tabs>

            <Box sx={{ marginTop: 3 }}>
                {activeTab === 0 && <PartDemandForecastChart endpoint="/api/forecasting/parts-demand" title="Part Demand Forecast" />}
                {activeTab === 1 && <ForecastChart endpoint="/api/forecasting/procurement" title="Procurement Expenses Forecast" />}
                {activeTab === 2 && <ForecastChart endpoint="/api/forecasting/sales" title="Sales Forecast" />}
                {activeTab === 3 && <ForecastChart endpoint="/api/forecasting/expenses" title="Expenses Forecast" />}
                {activeTab === 4 && <TurnaroundAnalysis endpoint="/api/forecasting/turnaround" title="Turnaround Time Analysis" />}
            </Box>
        </Box>
    );
};

export default Forecast;
