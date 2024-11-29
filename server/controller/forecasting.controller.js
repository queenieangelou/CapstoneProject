// server/controller/forecasting.controller.js
import {
  forecastProcurementExpenses,
  forecastSeasonalPartDemand,
  forecastSales,
  forecastExpenses,
} from '../services/forecasting.services.js';

export const getProcurementForecast = async (req, res) => {
  try {
    const periods = parseInt(req.query.periods || 3);
    const forecast = await forecastProcurementExpenses(periods);
    res.status(200).json(forecast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPartDemandForecast = async (req, res) => {
  try {
    const forecast = await forecastSeasonalPartDemand();
    res.status(200).json(forecast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesForecast = async (req, res) => {
  try {
    const periods = parseInt(req.query.periods || 3);
    const forecast = await forecastSales(periods);
    res.status(200).json(forecast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpensesForecast = async (req, res) => {
  try {
    const periods = parseInt(req.query.periods || 3);
    const forecast = await forecastExpenses(periods);
    res.status(200).json(forecast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
