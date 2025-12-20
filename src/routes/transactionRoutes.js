import express from 'express';
import * as fgLabel from '../controllers/transactions/fg-label-printing.js';
import * as deliveryOrder from '../controllers/transactions/deliveryOrderController.js';
import * as warrantyController from '../controllers/transactions/warrantyController.js';
import * as productionOrderAssign from '../controllers/transactions/productionOrderAssign.js';
import * as productLabelPrinting from '../controllers/transactions/productLabelPrinting.js';
import { authWithSession } from '../middleware/authWithSession.js';

const router = express.Router();

router.post('/find-label-serial-no', authWithSession, fgLabel.findLabelSerialNo);
router.post('/insert-fg-label-printing', authWithSession, fgLabel.insertFGLabelPrinting);

router.get('/get-all-labels', authWithSession, fgLabel.getAllLabels);
router.get('/get-active-printers', authWithSession, fgLabel.getActivePrinters);
router.post('/check-printer-connectivity', authWithSession, fgLabel.checkPrinterConnectivity);

router.post('/generate-delivery-order-no', authWithSession, deliveryOrder.generateDeliveryOrderNo);
router.post('/get-model-wise-quantity', authWithSession, deliveryOrder.getModelWiseQuantity);
router.post('/insert-delivery-order-request', authWithSession, deliveryOrder.insertDeliveryOrderRequest);
router.post('/update-delivery-order-request', authWithSession, deliveryOrder.updateDeliveryOrderRequest);
router.get('/get-recent-delivery-orders', authWithSession, deliveryOrder.getRecentDeliveryOrderDetails);
router.get('/get-active-users', authWithSession, deliveryOrder.getActiveUsers);

router.post('/warranty-status', authWithSession, warrantyController.warrantyStatus);
router.post('/warranty-validation', authWithSession, warrantyController.warrantyValidation);
router.post('/warranty-update', authWithSession, warrantyController.warrantyUpdate);

router.post('/production-order-details', authWithSession, productionOrderAssign.getProductionOrderDetails);
router.post('/production-order-insert', authWithSession, productionOrderAssign.insertProductionOrder);
router.get('/get-recent-assigned-production-orders', authWithSession, productionOrderAssign.getRecentAssignedProductionOrders);

router.post('/get-active-production-orders-by-assigned-line', authWithSession, productLabelPrinting.getActiveProductionOrdersByAssignedLine);

router.post('/get-unprinted-labels', authWithSession, productLabelPrinting.getUnprintedLabels);

router.post('/update-label-printing-print-status', authWithSession, productLabelPrinting.updateLabelPrintingPrintStatus);

export default router;
