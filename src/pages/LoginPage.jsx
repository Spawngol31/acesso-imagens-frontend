// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // <-- IMPORT NOVO
import FacebookLogin from '@greatsumini/react-facebook-login';
import axiosInstance from '../api/axiosInstance'; // <-- IMPORT NOVO

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login, setTokenEUsuario } = useAuth(); // Importamos uma função para forçar o login
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/'); 
        } catch (err) {
            setError('Falha no login. Verifique o seu email e senha.');
        }
    };

    // --- FUNÇÃO DO GOOGLE ATUALIZADA ---
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axiosInstance.post('/auth/google/', {
                credential: credentialResponse.credential
            });
            
            const data = response.data;
            
            // 1. Guardamos as chaves EXATAMENTE como o seu AuthContext espera:
            localStorage.setItem('authToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            
            // 2. Colocamos o token no cabeçalho do Axios para pedidos futuros
            axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + data.access;
            
            // 3. Opcional mas recomendado: forçamos o recarregamento da página para 
            // garantir que o AuthContext acorda e lê o localStorage novo
            window.location.href = '/'; 
            
        } catch (error) {
            console.error("Erro no login com Google:", error);
            setError('Não foi possível entrar com o Google. Tente novamente.');
        }
    };

    // --- FUNÇÃO DO FACEBOOK ATUALIZADA ---
    const handleFacebookSuccess = async (response) => {
        try {
            const res = await axiosInstance.post('/auth/facebook/', {
                accessToken: response.accessToken
            });
            
            const data = res.data;
            
            // 1. Guardamos as chaves EXATAMENTE como o seu AuthContext espera:
            localStorage.setItem('authToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            
            // 2. Colocamos o token no cabeçalho do Axios para pedidos futuros
            axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + data.access;
            
            // 3. Forçamos o recarregamento da página
            window.location.href = '/'; 
            
        } catch (error) {
            console.error("Erro no login com Facebook:", error);
            setError(error.response?.data?.error || 'Não foi possível entrar com o Facebook. Tente novamente.');
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
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Senha"
                            required 
                        />
                        <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </span>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Entrar</button>
                </form>

                {/* --- SEPARADOR E BOTÕES SOCIAIS PADRONIZADOS (FORMATO PADRÃO GOOGLE) --- */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
                    <span style={{ padding: '0 10px', color: '#888', fontSize: '0.9rem' }}>ou</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    
                    {/* Botão do Google (Formato Retangular Padrão) */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Falha na comunicação com o Google.')}
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="pill" /* <-- Voltamos para o formato retangular padrão (cantos levemente arredondados) */
                            width="260"
                        />
                    </div>

                    {/* Botão do Facebook Mimetizando o Google */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <FacebookLogin
                            appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                            onSuccess={handleFacebookSuccess}
                            onFail={(error) => {
                                console.error('Falha no Facebook', error);
                                setError('O login com Facebook foi cancelado ou falhou.');
                            }}
                            className="btn-facebook-mimic-google" /* <-- USA A NOVA CLASSE CSS */
                        >
                            {/* Ícone oficial do Facebook com as cores originais da Meta */}
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6c1.05 0 2.05.2 2.05.2v2.2h-1.16c-1.14 0-1.39.7-1.39 1.36V12h2.58l-.41 3h-2.17v6.8c4.56-.93 8-4.96 8-9.8z" fill="#1877F2"/>
                            </svg>
                            <span>Continuar com o Facebook</span>
                        </FacebookLogin>
                    </div>
                </div>
                {/* ---------------------------------------------------------------------- */}
                
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