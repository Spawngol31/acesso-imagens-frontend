// src/pages/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function AboutPage() {
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/fotografos/');
                setColaboradores(response.data);
            } catch (error) {
                console.error("Erro ao buscar colaboradores:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchColaboradores();
    }, []);

    return (
        <div className="page-container">
            <h1 style={{ color: '#6c0464' }}>Quem somos</h1>

            <div className="about-section">
                <h2>Nossa história</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.</p>

                <h2>Nossos objetivos</h2>
                <p>Praesent ac sem eget est egestas volutpat. Morbi vitae tortor id nisl finibus auctor. Etiam vitae leo et diam pellentesque porta.</p>

                <h2>Área de atuação</h2>
                <p>Curabitur sit amet magna quam. Praesent in libero vel turpis pellentesque egestas sit amet vel nunc. Nunc nonummy metus.</p>
            </div>

            <h1 style={{ color: '#6c0464', marginTop: '4rem' }}>Nossa equipe</h1>

            {loading ? <p>A carregar...</p> : (
                <div className="collaborator-grid">
                    {colaboradores.map(colaborador => (
                        <div key={colaborador.id} className="collaborator-card">
                            <img 
                                src={colaborador.foto_perfil_url || '/images/default-avatar.jpg'} 
                                alt={`Foto de ${colaborador.nome_completo}`} 
                                className="collaborator-photo"
                            />
                            <div className="collaborator-info">
                                <h3>{colaborador.nome_completo}</h3>
                                <p className="collaborator-role">{colaborador.especialidade || 'Fotógrafo'}</p>
                                <p className="collaborator-social">{colaborador.rede_social || ''}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default AboutPage;