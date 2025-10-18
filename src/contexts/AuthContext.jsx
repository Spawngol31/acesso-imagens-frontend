// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor do Contexto
export function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);

    // Efeito para buscar dados do usuário se um token existir
    useEffect(() => {
        const fetchUser = async () => {
            if (authToken) {
                try {
                    const response = await axiosInstance.get('/me/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Token inválido, fazendo logout.", error);
                    logout();
                }
            }
        };
        fetchUser();
    }, [authToken]);


    // Função de Login
    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('/token/', { email, password });
            if (response.data) {
                // 2. Armazena AMBOS os tokens
                localStorage.setItem('authToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                setAuthToken(response.data.access);
            }
        } catch (error) {
            console.error("Erro no login", error);
            throw new Error("Falha no login");
        }
    };

    // Função de Logout
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Cria um Hook customizado para facilitar o uso do contexto
export function useAuth() {
    return useContext(AuthContext);
}
