// src/components/atoms/EmptyState.jsx
export function EmptyState({ icon, title, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
    </div>
  );
}

/*
USO EJEMPLO:

import { PackageOpen } from 'lucide-react';

<EmptyState
  icon={<PackageOpen />}
  title="Sin productos"
  sub="Agrega tu primer producto"
/>
*/
