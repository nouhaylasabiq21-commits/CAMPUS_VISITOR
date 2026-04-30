const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obligatoire' });

    let user = null, table = null;

    const vRes = await pool.query('SELECT id, name, email FROM visitors WHERE email = $1', [email]);
    if (vRes.rows.length > 0) { user = vRes.rows[0]; table = 'visitors'; }

    if (!user) {
      const hRes = await pool.query('SELECT id, name, email FROM hosts WHERE email = $1', [email]);
      if (hRes.rows.length > 0) { user = hRes.rows[0]; table = 'hosts'; }
    }

    if (!user) {
      return res.json({ message: 'Si cet email existe, un lien a été envoyé.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await pool.query(
      `UPDATE ${table} SET reset_token = $1, reset_token_expires = $2 WHERE id = $3`,
      [token, expires, user.id]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&table=${table}`;

    await transporter.sendMail({
      from: `"ENS Marrakech" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#1C1A14;">Réinitialisation du mot de passe</h2>
          <p style="color:#6B6760;">Bonjour ${user.name},</p>
          <p style="color:#6B6760;">Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#1C1A14;color:#F0EDE6;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#9E9B95;font-size:12px;">Ce lien expire dans 1 heure.</p>
        </div>
      `,
    });

    res.json({ message: 'Si cet email existe, un lien a été envoyé.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, table, password } = req.body;

    if (!token || !table || !password)
      return res.status(400).json({ message: 'Données manquantes' });

    if (!['visitors', 'hosts'].includes(table))
      return res.status(400).json({ message: 'Table invalide' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Minimum 6 caractères' });

    const result = await pool.query(
      `SELECT id FROM ${table} WHERE reset_token = $1 AND reset_token_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Lien invalide ou expiré' });

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE ${table} SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2`,
      [hash, result.rows[0].id]
    );

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    next(error);
  }
};

module.exports = { forgotPassword, resetPassword };