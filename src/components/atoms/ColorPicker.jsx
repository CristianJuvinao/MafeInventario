// src/components/atoms/ColorPicker.jsx

export function ColorPicker({ colors, selected, onChange }) {
  return (
    <div className="color-grid">
      {colors.map(c => (
        <div
          key={c}
          className={selected === c ? 'color-dot active' : 'color-dot'}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
