// src/components/atoms/SidebarLogo.jsx
import { Boxes } from 'lucide-react';

export function SidebarLogo() {
  return (
    <div className="sidebar-logo">
      <div className="logo-mark">
        <div className="logo-icon"><Boxes size={22} /></div>
        <div>
          <div className="logo-text">MafeInventario</div>
          <span className="logo-badge">BETA</span>
        </div>
      </div>
    </div>
  );
}
