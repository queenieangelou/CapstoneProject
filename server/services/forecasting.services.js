// server/services/forecasting.service.js
import * as tf from '@tensorflow/tfjs-node';

class ForecastingService {
  constructor() {
    this.salesModel = null;
    this.expenseModel = null;
    this.procurementModel = null;
    this.demandModel = null;
  }

  // Utility function to prepare time series data
  prepareTimeSeriesData(data, windowSize = 6) {
    const xs = [];
    const ys = [];
    
    for (let i = 0; i < data.length - windowSize; i++) {
      const window = data.slice(i, i + windowSize);
      const target = data[i + windowSize];
      xs.push(window);
      ys.push(target);
    }

    return [tf.tensor2d(xs, [xs.length, windowSize]), tf.tensor2d(ys, [ys.length, 1])];
  }

  // Create and train LSTM model
  async createModel(inputShape) {
    const model = tf.sequential();
    
    model.add(tf.layers.lstm({
      units: 50,
      inputShape: [inputShape, 1],
      returnSequences: false
    }));
    
    model.add(tf.layers.dense({ units: 1 }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  // Train model with historical data
  async trainModel(data, modelType) {
    const values = data.map(item => item.value);
    const [xs, ys] = this.prepareTimeSeriesData(values);
    
    const model = await this.createModel(xs.shape[1]);
    
    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.1,
      shuffle: true
    });

    // Store the trained model based on type
    switch(modelType) {
      case 'sales':
        this.salesModel = model;
        break;
      case 'expense':
        this.expenseModel = model;
        break;
      case 'procurement':
        this.procurementModel = model;
        break;
      case 'demand':
        this.demandModel = model;
        break;
    }

    return model;
  }

  // Generate forecasts
  async generateForecast(model, historicalData, periods = 3) {
    const forecasts = [];
    let lastWindow = historicalData.slice(-6);

    for (let i = 0; i < periods; i++) {
      const input = tf.tensor2d([lastWindow], [1, 6, 1]);
      const prediction = model.predict(input);
      const forecastValue = await prediction.data();
      
      forecasts.push(forecastValue[0]);
      lastWindow = [...lastWindow.slice(1), forecastValue[0]];
    }

    return forecasts;
  }

  // Seasonal adjustment using moving averages
  calculateSeasonality(data, period = 12) {
    const values = data.map(item => item.value);
    const seasonalIndices = Array(period).fill(0);
    const seasonsCount = Array(period).fill(0);
    
    for (let i = 0; i < values.length; i++) {
      const seasonIndex = i % period;
      seasonalIndices[seasonIndex] += values[i];
      seasonsCount[seasonIndex]++;
    }
    
    return seasonalIndices.map((sum, i) => sum / seasonsCount[i]);
  }
}

export default new ForecastingService();