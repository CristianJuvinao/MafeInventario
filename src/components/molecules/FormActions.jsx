// src/components/atoms/FormActions.jsx
export function FormActions({ onCancel, onSave, disabled = false, saveLabel = 'Guardar' }) {
  return (
    <div className="form-actions">
      <button className="btn btn-ghost" type="button" onClick={onCancel}>
        Cancelar
      </button>
      <button
        className="btn btn-primary"
        type="button"
        onClick={onSave}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {saveLabel}
      </button>
    </div>
  );
}