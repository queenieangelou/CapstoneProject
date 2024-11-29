// server/controller/forecasting.controller.js
import forecastingService from '../services/forecasting.service.js';
import Sale from '../mongodb/models/sale.js';
import Expense from '../mongodb/models/expense.js';
import Procurement from '../mongodb/models/procurement.js';
import Part from '../mongodb/models/part.js';

export const generateSalesForecast = async (req, res) => {
  try {
    // Get historical sales data
    const historicalSales = await Sale.find({})
      .sort({ date: 1 })
      .select('amount date')
      .lean();

    // Train the model
    await forecastingService.trainModel(
      historicalSales.map(sale => ({ value: sale.amount })),
      'sales'
    );

    // Generate forecast
    const forecast = await forecastingService.generateForecast(
      forecastingService.salesModel,
      historicalSales.map(sale => sale.amount)
    );

    res.status(200).json({
      success: true,
      forecast,
      historical: historicalSales
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateExpenseForecast = async (req, res) => {
  try {
    const historicalExpenses = await Expense.find({})
      .sort({ date: 1 })
      .select('amount date')
      .lean();

    await forecastingService.trainModel(
      historicalExpenses.map(expense => ({ value: expense.amount })),
      'expense'
    );

    const forecast = await forecastingService.generateForecast(
      forecastingService.expenseModel,
      historicalExpenses.map(expense => expense.amount)
    );

    res.status(200).json({
      success: true,
      forecast,
      historical: historicalExpenses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateProcurementForecast = async (req, res) => {
  try {
    const historicalProcurements = await Procurement.find({})
      .sort({ date: 1 })
      .select('cost date')
      .lean();

    await forecastingService.trainModel(
      historicalProcurements.map(proc => ({ value: proc.cost })),
      'procurement'
    );

    const forecast = await forecastingService.generateForecast(
      forecastingService.procurementModel,
      historicalProcurements.map(proc => proc.cost)
    );

    res.status(200).json({
      success: true,
      forecast,
      historical: historicalProcurements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generatePartDemandForecast = async (req, res) => {
  try {
    const { partId } = req.params;
    
    const historicalDemand = await Part.findById(partId)
      .select('demandHistory')
      .lean();

    if (!historicalDemand.demandHistory || historicalDemand.demandHistory.length < 6) {
      throw new Error('Insufficient historical data for forecasting');
    }

    await forecastingService.trainModel(
      historicalDemand.demandHistory.map(demand => ({ value: demand.quantity })),
      'demand'
    );

    const forecast = await forecastingService.generateForecast(
      forecastingService.demandModel,
      historicalDemand.demandHistory.map(demand => demand.quantity)
    );

    // Calculate seasonality
    const seasonalFactors = forecastingService.calculateSeasonality(
      historicalDemand.demandHistory.map(demand => ({ value: demand.quantity }))
    );

    res.status(200).json({
      success: true,
      forecast,
      historical: historicalDemand.demandHistory,
      seasonalFactors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};