// frontend/src/components/Modal.jsx
import React from 'react';

/**
 * Componente Modal genérico y reutilizable.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Si el modal está abierto o no.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {string} [props.titulo] - Título opcional para el modal.
 * @param {React.ReactNode} props.children - Contenido del modal.
 */
const Modal = ({ isOpen, onClose, titulo, children }) => {
  if (!isOpen) {
    return null;
  }

  // Maneja el clic en el fondo (overlay) para cerrar
  const handleBackdropClick = (e) => {
    // Solo cierra si se hace clic en el fondo mismo, no en el contenido
    if (e.target.id === 'modal-backdrop') {
      onClose();
    }
  };

  return (
    // Fondo (overlay)
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
    >
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {titulo || 'Ventana'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Cerrar modal</span>
          </button>
        </div>

        {/* Cuerpo del Modal (con scroll) */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;