// src/contexts/CartContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from './AuthContext'; // 1. Importa o useAuth
import axiosInstance from "../api/axiosInstance";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const { authToken, user } = useAuth(); // 2. Pega também o objeto 'user'

    const fetchCart = useCallback(async () => {
        if (!authToken) return;

        try {
            const response = await axiosInstance.get('/carrinho/');
            setCart(response.data);
        } catch (error) {
            console.error("Erro ao buscar o carrinho:", error);
            // Se o erro for 403, não faz nada, pois é esperado para não-clientes
            if (error.response?.status !== 403) {
                // Lidar com outros erros se necessário
            }
        }
    }, [authToken]);

    const applyCoupon = async (codigo) => {
        try {
            // A resposta de sucesso já contém o carrinho atualizado
            const response = await axiosInstance.post('/carrinho/aplicar-cupom/', { codigo });
            setCart(response.data); // Atualiza o estado do carrinho
        } catch (error) {
            console.error("Erro ao aplicar cupom:", error);
            // Lança o erro para que o componente possa exibi-lo
            throw new Error(error.response.data.error || "Erro ao aplicar cupom.");
        }
    };

    useEffect(() => {
        // 3. A CONDIÇÃO PRINCIPAL DA CORREÇÃO:
        // Só busca o carrinho se o token existir E o usuário estiver carregado E o papel for 'CLIENTE'.
        if (authToken && user?.papel === 'CLIENTE') {
            fetchCart();
        } else {
            setCart(null); // Garante que o carrinho esteja limpo para fotógrafos ou usuários deslogados
        }
    }, [authToken, user, fetchCart]); // Adiciona 'user' como dependência

    const addToCart = async (fotoId) => {
        // ... (esta função não precisa de alteração)
        try {
            await axiosInstance.post('/carrinho/', { foto_id: fotoId });
            fetchCart();
        } catch (error) {
            console.error("Erro ao adicionar ao carrinho:", error);
        }
    };
    
    const removeFromCart = async (itemId) => {
        // ... (esta função não precisa de alteração)
        try {
            await axiosInstance.delete('/carrinho/', { data: { item_id: itemId } });
            fetchCart();
        } catch (error) {
            console.error("Erro ao remover do carrinho:", error);
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, applyCoupon, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}