// src/components/molecules/ProductForm.jsx
import { useState } from 'react';
import { useApp }      from '../../context/AppContext';
import { UNITS }       from '../../utils/constants';
import { FormField }   from '../atoms/FormField';
import { FormActions } from '../atoms/FormActions';

export function ProductForm({ initial = {}, onSave, onCancel }) {
  const { categories, suppliers } = useApp();

  const [form, setForm] = useState({
    name:          '',
    categoryId:    categories?.[0]?.id || '',
    supplierId:    '',
    purchasePrice: '',
    price:         '',
    quantity:      '',
    unit:          'unidad',
    minStock:      '5',
    ...initial,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submit = () => {
    if (!form.name.trim() || !form.categoryId) return;
    const { imageUrl: _u, imagePath: _p, ...rest } = form;
    onSave({
      ...rest,
      purchasePrice: Number(rest.purchasePrice) || 0,
      price:         Number(rest.price)         || 0,
      quantity:      Number(rest.quantity)       || 0,
      minStock:      Number(rest.minStock)       || 0,
    });
  };

  const activeSuppliers = suppliers.filter(s => s.active !== false);
  const margin = form.price && form.purchasePrice && Number(form.purchasePrice) > 0
    ? (((Number(form.price) - Number(form.purchasePrice)) / Number(form.purchasePrice)) * 100).toFixed(1)
    : null;

  return (
    <div className="form-grid">

      <FormField label="Nombre del producto *" className="full">
        <input
          type="text" name="name"
          placeholder="Ej: Base Líquida HD"
          value={form.name} onChange={handleChange}
        />
      </FormField>

      <FormField label="Categoría">
        <select name="categoryId" className="form-select"
          value={form.categoryId} onChange={handleChange}
          disabled={!categories?.length}
        >
          {categories?.length
            ? categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            : <option value="">No hay categorías</option>
          }
        </select>
      </FormField>

      <FormField label="Proveedor">
        <select name="supplierId" className="form-select"
          value={form.supplierId} onChange={handleChange}
        >
          <option value="">— Sin proveedor —</option>
          {activeSuppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Unidad de medida">
        <select name="unit" className="form-select" value={form.unit} onChange={handleChange}>
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </FormField>

      <FormField label="Precio de compra (COP)">
        <input type="number" name="purchasePrice" min="0" placeholder="0"
          value={form.purchasePrice} onChange={handleChange} />
      </FormField>

      <FormField label="Precio de venta (COP)">
        <input type="number" name="price" min="0" placeholder="0"
          value={form.price} onChange={handleChange} />
      </FormField>

      <FormField label="Cantidad disponible">
        <input type="number" name="quantity" min="0" placeholder="0"
          value={form.quantity} onChange={handleChange} />
      </FormField>

      <FormField label="Stock mínimo (alerta)">
        <input type="number" name="minStock" min="0" placeholder="5"
          value={form.minStock} onChange={handleChange} />
      </FormField>

      {margin !== null && (
        <div className="full" style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'var(--green-dim)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, color: 'var(--green)', fontWeight: 600,
        }}>
          Margen estimado: {margin}% · Ganancia por unidad:{' '}
          ${(Number(form.price) - Number(form.purchasePrice)).toLocaleString('es-CO')}
        </div>
      )}

      <div className="full">
        <FormActions onCancel={onCancel} onSave={submit} disabled={!categories?.length} />
      </div>
    </div>
  );
}
