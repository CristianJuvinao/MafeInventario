// src/components/atoms/StatusBadge.jsx
export function StatusBadge({ status }) {
  if (status === 'ok')   return <span className="badge badge-green"><span className="badge-dot" />Disponible</span>;
  if (status === 'bajo') return <span className="badge badge-yellow"><span className="badge-dot" />Bajo stock</span>;
  return <span className="badge badge-red"><span className="badge-dot" />Agotado</span>;
}