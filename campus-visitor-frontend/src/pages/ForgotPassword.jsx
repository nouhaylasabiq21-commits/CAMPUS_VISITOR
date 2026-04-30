import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur');
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
          {!sent ? (
            <>
              <h2>Mot de passe oublié</h2>
              <p className="login-hint">Entrez votre email pour recevoir un lien de réinitialisation</p>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="votre@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                {error && <div className="login-error">{error}</div>}
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
              <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--muted)' }}>
                <Link to="/login" style={{ color:'var(--text)', textDecoration:'none', fontWeight:500 }}>
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:40, marginBottom:16 }}>✉</div>
              <h2 style={{ marginBottom:10 }}>Email envoyé !</h2>
              <p style={{ color:'var(--muted)', fontSize:13, marginBottom:24 }}>
                Vérifiez votre boîte mail (et les spams).
              </p>
              <Link to="/login" className="btn btn-outline" style={{ textDecoration:'none' }}>
                ← Retour à la connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}