import { executeQuery, sql } from '../../config/db.js';

export const dashboardDetails = async (req, res) => {
  const { FromDate, ToDate } = req.body;

  try {
    const result = await executeQuery(`EXEC [dbo].[Sp_DashboardDetails] @FromDate, @ToDate`, {
      FromDate: { type: sql.NVarChar(10), value: FromDate },
      ToDate: { type: sql.NVarChar(10), value: ToDate },
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardDetailsCounts = async (req, res) => {
  const { from_date, to_date } = req.body;

  try {
    const result = await executeQuery(`EXEC [dbo].[sp_dashboard_details] @from_date, @to_date`, {
      from_date: { type: sql.NVarChar(20), value: from_date },
      to_date: { type: sql.NVarChar(20), value: to_date },
    });
    console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching dashboard details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard details',
      error: error.message,
    });
  }
};
