import React, { useEffect, useState, useCallback } from 'react';
import { visitsAPI, visitorsAPI, hostsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const STATUS_OPTIONS = ['pending','approved','refused','ongoing','completed','cancelled'];
const STATUS_LABELS  = {
  pending:   'En attente',
  approved:  'Approuvée',
  refused:   'Refusée',
  ongoing:   'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

export default function Visits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [visits, setVisits]       = useState([]);
  const [visitors, setVisitors]   = useState([]);
  const [hosts, setHosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editVisit, setEditVisit] = useState(null);
  const [toast, setToast]         = useState(null);

  // Filtres
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHost, setFilterHost]     = useState('');
  const [filterDate, setFilterDate]     = useState('');

  const [form, setForm] = useState({
    visitor_id: '', host_id: '', purpose: '', scheduled_at: '', notes: ''
  });

  const isNew     = location.pathname === '/visits/new';
  const isVisitor = user?.role === 'visitor';
  const isAdmin   = user?.role === 'admin';
  const isAgent   = user?.role === 'agent';
  const isHost    = user?.role === 'host';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus) filters.status  = filterStatus;
      if (filterHost)   filters.host_id = filterHost;
      if (filterDate)   filters.date    = filterDate;
      const res = await visitsAPI.getAll(filters);
      setVisits(res.data);
    } finally { setLoading(false); }
  }, [filterStatus, filterHost, filterDate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    hostsAPI.getAll().then(h => setHosts(h.data)).catch(() => {});
    if (isAdmin || isAgent) {
      visitorsAPI.getAll().then(v => setVisitors(v.data)).catch(() => {});
    }
  }, [isAdmin, isAgent]);

  useEffect(() => { if (isNew) openCreate(); }, [isNew]);

  const resetFilters = () => {
    setFilterStatus('');
    setFilterHost('');
    setFilterDate('');
  };

  const hasFilters = filterStatus || filterHost || filterDate;

  const openCreate = () => {
    setEditVisit(null);
    setForm({ visitor_id: isVisitor ? user.id : '', host_id: '', purpose: '', scheduled_at: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditVisit(v);
    const dt = v.scheduled_at ? new Date(v.scheduled_at).toISOString().slice(0, 16) : '';
    setForm({ visitor_id: v.visitor_id, host_id: v.host_id, purpose: v.purpose || '', scheduled_at: dt, notes: v.notes || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.host_id || !form.scheduled_at) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error'); return;
    }
    try {
      if (editVisit) {
        await visitsAPI.update(editVisit.id, form);
        showToast('Visite mise à jour', 'success');
      } else {
        await visitsAPI.create(form);
        showToast('Demande de visite envoyée !', 'success');
      }
      setShowModal(false);
      if (isNew) navigate('/visits');
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
  };

  const handleStatus = async (id, status) => {
    try {
      await visitsAPI.updateStatus(id, status);
      showToast(`Statut : ${STATUS_LABELS[status]}`, 'success');
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
  };

  const handleCheckIn = async (id) => {
    try {
      await visitsAPI.checkIn(id, { agent_id: user.id });
      showToast('Check-in enregistré', 'success');
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur check-in', 'error'); }
  };

  const handleCheckOut = async (id) => {
    try {
      await visitsAPI.checkOut(id, { agent_id: user.id });
      showToast('Check-out enregistré', 'success');
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur check-out', 'error'); }
  };

  const handleCancel = async (id) => {
    try {
      await visitsAPI.updateStatus(id, 'cancelled');
      showToast('Visite annulée', 'success');
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
  };

  const showToast = (msg, type) => setToast({ msg, type });

  const canEdit       = isAdmin;
  const canStatus = isAdmin || isHost;
  const canCheckInOut = isAdmin || isAgent;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visites</h1>
          <p className="page-sub">
            {visits.length} visite{visits.length !== 1 ? 's' : ''} trouvée{visits.length !== 1 ? 's' : ''}
            {hasFilters && <span style={{ color:'var(--accent2)', marginLeft:8 }}>— filtres actifs</span>}
          </p>
        </div>
        {(isAdmin || isVisitor) && (
  <button className="btn btn-primary" onClick={openCreate}>
    + {isVisitor ? 'Demander une visite' : 'Nouvelle visite'}
  </button>
)}
      </div>

      {/* ── Filtres ── */}
      <div className="card" style={{ marginBottom: 20, padding: '18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>

          {/* Filtre statut */}
          <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1, minWidth:160 }}>
            <label style={{ fontSize:11, fontWeight:500, color:'var(--subtle)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Statut
            </label>
            <select
              className="search-input"
              style={{ height:38, maxWidth:'100%' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {!isVisitor && (
  <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1, minWidth:180 }}>
    <label style={{ fontSize:11, fontWeight:500, color:'var(--subtle)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
      Hôte
    </label>
    <select
      className="search-input"
      style={{ height:38, maxWidth:'100%' }}
      value={filterHost}
      onChange={e => setFilterHost(e.target.value)}
    >
      <option value="">Tous les hôtes</option>
      {hosts.map(h => (
        <option key={h.id} value={h.id}>{h.name} {h.department ? `— ${h.department}` : ''}</option>
      ))}
    </select>
  </div>
)}

          {/* Filtre date */}
          <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1, minWidth:160 }}>
            <label style={{ fontSize:11, fontWeight:500, color:'var(--subtle)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Date
            </label>
            <input
              type="date"
              className="search-input"
              style={{ height:38, maxWidth:'100%' }}
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>

          {/* Bouton reset */}
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, color:'transparent' }}>reset</label>
            <button
              className="btn btn-outline"
              onClick={resetFilters}
              disabled={!hasFilters}
              style={{ height:38, opacity: hasFilters ? 1 : 0.4 }}
            >
              ✕ Effacer
            </button>
          </div>

        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="card">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : visits.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize:32 }}>◈</div>
            <p>{hasFilters ? 'Aucune visite ne correspond aux filtres' : 'Aucune visite trouvée'}</p>
            {hasFilters && (
              <button className="btn btn-outline" style={{ marginTop:12 }} onClick={resetFilters}>
                Effacer les filtres
              </button>
            )}
            {isVisitor && !hasFilters && (
              <button className="btn btn-primary" style={{ marginTop:16 }} onClick={openCreate}>
                Faire une demande
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Visiteur</th>
                  <th>Hôte</th>
                  <th>Objet</th>
                  <th>Rendez-vous</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map(v => (
                  <tr key={v.id}>
                    <td style={{ color:'var(--subtle)', fontVariantNumeric:'tabular-nums' }}>{v.id}</td>
                    <td>
                      <div style={{ fontWeight:500, color:'var(--text)' }}>{v.visitor_name}</div>
                      <div style={{ fontSize:11, color:'var(--subtle)' }}>{v.visitor_email}</div>
                    </td>
                    <td>
                      <div style={{ color:'var(--text)' }}>{v.host_name}</div>
                      <div style={{ fontSize:11, color:'var(--subtle)' }}>{v.department}</div>
                    </td>
                    <td style={{ color:'var(--muted)', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {v.purpose || '—'}
                    </td>
                    <td style={{ whiteSpace:'nowrap', color:'var(--muted)' }}>
                      {new Date(v.scheduled_at).toLocaleString('fr-MA', {
                        day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
                      })}
                    </td>
                    <td>
                      <span className={`badge badge-${v.status}`}>{STATUS_LABELS[v.status]}</span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {canEdit && (
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(v)}>Modifier</button>
                        )}
                        {isVisitor && v.status === 'pending' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(v.id)}>Annuler</button>
                        )}
                        {canStatus && v.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{ background:'rgba(52,211,153,0.12)', color:'#34D399', border:'1px solid rgba(52,211,153,0.25)', fontWeight:600 }}
                              onClick={() => handleStatus(v.id, 'approved')}
                            >Approuver</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatus(v.id, 'refused')}>Refuser</button>
                          </>
                        )}
                        {canCheckInOut && v.status === 'approved' && (
                          <button
                            className="btn btn-sm"
                            style={{ background:'rgba(96,165,250,0.12)', color:'#60A5FA', border:'1px solid rgba(96,165,250,0.25)', fontWeight:600 }}
                            onClick={() => handleCheckIn(v.id)}
                          >Check-in</button>
                        )}
                        {canCheckInOut && v.status === 'ongoing' && (
                          <button
                            className="btn btn-sm"
                            style={{ background:'rgba(52,211,153,0.12)', color:'#34D399', border:'1px solid rgba(52,211,153,0.25)', fontWeight:600 }}
                            onClick={() => handleCheckOut(v.id)}
                          >Check-out</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>{isVisitor ? 'Demander une visite' : editVisit ? 'Modifier la visite' : 'Nouvelle visite'}</h3>

            {!isVisitor && (
              <div className="form-field">
                <label>Visiteur *</label>
                <select value={form.visitor_id} onChange={e => setForm(f=>({...f, visitor_id: e.target.value}))}>
                  <option value="">Sélectionner un visiteur</option>
                  {visitors.map(v => <option key={v.id} value={v.id}>{v.name} — {v.email}</option>)}
                </select>
              </div>
            )}

            {isVisitor && (
              <div className="form-field">
                <label>Visiteur</label>
                <input type="text" value={user.name} disabled style={{ opacity:0.5, cursor:'not-allowed' }}/>
              </div>
            )}

            <div className="form-field">
              <label>Hôte à visiter *</label>
              <select value={form.host_id} onChange={e => setForm(f=>({...f, host_id: e.target.value}))}>
                <option value="">Sélectionner un hôte</option>
                {hosts.map(h => <option key={h.id} value={h.id}>{h.name}{h.department ? ` — ${h.department}` : ''}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Date et heure *</label>
                <input type="datetime-local" value={form.scheduled_at}
                  onChange={e => setForm(f=>({...f, scheduled_at: e.target.value}))}/>
              </div>
              <div className="form-field">
                <label>Objet</label>
                <input type="text" placeholder="Réunion, entretien..." value={form.purpose}
                  onChange={e => setForm(f=>({...f, purpose: e.target.value}))}/>
              </div>
            </div>

            <div className="form-field">
              <label>Notes (optionnel)</label>
              <textarea rows={3} placeholder="Informations complémentaires..."
                value={form.notes} onChange={e => setForm(f=>({...f, notes: e.target.value}))}/>
            </div>

            {isVisitor && (
              <div style={{ background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:'var(--radius)', padding:'10px 14px', fontSize:12, color:'#60A5FA', marginBottom:16 }}>
                ℹ️ Votre demande sera envoyée en attente d'approbation par un responsable.
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => { setShowModal(false); if(isNew) navigate('/visits'); }}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {isVisitor ? 'Envoyer la demande' : editVisit ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}