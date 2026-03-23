// src/components/molecules/StatCard.jsx

export function StatCard({ label, value, valueStyle, icon, iconStyle, sub }) {
  return (
    <div className="card stat-card">
      <div className="stat-header">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={valueStyle}>{value}</div>
        </div>
        <div className="stat-icon" style={iconStyle}>
          {icon}
        </div>
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
