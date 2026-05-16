// src/App.jsx
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useApp }  from './context/AppContext';

import Sidebar             from './components/organisms/Sidebar';
import { ToastContainer }  from './components/atoms';

import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage  from './pages/ProductsPage';
import HistoryPage   from './pages/HistoryPage';
import ImportPage    from './pages/ImportPage';
import SuppliersPage from './pages/SuppliersPage';
import ReportsPage   from './pages/ReportsPage';
import SalesPage     from './pages/SalesPage';
import OrdersPage    from './pages/OrdersPage';
import CajaPage      from './pages/CajaPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AlertsPage }     from './pages/AlertsPage';

import {
  LayoutDashboard, Package, Folder,
  AlertTriangle, History, FileSpreadsheet,
  Truck, BarChart2, Boxes, Bell, Settings,
  ShoppingCart, ClipboardList, Wallet,
} from 'lucide-react';

/* Carga Chart.js desde CDN una sola vez al montar la app */
function useChartJs() {
  useEffect(() => {
    if (window.Chart) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    s.async = true;
    document.head.appendChild(s);
  }, []);
}

const PAGES = {
  dashboard:  { label: 'Dashboard',          icon: LayoutDashboard },
  sales:      { label: 'Ventas',             icon: ShoppingCart    },
  caja:       { label: 'Corte de Caja',      icon: Wallet          },
  products:   { label: 'Productos',           icon: Package         },
  categories: { label: 'Categorías',          icon: Folder          },
  alerts:     { label: 'Alertas de Stock',    icon: AlertTriangle   },
  orders:     { label: 'Órdenes de compra',   icon: ClipboardList   },
  history:    { label: 'Historial',           icon: History         },
  import:     { label: 'Importar Excel',      icon: FileSpreadsheet },
  suppliers:  { label: 'Proveedores',         icon: Truck           },
  reports:    { label: 'Reportes',            icon: BarChart2       },
};

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 28px var(--accent-glow)',
      }}>
        <Boxes size={26} color="#fff" />
      </div>
      <div style={{
        width: 26, height: 26,
        border: '3px solid var(--surface3)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { theme, ready, movements, products, sales, getStatus } = useApp();

  useChartJs();
  const [page,        setPage]        = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  useEffect(() => {
    const handler = e => setPage(e.detail);
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  if (authLoading) return <LoadingScreen />;
  if (!user)       return <LoginPage />;
  if (!ready)      return <LoadingScreen />;

  const alertCount = products?.filter(p => getStatus(p) !== 'ok').length || 0;
  const CurrentIcon = PAGES[page]?.icon || LayoutDashboard;

  return (
    <div className="layout">
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} setOpen={setSidebarOpen} />

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
            <CurrentIcon size={17} color="var(--accent)" />
            <span>{PAGES[page]?.label}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-icon" style={{ position: 'relative' }} onClick={() => setPage('alerts')}>
              <Bell size={17} />
              {alertCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--red)',
                  border: '2px solid var(--surface)',
                }} />
              )}
            </button>

            <button className="btn-icon"><Settings size={17} /></button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '6px 12px', borderRadius: 10,
              background: 'var(--surface2)', cursor: 'pointer',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent-soft)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, overflow: 'hidden',
              }}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user.displayName || user.email || '?')[0].toUpperCase()
                }
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                  {user.displayName?.split(' ')[0] || 'Usuario'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          {page === 'dashboard'  && <DashboardPage setPage={setPage} />}
          {page === 'sales'      && <SalesPage />}
          {page === 'caja'       && <CajaPage />}
          {page === 'products'   && <ProductsPage />}
          {page === 'categories' && <CategoriesPage />}
          {page === 'alerts'     && <AlertsPage setPage={setPage} />}
          {page === 'orders'     && <OrdersPage setPage={setPage} />}
          {page === 'history'    && <HistoryPage />}
          {page === 'import'     && <ImportPage />}
          {page === 'suppliers'  && <SuppliersPage />}
          {page === 'reports'    && <ReportsPage />}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
