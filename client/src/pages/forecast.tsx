// client/src/pages/forecast.tsx
import React from 'react';
import { Box, Typography, Tab, Tabs, useTheme } from '@pankod/refine-mui';
import { useList } from '@pankod/refine-core';
import ForecastChart from 'components/common/ForecastChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`forecast-tabpanel-${index}`}
      aria-labelledby={`forecast-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `forecast-tab-${index}`,
    'aria-controls': `forecast-tabpanel-${index}`,
  };
};

const Forecast: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  // Fetch summary data for each category
  const { data: salesData } = useList({
    resource: "sales",
    config: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const { data: expenseData } = useList({
    resource: "expenses",
    config: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const { data: procurementData } = useList({
    resource: "procurements",
    config: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 4 }}>
        Forecasting Dashboard
      </Typography>

      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="forecast tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 120,
                fontWeight: theme.typography.fontWeightRegular,
                fontSize: theme.typography.pxToRem(15),
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <Tab label="Sales Forecast" {...a11yProps(0)} />
            <Tab label="Expense Forecast" {...a11yProps(1)} />
            <Tab label="Procurement Forecast" {...a11yProps(2)} />
            <Tab label="Demand Forecast" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sales Forecast Analysis
            </Typography>
            <ForecastChart 
              title="Sales Forecast" 
              type="sales" 
            />
            {salesData && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Based on {salesData.total} historical sales records
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expense Forecast Analysis
            </Typography>
            <ForecastChart 
              title="Expense Forecast" 
              type="expense" 
            />
            {expenseData && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Based on {expenseData.total} historical expense records
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Procurement Forecast Analysis
            </Typography>
            <ForecastChart 
              title="Procurement Forecast" 
              type="procurement" 
            />
            {procurementData && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Based on {procurementData.total} historical procurement records
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={value} index={3}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Demand Forecast Analysis
            </Typography>
            <ForecastChart 
              title="Demand Forecast" 
              type="demand" 
            />
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Forecast;