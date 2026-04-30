const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllHosts = async (req, res, next) => {
  try {
    const search = req.query.search || '';

    const result = await pool.query(
      `SELECT id, name, email, phone, department, role, created_at
       FROM hosts
       WHERE name ILIKE $1 OR email ILIKE $1 OR department ILIKE $1
       ORDER BY id DESC`,
      [`%${search}%`]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getHostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, phone, department, role, created_at
       FROM hosts
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hôte introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createHost = async (req, res, next) => {
  try {
    const { name, email, phone, department, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont obligatoires' });
    }

    const existing = await pool.query('SELECT id FROM hosts WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO hosts (name, email, phone, department, role, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, department, role, created_at`,
      [name, email, phone || null, department || null, role || 'host', hashedPassword]
    );

    res.status(201).json({
      message: 'Hôte créé avec succès',
      host: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const updateHost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, role } = req.body;

    const existing = await pool.query('SELECT id FROM hosts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Hôte introuvable' });
    }

    const result = await pool.query(
      `UPDATE hosts
       SET name = $1,
           email = $2,
           phone = $3,
           department = $4,
           role = $5
       WHERE id = $6
       RETURNING id, name, email, phone, department, role, created_at`,
      [name, email, phone || null, department || null, role || 'host', id]
    );

    res.json({
      message: 'Hôte mis à jour avec succès',
      host: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteHost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM hosts WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hôte introuvable' });
    }

    res.json({ message: 'Hôte supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHosts,
  getHostById,
  createHost,
  updateHost,
  deleteHost,
};