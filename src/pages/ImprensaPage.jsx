// src/pages/ImprensaPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

function ImprensaPage() {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchMaterias();
    }, []);

    const fetchMaterias = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/imprensa/');
            setMaterias(response.data);
        } catch (error) {
            console.error("Erro ao buscar matérias:", error);
            toast.error("Não foi possível carregar as publicações.");
            setMaterias([]); 
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="imprensa-page">
            
            {/* HERO SECTION COM NOVO ALINHAMENTO */}
            <section className="imprensa-hero-section">
                <div className="imprensa-hero-overlay">
                    <h1 className="imprensa-title">NA MÍDIA</h1>
                    <p className="imprensa-subtitle-text">
                        Acompanhe as principais notícias, reportagens e destaques dos nossos clientes veiculados nos maiores portais de comunicação.
                    </p>
                </div>
            </section>

            <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                
                {loading ? (
                    <p className="page-subtitle" style={{ textAlign: 'center' }}>A carregar publicações...</p>
                ) : (
                    <div className="imprensa-grid">
                        {materias.map(materia => (
                            <a 
                                href={materia.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                key={materia.id} 
                                className="imprensa-card"
                            >
                                <div className="imprensa-card-image">
                                    <img 
                                        src={materia.imagem_capa || '/images/default-news.png'} 
                                        alt={materia.titulo} 
                                        onError={(e) => { e.target.src = '/images/default-news.png' }}
                                    />
                                </div>
                                <div className="imprensa-card-content">
                                    <h3 className="imprensa-card-title" title={materia.titulo}>{materia.titulo}</h3>
                                    <span className="imprensa-data">{formatDate(materia.data_publicacao)} • {materia.veiculo}</span>
                                </div>
                            </a>
                        ))}
                        {materias.length === 0 && <p className="page-subtitle" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>Nenhuma matéria publicada ainda.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImprensaPage;