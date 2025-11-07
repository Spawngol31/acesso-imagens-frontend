// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import axiosInstance from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        const response = await axios.post(`${API_URL}/token/`, {
            email,
            password
        });
        const data = response.data;
        setAuthToken(data.access);
        setRefreshToken(data.refresh);
        localStorage.setItem('authToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        const decodedUser = jwtDecode(data.access);
        setUser(decodedUser);
        axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + data.access;
    };

    const logout = useCallback(() => {
        setAuthToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        delete axiosInstance.defaults.headers['Authorization'];
    }, []);

    // Este useEffect configura os INTERCETORES (o "robô")
    useEffect(() => {
        const requestInterceptor = axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers['Authorization'] = 'Bearer ' + token;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                // Verifica se o erro é 401 e se NÃO é um pedido de refresh que falhou
                if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/token/refresh/') {
                    originalRequest._retry = true;
                    
                    const currentRefreshToken = localStorage.getItem('refreshToken');
                    
                    if (currentRefreshToken) {
                        try {
                            const response = await axios.post(`${API_URL}/token/refresh/`, {
                                refresh: currentRefreshToken
                            });
                            
                            const newAuthToken = response.data.access;
                            localStorage.setItem('authToken', newAuthToken);
                            
                            // Atualiza o estado (dispara o outro useEffect)
                            setAuthToken(newAuthToken); 
                            
                            axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + newAuthToken;
                            originalRequest.headers['Authorization'] = 'Bearer ' + newAuthToken;
                            
                            return axiosInstance(originalRequest);
                        } catch (refreshError) {
                            console.error("Refresh token é inválido. A desconectar.");
                            logout();
                            return Promise.reject(refreshError);
                        }
                    } else {
                        logout();
                    }
                }
                
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]);


    // Este useEffect carrega o 'user' no arranque inicial da app
    useEffect(() => {
        if (authToken) {
            try {
                const decodedUser = jwtDecode(authToken);
                setUser(decodedUser);
                // Define o cabeçalho padrão (redundante por causa do intercetor, mas seguro)
                axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + authToken;
            } catch (error) {
                console.error("Token de autenticação inválido.");
                logout(); 
            }
        }
        setLoading(false); // Diz à app para renderizar
    }, [authToken, logout]);

    return (
        // --- CORREÇÃO 1: Adicionar 'loading' ao 'value' ---
        <AuthContext.Provider value={{ user, authToken, login, logout, loading }}>
            {/* --- CORREÇÃO 2: Só renderiza o site quando o 'loading' inicial terminar --- */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};