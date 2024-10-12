import express from 'express';

import {
    createDeployment, deleteDeployment, getAllDeployments, getDeploymentDetail, updateDeployment,
} from '../controller/deployment.controller.js';

const router = express.Router();

router
    .route('/')
    .get(getAllDeployments);

router
    .route('/:id')
    .get(getDeploymentDetail);

router
    .route('/')
    .post(createDeployment);

router
    .route('/:id')
    .patch(updateDeployment);

router
    .route('/:id')
    .delete(deleteDeployment);

export default router;