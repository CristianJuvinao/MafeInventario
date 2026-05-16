// src/components/molecules/CategoryForm.jsx
import { useState } from 'react';
import { CAT_COLORS } from '../../utils/constants';
import { CATEGORY_ICONS } from '../../utils/categoryIcons';
import { FormField } from '../atoms/FormField';
import { FormActions } from '../atoms/FormActions';
import { ColorPicker } from '../atoms/ColorPicker';
import { IconPicker } from '../atoms/IconPicker';

export function CategoryForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:  '',
    color: CAT_COLORS[0],
    icon:  'package',
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
      <FormField label="Nombre *">
        <input
          type="text"
          placeholder="Ej: Maquillaje"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
        />
      </FormField>

      <FormField label="Icono">
        <IconPicker
          icons={CATEGORY_ICONS}
          selected={form.icon}
          onChange={key => setField('icon', key)}
        />
      </FormField>

      <FormField label="Color">
        <ColorPicker
          colors={CAT_COLORS}
          selected={form.color}
          onChange={color => setField('color', color)}
        />
      </FormField>

      <FormActions onCancel={onCancel} onSave={submit} />
    </div>
  );
}
