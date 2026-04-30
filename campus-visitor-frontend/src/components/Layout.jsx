import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV = [
  { path: '/dashboard', label: 'Tableau de bord', icon: '▣', roles: ['admin', 'agent', 'host','visitor'] },
  { path: '/visits', label: 'Visites', icon: '◈', roles: ['admin', 'agent', 'host', 'visitor'] },
  { path: '/visitors', label: 'Visiteurs', icon: '◎', roles: ['admin'] },
{ path: '/hosts', label: 'Hôtes', icon: '◇', roles: ['admin'] },
  { path: '/checkin', label: 'Check-in / Out', icon: '⟳', roles: ['admin', 'agent'] },
  { path: '/logs', label: 'Journal', icon: '≡', roles: ['admin', 'agent', 'host'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const visibleNav = NAV.filter(n => n.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-mark">ENS</div>
            {!collapsed && (
              <div className="logo-text">
                <span className="logo-name">Campus</span>
                <span className="logo-sub">Marrakech</span>
              </div>
            )}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {visibleNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
            ⏻
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
