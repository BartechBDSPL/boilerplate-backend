import express from 'express';
import * as companyMasterController from '../controllers/masters/company-master.js';
import * as plantMasterController from '../controllers/masters/plant-master.js';
import * as whMaster from '../controllers/masters/warehouseMaster.js';
import * as whCategoryMaster from '../controllers/masters/whCategoryMaster.js';
import * as lineMaster from '../controllers/masters/lineMaster.js';
import * as WhLocationMaster from '../controllers/masters/whLocationMaster.js';
import * as PalletMasterController from '../controllers/masters/palletMaster.js';
import * as PrinterMasterController from '../controllers/masters/printerMaster.js';
import * as ExistingStockUpload from '../controllers/masters/exisiting-stock-upload.js';
import * as MaterialMaster from '../controllers/masters/materialMaster.js';
import * as LabelMasterController from '../controllers/masters/labelMaster.js';
import * as MaterialTypeMasterController from '../controllers/masters/material-type-master.js';
import { authWithSession } from '../middleware/authWithSession.js';
const router = express.Router();

router.get('/company/all-details', authWithSession, companyMasterController.getAllCompanyDetails);
router.patch('/company/update-details', authWithSession, companyMasterController.updateCompanyDetails);
router.post('/company/insert-details', authWithSession, companyMasterController.insertCompanyDetails);

router.get('/company/names', authWithSession, plantMasterController.getAllCompanyName);
router.post('/plant/insert-details', authWithSession, plantMasterController.insertAllDetails);
router.get('/plant/all-details', authWithSession, plantMasterController.getAllDetailsPlantMaster);
router.patch('/plant/update-details', authWithSession, plantMasterController.updateDetails);
router.get('/plant/codes', authWithSession, plantMasterController.getAllPlantCodes);

router.post('/insert-warehouse-category', authWithSession, whCategoryMaster.insertWhCategory);
router.get('/get-all-warehouse-category', authWithSession, whCategoryMaster.getAllWarehouseCategory);
router.patch('/update-warehouse-category', authWithSession, whCategoryMaster.updateWarehouseCategory);

router.get('/get-all-plant-code', authWithSession, whMaster.getAllPlantCode);
router.get('/get-all-warehouse-category-code', authWithSession, whMaster.getCategoryCode);
router.post('/wh-insert-details', authWithSession, whMaster.insertDetails);
router.patch('/wh-update-details', authWithSession, whMaster.updateDetails);
router.get('/wh-all-details', authWithSession, whMaster.getAllDetails);

router.get('/get-all-wh-code', authWithSession, WhLocationMaster.getAllWhCode);
router.get('/get-all-wh-location', authWithSession, WhLocationMaster.getAllDetails);
router.post('/insert-wh-location', authWithSession, WhLocationMaster.insertDetails);
router.patch('/update-wh-location', authWithSession, WhLocationMaster.updateDetails);
router.post('/upload-wh-location-excel', authWithSession, WhLocationMaster.uploadWhLocationExcel);

router.get('/get-all-material-details', authWithSession, MaterialMaster.getAllMaterialDetails);
router.post('/insert-material-details', authWithSession, MaterialMaster.insertMaterialDetails);
router.patch('/update-material-details', authWithSession, MaterialMaster.updateMaterialDetails);
router.post('/sync-materials-by-type', authWithSession, MaterialMaster.syncMaterialsByType);
router.get('/get-all-plant-code', authWithSession, MaterialMaster.getAllPlantCodes);

router.post('/upload-existing-stock', authWithSession, ExistingStockUpload.uploadStock);
router.get('/get-all-existing-stock', authWithSession, ExistingStockUpload.getAllStockUploaded);

// Line Master routes
router.get('/get-all-line', authWithSession, lineMaster.getAllLineMaster);
router.post('/insert-line', authWithSession, lineMaster.insertLineMaster);
router.patch('/update-line', authWithSession, lineMaster.updateLineMaster);
router.post('/get-all-line-name-by-plant', authWithSession, lineMaster.getPlantName);
router.get('/get-active-line-details', authWithSession, lineMaster.getActiveLineDetails);

router.post('/insert-pallet-master', authWithSession, PalletMasterController.insertPalletMaster);
router.post('/update-pallet-master', authWithSession, PalletMasterController.updatePalletMaster);
router.post('/pallet-barcode-exist', authWithSession, PalletMasterController.checkPalletBarcode);
router.get('/pallet-all-details', authWithSession, PalletMasterController.getAllPalletMasterDetails);

router.post('/insert-printer', authWithSession, PrinterMasterController.insertPrinter);
router.patch('/update-printer', authWithSession, PrinterMasterController.updatePrinter);
router.get('/get-all-printer', authWithSession, PrinterMasterController.getAllPrinters);
router.get('/ping-printer', authWithSession, PrinterMasterController.pingPrinter);

router.post('/insert-material-type', authWithSession, MaterialTypeMasterController.insertMaterialType);
router.patch('/update-material-type', authWithSession, MaterialTypeMasterController.updateMaterialType);
router.get('/get-all-material-types', authWithSession, MaterialTypeMasterController.getAllMaterialTypes);


router.get('/get-all-labels', authWithSession, LabelMasterController.getAllLabelMaster);
router.post('/insert-label', authWithSession, LabelMasterController.insertLabelMaster);
router.patch('/update-label', authWithSession, LabelMasterController.updateLabelMaster);



export default router;
