import express from 'express';
import * as UserMaster from '../controllers/admin/userMaster.js';
import * as ChangePassword from '../controllers/admin/changePassword.js';
import * as UserRoleMaster from '../controllers/admin/userRoleMaster.js';
import * as androidAccessController from '../controllers/admin/androidAccess.js';
import * as SessionMaster from '../controllers/admin/sessionMaster.js';
import * as SessionController from '../controllers/admin/sessionController.js';
import { authWithSession } from '../middleware/authWithSession.js';

const router = express.Router();

router.get('/all-user-master', UserMaster.getAllUserDetails);
router.post('/insert-user-master', UserMaster.insertUserDetails);
router.patch('/edit-user-master', UserMaster.updateUserDetails);
router.get('/get-all-user-type', UserMaster.getAllUserTypeDD);

router.post('/change-password', ChangePassword.changePassword);

router.post('/insert-user-role', authWithSession, UserRoleMaster.insertUserRole);
router.patch('/update-user-role', authWithSession, UserRoleMaster.updateUserRoles);
router.get('/get-all-user-role', authWithSession, UserRoleMaster.getAllUserType);

router.patch('/edit-hht-user', authWithSession, androidAccessController.editHHTRegisterStatus);
router.post('/get-hht-user-specific', authWithSession, androidAccessController.getHHTRegisterSpecific);
router.post('/add-hht-req', androidAccessController.addHHTRegisterRequest);
router.get('/get-all-hht-req', authWithSession, androidAccessController.getAllRegisterHHTDevice);
router.post('/update-android-access', authWithSession, androidAccessController.updateAndroidAccess);
router.get('/get-pending-approvals', authWithSession, androidAccessController.getPendingApprovals);

router.get('/get-all-session-master', authWithSession, SessionMaster.getAllDetails);
router.patch('/update-session-master', authWithSession, SessionMaster.updateDetails);

router.post('/logout', authWithSession, SessionController.handleLogout);
router.get('/session-status', SessionController.getSessionStatus);
router.get('/active-sessions', SessionController.getActiveSessions);
router.post('/cleanup-sessions', SessionController.cleanupSessions);
router.get('/session-config', SessionController.getSessionConfig);
router.post('/refresh-session-config', SessionController.refreshSessionConfig);

export default router;
