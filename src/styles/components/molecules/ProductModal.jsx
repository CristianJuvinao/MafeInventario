// src/components/molecules/ProductModal.jsx
import { X } from 'lucide-react';
import { ModalShell }  from '../atoms/ModalShell';
import { ProductForm } from './ProductForm';

export function ProductModal({ editProd, onSave, onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">
            {editProd ? 'Editar producto' : 'Nuevo producto'}
          </span>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <ProductForm
            initial={editProd}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </ModalShell>
  );
}