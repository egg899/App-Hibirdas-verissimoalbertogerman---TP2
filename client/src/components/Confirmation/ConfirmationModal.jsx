import React from 'react';
import '../../styles/ConfirmationModalStyles.scss'; 

const ConfirmationModal = ({ onConfirm, onCancel, subject }) => {
  


  return (
    <div className="confirmation-modal">
      <div className="modal-content">
        <h3>¿Estás seguro que deseas borrar a este {subject}?</h3>
        <div className="modal-actions">
          <button onClick={onConfirm} className="btn-confirm">Si</button>
          <button onClick={onCancel} className="btn-cancel">No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
