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

  // Função que inverte o lado do borrão ao clicar na foto
  const handleToggleBlur = (e) => {
    e.stopPropagation();
    setBlurSide(prev => prev === 'left' ? 'right' : 'left');
  };

  return (
    <div className="lightbox-backdrop" onClick={handleBackdropClick}>
      <button className="lightbox-close" onClick={onClose}>&times;</button>
      
      {/* --- BOTÃO VOLTAR --- */}
      {onPrev && (
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
      )}
      
      <div className="lightbox-content" style={{flexDirection: 'column', alignItems: 'center'}}>
        
        {/* 📸 CONTAINER DA IMAGEM E DA MÁGICA ANTI-PRINT */}
        <div onClick={handleToggleBlur} style={{
            position: 'relative',
            display: 'inline-block', // Ajusta ao tamanho da imagem
            cursor: 'pointer',
            overflow: 'hidden', // Impede que o borrão vaze
            borderRadius: '8px',
            userSelect: 'none'
        }}>
            {/* A Imagem Real */}
            <img 
              src={image.url || image.imagem_url} 
              alt="Visualização ampliada" 
              style={{ 
                // transform: `rotate(${image.rotacao || 0}deg)`, 
                maxHeight: '80vh', maxWidth: '100%',
                display: 'block'
              }}
            />

            {/* 🛡️ O Overlay de Borrão */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%', // Cobre exatamente metade
                height: '100%',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)', // Suporte para iOS/Safari
                backgroundColor: 'rgba(255, 255, 255, 0.05)', // Leve brilho
                transition: 'transform 0.4s ease-in-out', // Animação de deslize
                transform: blurSide === 'left' ? 'translateX(0)' : 'translateX(100%)',
                pointerEvents: 'none', // O clique ignora o borrão e atinge a div pai
                zIndex: 10
            }} />

            {/* 💡 Dica visual flutuante */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(108, 4, 100, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '30px',
                fontSize: '13px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 11,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}>
                👆 Toque para ver o outro lado
            </div>
        </div>

        {/* TEXTO DE COPYRIGHT NO LIGHTBOX */}
        <div style={{
            marginTop: '10px',
            marginBottom: '15px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '11px',
            textAlign: 'center',
            textShadow: '1px 1px 2px black'
        }}>
            &copy; {new Date().getFullYear()} Acesso Imagens. Imagem protegida por direitos autorais.
        </div>

        {/* 🛒 SEU BOTÃO DE CARRINHO ORIGINAL */}
        {(!user || user.papel === 'CLIENTE') && (
            <button 
              onClick={handleAddCart} 
              className="create-button" 
              style={{
                position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 10000, backgroundColor: '#6c046370', color: '#fff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: 'none', padding: '10px 20px',
                borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Adicionar ao carrinho (R$ {parseFloat(image.preco || 0).toFixed(2)})
            </button>
        )}
      </div>

      {/* --- BOTÃO AVANÇAR --- */}
      {onNext && (
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
      )}
    </div>
  );
}

export default Lightbox;