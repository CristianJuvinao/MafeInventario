// src/components/atoms/SidebarCategoryItem.jsx

export function SidebarCategoryItem({ category: c, count, onClick }) {
  return (
    <button className="nav-item" onClick={onClick}>
      <span className="nav-cat-dot" style={{ background: c.color }} />
      <span style={{ flex: 1 }}>{c.name}</span>
      <span style={{ fontSize: 11, color: 'var(--sb-text2)', fontWeight: 600 }}>{count}</span>
    </button>
  );
}