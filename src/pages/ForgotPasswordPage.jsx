// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
            
            let errorMessage = 'Ocorreu um erro de conexão. Tente novamente.';
            
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.email && Array.isArray(data.email)) {
                    errorMessage = data.email[0]; 
                } else if (data.detail) {
                    errorMessage = data.detail; 
                } else if (data.error) {
                    errorMessage = data.error; 
                } else if (typeof data === 'string') {
                    errorMessage = "Erro no servidor. Verifique o terminal do Django.";
                }
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2 className="auth-card-title">Recuperar senha</h2>
                
                {message ? (
                    <div className="auth-success-box">
                        <p>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <p className="auth-subtitle">Digite o seu e-mail para receber as instruções de recuperação.</p>
                        
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="exemplo@email.com" 
                            required 
                        />
                        
                        {error && (
                            <div className="auth-error-box">
                                ❌ {error}
                            </div>
                        )}
                        
                        <button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                            {isLoading ? 'A enviar...' : 'Enviar Link'}
                        </button>
                    </form>
                )}
                
                <p className="auth-switch-link forgot-password-switch">
                    Lembrou da senha? <Link to="/login" className="auth-link-bold">Voltar para o Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;