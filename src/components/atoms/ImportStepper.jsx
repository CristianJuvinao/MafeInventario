// src/components/atoms/ImportStepper.jsx
import { CheckCircle, ChevronRight } from 'lucide-react';

const STEPS = [
  { key: 'upload',  label: 'Subir archivo'    },
  { key: 'map',     label: 'Mapear columnas'  },
  { key: 'preview', label: 'Previsualizar'    },
  { key: 'done',    label: 'Listo'            },
];

export function ImportStepper({ step }) {
  const cur = STEPS.findIndex(s => s.key === step);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
      {STEPS.map((s, i) => {
        const done   = i < cur;
        const active = i === cur;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: done || active ? 'var(--accent)' : 'var(--surface2)',
              color:      done || active ? '#fff'          : 'var(--text3)',
            }}>
              {done ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span style={{
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--text1)' : 'var(--text3)',
            }}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} style={{ color: 'var(--text3)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
