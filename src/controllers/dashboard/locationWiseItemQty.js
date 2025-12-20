import { executeQuery } from '../../config/db.js';

export const getLocationWiseItemQty = async (req, res) => {
  try {
    const result = await executeQuery('EXEC [dbo].[sp_get_location_wise_item_qty]');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching location wise item quantity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location wise item quantity',
      error: error.message,
    });
  }
};
