// src/components/CheckoutForm.jsx

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js não carregou ainda.
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // URL para onde o cliente será redirecionado após o pagamento.
        return_url: `${window.location.origin}/pedido/sucesso`,
      },
    });
    
    // Este código só é executado se houver um erro imediato.
    // Redirecionamentos e sucessos são tratados pelo 'return_url'.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("Ocorreu um erro inesperado.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit" className="checkout-button">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pagar Agora"}
        </span>
      </button>
      {/* Exibe mensagens de erro */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}
