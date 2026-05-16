// src/components/molecules/ImportPreview.jsx
import { CheckCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';

export function ImportPreview({ preview, errors, validRows, importing, onBack, onImport }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Previsualización</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            {validRows.length} productos válidos ·{' '}
            <span style={{ color: 'var(--red)' }}>{errors.length} errores</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>← Volver</button>
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 6, fontSize: 13 }}>
            <AlertTriangle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Las siguientes filas serán ignoradas por tener datos incompletos:
          </div>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--red)', marginTop: 2 }}>• {e}</div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>P. Compra</th>
                <th>P. Venta</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Stock mín.</th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 50).map((r, i) => (
                <tr key={i} style={r.__error__ ? { opacity: 0.45 } : {}}>
                  <td>
                    {r.__error__
                      ? <X size={14} style={{ color: 'var(--red)' }} />
                      : <CheckCircle size={14} style={{ color: 'var(--green)' }} />}
                  </td>
                  <td className="td-name">{r.name || '—'}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>{r.category || '—'}</td>
                  <td style={{ color: 'var(--red)', fontWeight: 600 }}>
                    {r.purchasePrice ? `$${r.purchasePrice.toLocaleString('es-CO')}` : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {r.price ? `$${r.price.toLocaleString('es-CO')}` : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.quantity}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>{r.unit}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>{r.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {preview.length > 50 && (
          <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text3)' }}>
            Mostrando 50 de {preview.length} filas en la previsualización.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onBack}>Cancelar</button>
        <button
          className="btn btn-primary"
          onClick={onImport}
          disabled={importing || validRows.length === 0}
        >
          {importing
            ? <><RefreshCw size={14} className="spin" /> Importando...</>
            : <>Importar {validRows.length} productos</>}
        </button>
      </div>
    </div>
  );
}
