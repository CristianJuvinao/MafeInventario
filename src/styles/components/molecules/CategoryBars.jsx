// src/components/molecules/CategoryBars.jsx
import { BarChart3 } from 'lucide-react';
import { fmt } from '../../utils/helpers.js';

export function CategoryBars({ catStats, maxValue }) {
  return (
    <div className="card" style={{ padding: '22px 22px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>
          Por Categoría
        </div>
        <div style={{
          padding: '4px 10px',
          background: 'var(--blue-dim)', color: 'var(--blue)',
          borderRadius: 99, fontSize: 11, fontWeight: 700,
        }}>
          Ingresos / Ganancia
        </div>
      </div>

      {catStats.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-icon"><BarChart3 size={26} /></div>
          <div className="empty-sub">Sin datos aún</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {catStats.map(c => (
            <div key={c.id}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', marginBottom: 6,
              }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                  {c.name}
                  <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: 5 }}>
                    ({c.count})
                  </span>
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                  {fmt(c.ingresos)}
                </span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${maxValue > 0 ? (c.value / maxValue) * 100 : 0}%`,
                    background: c.color,
                  }}
                />
              </div>

              <div style={{
                display: 'flex', gap: 14, marginTop: 5,
                fontSize: 11.5, color: 'var(--text3)',
              }}>
                <span>
                  Inversión:{' '}
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>
                    {fmt(c.inversion)}
                  </span>
                </span>
                <span>
                  Ganancia:{' '}
                  <span style={{
                    color: c.ganancia >= 0 ? 'var(--green)' : 'var(--red)',
                    fontWeight: 700,
                  }}>
                    {fmt(c.ganancia)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}