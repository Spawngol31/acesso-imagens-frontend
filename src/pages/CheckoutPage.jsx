// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import axiosInstance from '../api/axiosInstance';

// Carrega a instância do Stripe com sua chave publicável do .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Cria o Payment Intent no nosso backend assim que a página carrega
    const createPaymentIntent = async () => {
      try {
        const response = await axiosInstance.post("/checkout/");
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Erro ao criar o Payment Intent:", error);
        // Adicionar lógica para lidar com erro, ex: redirecionar para o carrinho
      }
    };

    createPaymentIntent();
  }, []);

  const appearance = { theme: 'stripe' };
  const options = { clientSecret, appearance };

  return (
    <div className="checkout-page">
      <h1>Finalizar compra</h1>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}

export default CheckoutPage;