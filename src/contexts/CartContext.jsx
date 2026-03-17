// src/contexts/CartContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from './AuthContext';
import axiosInstance from "../api/axiosInstance";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const { authToken, user } = useAuth();

    // --- 1. FUNÇÕES DO CARRINHO LOCAL (VISITANTE) ---
    const getGuestCart = () => {
        const localItems = JSON.parse(localStorage.getItem('guestCart')) || [];
        const subtotal = localItems.reduce((acc, item) => acc + parseFloat(item.preco_item || item.foto.preco), 0);
        return {
            itens: localItems,
            subtotal: subtotal.toFixed(2),
            desconto: 0,
            total: subtotal.toFixed(2),
            cupom: null
        };
    };

    const syncGuestCartToServer = async () => {
        const localItems = JSON.parse(localStorage.getItem('guestCart')) || [];
        if (localItems.length > 0) {
            try {
                // Manda os itens do navegador para o Django
                for (const item of localItems) {
                    try {
                        await axiosInstance.post('/carrinho/', { foto_id: item.foto.id });
                    } catch (err) {
                        console.error("Erro ao sincronizar item (pode já estar no carrinho):", err);
                    }
                }
                // Limpa o carrinho local pois agora está no banco de dados!
                localStorage.removeItem('guestCart');
            } catch (error) {
                console.error("Erro ao sincronizar carrinho de visitante:", error);
            }
        }
    };
    // -------------------------------------------------

    const fetchCart = useCallback(async () => {
        // Se não está logado como cliente, usa o carrinho da memória do navegador
        if (!authToken || user?.papel !== 'CLIENTE') {
            setCart(getGuestCart());
            return;
        }

        try {
            // Se acabou de fazer login, primeiro sincroniza o que tinha guardado localmente
            await syncGuestCartToServer();
            // Depois busca o carrinho real, oficial, do servidor
            const response = await axiosInstance.get('/carrinho/');
            setCart(response.data);
        } catch (error) {
            console.error("Erro ao buscar o carrinho:", error);
        }
    }, [authToken, user]);

    const applyCoupon = async (codigo) => {
        if (!authToken) {
            throw new Error("Você precisa fazer login para usar cupons de desconto.");
        }
        try {
            const response = await axiosInstance.post('/carrinho/aplicar-cupom/', { codigo });
            setCart(response.data);
        } catch (error) {
            throw new Error(error.response?.data?.error || "Erro ao aplicar cupom.");
        }
    };

    useEffect(() => {
        fetchCart(); // Agora sempre carrega (seja local ou do servidor)
    }, [fetchCart]);

    // ATENÇÃO: Agora precisamos receber o objeto 'foto' inteiro (não só o ID) 
    // para podermos salvar a imagem e o preço na memória do visitante.
    const addToCart = async (foto) => {
        // Se passarem apenas o ID por engano, tentamos isolá-o
        const fotoId = typeof foto === 'object' ? foto.id : foto;

        if (authToken && user?.papel === 'CLIENTE') {
            try {
                await axiosInstance.post('/carrinho/', { foto_id: fotoId });
                fetchCart();
            } catch (error) {
                console.error("Erro ao adicionar ao carrinho:", error);
            }
        } else {
            // Visitante: Salva no localStorage
            const localItems = JSON.parse(localStorage.getItem('guestCart')) || [];
            const exists = localItems.find(item => item.foto.id === fotoId);
            
            if (!exists) {
                // Se o componente passou o objeto foto completo, salvamos!
                const newItem = {
                    id: `local_${Date.now()}`, 
                    foto: typeof foto === 'object' ? foto : { id: fotoId, preco: 0, imagem_url: '' }, 
                    preco_item: typeof foto === 'object' ? foto.preco : 0
                };
                localItems.push(newItem);
                localStorage.setItem('guestCart', JSON.stringify(localItems));
                setCart(getGuestCart()); // Atualiza a tela
            } else {
                alert("Esta foto já está no seu carrinho!");
            }
        }
    };
    
    const removeFromCart = async (itemId) => {
        if (authToken && user?.papel === 'CLIENTE') {
            try {
                await axiosInstance.delete('/carrinho/', { data: { item_id: itemId } });
                fetchCart();
            } catch (error) {
                console.error("Erro ao remover do carrinho:", error);
            }
        } else {
            // Visitante: Remove do localStorage
            let localItems = JSON.parse(localStorage.getItem('guestCart')) || [];
            localItems = localItems.filter(item => item.id !== itemId);
            localStorage.setItem('guestCart', JSON.stringify(localItems));
            setCart(getGuestCart());
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