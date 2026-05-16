// src/components/atoms/SidebarLogo.jsx
import { Boxes } from 'lucide-react';

export function SidebarLogo() {
  return (
    <div className="sidebar-logo-area">
      <div className="sidebar-logo-icon">
        <Boxes size={20} color="#fff" />
      </div>
      <div>
        <div className="sidebar-logo-name">MafeInventario</div>
        <span className="sidebar-logo-tag">BETA</span>
      </div>
    </div>
  );
}