import express from 'express';
import * as companyMasterController from '../controllers/masters/company-master.js';
import * as plantMasterController from '../controllers/masters/plant-master.js';
import * as whMaster from '../controllers/masters/warehouseMaster.js';
import * as whCategoryMaster from '../controllers/masters/whCategoryMaster.js';
import * as lineMaster from '../controllers/masters/lineMaster.js';
import * as MaterialMaster from '../controllers/masters/materialMaster.js';
import * as UOMMaster from '../controllers/masters/uomMaster.js';
import * as WhLocationMaster from '../controllers/masters/whLocationMaster.js';
import * as PalletMasterController from '../controllers/masters/palletMaster.js';
import * as ShiftMasterController from '../controllers/masters/shiftMaster.js';
import * as PrinterMasterController from '../controllers/masters/printerMaster.js';
import * as MaterialMasterExisiting from '../controllers/masters/materialMasterExisiting.js';
import * as MaterialExistingStockUpload from '../controllers/masters/material-master-existing-stock-upload.js';
import * as ExistingStockUpload from '../controllers/masters/exisiting-stock-upload.js';
import auth from '../middleware/auth.js';
import * as TransporterMasterController from '../controllers/masters/transporterMaster.js';
const router = express.Router();

// Company Master
router.get('/company/all-details', auth, companyMasterController.getAllCompanyDetails);
router.patch('/company/update-details', auth, companyMasterController.updateCompanyDetails);
router.post('/company/insert-details', auth, companyMasterController.insertCompanyDetails);

// Plant Master
router.get('/company/names', auth, plantMasterController.getAllCompanyName);
router.post('/plant/insert-details', auth, plantMasterController.insertAllDetails);
router.get('/plant/all-details', auth, plantMasterController.getAllDetailsPlantMaster);
router.patch('/plant/update-details', auth, plantMasterController.updateDetails);
router.get('/plant/codes', auth, plantMasterController.getAllPlantCodes);

//UOM Master
router.get('/all-uom-details', auth, UOMMaster.getAllUom);
router.get('/all-uom-unit', auth, UOMMaster.getAllUomUnits);
router.post('/insert-uom-details', auth, UOMMaster.insertUom);
router.patch('/update-uom-details', auth, UOMMaster.updateUom);

//Warehouse Category Master
router.post('/insert-warehouse-category', auth, whCategoryMaster.insertWhCategory);
router.get('/get-all-warehouse-category', auth, whCategoryMaster.getAllWarehouseCategory);
router.patch('/update-warehouse-category', auth, whCategoryMaster.updateWarehouseCategory);

//Warehouse Master
router.get('/get-all-plant-code', auth, whMaster.getAllPlantCode);
router.get('/get-all-warehouse-category-code', auth, whMaster.getCategoryCode);
router.post('/wh-insert-details', auth, whMaster.insertDetails);
router.patch('/wh-update-details', auth, whMaster.updateDetails);
router.get('/wh-all-details', auth, whMaster.getAllDetails);
//Warehouse Location Master
router.get('/get-all-wh-code', auth, WhLocationMaster.getAllWhCode);
router.get('/get-all-wh-location', auth, WhLocationMaster.getAllDetails);
router.post('/insert-wh-location', auth, WhLocationMaster.insertDetails);
router.patch('/update-wh-location', auth, WhLocationMaster.updateDetails);
router.post('/upload-wh-location-excel', auth, WhLocationMaster.uploadWhLocationExcel);

//Material Master
router.get('/get-all-material-details', auth, MaterialMaster.getAllMaterialDetails);
router.post('/insert-material-details', auth, MaterialMaster.insertMaterialDetails);
router.patch('/update-material-details', auth, MaterialMaster.updateMaterialDetails);
router.get('/get-all-mat-code', auth, MaterialMaster.getAllMaterialCode);

// Material Master Exisiting Data
router.post('/post-material-master', auth, MaterialMasterExisiting.postMaterialMaster);
// Material Master Existing Stock Upload
router.post('/upload-material-existing-stock', auth, MaterialExistingStockUpload.uploadMaterialExistingStock);
router.get('/get-all-material-existing-stock', auth, MaterialExistingStockUpload.getAllMaterialUploaded);
router.post('/insert-material-existing-stock', auth, MaterialExistingStockUpload.insertMaterialExistingStock);
router.post('/update-material-existing-stock', auth, MaterialExistingStockUpload.updateMaterialExistingStock);

// Existing Stock Upload
router.post('/upload-existing-stock', auth, ExistingStockUpload.uploadStock);
router.get('/get-all-existing-stock', auth, ExistingStockUpload.getAllStockUploaded);

//Line Master
router.get('/get-all-line', auth, lineMaster.getAllLineMaster);
router.post('/insert-line', auth, lineMaster.insertLineMaster);
router.patch('/update-line', auth, lineMaster.updateLineMaster);
router.get('/get-all-plant-name', auth, lineMaster.getPlantName);
//TO get all plant code use -> get-all-plant-code

//Pallet Master
router.post('/insert-pallet-master', auth, PalletMasterController.insertPalletMaster);
router.post('/update-pallet-master', auth, PalletMasterController.updatePalletMaster);
router.post('/pallet-barcode-exist', auth, PalletMasterController.checkPalletBarcode);
router.get('/pallet-all-details', auth, PalletMasterController.getAllPalletMasterDetails);

// Printer Master
router.post('/insert-printer', auth, PrinterMasterController.insertPrinter);
router.post('/update-printer', auth, PrinterMasterController.updatePrinter);
router.get('/get-all-printer', auth, PrinterMasterController.getAllPrinters);
router.get('/ping-printer', auth, PrinterMasterController.pingPrinter);

// Shift Master
router.post('/insert-shift', auth, ShiftMasterController.insertShift);
router.post('/update-shift', auth, ShiftMasterController.updateShift);
router.get('/get-all-shift', auth, ShiftMasterController.getAllShift);

// Transporter Master
router.post('/insert-transporter', auth, TransporterMasterController.insertTransporter);
router.post('/update-transporter', auth, TransporterMasterController.updateTransporter);
router.get('/get-all-transporter', auth, TransporterMasterController.getAllTransporters);

export default router;
