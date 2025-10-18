// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

function ContactPage() {
    const [formData, setFormData] = useState({ nome: '', email: '', mensagem: '' });
    const [feedback, setFeedback] = useState({ message: '', error: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ message: '', error: '' });

        try {
            const response = await axios.post('http://localhost:8000/api/contato/', formData);
            setFeedback({ message: response.data.message, error: '' });
            setFormData({ nome: '', email: '', mensagem: '' });
        } catch (error) {
            setFeedback({ message: '', error: error.response?.data?.error || 'Erro ao enviar mensagem.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1>Contato</h1>
            <div className="auth-card" style={{ maxWidth: '700px' }}>
                <form onSubmit={handleSubmit} className="auth-form">
                    <p style={{textAlign: 'left', color: '#555'}}>Tem alguma dúvida ou sugestão? Envie-nos uma mensagem!</p>
                    <input type="text" name="nome" placeholder="Seu Nome" value={formData.nome} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Seu E-mail" value={formData.email} onChange={handleChange} required />
                    <textarea name="mensagem" placeholder="Sua Mensagem" value={formData.mensagem} onChange={handleChange} required rows="6"></textarea>
                    
                    {feedback.message && <p className="success-message">{feedback.message}</p>}
                    {feedback.error && <p className="error-message">{feedback.error}</p>}

                    {/* --- BOTÃO ENVOLVIDO NUMA DIV --- */}
                    <div className="form-submit-wrapper">
                        <button type="submit" className="create-button" disabled={loading}>
                            {loading ? 'A enviar...' : 'Enviar Mensagem'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ContactPage;