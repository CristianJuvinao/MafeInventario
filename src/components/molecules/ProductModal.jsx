// src/components/molecules/ProductModal.jsx
import { ModalShell }  from '../atoms/ModalShell';
import { ProductForm } from './ProductForm';

export function ProductModal({ editProd, onSave, onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            {editProd ? 'Editar Producto' : 'Nuevo Producto'}
          </span>
        </div>
        <div className="modal-body">
          <ProductForm
            key={editProd?.id || 'new'}
            initial={editProd}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </ModalShell>
  );
}
