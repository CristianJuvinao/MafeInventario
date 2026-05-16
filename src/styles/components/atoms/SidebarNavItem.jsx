// src/components/atoms/SidebarNavItem.jsx

export function SidebarNavItem({ icon: Icon, label, badge, active, onClick }) {
  return (
    <button
      className={`nav-item${active ? ' active' : ''}`}
      onClick={onClick}
    >
      <Icon size={17} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </button>
  );
}