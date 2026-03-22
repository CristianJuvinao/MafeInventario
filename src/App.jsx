import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';

// Layout
import Sidebar from './components/Sidebar';
import { ToastContainer } from './components/UI';

// Pages
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import { CategoriesPage, AlertsPage } from './pages/OtherPages';

// Icons
import {
  LayoutDashboard,
  Package,
  Folder,
  AlertTriangle
} from 'lucide-react';

/**
 * Configuración central de páginas
 * (título + ícono dinámico)
 */
const PAGES = {
  dashboard: {
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  products: {
    label: 'Productos',
    icon: Package,
  },
  categories: {
    label: 'Categorías',
    icon: Folder,
  },
  alerts: {
    label: 'Alertas de Stock',
    icon: AlertTriangle,
  },
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useApp();

  // Tema claro / oscuro
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  const CurrentIcon = PAGES[page].icon;

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main */}
      <div className="main">
        {/* Topbar */}
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

        {/* Content */}
        <main className="content">
          {page === 'dashboard' && <DashboardPage setPage={setPage} />}
          {page === 'products' && <ProductsPage />}
          {page === 'categories' && <CategoriesPage />}
          {page === 'alerts' && <AlertsPage />}
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}