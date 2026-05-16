// src/components/molecules/ImportDone.jsx
import { CheckCircle, Upload } from 'lucide-react';

export function ImportDone({ imported, onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--green-dim)', color: 'var(--green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <CheckCircle size={40} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
        ¡Importación exitosa!
      </div>
      <div style={{ color: 'var(--text3)', fontSize: 15, marginBottom: 32 }}>
        Se importaron{' '}
        <strong style={{ color: 'var(--green)' }}>{imported} productos</strong>{' '}
        a tu inventario.
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={onReset}>
          <Upload size={14} /> Importar otro archivo
        </button>
        <button
          className="btn btn-primary"
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
        >
          Ver productos →
        </button>
      </div>
    </div>
  );
}
