import React, { useEffect, useState } from 'react';
import { visitsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

export default function CheckIn() {
  const { user } = useAuth();
  const [approved, setApproved] = useState([]);
  const [ongoing, setOngoing]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, o] = await Promise.all([
        visitsAPI.getAll({ status: 'approved' }),
        visitsAPI.getAll({ status: 'ongoing' }),
      ]);
      setApproved(a.data);
      setOngoing(o.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCheckIn = async (id) => {
    try {
      await visitsAPI.checkIn(id, { agent_id: user?.id || null });
      setToast({ msg: 'Check-in enregistré avec succès', type: 'success' });
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Erreur lors du check-in';
      setToast({ msg, type: 'error' });
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await visitsAPI.checkOut(id, { agent_id: user?.id || null });
      setToast({ msg: 'Check-out enregistré avec succès', type: 'success' });
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Erreur lors du check-out';
      setToast({ msg, type: 'error' });
    }
  };

  const VisitCard = ({ v, action, actionLabel, actionStyle }) => (
    <div className="checkin-card">
      <div className="checkin-info">
        <div className="checkin-visitor">{v.visitor_name}</div>
        <div className="checkin-meta">{v.visitor_email}</div>
        <div className="checkin-host">
          → {v.host_name}{' '}
          <span style={{ color: 'var(--subtle)' }}>({v.department})</span>
        </div>
        {v.purpose && <div className="checkin-purpose">{v.purpose}</div>}
      </div>
      <div className="checkin-right">
        <div className="checkin-time">
          {new Date(v.scheduled_at).toLocaleString('fr-MA', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
          })}
        </div>
        <button className="btn btn-sm" style={actionStyle} onClick={() => action(v.id)}>
          {actionLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check-in / Check-out</h1>
          <p className="page-sub">Gestion des entrées et sorties en temps réel</p>
        </div>
        <button className="btn btn-outline" onClick={load}>↻ Actualiser</button>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="checkin-grid">
          <div>
            <div className="checkin-section-header">
              <div className="checkin-dot" style={{ background: '#60A5FA', boxShadow: '0 0 8px #60A5FA' }} />
              <h2 style={{ fontSize: 18, color: '#073310' }}>Prêts à entrer</h2>
              <span className="checkin-count">{approved.length}</span>
            </div>
            {approved.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p>Aucune visite approuvée en attente</p>
              </div>
            ) : (
              approved.map(v => (
                <VisitCard
                  key={v.id}
                  v={v}
                  action={handleCheckIn}
                  actionLabel="Check-in ↓"
                  actionStyle={{
                    background: 'rgba(96,165,250,0.12)',
                    color: '#60A5FA',
                    border: '1px solid rgba(96,165,250,0.25)',
                    fontWeight: 600,
                  }}
                />
              ))
            )}
          </div>

          <div>
            <div className="checkin-section-header">
              <div className="checkin-dot" style={{ background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
              <h2 style={{ fontSize: 18, color: '#073310' }}>Sur le campus</h2>
              <span className="checkin-count">{ongoing.length}</span>
            </div>
            {ongoing.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p>Aucun visiteur actuellement présent</p>
              </div>
            ) : (
              ongoing.map(v => (
                <VisitCard
                  key={v.id}
                  v={v}
                  action={handleCheckOut}
                  actionLabel="Check-out ↑"
                  actionStyle={{
                    background: 'rgba(52,211,153,0.12)',
                    color: '#34D399',
                    border: '1px solid rgba(52,211,153,0.25)',
                    fontWeight: 600,
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}