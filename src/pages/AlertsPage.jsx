// src/pages/AlertsPage.jsx
import { PartyPopper, ClipboardList, Plus }  from 'lucide-react';
import { useAlerts }                         from '../hooks/useAlerts';
import { EmptyState, AlertsSummary }         from '../components/atoms';
import { AlertsTable }                       from '../components/molecules';

export function AlertsPage({ setPage }) {
  const { lowProds, categories, getStatus, agotados, bajos } = useAlerts();

  if (lowProds.length === 0) {
    return (
      <div className="page">
        <div className="card">
          <EmptyState
            icon={<PartyPopper size={32} />}
            title="¡Todo está bien!"
            sub="No hay productos con stock bajo o agotado"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Alertas de Stock</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            Productos que requieren reabastecimiento.
          </p>
        </div>
        {setPage && (
          <button className="btn btn-primary" onClick={() => setPage('orders')}>
            <ClipboardList size={14} /> Crear orden de compra
          </button>
        )}
      </div>
      <AlertsSummary agotados={agotados} bajos={bajos} />
      <AlertsTable lowProds={lowProds} categories={categories} getStatus={getStatus} />
    </div>
  );
}
