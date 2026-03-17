// src/components/Lightbox.jsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Lightbox({ image, onClose }) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  if (!image) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
  };

  const handleAddCart = (e) => {
    e.stopPropagation();
    addToCart(image);
    // Adicionamos o alerta aqui também para o cliente saber que funcionou!
    alert("Sucesso! Foto adicionada ao carrinho."); 
  };

  return (
    <div className="lightbox-backdrop" onClick={handleBackdropClick}>
      <button className="lightbox-close" onClick={onClose}>&times;</button>
      
      <div className="lightbox-content" onClick={handleImageClick} style={{flexDirection: 'column', alignItems: 'center'}}>
        
        <img 
          src={image.url || image.imagem_url} 
          alt="Visualização ampliada" 
          style={{ 
            transform: `rotate(${image.rotacao || 0}deg)`, 
            maxHeight: '80vh',
            maxWidth: '100%' // Garante que não estoure a largura
          }}
        />

        {/* --- O BOTÃO AGORA FICA PRESO NO FUNDO DA TELA --- */}
        {(!user || user.papel === 'CLIENTE') && (
            <button 
              onClick={handleAddCart} 
              className="create-button" 
              style={{
                position: 'fixed', // Prende o botão na tela
                bottom: '40px',    // Distância do fundo da tela
                left: '50%',       // Centraliza no meio
                transform: 'translateX(-50%)', // Ajuste fino da centralização
                zIndex: 10000,     // Garante que fique por cima de QUALQUER foto
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#6c0464',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)', // Uma sombra para destacar
                border: 'none',
                padding: '10px 20px',
                borderRadius: '50px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Adicionar ao carrinho (R$ {parseFloat(image.preco || 0).toFixed(2)})
            </button>
        )}

      </div>
    </div>
  );
}

export default Lightbox;