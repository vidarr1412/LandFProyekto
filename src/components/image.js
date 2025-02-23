// Modal.js
import React from 'react';
import '../style/imageC.css'; // Import the CSS for styling

const Modal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="modelo" onClick={onClose}>
      <div className="modelo-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Enlarged" className="enlarged-image" />
      </div>
    </div>
  );
};

export default Modal;