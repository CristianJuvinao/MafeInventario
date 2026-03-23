// src/components/atoms/SidebarNavItem.jsx

export function SidebarNavItem({ icon: Icon, label, badge, active, onClick }) {
  return (
    <div
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="nav-icon"><Icon size={18} /></span>
      <span>{label}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </div>
  );
}
