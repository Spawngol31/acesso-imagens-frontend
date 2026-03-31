// src/components/Lightbox.jsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

// Adicionamos as propriedades onNext e onPrev
function Lightbox({ image, onClose, onNext, onPrev }) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  if (!image) return null;

  const handleBackdropClick = (e) => {
    // Só fecha se a pessoa clicar exatamente no fundo preto
    if (e.target.className === 'lightbox-backdrop') {
      onClose();
    }
  };

  const handleAddCart = (e) => {
    e.stopPropagation();
    addToCart(image);
    toast.success("🛒 Sucesso! Foto adicionada ao carrinho."); 
  };

  return (
    <div className="lightbox-backdrop" onClick={handleBackdropClick}>
      <button className="lightbox-close" onClick={onClose}>&times;</button>
      
      {/* --- BOTÃO VOLTAR --- */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }} 
        style={{
          position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
          color: 'white', border: 'none', 
          fontSize: '1.5rem', padding: '10px 20px', cursor: 'pointer', borderRadius: '50%', zIndex: 10001
        }}
      >
        &#10094;
      </button>

      <div className="lightbox-content" style={{flexDirection: 'column', alignItems: 'center'}}>
        <img 
          src={image.url || image.imagem_url} 
          alt="Visualização ampliada" 
          style={{ 
            transform: `rotate(${image.rotacao || 0}deg)`, 
            maxHeight: '80vh', maxWidth: '100%' 
          }}
        />

        {(!user || user.papel === 'CLIENTE') && (
            <button 
              onClick={handleAddCart} 
              className="create-button" 
              style={{
                position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 10000, backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#6c0464',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: 'none', padding: '10px 20px',
                borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Adicionar ao carrinho (R$ {parseFloat(image.preco || 0).toFixed(2)})
            </button>
        )}
      </div>

      {/* --- BOTÃO AVANÇAR --- */}
      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }} 
        style={{
          position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
          color: 'white', border: 'none', 
          fontSize: '1.5rem', padding: '10px 20px', cursor: 'pointer', borderRadius: '50%', zIndex: 10001
        }}
      >
        &#10095;
      </button>

    </div>
  );
}

export default Lightbox;