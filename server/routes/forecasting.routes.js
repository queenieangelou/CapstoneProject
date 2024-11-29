// server\routes\forecasting.routes.js
import express from 'express';
import {
  generateSalesForecast,
  generateExpenseForecast,
  generateProcurementForecast,
  generatePartDemandForecast
} from '../controller/forecasting.controller.js';

const router = express.Router();

router.get('/sales/forecast', generateSalesForecast);
router.get('/expense/forecast', generateExpenseForecast);
router.get('/procurement/forecast', generateProcurementForecast);
router.get('/part/:partId/forecast', generatePartDemandForecast);