const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerVisitor = async (req, res, next) => {
  try {
    const { name, email, phone, id_document, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont obligatoires' });
    }

    const existing = await pool.query(
      'SELECT id FROM visitors WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO visitors (name, email, phone, id_document, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'visitor')
       RETURNING id, name, email, role, created_at`,
      [name, email, phone || null, id_document || null, hashedPassword]
    );

    res.status(201).json({
      message: 'Inscription réussie',
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Email, mot de passe et type utilisateur sont obligatoires' });
    }

    let result;
    let user;

    if (userType === 'visitor' || userType === 'agent' || userType === 'admin_visitor') {
      result = await pool.query(
        'SELECT * FROM visitors WHERE email = $1',
        [email]
      );
      user = result.rows[0];
    } else if (userType === 'host' || userType === 'admin') {
      result = await pool.query(
        'SELECT * FROM hosts WHERE email = $1',
        [email]
      );
      user = result.rows[0];
    } else {
      return res.status(400).json({ message: 'Type utilisateur invalide' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        source: (userType === 'host' || userType === 'admin') ? 'hosts' : 'visitors',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const { id, source } = req.user;

    const table = source === 'hosts' ? 'hosts' : 'visitors';

    const result = await pool.query(
      `SELECT id, name, email, phone, role, created_at FROM ${table} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerVisitor,
  login,
  me,
};