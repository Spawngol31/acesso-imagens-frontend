// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        nome_completo: '',
        password: '',
        password2: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (formData.password !== formData.password2) {
            setErrors({ password2: "As senhas não coincidem." });
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.post('/registrar/', formData);
            navigate('/login', { state: { message: 'Conta criada com sucesso! Por favor, faça o login.' } });
        
        } catch (error) {
            // --- TRATAMENTO DE ERRO CORRIGIDO ---
            if (error.response) {
                // O servidor respondeu com um erro (ex: username já existe)
                console.error("Erro no registo (dados):", error.response.data);
                setErrors(error.response.data);
            } else if (error.request) {
                // O pedido foi feito, mas não houve resposta (ex: CORS ou servidor offline)
                console.error("Erro no registo (rede):", error.request);
                setErrors({ detail: "Não foi possível ligar ao servidor. Tente novamente." });
            } else {
                // Algo correu mal a preparar o pedido
                console.error("Erro no registo (inesperado):", error.message);
                setErrors({ detail: "Ocorreu um erro inesperado." });
            }
            // ------------------------------------
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="back-to-home-link">
                    ‹ Voltar à página inicial
                </Link>
                <h2>Criar Conta</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input name="nome_completo" type="text" placeholder="Nome Completo" onChange={handleChange} required />
                    {errors.nome_completo && <p className="error-message">{errors.nome_completo[0]}</p>}

                    <input name="username" type="text" placeholder="Nome de Utilizador" onChange={handleChange} required />
                    {errors.username && <p className="error-message">{errors.username[0]}</p>}
                    
                    <input name="email" type="email" placeholder="E-mail" onChange={handleChange} required />
                    {errors.email && <p className="error-message">{errors.email[0]}</p>}

                    <div className="password-input-wrapper">
                        <input name="password" type={showPassword1 ? "text" : "password"} placeholder="Senha" value={formData.password} onChange={handleChange} required />
                        <span onClick={() => setShowPassword1(!showPassword1)} className="password-toggle-icon">
                            {showPassword1 ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> )}
                        </span>
                    </div>
                    {errors.password && <p className="error-message">{errors.password[0]}</p>}

                    <div className="password-input-wrapper">
                        <input name="password2" type={showPassword2 ? "text" : "password"} placeholder="Confirmar Senha" value={formData.password2} onChange={handleChange} required />
                        <span onClick={() => setShowPassword2(!showPassword2)} className="password-toggle-icon">
                            {showPassword2 ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> )}
                        </span>
                    </div>
                    {errors.password2 && <p className="error-message">{errors.password2}</p>}
                    
                    <button type="submit" disabled={loading}>{loading ? 'A registar...' : 'Registar'}</button>
                    {errors.detail && <p className="error-message">{errors.detail}</p>}
                </form>
                <p className="auth-switch-link">
                    Já tem uma conta? <Link to="/login">Faça o login aqui</Link>.
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;