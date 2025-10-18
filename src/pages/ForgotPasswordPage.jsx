// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/password-reset/', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError("Ocorreu um erro. Tente novamente.");
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2>Recuperar senha</h2>
                {message ? (
                    <p className="success-message">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <p>Digite o seu e-mail para recuperar a senha.</p>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" required />
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit">Enviar Link</button>
                    </form>
                )}
                <p className="auth-switch-link">
                    Lembrou da senha? <Link to="/login">Voltar para o Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;