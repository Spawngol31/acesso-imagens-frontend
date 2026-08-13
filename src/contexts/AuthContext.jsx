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
        const response = await axios.post(`${API_URL}token/`, {
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
        window.location.href = '/';
    }, []);

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
                
                if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== 'token/refresh/') {
                    originalRequest._retry = true;
                    
                    const currentRefreshToken = localStorage.getItem('refreshToken');
                    
                    if (currentRefreshToken) {
                        try {
                            const response = await axios.post(`${API_URL}token/refresh/`, {
                                refresh: currentRefreshToken
                            });
                            
                            const newAuthToken = response.data.access;
                            localStorage.setItem('authToken', newAuthToken);
                            
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

    useEffect(() => {
        if (authToken) {
            try {
                const decodedUser = jwtDecode(authToken);
                setUser(decodedUser);
                axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + authToken;
            } catch (error) {
                console.error("Token de autenticação inválido.");
                logout(); 
            }
        }
        setLoading(false);
    }, [authToken, logout]);

    return (
        <AuthContext.Provider value={{ user, authToken, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};