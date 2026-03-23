// src/components/atoms/CategoryCard.jsx
import { Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_ICONS } from '../../utils/categoryIcons';

export function CategoryCard({ category, productCount, onEdit, onDelete }) {
  const Icon = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.default;

  return (
    <div className="card cat-card card-hover">
      {/* Barra de color superior */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: category.color, borderRadius: '14px 14px 0 0',
      }} />

      {/* Icono */}
      <div className="cat-emoji" style={{ color: category.color, background: `${category.color}22` }}>
        <Icon size={28} />
      </div>

      <div className="cat-card-name" style={{ color: category.color }}>
        {category.name}
      </div>

      <div className="cat-card-count">
        {productCount} producto{productCount !== 1 ? 's' : ''}
      </div>

      <div className="cat-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(category)}>
          <Pencil size={14} /> Editar
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(category.id)}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
