import express from 'express';
import * as reprintController from '../controllers/transactions/reprintController.js';
import { authWithSession } from '../middleware/authWithSession.js';

const router = express.Router();

router.post('/insert-reprint-fg-label', authWithSession, reprintController.insertReprintFGLabel);
router.post('/get-reprint-fg-label-details', authWithSession, reprintController.getReprintFGLabelDetails);

export default router;
