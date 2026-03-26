// src/components/atoms/ToastContainer.jsx
import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const COLORS = {
  success: 'var(--green)',
  error:   'var(--red)',
  warning: 'var(--yellow)',
  info:    'var(--blue)',
};

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon  = ICONS[t.type]  || CheckCircle;
        const color = COLORS[t.type] || 'var(--green)';
        return (
          <div key={t.id} className="toast">
            <Icon size={17} color={color} style={{ flexShrink: 0 }} />
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}