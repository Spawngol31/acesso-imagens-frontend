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
                    <p style={{ textAlign: 'center', color: '#888' }}>A carregar publicações...</p>
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
                                    {/* Usa a imagem da API ou um fallback se não existir */}
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
                        {materias.length === 0 && <p style={{ textAlign: 'center', color: '#888', gridColumn: '1 / -1', padding: '40px' }}>Nenhuma matéria publicada ainda.</p>}
                    </div>
                )}
            </div>

            {/* ESTILOS CSS INJETADOS */}
            <style>{`
                /* CABEÇALHO */
                .imprensa-hero-section {
                    width: 100%;
                    background-color: transparent;
                }
                .imprensa-hero-overlay {
                    padding: 40px 20px 20px 20px; 
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .imprensa-title {
                    font-size: clamp(2.5rem, 5vw, 3.5rem); 
                    margin-bottom: 15px;
                    font-weight: 800;
                    color: #fff;
                }
                .imprensa-subtitle-text {
                    font-size: clamp(1rem, 2vw, 1.1rem);
                    max-width: 600px;
                    line-height: 1.5;
                    margin: 0 auto;
                    color: #eee;
                }

                /* GRID DOS CARDS DE MATÉRIA */
                .imprensa-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 25px;
                    margin-top: 20px;
                }

                /* DESIGN DO CARD VERTICAL */
                .imprensa-card {
                    background: #2a2a2a;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    text-decoration: none;
                    color: inherit;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    position: relative;
                }
                .imprensa-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
                }

                .imprensa-card-image {
                    width: 100%;
                    height: 220px; /* Altura fixa para todos ficarem iguais */
                    position: relative;
                    overflow: hidden;
                    background-color: #1a1a1a;
                }
                .imprensa-card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                .imprensa-card:hover .imprensa-card-image img {
                    transform: scale(1.05); /* Efeito de zoom na imagem ao passar o rato */
                }

                .imprensa-card-content {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    text-align: center;
                    background-color: #222;
                }
                
                .imprensa-card-title {
                    margin: 0 0 10px 0; 
                    font-size: 1.15rem; 
                    color: #fff; 
                    line-height: 1.4;
                    font-weight: bold;
                    /* Trunca o texto em 2 linhas se for muito grande */
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .imprensa-data { 
                    color: #aaa; 
                    font-size: 0.85rem; 
                    font-weight: 500;
                    margin-top: auto; /* Empurra a data para o fundo do card */
                }
            `}</style>
        </div>
    );
}

export default ImprensaPage;