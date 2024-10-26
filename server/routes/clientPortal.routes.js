// server\routes\clientPortal.routes.js
import express from 'express';
import { searchClientByName } from '../controller/clientPortal.controller.js';

const router = express.Router();

router.get('/search', searchClientByName);

export default router;