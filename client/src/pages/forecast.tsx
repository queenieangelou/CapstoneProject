// client/src/pages/forecast.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Tab, Tabs, useTheme } from '@pankod/refine-mui';
import { useList } from '@pankod/refine-core';
import ForecastChart from '../components/common/ForecastChart';

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
                <Tab label="Procurement Forecast" />
                <Tab label="Part Demand Forecast" />
                <Tab label="Sales Forecast" />
                <Tab label="Expenses Forecast" />
            </Tabs>

            <Box sx={{ marginTop: 3 }}>
                {activeTab === 0 && <ForecastChart endpoint="/api/forecasting/procurement" title="Procurement Expenses Forecast" />}
                {activeTab === 1 && <ForecastChart endpoint="/api/forecasting/parts-demand" title="Part Demand Forecast" />}
                {activeTab === 2 && <ForecastChart endpoint="/api/forecasting/sales" title="Sales Forecast" />}
                {activeTab === 3 && <ForecastChart endpoint="/api/forecasting/expenses" title="Expenses Forecast" />}
            </Box>
        </Box>
    );
};

export default Forecast;
