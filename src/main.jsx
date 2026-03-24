// src/main.jsx

import { GoogleOAuthProvider } from '@react-oauth/google';

// Importações principais do React
import React from 'react';
import ReactDOM from 'react-dom/client';

// Importação do Roteador
import { BrowserRouter } from "react-router-dom";

// Nossos Provedores de Contexto Globais
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// O componente principal da aplicação
import App from './App.jsx';

// Estilos globais
import './index.css';
import './App.css';

// --- BLOQUEIO DE BOTÃO DIREITO (Proteção Simples) ---
document.addEventListener('contextmenu', (event) => {
  // Impede o menu de abrir
  event.preventDefault();
});

// --- BLOQUEIO DE TECLAS DE ATALHO (Opcional) ---
document.addEventListener('keydown', (event) => {
  // Bloqueia F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (Ver Fonte)
  if (
    event.key === 'F12' || 
    (event.ctrlKey && event.shiftKey && event.key === 'I') || 
    (event.ctrlKey && event.shiftKey && event.key === 'J') || 
    (event.ctrlKey && event.key === 'u')
  ) {
    event.preventDefault();
  }
});

// Esta é a linha que renderiza TUDO na tela
// E lá embaixo, envolva o AuthProvider assim:
ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);