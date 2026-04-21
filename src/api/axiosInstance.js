// src/api/axiosInstance.js
import axios from 'axios';

// O React vai buscar a URL dinamicamente (do .env ou do Render)
const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    // --- CORREÇÃO AQUI ---
    baseURL: API_URL, // Agora ele usa a variável em vez do IP fixo!
    //withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;