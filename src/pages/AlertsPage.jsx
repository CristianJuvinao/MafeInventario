// src/pages/AlertsPage.jsx
import { PartyPopper }                     from 'lucide-react';
import { useAlerts }                       from '../hooks/useAlerts';
import { EmptyState, AlertsSummary }       from '../components/atoms';
import { AlertsTable }                     from '../components/molecules';

export function AlertsPage() {
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
      <AlertsSummary agotados={agotados} bajos={bajos} />
      <AlertsTable lowProds={lowProds} categories={categories} getStatus={getStatus} />
    </div>
  );
}
