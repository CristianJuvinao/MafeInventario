// src/components/atoms/AlertsSummary.jsx
import { AlertTriangle } from 'lucide-react';

export function AlertsSummary({ agotados, bajos }) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
      <span className="badge badge-red">
        <AlertTriangle size={12} /> {agotados} Agotados
      </span>
      <span className="badge badge-yellow">
        {bajos} Stock bajo
      </span>
    </div>
  );
}
