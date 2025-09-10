import { executeQuery, sql } from '../../config/db.js';

// 1. Function to get all material details
export const getAllMaterialDetails = async (req, res) => {
  try {
    const result = await executeQuery('EXEC Sp_MaterialMaster_GetAll');
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'F',
      message: error.message,
      data: null,
    });
  }
};

// 2. Function to update material details
export const updateMaterialDetails = async (req, res) => {
  const {
    M_Id,
    MatCode,
    MatDesc,
    MatType,
    UOM,
    MaterialGroup,
    CreatedBy,
    SerilizationFlag,
    LotControlled,
    Tolerance,
    CompanyCode,
    QC,
    QC_Quantity_NEW,
    Packsize,
    Cost,
    MaterialCategory,
    Status,
    PalletCount,
    WMSApplicable,
    flag,
  } = req.body;

  try {
    const result = await executeQuery(
      'EXEC Sp_UpdatedMaterialDetails @M_Id, @MatCode, @MatDesc, @MatType, @UOM, @MaterialGroup, @CreatedBy, @SerilizationFlag, @LotControlled, @Tolerance, @CompanyCode, @QC, @QC_Quantity_NEW, @Packsize, @Cost, @MaterialCategory, @Status, @PalletCount,@WMSApplicable,@flag',
      [
        { name: 'M_Id', type: sql.Int, value: M_Id },
        { name: 'MatCode', type: sql.NVarChar, value: MatCode },
        { name: 'MatDesc', type: sql.NVarChar, value: MatDesc },
        { name: 'MatType', type: sql.NVarChar, value: MatType },
        { name: 'UOM', type: sql.NVarChar, value: UOM },
        { name: 'MaterialGroup', type: sql.NVarChar, value: MaterialGroup },
        { name: 'CreatedBy', type: sql.NVarChar, value: CreatedBy },
        {
          name: 'SerilizationFlag',
          type: sql.NVarChar,
          value: SerilizationFlag,
        },
        { name: 'LotControlled', type: sql.NVarChar, value: LotControlled },
        { name: 'Tolerance', type: sql.NVarChar, value: Tolerance },
        { name: 'CompanyCode', type: sql.NVarChar, value: CompanyCode },
        { name: 'QC', type: sql.NVarChar, value: QC },
        { name: 'QC_Quantity_NEW', type: sql.NVarChar, value: QC_Quantity_NEW },
        { name: 'Packsize', type: sql.NVarChar, value: Packsize },
        { name: 'Cost', type: sql.Decimal, value: Cost },
        {
          name: 'MaterialCategory',
          type: sql.NVarChar,
          value: MaterialCategory,
        },
        { name: 'Status', type: sql.NVarChar, value: Status },
        { name: 'PalletCount', type: sql.NVarChar, value: PalletCount },
        { name: 'WMSApplicable', type: sql.NVarChar, value: WMSApplicable },
        { name: 'flag', type: sql.NVarChar, value: flag },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
export const getAllMaterialCode = async (req, res) => {
  try {
    const result = await executeQuery('EXEC Sp_GetAllMatCode;');

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const insertMaterialDetails = async (req, res) => {
  const {
    PlantCode,
    MatCode,
    MatDesc,
    MatType,
    UOM,
    MaterialGroup,
    CreatedBy,
    SerilizationFlag,
    LotControlled,
    Tolerance,
    CompanyCode,
    QC,
    QC_Quantity_NEW,
    PalletCount,
    PackSize,
    Cost,
    MaterialCategory,
    Status,
    WMSApplicable,
    flag,
  } = req.body;

  try {
    const result = await executeQuery(
      `EXEC [Sp_InsertMaterialMaster] 
             @MatCode, @MatDesc, @MatType, @UOM, @MaterialGroup, @CreatedBy, 
             @SerilizationFlag, @LotControlled, @CompanyCode, @Tolerance, 
             @QC, @QC_Quantity_NEW, @PalletCount, @PackSize, @Cost_NEW, @MaterialCategory, 
             @Status,@WMSApplicable,@PlantCode,@flag, @RES OUTPUT;`,
      [
        { name: 'MatCode', type: sql.NVarChar, value: MatCode },
        { name: 'MatDesc', type: sql.NVarChar, value: MatDesc },
        { name: 'MatType', type: sql.NVarChar, value: MatType },
        { name: 'UOM', type: sql.NVarChar, value: UOM },
        { name: 'MaterialGroup', type: sql.NVarChar, value: MaterialGroup },
        { name: 'CreatedBy', type: sql.NVarChar, value: CreatedBy },
        {
          name: 'SerilizationFlag',
          type: sql.NVarChar,
          value: SerilizationFlag,
        },
        { name: 'LotControlled', type: sql.NVarChar, value: LotControlled },
        { name: 'Tolerance', type: sql.NVarChar, value: Tolerance },
        { name: 'CompanyCode', type: sql.NVarChar, value: CompanyCode },
        { name: 'QC', type: sql.NVarChar, value: QC },
        { name: 'QC_Quantity_NEW', type: sql.NVarChar, value: QC_Quantity_NEW },
        { name: 'PalletCount', type: sql.NVarChar, value: PalletCount },
        { name: 'PackSize', type: sql.NVarChar, value: PackSize },
        { name: 'Cost_NEW', type: sql.NVarChar, value: Cost },
        {
          name: 'MaterialCategory',
          type: sql.NVarChar,
          value: MaterialCategory,
        },
        { name: 'Status', type: sql.NVarChar, value: Status },
        { name: 'WMSApplicable', type: sql.NVarChar, value: WMSApplicable },
        { name: 'PlantCode', type: sql.NVarChar, value: PlantCode },
        { name: 'flag', type: sql.NVarChar, value: flag },
        { name: 'RES', type: sql.VarChar, direction: sql.Output }, // Output parameter
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
