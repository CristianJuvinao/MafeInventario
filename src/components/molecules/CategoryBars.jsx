// src/components/molecules/CategoryBars.jsx
import { BarChart3 } from 'lucide-react';
import { fmt } from '../../utils/helpers.js';

export function CategoryBars({ catStats, maxValue }) {
  return (
    <div className="card" style={{ padding: 20, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
        Ingresos / Ganancias por Categoría
      </div>

      {catStats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><BarChart3 size={28} /></div>
          <div>Sin datos aún</div>
        </div>
      ) : (
        catStats.map(c => (
          <div key={c.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 13 }}>
              <span>
                {c.name}{' '}
                <span style={{ color: 'var(--text3)', fontSize: 11 }}>({c.count} prod.)</span>
              </span>
              <span style={{ fontWeight: 600 }}>{fmt(c.ingresos)}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(c.value / maxValue) * 100}%`, background: c.color }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, marginTop: 3, color: 'var(--text3)' }}>
              <span>
                Inversión:{' '}
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(c.inversion)}</span>
              </span>
              <span>
                Ganancia:{' '}
                <span style={{ color: c.ganancia >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {fmt(c.ganancia)}
                </span>
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
