// src/components/molecules/ProductsToolbar.jsx
import { Search, Download, Plus } from 'lucide-react';

export function ProductsToolbar({ search, onSearch, catFilter, onCatFilter, categories, onExport, onAdd }) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Search size={14} className="search-icon" />
        <input
          placeholder="Buscar productos..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

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

      <button className="btn btn-ghost" onClick={onExport}>
        <Download size={14} /> CSV
      </button>

      <button className="btn btn-primary" onClick={onAdd}>
        <Plus size={16} /> Agregar
      </button>
    </div>
  );
}
