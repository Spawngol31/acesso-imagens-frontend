// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { jwtDecode } from 'jwt-decode'; // Importe o jwt-decode

const AuthContext = createContext();

// 2. Cria o Provedor do Contexto
export function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    // 1. O 'loading' é crucial para evitar "crashes"
    const [loading, setLoading] = useState(true);

    // Função de Logout (envolvida em useCallback para ser estável)
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setAuthToken(null);
        setUser(null);
        delete axiosInstance.defaults.headers['Authorization'];
    }, []);

    // Efeito para buscar dados do usuário se um token existir
    useEffect(() => {
        const fetchUser = async () => {
            if (authToken) {
                try {
                    // Adiciona o token aos cabeçalhos para este pedido
                    axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + authToken;
                    
                    const response = await axiosInstance.get('/me/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Token inválido ou expirado, fazendo logout.", error);
                    logout();
                }
            }
            // --- CORREÇÃO 1: O 'setLoading(false)' DEVE estar fora do 'if' ---
            // Isto garante que o site é carregado, mesmo para utilizadores não logados.
            setLoading(false);
        };
        fetchUser();
    }, [authToken, logout]); // 'logout' é uma dependência do useEffect


    // Função de Login
    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('/token/', { email, password });
            if (response.data) {
                const { access, refresh } = response.data;

                // Armazena AMBOS os tokens
                localStorage.setItem('authToken', access);
                localStorage.setItem('refreshToken', refresh);
                
                // --- CORREÇÃO 2: Define o utilizador e o token IMEDIATAMENTE ---
                setAuthToken(access);
                const decodedUser = jwtDecode(access);
                setUser(decodedUser);
                
                // Define o cabeçalho padrão para todos os pedidos futuros
                axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + access;
            }
        } catch (error) {
            console.error("Erro no login", error);
            throw new Error("Falha no login");
        }
    };

    return (
        <AuthContext.Provider value={{ authToken, user, login, logout, loading }}>
            {/* --- CORREÇÃO 3: Só renderiza o site se não estiver a carregar --- */}
            {!loading && children}
        </AuthContext.Provider>
    );
}

// 3. Cria um Hook customizado para facilitar o uso do contexto
export function useAuth() {
    return useContext(AuthContext);
}