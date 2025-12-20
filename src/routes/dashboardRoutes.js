import express from 'express';
import { getPrintingReworkModelPutVsPick } from '../controllers/dashboard/printingReworkModelPutVsPick.js';
import { getDashboardDetailsCounts } from '../controllers/dashboard/dashboardDetails.js';
import { getLocationWiseItemQty } from '../controllers/dashboard/locationWiseItemQty.js';
import { authWithSession } from '../middleware/authWithSession.js';

const router = express.Router();

router.get('/printing-rework-model-putvspick', authWithSession, getPrintingReworkModelPutVsPick);

router.post('/details', authWithSession, getDashboardDetailsCounts);

router.get('/location-wise-item-qty', authWithSession, getLocationWiseItemQty);

export default router;
