// src/components/organisms/Sidebar.jsx
import { useApp }  from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, LogOut, LayoutDashboard, Package, Tags, AlertTriangle, History, FileSpreadsheet } from 'lucide-react';
import { SidebarLogo }         from '../atoms/SidebarLogo';
import { SidebarUserCard }     from '../atoms/SidebarUserCard';
import { SidebarNavItem }      from '../atoms/SidebarNavItem';
import { SidebarCategoryItem } from '../atoms/SidebarCategoryItem';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'products',   label: 'Productos',      icon: Package          },
  { id: 'categories', label: 'Categorías',     icon: Tags             },
  { id: 'alerts',     label: 'Alertas',        icon: AlertTriangle    },
  { id: 'history',    label: 'Historial',      icon: History          },
  { id: 'import',     label: 'Importar Excel', icon: FileSpreadsheet  },
];

export default function Sidebar({ page, setPage, open, setOpen }) {
  const { categories, products, movements, getStatus, theme, setTheme } = useApp();
  const { user, logout } = useAuth();

  const alertCount = products.filter(p => getStatus(p) !== 'ok').length;

  const navWithBadges = NAV_ITEMS.map(item => ({
    ...item,
    badge: item.id === 'alerts'  ? alertCount           :
           item.id === 'history' ? movements.length || 0 : 0,
  }));

  const handleNav = (id) => { setPage(id); setOpen(false); };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <SidebarLogo />

        <SidebarUserCard user={user} />

        <nav className="sidebar-nav">
          <div className="nav-section-title">Menú</div>
          {navWithBadges.map(n => (
            <SidebarNavItem
              key={n.id}
              icon={n.icon}
              label={n.label}
              badge={n.badge}
              active={page === n.id}
              onClick={() => handleNav(n.id)}
            />
          ))}

          <div className="divider" />

          <div className="nav-section-title">Categorías</div>
          {categories.map(c => (
            <SidebarCategoryItem
              key={c.id}
              category={c}
              count={products.filter(p => p.categoryId === c.id).length}
              onClick={() => handleNav('products')}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <SidebarNavItem
            icon={theme === 'dark' ? Sun : Moon}
            label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
          <div style={{ marginTop: 4 }}>
            <SidebarNavItem
              icon={LogOut}
              label="Cerrar sesión"
              onClick={logout}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
