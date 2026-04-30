import React, { useEffect, useState, useCallback } from 'react';
import { visitorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

const emptyForm = { name:'', email:'', phone:'', id_document:'', password:'', role:'visitor' };

export default function Visitors() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [toast, setToast]       = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await visitorsAPI.getAll(search);
      setVisitors(res.data);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (v) => {
    setEditItem(v);
    setForm({ name:v.name, email:v.email, phone:v.phone||'', id_document:v.id_document||'', password:'', role:v.role||'visitor' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        const { password, ...data } = form;
        await visitorsAPI.update(editItem.id, data);
        showToast('Visiteur mis à jour', 'success');
      } else {
        await visitorsAPI.create(form);
        showToast('Visiteur créé', 'success');
      }
      setShowModal(false);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await visitorsAPI.delete(id);
      showToast('Visiteur supprimé', 'success');
      setConfirmDel(null);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
  };

  const showToast = (msg, type) => setToast({ msg, type });

  const canCreate = ['admin','agent'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visiteurs</h1>
          <p className="page-sub">{visitors.length} visiteur{visitors.length !== 1 ? 's' : ''}</p>
        </div>
        {canCreate && <button className="btn btn-primary" onClick={openCreate}>+ Nouveau visiteur</button>}
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Rechercher par nom, email, téléphone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : visitors.length === 0 ? (
          <div className="empty-state"><div style={{fontSize:32}}>◎</div><p>Aucun visiteur trouvé</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Pièce d'identité</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map(v => (
                  <tr key={v.id}>
                    <td style={{ color:'var(--subtle)' }}>{v.id}</td>
                    <td style={{ fontWeight:500 }}>{v.name}</td>
                    <td style={{ color:'var(--muted)' }}>{v.email}</td>
                    <td style={{ color:'var(--muted)' }}>{v.phone || '—'}</td>
                    <td style={{ color:'var(--muted)' }}>{v.id_document || '—'}</td>
                    <td><span className={`badge badge-${v.role}`}>{v.role}</span></td>
                    <td style={{ color:'var(--muted)', whiteSpace:'nowrap' }}>
                      {new Date(v.created_at).toLocaleDateString('fr-MA')}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {canCreate && (
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(v)}>Modifier</button>
                        )}
                        {canDelete && (
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(v)}>Supprimer</button>
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

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>{editItem ? 'Modifier le visiteur' : 'Nouveau visiteur'}</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Nom complet</label>
                <input type="text" placeholder="Ahmed Benali" value={form.name} onChange={f('name')} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" placeholder="ahmed@email.com" value={form.email} onChange={f('email')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Téléphone</label>
                <input type="tel" placeholder="+212 6XX XXX XXX" value={form.phone} onChange={f('phone')} />
              </div>
              <div className="form-field">
                <label>Pièce d'identité</label>
                <input type="text" placeholder="CIN / Passeport" value={form.id_document} onChange={f('id_document')} />
              </div>
            </div>
            <div className="form-row">
              {!editItem && (
                <div className="form-field">
                  <label>Mot de passe</label>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={f('password')} />
                </div>
              )}
              <div className="form-field">
                <label>Rôle</label>
                <select value={form.role} onChange={f('role')}>
                  <option value="visitor">Visiteur</option>
                  <option value="agent">Agent</option>
                  <option value="admin_visitor">Admin visiteur</option>
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
