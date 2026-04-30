import React, { useEffect, useState } from 'react';
import { visitsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const load = async () => {
    try {
      if (user?.role === 'visitor') {
        const visitsRes = await visitsAPI.getAll({});
        setRecentVisits(visitsRes.data.slice(0, 6));
        setStats(null);
      } else {
        const [statsRes, visitsRes] = await Promise.all([
          visitsAPI.getDashboardStats(),
          visitsAPI.getAll({ status: '' }),
        ]);

        setStats(statsRes.data);
        setRecentVisits(visitsRes.data.slice(0, 6));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [user]);

  const statusLabel = {
    pending: 'En attente', approved: 'Approuvée', ongoing: 'En cours',
    completed: 'Terminée', refused: 'Refusée', cancelled: 'Annulée',
  };
  const isVisitor = user?.role === 'visitor';

const visitorStats = {
  total: recentVisits.length,
  pending: recentVisits.filter(v => v.status === 'pending').length,
  approved: recentVisits.filter(v => v.status === 'approved').length,
  history: recentVisits.filter(v =>
    ['completed', 'refused', 'cancelled'].includes(v.status)
  ).length,
};
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}</h1>
          <p className="page-sub">
            {now.toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {user?.role !== 'agent' && user?.role !== 'host' && (
  <Link to="/visits/new" className="btn btn-primary">
    + Demander une visite
  </Link>
)}
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <>
          <div className="stats">
  <div className="stat-card stat-blue">
    <div className="stat-label">
      {isVisitor ? 'Mes demandes' : 'Visiteurs présents'}
    </div>
    <div className="stat-value">
      {isVisitor ? visitorStats.total : (stats?.visitors_present_now ?? 0)}
    </div>
    <div className="stat-hint">
      {isVisitor ? 'Total de mes demandes' : 'En ce moment sur le campus'}
    </div>
  </div>

  <div className="stat-card stat-green">
    <div className="stat-label">
      {isVisitor ? 'En attente' : "Visites aujourd'hui"}
    </div>
    <div className="stat-value">
      {isVisitor ? visitorStats.pending : (stats?.visits_today ?? 0)}
    </div>
    <div className="stat-hint">
      {isVisitor ? 'Demandes non traitées' : 'Programmées ce jour'}
    </div>
  </div>

  <div className="stat-card stat-gold">
    <div className="stat-label">
      {isVisitor ? 'Approuvées' : 'En attente'}
    </div>
    <div className="stat-value">
      {isVisitor ? visitorStats.approved : (stats?.pending_visits ?? 0)}
    </div>
    <div className="stat-hint">
      {isVisitor ? 'Visites validées' : 'Demandes à traiter'}
    </div>
  </div>

  <div className="stat-card stat-muted">
    <div className="stat-label">
      {isVisitor ? 'Historique' : 'Refusées / Annulées'}
    </div>
    <div className="stat-value">
      {isVisitor
        ? visitorStats.history
        : (stats?.refused_visits ?? 0) + (stats?.cancelled_visits ?? 0)}
    </div>
    <div className="stat-hint">
      {isVisitor ? 'Terminées / refusées / annulées' : 'Total cumulé'}
    </div>
  </div>
</div>

          <div className="card" style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18 }}>Visites récentes</h2>
              <Link to="/visits" className="btn btn-outline btn-sm">Voir tout</Link>
            </div>
            {recentVisits.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 32 }}>◎</div>
                <p>Aucune visite enregistrée</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Visiteur</th>
                      <th>Hôte</th>
                      <th>Département</th>
                      <th>Objet</th>
                      <th>Date prévue</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map(v => (
                      <tr key={v.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{v.visitor_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--subtle)' }}>{v.visitor_email}</div>
                        </td>
                        <td>{v.host_name}</td>
                        <td style={{ color: 'var(--muted)' }}>{v.department || '—'}</td>
                        <td style={{ color: 'var(--muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.purpose || '—'}
                        </td>
                        <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          {new Date(v.scheduled_at).toLocaleString('fr-MA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <span className={`badge badge-${v.status}`}>
                            {statusLabel[v.status] || v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
