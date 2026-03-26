// src/components/atoms/ImportStepper.jsx
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'upload',  label: 'Subir archivo'   },
  { key: 'map',     label: 'Mapear columnas' },
  { key: 'preview', label: 'Previsualizar'   },
  { key: 'done',    label: 'Completado'      },
];

export function ImportStepper({ step }) {
  const cur = STEPS.findIndex(s => s.key === step);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}>
      {STEPS.map((s, i) => {
        const done   = i < cur;
        const active = i === cur;

        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            {/* Circle + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
              <div style={{
                width: 30, height: 30,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                background: done
                  ? 'var(--green)'
                  : active
                  ? 'var(--accent)'
                  : 'var(--surface3)',
                color: done || active ? '#fff' : 'var(--text3)',
                transition: 'all .2s',
                boxShadow: active ? '0 4px 12px var(--accent-glow)' : 'none',
              }}>
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--text)' : done ? 'var(--green)' : 'var(--text3)',
              }}>
                {s.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                margin: '0 12px',
                background: done ? 'var(--green)' : 'var(--border2)',
                borderRadius: 99,
                transition: 'background .3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}