// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Adicionei um estado de loading para evitar cliques duplos

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/password-reset/', { email });
            setMessage(response.data.message || 'Um link de recuperação foi enviado para o seu e-mail.');
        } catch (err) {
            console.error("Erro real do backend (Recuperar Senha):", err.response?.data || err.message);
            
            // --- NOVA LÓGICA PARA LER ERROS DO DJANGO ---
            let errorMessage = 'Ocorreu um erro de conexão. Tente novamente.';
            
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.email && Array.isArray(data.email)) {
                    errorMessage = data.email[0]; // Erro específico do campo email
                } else if (data.detail) {
                    errorMessage = data.detail; // Erro genérico do DRF
                } else if (data.error) {
                    errorMessage = data.error; // O seu formato antigo
                } else if (typeof data === 'string') {
                    errorMessage = "Erro no servidor. Verifique o terminal do Django.";
                }
            }
            // ---------------------------------------------
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2 style={{ color: '#6c0464', marginTop: 0, marginBottom: '2rem' }}>🔒 Recuperar senha</h2>
                
                {message ? (
                    <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <p style={{ color: '#555', marginBottom: '1.5rem' }}>Digite o seu e-mail para receber as instruções de recuperação.</p>
                        
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="exemplo@email.com" 
                            required 
                            style={{ backgroundColor: 'white', color: '#333' }} // Força o fundo branco
                        />
                        
                        {/* MENSAGEM DE ERRO VISÍVEL */}
                        {error && (
                            <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', fontSize: '14px', textAlign: 'left', marginTop: '5px' }}>
                                ❌ {error}
                            </div>
                        )}
                        
                        <button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                            {isLoading ? 'A enviar...' : 'Enviar Link'}
                        </button>
                    </form>
                )}
                
                <p className="auth-switch-link" style={{ marginTop: '2rem' }}>
                    Lembrou da senha? <Link to="/login" style={{ color: '#6c0464', fontWeight: 'bold' }}>Voltar para o Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;