import React from 'react';

const DeleteModal = ({ isOpen, hotelTitle, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Delete Confirmation</h3>
        <p style={{ margin: '1rem 0', color: '#6c757d' }}>
          Are you sure you want to delete <strong>"{hotelTitle}"</strong>? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn" style={{ background: '#e2e6ea', color: '#333' }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-delete" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;