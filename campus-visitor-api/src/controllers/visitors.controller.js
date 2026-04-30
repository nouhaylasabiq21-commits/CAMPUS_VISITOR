const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllVisitors = async (req, res, next) => {
  try {
    const search = req.query.search || '';

    const result = await pool.query(
      `SELECT id, name, email, phone, id_document, role, created_at
       FROM visitors
       WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
       ORDER BY id DESC`,
      [`%${search}%`]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getVisitorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, phone, id_document, role, created_at
       FROM visitors
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visiteur introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createVisitor = async (req, res, next) => {
  try {
    const { name, email, phone, id_document, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont obligatoires' });
    }

    const existing = await pool.query('SELECT id FROM visitors WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO visitors (name, email, phone, id_document, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, id_document, role, created_at`,
      [name, email, phone || null, id_document || null, hashedPassword, role || 'visitor']
    );

    res.status(201).json({
      message: 'Visiteur créé avec succès',
      visitor: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const updateVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, id_document, role } = req.body;

    const existing = await pool.query('SELECT id FROM visitors WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Visiteur introuvable' });
    }

    const result = await pool.query(
      `UPDATE visitors
       SET name = $1,
           email = $2,
           phone = $3,
           id_document = $4,
           role = $5
       WHERE id = $6
       RETURNING id, name, email, phone, id_document, role, created_at`,
      [name, email, phone || null, id_document || null, role || 'visitor', id]
    );

    res.json({
      message: 'Visiteur mis à jour avec succès',
      visitor: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM visitors WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visiteur introuvable' });
    }

    res.json({ message: 'Visiteur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
};