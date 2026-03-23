// src/components/atoms/IconPicker.jsx

export function IconPicker({ icons, selected, onChange }) {
  return (
    <div className="icon-grid">
      {Object.entries(icons).map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={selected === key ? 'icon-btn active' : 'icon-btn'}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
}
