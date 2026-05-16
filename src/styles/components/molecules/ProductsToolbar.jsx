// src/components/molecules/ProductsToolbar.jsx
import { Search, Download, Plus, SlidersHorizontal } from 'lucide-react';

export function ProductsToolbar({ search, onSearch, catFilter, onCatFilter, categories, onExport, onAdd }) {
  return (
    <div className="toolbar">
      {/* Search */}
      <div className="search-box">
        <Search size={14} className="search-icon" />
        <input
          placeholder="Buscar por nombre, código..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <select
        className="select"
        value={catFilter}
        onChange={e => onCatFilter(e.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Actions */}
      <button className="btn btn-ghost" onClick={onExport}>
        <Download size={14} /> Exportar CSV
      </button>

      <button className="btn btn-primary" onClick={onAdd}>
        <Plus size={16} /> Agregar producto
      </button>
    </div>
  );
}