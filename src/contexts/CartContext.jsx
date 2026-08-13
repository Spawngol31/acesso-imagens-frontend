// src/contexts/CartContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from './AuthContext';
import axiosInstance from "../api/axiosInstance";
import { toast } from 'react-toastify';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const { authToken, user } = useAuth();

    // --- 1. FUNÇÕES DO CARRINHO LOCAL (VISITANTE) ---
    const getGuestCart = () => {
        const localItems = JSON.parse(localStorage.getItem('guestCart')) || [];
        
        const subtotal = localItems.reduce((acc, item) => {
            const preco = parseFloat(item.preco_item || item.foto?.preco || item.video?.preco);
            return acc + (isNaN(preco) ? 0 : preco);
        }, 0);
        
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
                for (const item of localItems) {
                    try {
                        await axiosInstance.post('carrinho/', { foto_id: item.foto.id });
                    } catch (err) {
                        console.error("Erro ao sincronizar item (pode já estar no carrinho):", err);
                    }
                }
                localStorage.removeItem('guestCart');
            } catch (error) {
                console.error("Erro ao sincronizar carrinho de visitante:", error);
            }
        }
    };
    // -------------------------------------------------

    const fetchCart = useCallback(async () => {
        if (!authToken || user?.papel !== 'CLIENTE') {
            setCart(getGuestCart());
            return;
        }

        try {
            await syncGuestCartToServer();
            const response = await axiosInstance.get('carrinho/');
            setCart(response.data);
        } catch (error) {
            console.error("Erro ao buscar o carrinho:", error);
            setCart({ itens: [], subtotal: 0, desconto: 0, total: 0, cupom: null });
        }
    }, [authToken, user]);

    const applyCoupon = async (codigo) => {
        if (!authToken) {
            throw new Error("Você precisa fazer login para usar cupons de desconto.");
        }
        try {
            const response = await axiosInstance.post('carrinho/aplicar-cupom/', { codigo });
            setCart(response.data);
        } catch (error) {
            throw new Error(error.response?.data?.error || "Erro ao aplicar cupom.");
        }
    };

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (media) => {
        const isVideo = typeof media === 'object' && media.arquivo_preview_url !== undefined;
        const mediaId = typeof media === 'object' ? media.id : media;

        if (authToken && user?.papel === 'CLIENTE') {
            try {
                const payload = isVideo ? { video_id: mediaId } : { foto_id: mediaId };
                await axiosInstance.post('carrinho/', payload);
                fetchCart();
                toast.success(`🛒 Sucesso! ${isVideo ? 'Vídeo' : 'Foto'} adicionado(a) ao carrinho.`); 
            } catch (error) {
                console.error("Erro ao adicionar ao carrinho:", error);
                toast.error("Erro ao adicionar. O item pode já estar no carrinho.");
            }
        } else {
            const localItems = JSON.parse(localStorage.getItem('guestCart')) || [];
            
            const exists = localItems.find(item => 
                (isVideo && item.video?.id === mediaId) || (!isVideo && item.foto?.id === mediaId)
            );
            
            if (!exists) {
                const newItem = {
                    id: `local_${Date.now()}`,
                    foto: !isVideo ? (typeof media === 'object' ? media : { id: mediaId, preco: 0 }) : null,
                    video: isVideo ? media : null,
                    preco_item: typeof media === 'object' ? media.preco : 0
                };
                localItems.push(newItem);
                localStorage.setItem('guestCart', JSON.stringify(localItems));
                setCart(getGuestCart()); 
                toast.success(`🛒 Sucesso! ${isVideo ? 'Vídeo' : 'Foto'} adicionado(a) ao carrinho.`);
            } else {
                toast.warning(`Este ${isVideo ? 'vídeo' : 'item'} já está no seu carrinho!`);
            }
        }
    };
    
    const removeFromCart = async (itemId) => {
        if (authToken && user?.papel === 'CLIENTE') {
            try {
                await axiosInstance.delete('carrinho/', { data: { item_id: itemId } });
                fetchCart();
            } catch (error) {
                console.error("Erro ao remover do carrinho:", error);
            }
        } else {
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