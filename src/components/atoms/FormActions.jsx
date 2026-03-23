// src/components/atoms/FormActions.jsx

export function FormActions({ onCancel, onSave, disabled = false, saveLabel = 'Guardar' }) {
  return (
    <div className="form-group full actions">
      <button className="btn btn-ghost" onClick={onCancel}>
        Cancelar
      </button>
      <button className="btn btn-primary" onClick={onSave} disabled={disabled}>
        {saveLabel}
      </button>
    </div>
  );
}
