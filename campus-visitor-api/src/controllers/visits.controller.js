const pool = require('../config/db');

const getAllVisits = async (req, res, next) => {
  try {
    const { status, host_id, date } = req.query;

    let query = `
      SELECT 
        v.id,
        v.visitor_id,
        v.host_id,
        v.purpose,
        v.scheduled_at,
        v.status,
        v.notes,
        v.created_at,
        v.updated_at,
        vis.name AS visitor_name,
        vis.email AS visitor_email,
        h.name AS host_name,
        h.department
      FROM visits v
      JOIN visitors vis ON v.visitor_id = vis.id
      JOIN hosts h ON v.host_id = h.id
      WHERE 1=1
    `;

    const values = [];
    let idx = 1;
    if (req.user.role === 'visitor') {
  query += ` AND v.visitor_id = $${idx++}`;
  values.push(req.user.id);
}
    if (req.user.role === 'host') {
  query += ` AND v.host_id = $${idx++}`;
  values.push(req.user.id);
}

    if (status) {
      query += ` AND v.status = $${idx++}`;
      values.push(status);
    }

    if (host_id && req.user.role !== 'host') {
  query += ` AND v.host_id = $${idx++}`;
  values.push(host_id);
}

    if (date) {
      query += ` AND DATE(v.scheduled_at) = $${idx++}`;
      values.push(date);
    }

    query += ' ORDER BY v.scheduled_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        v.*,
        vis.name AS visitor_name,
        vis.email AS visitor_email,
        h.name AS host_name,
        h.department
      FROM visits v
      JOIN visitors vis ON v.visitor_id = vis.id
      JOIN hosts h ON v.host_id = h.id
      WHERE v.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visite introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createVisit = async (req, res, next) => {
  try {
    const { visitor_id, host_id, purpose, scheduled_at, notes } = req.body;

    if (!visitor_id || !host_id || !scheduled_at) {
      return res.status(400).json({ message: 'visitor_id, host_id et scheduled_at sont obligatoires' });
    }

    const visitorCheck = await pool.query('SELECT id FROM visitors WHERE id = $1', [visitor_id]);
    if (visitorCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Visiteur introuvable' });
    }

    const hostCheck = await pool.query('SELECT id FROM hosts WHERE id = $1', [host_id]);
    if (hostCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Hôte introuvable' });
    }

    const result = await pool.query(
      `INSERT INTO visits (visitor_id, host_id, purpose, scheduled_at, status, notes, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [visitor_id, host_id, purpose || null, scheduled_at, notes || null]
    );

    res.status(201).json({
      message: 'Demande de visite créée avec succès',
      visit: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const updateVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { host_id, purpose, scheduled_at, notes } = req.body;

    const existing = await pool.query('SELECT * FROM visits WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Visite introuvable' });
    }

    const visit = existing.rows[0];

    if (visit.status === 'completed' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Une visite terminée ne peut plus être modifiée sauf admin' });
    }

    const result = await pool.query(
      `UPDATE visits
       SET host_id = $1,
           purpose = $2,
           scheduled_at = $3,
           notes = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [host_id, purpose, scheduled_at, notes || null, id]
    );

    res.json({
      message: 'Visite mise à jour avec succès',
      visit: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const updateVisitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'approved', 'refused', 'ongoing', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const existing = await pool.query('SELECT * FROM visits WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Visite introuvable' });
    }

    const visit = existing.rows[0];
    if (visit.status === 'completed' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Une visite terminée ne peut plus être modifiée sauf admin' });
    }

    const result = await pool.query(
      `UPDATE visits
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: 'Statut mis à jour avec succès',
      visit: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const checkInVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agent_id, notes } = req.body;

    const existing = await pool.query('SELECT * FROM visits WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Visite introuvable' });
    }

    const visit = existing.rows[0];

    if (visit.status === 'completed') {
      return res.status(400).json({ message: 'Visite déjà terminée' });
    }

    await pool.query('BEGIN');

    const updatedVisit = await pool.query(
      `UPDATE visits
       SET status = 'ongoing', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    await pool.query(
      `INSERT INTO visit_logs (visit_id, agent_id, event_type, notes)
       VALUES ($1, $2, 'CHECK_IN', $3)`,
      [id, agent_id || null, notes || null]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Check-in enregistré avec succès',
      visit: updatedVisit.rows[0],
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    next(error);
  }
};

const checkOutVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agent_id, notes } = req.body;

    const existing = await pool.query('SELECT * FROM visits WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Visite introuvable' });
    }

    const visit = existing.rows[0];

    if (visit.status !== 'ongoing') {
      return res.status(400).json({ message: 'Check-out impossible sans visite en cours' });
    }

    await pool.query('BEGIN');

    const updatedVisit = await pool.query(
      `UPDATE visits
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    await pool.query(
      `INSERT INTO visit_logs (visit_id, agent_id, event_type, notes)
       VALUES ($1, $2, 'CHECK_OUT', $3)`,
      [id, agent_id || null, notes || null]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Check-out enregistré avec succès',
      visit: updatedVisit.rows[0],
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const presentNow = await pool.query(
      `SELECT COUNT(*) 
       FROM visits
       WHERE status = 'ongoing'`
    );

    const todayVisits = await pool.query(
      `SELECT COUNT(*) 
       FROM visits
       WHERE DATE(scheduled_at) = CURRENT_DATE`
    );

    const refusedVisits = await pool.query(
      `SELECT COUNT(*)
       FROM visits
       WHERE status = 'refused'`
    );

    const cancelledVisits = await pool.query(
      `SELECT COUNT(*)
       FROM visits
       WHERE status = 'cancelled'`
    );

    const pendingVisits = await pool.query(
      `SELECT COUNT(*)
       FROM visits
       WHERE status = 'pending'`
    );

    res.json({
      visitors_present_now: Number(presentNow.rows[0].count),
      visits_today: Number(todayVisits.rows[0].count),
      refused_visits: Number(refusedVisits.rows[0].count),
      cancelled_visits: Number(cancelledVisits.rows[0].count),
      pending_visits: Number(pendingVisits.rows[0].count),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVisits,
  getVisitById,
  createVisit,
  updateVisit,
  updateVisitStatus,
  checkInVisit,
  checkOutVisit,
  getDashboardStats,
};