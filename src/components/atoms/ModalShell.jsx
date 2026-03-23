// src/components/atoms/ModalShell.jsx

export function ModalShell({ onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
