import { Typography } from '@mui/material';
import { Box, Card, Paper } from '@pankod/refine-mui'
import ProcurementForecast from 'components/forecast/ProcurementForecast';
import React from 'react'

const Forecast = () => {

  return (
        <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          m: 2,
          overflow: 'hidden'
        }}>
          <Box>
            <Typography
            variant="h4"
            sx={{
              p: 2,
              fontWeight: 600,
            }}>
              Forecast
            </Typography>
          </Box>
          <Box
          sx={{ 
            p: 2,
            display: 'flex', 
            flexDirection: {xs: 'column', md: 'row'},
            gap: 2,
            alignItems: {xs: 'stretch', md: 'center'},
            justifyContent: 'space-between'
          }}>
            <ProcurementForecast />

          </Box>
        </Paper>

  )
}

export default Forecast