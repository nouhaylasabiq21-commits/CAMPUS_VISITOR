import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import './Login.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get('token');
  const table          = searchParams.get('table');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  if (!token || !table) {
    return (
      <div className="login-root">
        <div className="login-right" style={{ width:'100%' }}>
          <div className="login-card" style={{ textAlign:'center' }}>
            <h2>Lien invalide</h2>
            <p style={{ color:'var(--muted)', margin:'12px 0 24px', fontSize:13 }}>
              Ce lien est invalide ou a expiré.
            </p>
            <Link to="/forgot-password" className="btn btn-primary" style={{ textDecoration:'none' }}>
              Nouvelle demande
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Minimum 6 caractères');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');
    setLoading(true);
    try {
      await API.post('/api/auth/reset-password', { token, table, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-badge">ENS</div>
          <h1>École Normale<br />Supérieure</h1>
          <p>Marrakech — Système de gestion des visiteurs du campus</p>
        </div>
        <div className="login-deco">
          <div className="deco-ring r1" /><div className="deco-ring r2" /><div className="deco-ring r3" />
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          {!done ? (
            <>
              <h2>Nouveau mot de passe</h2>
              <p className="login-hint">Choisissez un nouveau mot de passe sécurisé</p>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} required autoFocus />
                </div>
                <div className="field">
                  <label>Confirmer</label>
                  <input type="password" placeholder="••••••••" value={confirm}
                    onChange={e => setConfirm(e.target.value)} required />
                </div>
                {error && <div className="login-error">{error}</div>}
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? 'Réinitialisation...' : 'Réinitialiser'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:40, marginBottom:16 }}>✓</div>
              <h2>Mot de passe modifié !</h2>
              <p style={{ color:'var(--muted)', fontSize:13, margin:'12px 0' }}>
                Redirection dans 3 secondes...
              </p>
              <Link to="/login" className="btn btn-primary" style={{ textDecoration:'none' }}>
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}