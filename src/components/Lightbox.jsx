// src/components/Lightbox.jsx

import React from 'react';

// O componente agora espera uma propriedade 'image' que é um objeto { url, rotacao }
function Lightbox({ image, onClose }) {
  if (!image) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="lightbox-backdrop" onClick={handleBackdropClick}>
      <button className="lightbox-close" onClick={onClose}>&times;</button>
      <div className="lightbox-content" onClick={handleImageClick}>
        {/* Aplicamos o mesmo estilo de transformação aqui */}
        <img 
          src={image.url} 
          alt="Visualização ampliada" 
          style={{ transform: `rotate(${image.rotacao || 0}deg)` }}
        />
      </div>
    </div>
  );
}

export default Lightbox;