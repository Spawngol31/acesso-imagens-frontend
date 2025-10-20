// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios'; // Importamos o 'axios' base para a chamada de refresh
import axiosInstance from '../api/axiosInstance'; // A nossa instância principal
import { jwtDecode } from 'jwt-decode';

// Lê a URL da nossa API a partir do .env
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Agora também guardamos o refreshToken no estado
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        // Usamos o axios base para o login, pois o axiosInstance ainda não tem os intercetores
        const response = await axios.post(`${API_URL}/token/`, {
            email,
            password
        });
        const data = response.data;

        // Guardamos AMBOS os tokens
        setAuthToken(data.access);
        setRefreshToken(data.refresh);
        localStorage.setItem('authToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);

        const decodedUser = jwtDecode(data.access);
        setUser(decodedUser);
    };

    const logout = useCallback(() => {
        setAuthToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }, []);

    useEffect(() => {
        // Esta função 'setupInterceptors' é o coração da nossa lógica
        const setupInterceptors = () => {
            
            // Intercetor 1: É executado ANTES de cada pedido
            const requestInterceptor = axiosInstance.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem('authToken'); // Pega o token mais recente
                    if (token) {
                        config.headers['Authorization'] = 'Bearer ' + token;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            // Intercetor 2: É executado DEPOIS de cada resposta (especialmente se for um erro)
            const responseInterceptor = axiosInstance.interceptors.response.use(
                (response) => response, // Se a resposta for 200 OK, não faz nada
                
                async (error) => {
                    const originalRequest = error.config;
                    
                    // Se o erro for 401 (Não Autorizado) E ainda não tentámos renovar
                    if (error.response?.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true; // Marca que vamos tentar renovar

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
                                
                                // Atualiza o cabeçalho do pedido original
                                originalRequest.headers['Authorization'] = 'Bearer ' + newAuthToken;
                                
                                // Tenta o pedido original novamente com o novo token
                                return axiosInstance(originalRequest);

                            } catch (refreshError) {
                                // Se o REFRESH token falhar (ex: também expirou), aí sim, desconectamos
                                console.error("Refresh token é inválido. A desconectar.");
                                logout();
                                return Promise.reject(refreshError);
                            }
                        } else {
                            logout(); // Se não há refresh token, desconecta
                        }
                    }
                    
                    return Promise.reject(error);
                }
            );

            // Devolve os intercetores para que possam ser "limpos"
            return { requestInterceptor, responseInterceptor };
        };

        const { requestInterceptor, responseInterceptor } = setupInterceptors();

        // Esta função de "limpeza" é importante
        // Ela remove os intercetores quando o componente 'morre'
        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]);


    // Este useEffect carrega os dados do utilizador ao iniciar a app
    useEffect(() => {
        if (authToken) {
            try {
                const decodedUser = jwtDecode(authToken);
                setUser(decodedUser);
            } catch (error) {
                console.error("Token de autenticação inválido ou corrompido.");
                logout(); // Limpa se o token estiver mau
            }
        }
        setLoading(false);
    }, [authToken, logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* Só renderiza a aplicação quando o carregamento inicial terminar */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// O nosso hook 'useAuth' continua o mesmo
export const useAuth = () => {
    return useContext(AuthContext);
};