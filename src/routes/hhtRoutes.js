import express from 'express';
import * as qcRoutes from '../controllers/hht/quality-check.js';
import * as putawayRoutes from '../controllers/hht/put-away-routes.js';
import * as reworkRoutes from '../controllers/hht/hhtRework.js';
import * as deliveryPicking from '../controllers/hht/delivery-picking.js';
import * as internalMovement from '../controllers/hht/internal-movement.js';
import * as hhtReturn from '../controllers/hht/hhtReturn.js';
import * as hhtOemInward from '../controllers/hht/hhtOemInward.js';
import upload from '../middleware/qcImageUpload.js';

const router = express.Router();

router.post('/qc-validation', qcRoutes.qcValidation);
router.post('/qc-update', upload.single('image'), qcRoutes.qcUpdate);

router.post('/putaway-validation', putawayRoutes.hhtPutawayValidation);
router.post('/putaway-update', putawayRoutes.hhtPutawayUpdate);
router.post('/location-exists', putawayRoutes.hhtLocationExists);
router.post('/location-suggestion', putawayRoutes.hhtLocationSuggestion);

router.post('/rework-validation', reworkRoutes.hhtReworkValidation);
router.post('/rework-update', reworkRoutes.hhtReworkUpdate);

router.post('/delivery-orders', deliveryPicking.getDeliveryOrders);
router.post('/delivery-order-details', deliveryPicking.getDeliveryOrderDetails);
router.post('/pick-validation', deliveryPicking.hhtPickValidation);
router.post('/pick-update', deliveryPicking.hhtPickUpdate);
router.post('/pick-serialno-details', deliveryPicking.hhtPickSerialNoDetails);
router.post('/pick-recent-details', deliveryPicking.hhtPickRecentDetails);
router.post('/pick-reversal', deliveryPicking.hhtPickReversal);
router.post('/pick-manual-closing', deliveryPicking.hhtPickManualClosing);

router.post('/internal-movement-validation', internalMovement.hhtInternalMovementValidation);
router.post('/internal-movement-update', internalMovement.hhtInternalMovementUpdate);

router.post('/return-validation', hhtReturn.hhtReturnValidation);
router.post('/return-update', hhtReturn.hhtReturnUpdate);

router.post('/oem-inward-validation', hhtOemInward.validateSerialNo);
router.post('/oem-inward-update', hhtOemInward.updateInward);
router.get('/oem-party-names', hhtOemInward.getPartyNames);
router.post('/oem-category-names', hhtOemInward.getCategoryNames);
router.post('/oem-model-names', hhtOemInward.getModelNames);

export default router;
