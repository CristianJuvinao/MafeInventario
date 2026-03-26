// src/components/molecules/MovementModal.jsx
import { useState } from 'react';
import { useApp }   from '../../context/AppContext';
import { ArrowDownCircle, ArrowUpCircle, SlidersHorizontal, X } from 'lucide-react';
import { ModalShell, FormField, FormActions } from '../atoms';

const TYPE_OPTIONS = [
  { key: 'entrada', label: 'Entrada',  color: 'var(--green)', Icon: ArrowDownCircle },
  { key: 'salida',  label: 'Salida',   color: 'var(--red)',   Icon: ArrowUpCircle   },
  { key: 'ajuste',  label: 'Ajuste',   color: 'var(--blue)',  Icon: SlidersHorizontal },
];

export function MovementModal({ onClose }) {
  const { products, registerMovement } = useApp();

  const [form, setForm] = useState({
    productId: products[0]?.id || '',
    type: 'entrada',
    qty: '',
    note: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedProduct = products.find(p => p.id === form.productId);

  const submit = () => {
    const qty = Number(form.qty);
    if (!form.productId || !qty || qty <= 0) return;
    registerMovement(form.productId, form.type, qty, form.note.trim());
    onClose();
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title">Registrar Movimiento</span>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="form-column">

            {/* Producto */}
            <FormField label="Producto">
              <select
                className="form-select"
                value={form.productId}
                onChange={e => set('productId', e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {selectedProduct && (
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 5 }}>
                  Stock actual:{' '}
                  <strong style={{ color: 'var(--text)' }}>
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </strong>
                </div>
              )}
            </FormField>

            {/* Tipo */}
            <FormField label="Tipo de movimiento">
              <div style={{ display: 'flex', gap: 8 }}>
                {TYPE_OPTIONS.map(({ key, label, color, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('type', key)}
                    style={{
                      flex: 1, padding: '10px 0',
                      borderRadius: 10,
                      border: `2px solid ${form.type === key ? color : 'var(--border2)'}`,
                      background: form.type === key ? `${color}14` : 'var(--surface2)',
                      color: form.type === key ? color : 'var(--text2)',
                      fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', transition: 'all .14s',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4,
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
              {form.type === 'ajuste' && (
                <div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 6 }}>
                  Con ajuste, el número que ingreses será el nuevo stock total.
                </div>
              )}
            </FormField>

            {/* Cantidad */}
            <FormField label={
              form.type === 'ajuste'  ? 'Nuevo stock total'   :
              form.type === 'entrada' ? 'Unidades a ingresar' :
                                        'Unidades a retirar'
            }>
              <input
                type="number" min="0" placeholder="0"
                value={form.qty}
                onChange={e => set('qty', e.target.value)}
              />
            </FormField>

            {/* Nota */}
            <FormField label="Nota (opcional)">
              <input
                type="text"
                placeholder="Ej: Compra proveedor Xyz..."
                value={form.note}
                onChange={e => set('note', e.target.value)}
              />
            </FormField>

            <FormActions
              onCancel={onClose}
              onSave={submit}
              saveLabel="Registrar movimiento"
              disabled={!form.productId || !form.qty || Number(form.qty) <= 0}
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}