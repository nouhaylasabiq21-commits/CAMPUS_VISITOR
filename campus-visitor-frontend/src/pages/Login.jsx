import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const USER_TYPES = [
  { value: 'admin', label: 'Administrateur', desc: 'Accès complet' },
  { value: 'agent', label: 'Agent', desc: 'Check-in / Check-out' },
  { value: 'host', label: 'Hôte', desc: 'Gestion invités' },
  { value: 'visitor', label: 'Visiteur', desc: 'Suivi visites' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', userType: 'admin' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password, form.userType);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = USER_TYPES.find(t => t.value === form.userType);

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="deco-pattern" />

        {/* Cadre décoratif art déco */}
        <div className="frame-outer" />
        <div className="frame-inner" />

        {/* Coins décoratifs */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="login-left-content">
          {/* Logo UCA en haut */}
          <div className="login-logo-top">
            <div className="logo-icon-wrap">
              <img 
                src="/uca-logo.png" 
                alt="UCA" 
                className="uca-logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {/* Fallback si l'image ne charge pas */}
              <div className="logo-fallback">❖</div>
            </div>
            
          </div>

          {/* Texte principal centré */}
          <div className="login-center-text">
            <h1>École Normale<br />Supérieure</h1>
            <div className="title-line" />
            <p className="subtitle-uni">Marrakech — Université Cadi Ayyad</p>
            <p className="subtitle-sys">Système de gestion des visiteurs</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Connexion</h2>
          <p className="login-hint">
            Profil d'accès
          </p>

          <div className="field">
            <div className="select-wrapper">
              <select
                value={form.userType}
                onChange={e => setForm(f => ({ ...f, userType: e.target.value }))}
                className="user-type-select"
              >
                {USER_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label} — {t.desc}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
            <span className="select-hint">
              {selectedType?.desc}
            </span>
          </div>

          <div className="field">
            <label>Adresse email</label>
            <input
              type="email"
              placeholder="admin@ens-marrakech.ma"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="field">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>

          <p className="forgot-link">
            Mot de passe oublié ?{' '}
            <Link to="/forgot-password">
              Réinitialiser
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}