// src/App.jsx
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useApp }  from './context/AppContext';

// ── Nueva estructura ──────────────────────────────────────
import Sidebar             from './components/organisms/Sidebar';
import { ToastContainer }  from './components/atoms';

// ── Pages (sin cambios) ───────────────────────────────────
import LoginPage                      from './pages/LoginPage';
import DashboardPage                  from './pages/DashboardPage';
import ProductsPage                   from './pages/ProductsPage';
import HistoryPage                    from './pages/HistoryPage';
import ImportPage                     from './pages/ImportPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AlertsPage }     from './pages/AlertsPage';

import {
  LayoutDashboard, Package, Folder,
  AlertTriangle, History, FileSpreadsheet, Boxes,
} from 'lucide-react';

const PAGES = {
  dashboard:  { label: 'Dashboard',       icon: LayoutDashboard },
  products:   { label: 'Productos',        icon: Package         },
  categories: { label: 'Categorías',       icon: Folder          },
  alerts:     { label: 'Alertas de Stock', icon: AlertTriangle   },
  history:    { label: 'Historial',        icon: History         },
  import:     { label: 'Importar Excel',   icon: FileSpreadsheet },
};

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: 16,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Boxes size={28} color="#fff" />
      </div>
      <div style={{
        width: 32, height: 32,
        border: '3px solid var(--surface2)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { theme, ready } = useApp();

  const [page, setPage]               = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  useEffect(() => {
    const handler = e => setPage(e.detail);
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  if (authLoading) return <LoadingScreen />;
  if (!user)       return <LoginPage />;
  if (!ready)      return <LoadingScreen />;

  const CurrentIcon = PAGES[page].icon;

  return (
    <div className="layout">
      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="main">
        <header className="topbar">
          <button
            className="btn-icon menu-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div className="topbar-title">
            <CurrentIcon size={18} />
            <span>{PAGES[page].label}</span>
          </div>
        </header>

        <main className="content">
          {page === 'dashboard'  && <DashboardPage setPage={setPage} />}
          {page === 'products'   && <ProductsPage />}
          {page === 'categories' && <CategoriesPage />}
          {page === 'alerts'     && <AlertsPage />}
          {page === 'history'    && <HistoryPage />}
          {page === 'import'     && <ImportPage />}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
