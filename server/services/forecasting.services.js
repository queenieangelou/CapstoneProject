// server/services/forecasting.service.js
import expenseModel from '../mongodb/models/expense.js';
import procurementModel from '../mongodb/models/procurement.js';
import saleModel from '../mongodb/models/sale.js';
import deploymentModel from '../mongodb/models/deployment.js';
import moment from 'moment';
import * as tf from '@tensorflow/tfjs-node'; // TensorFlow.js for training forecasting models

export const generateForecast = async (model, field, dateField, periods, interval = 'month') => {
  // Step 1: Fetch data
  const data = await model
    .find({ deleted: false })
    .sort({ [dateField]: 1 })
    .select(`${field} ${dateField}`);
    
  if (data.length < 2) throw new Error('Insufficient data to generate forecast.');

  // Step 2: Prepare data
  const timeSeries = data.map(item => ({
    value: item[field],
    date: moment(item[dateField]).startOf(interval).toDate(),
  }));

  const groupedData = {};
  timeSeries.forEach(({ value, date }) => {
    const key = moment(date).format(`YYYY-MM-${interval === 'month' ? '01' : 'DD'}`);
    groupedData[key] = (groupedData[key] || 0) + value;
  });

  const sortedKeys = Object.keys(groupedData).sort();
  const values = sortedKeys.map(key => groupedData[key]);

  // Step 3: Create model for prediction
  const xs = tf.tensor1d(values.slice(0, -1)); // Input
  const ys = tf.tensor1d(values.slice(1));    // Output (shifted)

  const modelTensor = tf.sequential();
  modelTensor.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  modelTensor.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  await modelTensor.fit(xs.reshape([-1, 1]), ys, { epochs: 100 });

  // Step 4: Generate Forecast
  let current = values[values.length - 1];
  const predictions = [];
  for (let i = 0; i < periods; i++) {
    const prediction = modelTensor.predict(tf.tensor2d([current], [1, 1]));
    current = prediction.arraySync()[0][0];
    predictions.push(current);
  }

  return predictions;
};

export const forecastProcurementExpenses = async (periods) =>
  generateForecast(procurementModel, 'amount', 'date', periods);

export const forecastSeasonalPartDemand = async (periods) => {
  const deployments = await deploymentModel.find({ deleted: false }).populate('parts.part');
  const partUsage = {};

  deployments.forEach(deployment => {
    deployment.parts.forEach(({ part, quantityUsed }) => {
      partUsage[part.partName] = (partUsage[part.partName] || 0) + quantityUsed;
    });
  });

  // Return simplified demand data for all parts
  return partUsage;
};

export const forecastSales = async (periods) =>
  generateForecast(saleModel, 'amount', 'date', periods);

export const forecastExpenses = async (periods) =>
  generateForecast(expenseModel, 'amount', 'date', periods);
