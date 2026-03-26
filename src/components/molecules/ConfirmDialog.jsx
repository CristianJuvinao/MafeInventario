// src/components/molecules/ConfirmDialog.jsx
import { ShieldAlert } from 'lucide-react';
import { ModalShell }  from '../atoms/ModalShell';

export function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <ModalShell onClose={onCancel}>
      <div className="modal confirm-dialog">
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <ShieldAlert size={18} color="var(--red)" /> Confirmar acción
          </span>
        </div>
        <div className="modal-body">
          <p className="confirm-msg">{msg}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Sí, eliminar</button>
        </div>
      </div>
    </ModalShell>
  );
}