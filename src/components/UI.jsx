import { useApp } from '../context/AppContext';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  PackageOpen,
} from 'lucide-react';

// ── Toast container ───────────────────────────────────────────────────────────
export function ToastContainer() {
  const { toasts } = useApp();

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = icons[t.type] || CheckCircle;
        return (
          <div key={t.id} className="toast">
            <Icon size={18} />
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal confirm-dialog"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span
            className="modal-title"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <ShieldAlert size={18} />
            Confirmar
          </span>
        </div>

        <div className="modal-body">
          <p className="confirm-msg">{msg}</p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  if (status === 'ok') {
    return (
      <span className="badge badge-green">
        <span className="badge-dot" />
        Disponible
      </span>
    );
  }

  if (status === 'bajo') {
    return (
      <span className="badge badge-yellow">
        <span className="badge-dot" />
        Bajo stock
      </span>
    );
  }

  return (
    <span className="badge badge-red">
      <span className="badge-dot" />
      Agotado
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {icon && <icon.type size={48} />}
      </div>
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