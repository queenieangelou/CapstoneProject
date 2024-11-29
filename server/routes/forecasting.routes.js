// server\routes\forecasting.routes.js
import express from 'express';
import {
    getProcurementForecast,
    getPartDemandForecast,
    getSalesForecast,
    getExpensesForecast,
} from '../controller/forecasting.controller.js';

const router = express.Router();

router.get('/procurement', getProcurementForecast);
router.get('/parts-demand', getPartDemandForecast);
router.get('/sales', getSalesForecast);
router.get('/expenses', getExpensesForecast);

export default router;
