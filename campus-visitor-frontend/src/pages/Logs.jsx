import React, { useEffect, useState } from 'react';
import { logsAPI } from '../services/api';

export default function Logs() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logsAPI.getAll()
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const eventStyle = {
    CHECK_IN:  { background: 'var(--blue-bg)',  color: 'var(--blue)',   label: '↓ Entrée' },
    CHECK_OUT: { background: 'var(--green-bg)', color: 'var(--green)',  label: '↑ Sortie' },
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Journal des événements</h1>
          <p className="page-sub">{logs.length} événement{logs.length !== 1 ? 's' : ''} enregistré{logs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><div style={{fontSize:32}}>≡</div><p>Aucun événement enregistré</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Événement</th>
                  <th>Visiteur</th>
                  <th>Hôte</th>
                  <th>Objet de la visite</th>
                  <th>Notes</th>
                  <th>Horodatage</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => {
                  const ev = eventStyle[l.event_type] || { background:'var(--surface2)', color:'var(--muted)', label: l.event_type };
                  return (
                    <tr key={l.id}>
                      <td style={{ color:'var(--subtle)' }}>{l.id}</td>
                      <td>
                        <span className="badge" style={{ background: ev.background, color: ev.color }}>
                          {ev.label}
                        </span>
                      </td>
                      <td style={{ fontWeight:500 }}>{l.visitor_name}</td>
                      <td style={{ color:'var(--muted)' }}>{l.host_name}</td>
                      <td style={{ color:'var(--muted)' }}>{l.purpose || '—'}</td>
                      <td style={{ color:'var(--subtle)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {l.notes || '—'}
                      </td>
                      <td style={{ color:'var(--muted)', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums', fontSize:12 }}>
                        {new Date(l.timestamp).toLocaleString('fr-MA', {
                          day:'2-digit', month:'short', year:'numeric',
                          hour:'2-digit', minute:'2-digit', second:'2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
