// src/components/Sidebar.jsx
import { useApp }  from '../../src/context/AppContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  LayoutDashboard, Package, Tags, AlertTriangle,
  Sun, Moon, Boxes, History, FileSpreadsheet, LogOut,
} from 'lucide-react';

export default function Sidebar({ page, setPage, open, setOpen }) {
  const { categories, products, movements, getStatus, theme, setTheme } = useApp();
  const { user, logout } = useAuth();

  const alertCount = products.filter(p => getStatus(p) !== 'ok').length;

  const nav = [
    { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
    { id: 'products',   label: 'Productos',       icon: Package          },
    { id: 'categories', label: 'Categorías',      icon: Tags             },
    { id: 'alerts',     label: 'Alertas',         icon: AlertTriangle,   badge: alertCount },
    { id: 'history',    label: 'Historial',       icon: History,         badge: movements.length || 0 },
    { id: 'import',     label: 'Importar Excel',  icon: FileSpreadsheet  },
  ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon"><Boxes size={22} /></div>
            <div>
              <div className="logo-text">MafeInventario</div>
              <span className="logo-badge">BETA</span>
            </div>
          </div>
        </div>

        {/* Usuario logueado */}
        {user && (
          <div style={{
            margin:       '0 12px 12px',
            padding:      '10px 12px',
            borderRadius: 12,
            background:   'var(--surface2)',
            display:      'flex',
            alignItems:   'center',
            gap:          10,
          }}>
            <img
              src={user.photoURL}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                objectFit: 'cover', flexShrink: 0,
                border: '2px solid var(--accent)',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600, fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.displayName}
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text3)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menú</div>
          {nav.map(n => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`nav-item ${page === n.id ? 'active' : ''}`}
                onClick={() => { setPage(n.id); setOpen(false); }}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                <span>{n.label}</span>
                {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
              </div>
            );
          })}

          <div className="divider" />

          {/* Categorías */}
          <div className="nav-section-title">Categorías</div>
          {categories.map(c => {
            const count = products.filter(p => p.categoryId === c.id).length;
            return (
              <div
                key={c.id}
                className="nav-item"
                style={{ fontSize: 13 }}
                onClick={() => { setPage('products'); setOpen(false); }}
              >
                <span className="nav-icon" style={{ color: c.color }}>
                  <span className="badge-dot" />
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{count}</span>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="nav-item" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            <span className="nav-icon">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </div>

          {/* Cerrar sesión */}
          <div
            className="nav-item"
            onClick={logout}
            style={{ color: 'var(--red)', marginTop: 4 }}
          >
            <span className="nav-icon" style={{ color: 'var(--red)' }}>
              <LogOut size={18} />
            </span>
            Cerrar sesión
          </div>
        </div>
      </aside>
    </>
  );
}