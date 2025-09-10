import express from 'express';
import * as UserMaster from '../controllers/admin/userMaster.js';
import * as ChangePassword from '../controllers/admin/changePassword.js';
import * as UserRoleMaster from '../controllers/admin/userRoleMaster.js';
import * as androidAccessController from '../controllers/admin/androidAccess.js';
import * as SessionMaster from '../controllers/admin/sessionMaster.js';
import auth from '../middleware/auth.js';

const router = express.Router();

//User Master
router.get('/all-user-master', auth, UserMaster.getAllUserDetails);
router.post('/insert-user-master', auth, UserMaster.insertUserDetails);
router.patch('/edit-user-master', auth, UserMaster.updateUserDetails);
router.get('/get-all-user-type', auth, UserMaster.getAllUserTypeDD);

//Change Password
router.post('/change-password', auth, ChangePassword.changePassword);

//User Role Master\
router.post('/insert-user-role', auth, UserRoleMaster.insertUserRole);
router.patch('/update-user-role', auth, UserRoleMaster.updateUserRoles);
router.get('/get-all-user-role', auth, UserRoleMaster.getAllUserType);

//Android Access
router.patch(
  '/edit-hht-user',
  auth,
  androidAccessController.editHHTRegisterStatus
);
router.post(
  '/get-hht-user-specific',
  auth,
  androidAccessController.getHHTRegisterSpecific
);
router.post('/add-hht-req', androidAccessController.addHHTRegisterRequest);
router.get(
  '/get-all-hht-req',
  auth,
  androidAccessController.getAllRegisterHHTDevice
);
router.post(
  '/update-android-access',
  auth,
  androidAccessController.updateAndroidAccess
);
router.get(
  '/get-pending-approvals',
  auth,
  androidAccessController.getPendingApprovals
);

// //Register Routes
// router.post('/register-user',registerController.insertAndroidAccess);
// router.post('/update-user',registerController.updateAndroidAccessStatus);

//Session Master
router.get('/get-all-session-master', auth, SessionMaster.getAllDetails);
router.post('/insert-session-master', auth, SessionMaster.insertDetails);
router.patch('/update-session-master', auth, SessionMaster.updateDetails);

export default router;
