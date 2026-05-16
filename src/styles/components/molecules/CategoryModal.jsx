// src/components/molecules/CategoryModal.jsx
import { ModalShell }    from '../atoms/ModalShell';
import { CategoryForm }  from './CategoryForm';

export function CategoryModal({ editCat, onSave, onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            {editCat ? 'Editar Categoría' : 'Nueva Categoría'}
          </span>
        </div>
        <div className="modal-body">
          <CategoryForm
            initial={editCat}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </ModalShell>
  );
}
