// src/components/Lightbox.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

function Lightbox({ image, onClose, onNext, onPrev }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  // Estado que controla qual lado está borrado ('left' ou 'right')
  const [blurSide, setBlurSide] = useState('left');

  // Sempre que a imagem mudar, reseta o borrão para a esquerda
  useEffect(() => {
      setBlurSide('left');
  }, [image]);

  if (!image) return null;

  const handleBackdropClick = (e) => {
    // Só fecha se a pessoa clicar exatamente no fundo preto (usando o ID para maior segurança)
    if (e.target.id === 'lightbox-backdrop-id') {
      onClose();
    }
  };

  const handleAddToCartClick = async (e, media) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      
      try {
          await addToCart(media); 
          toast.success("Adicionado ao carrinho!");
      } catch (error) {
          console.error("Erro no carrinho:", error);
          toast.error("Erro ao adicionar ao carrinho.");
      }
  };

  // Função que inverte o lado do borrão ao clicar na foto
  const handleToggleBlur = (e) => {
    e.stopPropagation();
    setBlurSide(prev => prev === 'left' ? 'right' : 'left');
  };

  // Garante que a foto tem o URL correto, quer venha do painel ou da galeria pública
  const imageUrl = image.imagem_url || image.url || image.miniatura_url;

  return (
    <div 
        id="lightbox-backdrop-id" 
        onClick={handleBackdropClick}
        style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 99999,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}
    >
      {/* BOTÃO FECHAR */}
      <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '30px', background: 'transparent',
          border: 'none', color: '#fff', fontSize: '40px', cursor: 'pointer', zIndex: 100000
      }}>
          &times;
      </button>
      
      {/* --- BOTÃO VOLTAR --- */}
      {onPrev && (
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{
            position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: 'white', 
            fontSize: '1.5rem', padding: '15px 20px', cursor: 'pointer', borderRadius: '50%', zIndex: 100000
        }}>
          &#10094;
        </button>
      )}
      
      {/* 📸 CONTAINER DA IMAGEM E DA MÁGICA ANTI-PRINT */}
      <div onClick={handleToggleBlur} style={{
          position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', overflow: 'hidden', borderRadius: '8px', userSelect: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
          {/* A Imagem Real */}
          <img 
            src={imageUrl} 
            alt={image.legenda || "Visualização ampliada"} 
            style={{ 
              transform: `rotate(${image.rotacao || 0}deg)`, 
              maxHeight: '75vh', maxWidth: '90vw', objectFit: 'contain', display: 'block'
            }}
          />

          {/* 🛡️ O Overlay de Borrão */}
          <div style={{
              position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
              backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)', transition: 'transform 0.4s ease-in-out',
              transform: blurSide === 'left' ? 'translateX(0)' : 'translateX(100%)',
              pointerEvents: 'none', zIndex: 10
          }} />

          {/* 💡 Dica visual flutuante */}
          <div style={{
              position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'rgba(108, 4, 100, 0.9)', color: 'white', padding: '8px 16px',
              borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', pointerEvents: 'none',
              zIndex: 11, whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
          }}>
              👆 Toque para ver o outro lado
          </div>
      </div>

      {/* TEXTO DE COPYRIGHT NO LIGHTBOX */}
      <div style={{
          marginTop: '15px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px',
          textAlign: 'center', textShadow: '1px 1px 2px black'
      }}>
          &copy; {new Date().getFullYear()} Acesso Imagens. Imagem protegida por direitos autorais.
      </div>

      {/* 🛒 BOTÃO DE CARRINHO ORIGINAL */}
      {(!user || user.papel === 'CLIENTE') && (
          <button 
            onClick={(e) => handleAddToCartClick(e, image)} 
            className="create-button" 
            style={{
              position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 100000, backgroundColor: '#6c0463', color: '#fff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: 'none', padding: '12px 30px',
              borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem'
            }}
          >
            Adicionar ao carrinho (R$ {parseFloat(image.preco || 0).toFixed(2)})
          </button>
      )}

      {/* --- BOTÃO AVANÇAR --- */}
      {onNext && (
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{
            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: 'white', 
            fontSize: '1.5rem', padding: '15px 20px', cursor: 'pointer', borderRadius: '50%', zIndex: 100000
        }}>
          &#10095;
        </button>
      )}
    </div>
  );
}

export default Lightbox;