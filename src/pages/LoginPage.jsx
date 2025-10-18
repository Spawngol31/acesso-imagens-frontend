// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/'); // Redireciona para a página inicial após o login
        } catch (err) {
            setError('Falha no login. Verifique o seu email e senha.');
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="back-to-home-link">
                    ‹ Voltar à página inicial
                </Link>
                {message && <p className="success-message">{message}</p>}
                <h2>Entrar</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="E-mail"
                        required 
                    />
                    <div className="password-input-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} // O tipo muda dinamicamente
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Senha"
                            required 
                        />
                        {/* 3. O ícone que alterna a visibilidade */}
                        <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
                            {showPassword ? (
                                // Ícone de "olho cortado" (esconder)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg>
                            ) : (
                                // Ícone de "olho" (mostrar)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </span>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Entrar</button>
                </form>
                <p className="auth-switch-link">
                    Não tem uma conta? <Link to="/registrar">Crie uma aqui</Link>
                </p>
                <div className="forgot-password-link">
                    <Link to="/esqueci-senha">Esqueceu sua senha?</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;