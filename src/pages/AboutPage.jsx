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
                <h2>A agência</h2>
                <p>Somos uma empresa de comunicação e assessoria esportiva. Nosso propósito é fortalecer a imagem de clubes, atletas e eventos esportivos por meio de soluções criativas e estratégias que conectam o esporte ao público.

                   Unimos experiência em jornalismo, marketing e produção audiovisual para entregar resultados que valorizam cada projeto. Atuamos em diferentes frentes, como assessoria de imprensa, gestão de redes sociais, fotografia esportiva, produção audiovisual e cobertura de eventos, sempre com foco em qualidade, credibilidade e visibilidade para nossos clientes.

                   Mais do que registrar momentos, contamos histórias. Acreditamos que cada imagem, texto e ação de comunicação tem o poder de inspirar, engajar e transformar percepções.</p>

                <h2>Nossos objetivos</h2>
                <p>Na Acesso Imagens, trabalhamos com o propósito de impulsionar a visibilidade e o reconhecimento de clubes, atletas e projetos esportivos. Nossos objetivos estão voltados para fortalecer a comunicação, ampliar o alcance das marcas e transformar a forma como o esporte é contado e percebido pelo público.

                   Buscamos oferecer estratégias eficazes que gerem engajamento, credibilidade e resultados reais. Cada ação é planejada para destacar histórias, consolidar identidades e aproximar o esporte de quem o vive e de quem o acompanha.

                   Também temos o compromisso de contribuir para o desenvolvimento do cenário esportivo amazonense, promovendo a valorização dos profissionais, das competições e dos talentos locais.

                   Nosso foco é construir uma comunicação que inspire, conecte e gere impacto, dentro e fora de campo, do Norte ao Sul do Brasil.</p>
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