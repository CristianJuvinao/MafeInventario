// src/components/molecules/ImportStepper.jsx
import { Check } from 'lucide-react';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Dot } from '../atoms/Dot'; // opcional para la línea conectora si quieres
import { Circle } from '../atoms/Circle'; // vamos a crear este átomo

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
              <Circle done={done} active={active} number={i + 1}>
                {done && <Icon><Check size={14} strokeWidth={3} /></Icon>}
              </Circle>

              <Text weight={active ? 700 : 500} color={active ? 'var(--text)' : done ? 'var(--green)' : 'var(--text3)'} size={13}>
                {s.label}
              </Text>
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