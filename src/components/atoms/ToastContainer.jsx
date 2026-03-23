// src/components/atoms/ToastContainer.jsx
import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || CheckCircle;
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
