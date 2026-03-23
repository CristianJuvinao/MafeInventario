// src/components/atoms/SidebarCategoryItem.jsx

export function SidebarCategoryItem({ category, count, onClick }) {
  return (
    <div
      className="nav-item"
      style={{ fontSize: 13 }}
      onClick={onClick}
    >
      <span className="nav-icon" style={{ color: category.color }}>
        <span className="badge-dot" />
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {category.name}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{count}</span>
    </div>
  );
}
