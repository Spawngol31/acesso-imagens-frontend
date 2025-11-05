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
        setError('');
        setMessage('');
        try {
            // Use o axiosInstance e o caminho relativo
            const response = await axiosInstance.post('/password-reset/', { email });
            setMessage(response.data.message);
        } catch (err) {
            // --- MELHORIA DE DEBUG AQUI ---
            console.error("Erro real do backend (Recuperar Senha):", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
            // -----------------------------
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