// src/components/molecules/ImportMapper.jsx
import { ChevronRight, AlertTriangle, X } from 'lucide-react';
import { DEST_FIELDS } from '../../hooks/useImport';

export function ImportMapper({ fileName, rows, headers, mapping, setMapping, missingRequired, onBack, onNext }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Mapear columnas</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Archivo: <strong>{fileName}</strong> · {rows.length} filas detectadas
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>
          <X size={14} /> Cambiar archivo
        </button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
          Indicale al sistema qué contiene cada columna de tu archivo.
          Los campos marcados con <span style={{ color: 'var(--red)' }}>*</span> son obligatorios.
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {headers.map((h, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--surface2)',
            }}>
              {/* Columna original */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Tu columna</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{h || `Columna ${i + 1}`}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  Ej: {String(rows[0]?.[i] ?? '—')}
                </div>
              </div>

              <ChevronRight size={16} style={{ color: 'var(--text3)' }} />

              {/* Select destino */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Campo del sistema</div>
                <select
                  className="form-select"
                  style={{ width: '100%' }}
                  value={mapping[i] || '__skip__'}
                  onChange={e => setMapping(m => ({ ...m, [i]: e.target.value }))}
                >
                  {DEST_FIELDS.map(f => (
                    <option key={f.key} value={f.key}>
                      {f.label}{f.required ? ' *' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Campos obligatorios faltantes */}
        {missingRequired.length > 0 && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(248,113,113,0.12)', color: 'var(--red)',
            fontSize: 13,
          }}>
            <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Faltan campos obligatorios: <strong>{missingRequired.join(', ')}</strong>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onBack}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={missingRequired.length > 0}
          >
            Previsualizar →
          </button>
        </div>
      </div>
    </div>
  );
}
