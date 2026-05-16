// src/components/molecules/StatCard.jsx

export function StatCard({ label, value, valueStyle, icon, iconStyle, sub, accent, trend, trendUp }) {
  return (
    <div className={`card stat-card${accent ? ' stat-card-accent' : ''}`}>
      <div className="stat-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={valueStyle}>{value}</div>
          {trend && (
            <div className={`stat-trend ${trendUp ? 'up' : 'down'}`} style={{ marginTop: 6 }}>
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>
        {icon && (
          <div className="stat-icon" style={iconStyle}>{icon}</div>
        )}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
