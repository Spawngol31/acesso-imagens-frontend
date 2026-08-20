// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { uidb64, token } = useParams(); // Pega os parâmetros da URL
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== password2) {
            setError("As senhas não coincidem.");
            return;
        }
        
        setError('');
        setMessage('');

        try {
            // --- CORREÇÃO AQUI ---
            // 1. O endpoint correto é '/password-reset/confirm/'
            // 2. Os dados a enviar são uidb64, token, e a nova password
            const response = await axiosInstance.post('/password-reset/confirm/', {
                uidb64,
                token,
                password
            });
            // ---------------------
            
            setMessage(response.data.message);
            // Redireciona para o login após 3 segundos
            setTimeout(() => navigate('/login'), 3000);

        } catch (err) {
            console.error("Erro real do backend (Resetar Senha):", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Ocorreu um erro. Este link pode ter expirado.');
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2>Redefinir senha</h2>
                {message ? (
                    <div style={{textAlign: 'center'}}>
                        <p className="success-message">{message}</p>
                        {/* --- BOTÃO MODIFICADO --- */}
                        <Link 
                            to="/login" 
                            className="create-button"
                            style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}
                        >
                            Ir para o Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha" required />
                        <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Confirmar nova senha" required />
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit">Redefinir Senha</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;