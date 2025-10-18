// src/api/axiosInstance.js

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Interceptor 1: Adiciona o token de acesso a cada requisição
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Interceptor 2: Lida com erros de token expirado (401)
axiosInstance.interceptors.response.use(
    // Se a resposta for bem-sucedida, não faz nada
    response => response,
    // Se a resposta der erro...
    async error => {
        const originalRequest = error.config;

        // Se o erro for 401 e ainda não tentamos renovar o token para esta requisição
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Marca que já tentamos uma vez

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    console.log("Token de acesso expirado. A tentar renovar...");
                    // Usamos axios.post para não acionar este mesmo interceptor de novo
                    const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                        refresh: refreshToken
                    });
                    
                    const newAccessToken = response.data.access;
                    localStorage.setItem('authToken', newAccessToken);
                    
                    // Atualiza o cabeçalho da requisição original com o novo token
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    
                    console.log("Token renovado. A tentar novamente a requisição original.");
                    // Tenta fazer a requisição original novamente com o novo token
                    return axiosInstance(originalRequest);

                } catch (refreshError) {
                    console.error("Refresh token inválido. A redirecionar para o login.", refreshError);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        // Para todos os outros erros, apenas rejeita a promessa
        return Promise.reject(error);
    }
);

export default axiosInstance;