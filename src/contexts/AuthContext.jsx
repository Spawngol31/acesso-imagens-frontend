// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios'; // Vamos precisar do axios base para o refresh
import axiosInstance from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Lê a URL da API do nosso ficheiro .env
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || null);
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);
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

    useEffect(() => {
        // --- LÓGICA DE INTERCETORES (O CORAÇÃO DO REFRESH) ---

        // 1. Intercetor de Pedido (Adiciona o token a cada pedido)
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

        // 2. Intercetor de Resposta (Lida com tokens expirados)
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response, // Passa se a resposta for bem-sucedida
            
            // Lida com erros
            async (error) => {
                const originalRequest = error.config;
                
                // Se o erro for 401 (Não Autorizado) e ainda não tentámos refrescar o token
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true; // Marca que já tentámos uma vez
                    
                    const currentRefreshToken = localStorage.getItem('refreshToken');
                    
                    if (currentRefreshToken) {
                        try {
                            // Tenta obter um novo Access Token usando o Refresh Token
                            const response = await axios.post(`${API_URL}/token/refresh/`, {
                                refresh: currentRefreshToken
                            });
                            
                            const newAuthToken = response.data.access;
                            
                            // Guarda o novo token
                            localStorage.setItem('authToken', newAuthToken);
                            setAuthToken(newAuthToken);
                            
                            // Atualiza o 'default' do axios e o pedido original
                            axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + newAuthToken;
                            originalRequest.headers['Authorization'] = 'Bearer ' + newAuthToken;
                            
                            // Tenta o pedido original novamente com o novo token
                            return axiosInstance(originalRequest);

                        } catch (refreshError) {
                            // Se o REFRESH token falhar (ex: também expirou), aí sim, desconectamos o utilizador
                            console.error("Refresh token é inválido ou expirou. A desconectar.");
                            logout();
                            return Promise.reject(refreshError);
                        }
                    } else {
                        // Se não houver refresh token, apenas desconecta
                        logout();
                    }
                }
                
                // Retorna qualquer outro erro que não seja 401
                return Promise.reject(error);
            }
        );

        // Função de limpeza para remover os intercetores quando o componente for desmontado
        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]);

    useEffect(() => {
        // Esta função verifica se o utilizador já está logado ao carregar a página
        if (authToken) {
            try {
                const decodedUser = jwtDecode(authToken);
                // TODO: Verificar se o token expirou (embora o intercetor vá tratar disso)
                setUser(decodedUser);
            } catch (error) {
                console.error("Token de autenticação inválido.");
                logout(); // Limpa se o token estiver corrompido
            }
        }
        setLoading(false);
    }, [authToken, logout]);

    return (
        <AuthContext.Provider value={{ user, authToken, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};