// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
        try {
            const response = await axios.post('http://localhost:8000/api/password-reset/confirm/', {
                uidb64,
                token,
                password
            });
            setMessage(response.data.message);
            // Redireciona para o login após alguns segundos
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Ocorreu um erro.");
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