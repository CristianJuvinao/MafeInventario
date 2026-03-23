// src/components/molecules/AlertsPanel.jsx
import { PartyPopper } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AlertsPanel({ low, out }) {
  const { getStatus } = useApp();
  const alertCount = low.length + out.length;

  return (
    <div className="card" style={{ padding: 20, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
          Alertas de Stock
        </div>
        {alertCount > 0 && (
          <span className="badge badge-red">{alertCount}</span>
        )}
      </div>

      {alertCount === 0 ? (
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-icon"><PartyPopper size={28} /></div>
          <div className="empty-title">¡Todo en orden!</div>
          <div className="empty-sub">No hay productos con stock bajo</div>
        </div>
      ) : (
        <div className="alert-list">
          {[...out, ...low].slice(0, 8).map(p => {
            const s = getStatus(p);
            return (
              <div key={p.id} className="alert-item">
                <div className="alert-item-name">{p.name}</div>
                <div style={{ color: s === 'agotado' ? 'var(--red)' : 'var(--yellow)', fontWeight: 600, fontSize: 12 }}>
                  {p.quantity} {p.unit}
                </div>
                <span className={`badge ${s === 'agotado' ? 'badge-red' : 'badge-yellow'}`}>
                  <span className="badge-dot" />
                  {s === 'agotado' ? 'Agotado' : 'Bajo'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
