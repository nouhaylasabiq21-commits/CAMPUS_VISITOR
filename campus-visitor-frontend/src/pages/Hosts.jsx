import React, { useEffect, useState, useCallback } from 'react';
import { hostsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

const emptyForm = { name:'', email:'', phone:'', department:'', password:'', role:'host' };

export default function Hosts() {
  const { user } = useAuth();
  const [hosts, setHosts]     = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [toast, setToast]         = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hostsAPI.getAll(search);
      setHosts(res.data);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (h) => {
    setEditItem(h);
    setForm({ name:h.name, email:h.email, phone:h.phone||'', department:h.department||'', password:'', role:h.role||'host' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        const { password, ...data } = form;
        await hostsAPI.update(editItem.id, data);
        showToast('Hôte mis à jour', 'success');
      } else {
        await hostsAPI.create(form);
        showToast('Hôte créé', 'success');
      }
      setShowModal(false);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await hostsAPI.delete(id);
      showToast('Hôte supprimé', 'success');
      setConfirmDel(null);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
  };

  const showToast = (msg, type) => setToast({ msg, type });
  const isAdmin = user?.role === 'admin';
  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hôtes</h1>
          <p className="page-sub">{hosts.length} hôte{hosts.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Nouvel hôte</button>}
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Rechercher par nom, email, département..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : hosts.length === 0 ? (
          <div className="empty-state"><div style={{fontSize:32}}>◇</div><p>Aucun hôte trouvé</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Département</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {hosts.map(h => (
                  <tr key={h.id}>
                    <td style={{ color:'var(--subtle)' }}>{h.id}</td>
                    <td style={{ fontWeight:500 }}>{h.name}</td>
                    <td style={{ color:'var(--muted)' }}>{h.email}</td>
                    <td style={{ color:'var(--muted)' }}>{h.phone || '—'}</td>
                    <td>
                      {h.department ? (
                        <span className="badge badge-agent" style={{ background:'var(--gold-bg)', color:'var(--gold)' }}>
                          {h.department}
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className={`badge badge-${h.role}`}>{h.role}</span></td>
                    <td style={{ color:'var(--muted)', whiteSpace:'nowrap' }}>
                      {new Date(h.created_at).toLocaleDateString('fr-MA')}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(h)}>Modifier</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(h)}>Supprimer</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>{editItem ? "Modifier l'hôte" : 'Nouvel hôte'}</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Nom complet</label>
                <input type="text" placeholder="Dr. Karima Idrissi" value={form.name} onChange={f('name')} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={f('email')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Téléphone</label>
                <input type="tel" value={form.phone} onChange={f('phone')} />
              </div>
              <div className="form-field">
                <label>Département</label>
                <input type="text" placeholder="Informatique, Mathématiques..." value={form.department} onChange={f('department')} />
              </div>
            </div>
            <div className="form-row">
              {!editItem && (
                <div className="form-field">
                  <label>Mot de passe</label>
                  <input type="password" value={form.password} onChange={f('password')} />
                </div>
              )}
              <div className="form-field">
                <label>Rôle</label>
                <select value={form.role} onChange={f('role')}>
                  <option value="host">Hôte</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <h3>Confirmer la suppression</h3>
            <p style={{ color:'var(--muted)', marginTop:8 }}>
              Supprimer <strong>{confirmDel.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDel.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
