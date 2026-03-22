import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  Tags,
  AlertTriangle,
  Sun,
  Moon,
  Boxes,
} from 'lucide-react';

export default function Sidebar({ page, setPage, open, setOpen }) {
  const { categories, products, getStatus, theme, setTheme } = useApp();

  const alertCount = products.filter(p => getStatus(p) !== 'ok').length;

  const nav = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'products',   label: 'Productos',  icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'alerts',     label: 'Alertas',    icon: AlertTriangle, badge: alertCount },
  ];

  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* ── Logo ───────────────────────────────────────── */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">
              <Boxes size={22} />
            </div>
            <div>
              <div className="logo-text">MafeInventario</div>
              <span className="logo-badge">BETA</span>
            </div>
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────── */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menú</div>

          {nav.map(n => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`nav-item ${page === n.id ? 'active' : ''}`}
                onClick={() => {
                  setPage(n.id);
                  setOpen(false);
                }}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>

                <span>{n.label}</span>

                {n.badge > 0 && (
                  <span className="nav-badge">{n.badge}</span>
                )}
              </div>
            );
          })}

          <div className="divider" />

          {/* ── Categories ───────────────────────────────── */}
          <div className="nav-section-title">Categorías</div>

          {categories.map(c => {
            const count = products.filter(
              p => p.categoryId === c.id
            ).length;

            return (
              <div
                key={c.id}
                className="nav-item"
                style={{ fontSize: 13 }}
                onClick={() => {
                  setPage('products');
                  setOpen(false);
                }}
              >
                <span
                  className="nav-icon"
                  style={{ color: c.color }}
                >
                  {c.icon && (
                    (() => {
                      // icon viene como string → lo renderizas donde corresponda
                      // aquí solo mostramos un punto de color para no romper el layout
                      return <span className="badge-dot" />;
                    })()
                  )}
                </span>

                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.name}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text3)',
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </nav>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="sidebar-footer">
          <div
            className="nav-item"
            onClick={() =>
              setTheme(t => (t === 'dark' ? 'light' : 'dark'))
            }
          >
            <span className="nav-icon">
              {theme === 'dark'
                ? <Sun size={18} />
                : <Moon size={18} />}
            </span>

            {theme === 'dark'
              ? 'Modo claro'
              : 'Modo oscuro'}
          </div>
        </div>
      </aside>
    </>
  );
}