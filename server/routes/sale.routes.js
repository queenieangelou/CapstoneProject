// server\routes\sale.routes.js
import express from 'express';

import {
  createSale, deleteSale, getAllSales, getSaleDetail, updateSale,
} from '../controller/sale.controller.js';

const router = express.Router();

router
  .route('/')
  .get(getAllSales);

router
  .route('/:id')
  .get(getSaleDetail);

router
  .route('/')
  .post(createSale);

router
  .route('/:id')
  .patch(updateSale);

router
  .route('/:id')
  .delete(deleteSale);

export default router;