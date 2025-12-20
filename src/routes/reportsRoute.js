import express from 'express';
import * as reportsController from '../controllers/reports/reportsController.js';

const router = express.Router();

router.post('/qc-details', reportsController.getQCDetailsReport);

router.post('/putaway-details', reportsController.getPutawayDetailsReport);

router.post('/rework', reportsController.getReworkReport);

router.post('/internal-movement', reportsController.getInternalMovementReport);

router.post('/picking', reportsController.getPickingReport);

router.post('/fg-label-printing', reportsController.getFGLabelPrintingReport);

router.post('/reprint-fg-label', reportsController.getReprintFGLabelReport);

router.post('/material-ageing', reportsController.getMaterialAgeingReport);

router.post('/return', reportsController.getReturnReport);

router.post('/live-stock', reportsController.getLiveStockReport);

export default router;
