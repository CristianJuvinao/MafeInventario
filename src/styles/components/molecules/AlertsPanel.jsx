// src/components/molecules/AlertsPanel.jsx
import { PartyPopper, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AlertsPanel({ low, out }) {
  const { getStatus } = useApp();
  const all = [...out, ...low].slice(0, 8);

  return (
    <div className="card" style={{ padding: '22px 22px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 20,
      }}>
        <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>
          Alertas de Stock
        </div>
        {all.length > 0 && (
          <span className="badge badge-red">
            <AlertTriangle size={11} />
            {all.length}
          </span>
        )}
      </div>

      {all.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-icon"><PartyPopper size={26} /></div>
          <div className="empty-title">¡Todo en orden!</div>
          <div className="empty-sub">No hay productos con stock bajo</div>
        </div>
      ) : (
        <div className="alert-list">
          {all.map(p => {
            const s = getStatus(p);
            return (
              <div key={p.id} className="alert-item">
                <div className="alert-item-name">{p.name}</div>
                <div style={{
                  color: s === 'agotado' ? 'var(--red)' : 'var(--yellow)',
                  fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>
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