import express from 'express';
import * as authRoutes from '../controllers/auth/authController.js';

const router = express.Router();

router.post('/check-credentials', authRoutes.checkCredentials);
router.post('/user-exist', authRoutes.checkUserExist);
router.get('/get-user-type', authRoutes.getAllUserTypes);

export default router;
