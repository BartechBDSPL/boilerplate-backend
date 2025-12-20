import { executeQueryMultipleResults } from '../../config/db.js';

export const getPrintingReworkModelPutVsPick = async (req, res) => {
  try {
    console.log('Fetching printing, rework, model name, and put vs pick details...');

    const results = await executeQueryMultipleResults('EXEC sp_dashboard_printing_rework_model_name_putvspick_detail');

    const response = {
      success: true,
      message: 'Dashboard data fetched successfully',
      data: {
        printingMonthly: results[0] || [],
        topModels: results[1] || [],
        reworkMonthly: results[2] || [],
        putVsPick: results[3] || [],
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard details',
      error: error.message,
    });
  }
};
