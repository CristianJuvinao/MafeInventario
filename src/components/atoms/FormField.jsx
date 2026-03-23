// src/components/atoms/FormField.jsx

export function FormField({ label, className = '', children }) {
  return (
    <div className={`form-group ${className}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}
