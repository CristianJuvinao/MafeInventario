import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UNITS, CAT_COLORS } from '../utils/constants';
import { CATEGORY_ICONS } from '../utils/categoryIcons';

/* ──────────────────────────────────────────────────────────────
   PRODUCT FORM
────────────────────────────────────────────────────────────── */
export function ProductForm({ initial = {}, onSave, onCancel }) {
  const { categories } = useApp();

  const [form, setForm] = useState({
    name: '',
    categoryId: categories?.[0]?.id || '',
    price: '',
    quantity: '',
    unit: 'unidad',
    minStock: '5',
    ...initial,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submit = () => {
    if (!form.name.trim()) return;
    if (!form.categoryId) return;

    onSave({
      ...form,
      price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0,
      minStock: Number(form.minStock) || 0,
    });
  };

  return (
    <div className="form-grid">
      <div className="form-group full">
        <label>Nombre del producto *</label>
        <input
          type="text"
          name="name"
          placeholder="Ej: Base Líquida HD"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Categoría</label>
        <select
          name="categoryId"
          className="form-select"
          value={form.categoryId}
          onChange={handleChange}
          disabled={!categories?.length}
        >
          {categories?.length ? (
            categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          ) : (
            <option value="">No hay categorías</option>
          )}
        </select>
      </div>

      <div className="form-group">
        <label>Unidad de medida</label>
        <select
          name="unit"
          className="form-select"
          value={form.unit}
          onChange={handleChange}
        >
          {UNITS.map(u => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Precio unitario (COP)</label>
        <input
          type="number"
          name="price"
          min="0"
          placeholder="0"
          value={form.price}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Cantidad disponible</label>
        <input
          type="number"
          name="quantity"
          min="0"
          placeholder="0"
          value={form.quantity}
          onChange={handleChange}
        />
      </div>

      <div className="form-group full">
        <label>Stock mínimo (alerta)</label>
        <input
          type="number"
          name="minStock"
          min="0"
          placeholder="5"
          value={form.minStock}
          onChange={handleChange}
        />
      </div>

      <div className="form-group full actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={!categories?.length}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CATEGORY FORM
────────────────────────────────────────────────────────────── */
export function CategoryForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    color: CAT_COLORS[0],
    icon: 'package',
    ...initial,
  });

  const setField = (key, value) =>
    setForm(f => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="form-column">
      <div className="form-group">
        <label>Nombre *</label>
        <input
          type="text"
          placeholder="Ej: Maquillaje"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Icono</label>
        <div className="icon-grid">
          {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setField('icon', key)}
              className={form.icon === key ? 'icon-btn active' : 'icon-btn'}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Color</label>
        <div className="color-grid">
          {CAT_COLORS.map(c => (
            <div
              key={c}
              className={form.color === c ? 'color-dot active' : 'color-dot'}
              style={{ background: c }}
              onClick={() => setField('color', c)}
            />
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={submit}>
          Guardar
        </button>
      </div>
    </div>
  );
}