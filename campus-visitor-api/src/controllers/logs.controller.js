const pool = require('../config/db');

const getAllLogs = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        l.*,
        v.purpose,
        vis.name AS visitor_name,
        h.name AS host_name
      FROM visit_logs l
      JOIN visits v ON l.visit_id = v.id
      JOIN visitors vis ON v.visitor_id = vis.id
      JOIN hosts h ON v.host_id = h.id
      ORDER BY l.timestamp DESC`
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getLogsByVisitId = async (req, res, next) => {
  try {
    const { visit_id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM visit_logs
       WHERE visit_id = $1
       ORDER BY timestamp ASC`,
      [visit_id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLogs,
  getLogsByVisitId,
};