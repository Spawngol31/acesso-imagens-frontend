import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ServicesPage() {
    const [activeTab, setActiveTab] = useState('atletas'); // 'atletas' ou 'clubes'

    const corPrincipal = '#6c0464';

    // Rola para o topo suavemente ao mudar de aba
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    return (
        <div className="services-page">
            
            {/* --- 1. HERO SECTION (IMAGEM DINÂMICA VIA CSS) --- */}
            {/* As imagens de fundo agora estão configuradas no <style> lá em baixo! */}
            <section className="services-hero-section">
                <div className="services-hero-overlay">
                    <h1 className="services-title">
                        Comunicação estratégica
                    </h1>
                    <p className="services-subtitle-text">
                        Na Acesso Imagens, reunimos comunicação, marketing, conteúdo, fotografia, design, relacionamento e estratégia para construir marcas e carreiras dentro do futebol.
                    </p>
                    <p className="services-description-text">
                        Cada cliente possui uma necessidade diferente. Por isso, nossa assessoria é construída de forma personalizada, reunindo as ferramentas e profissionais necessários para transformar <strong>posicionamento em presença</strong>, <strong>presença em relacionamento</strong> e <strong>relacionamento em oportunidades</strong>.
                    </p>
                </div>
            </section>

            {/* --- 2. NAVEGAÇÃO DE ABAS (ATLETAS vs CLUBES) --- */}
            <div className="services-tabs-wrapper">
                <div className="services-tabs-container">
                    <button 
                        className={`services-tab ${activeTab === 'atletas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('atletas')}
                    >
                        <span className="tab-icon"></span> PARA ATLETAS
                    </button>
                    <button 
                        className={`services-tab ${activeTab === 'clubes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('clubes')}
                    >
                        <span className="tab-icon"></span> PARA CLUBES
                    </button>
                </div>
            </div>

            <div className="container" style={{ padding: '60px 20px' }}>
                
                {/* ========================================================= */}
                {/*                       ABA: ATLETAS                        */}
                {/* ========================================================= */}
                {activeTab === 'atletas' && (
                    <div className="tab-content fade-in">
                        
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ color: corPrincipal, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '15px' }}>Construção e Gestão de Imagem Profissional</h2>
                            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                                A sua carreira dentro e fora das quatro linhas. Trabalhamos para transformar o atleta em uma <strong>marca profissional</strong>, cuidando da imagem, comunicação, conteúdo e relacionamento ao longo da carreira.
                            </p>
                        </div>

                        {/* GRID DE FERRAMENTAS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                            
                            <div className="service-card">
                                <h3> Fotografia Esportiva</h3>
                                
                                <ul>
                                    <li>Cobertura de jogos & Ensaios</li>
                                    <li>Media Day & Institucionais</li>
                                    <li>Conteúdo para redes e imprensa</li>
                                    <li>Construção de Banco de Imagens</li>
                                </ul>
                            </div>

                            <div className="service-card">
                                <h3> Produção de Conteúdo</h3>
                                <p className="service-subtitle">Contamos a história por trás da carreira.</p>
                                <ul>
                                    <li>Vídeos institucionais & Reels</li>
                                    <li>Rotina e Bastidores</li>
                                    <li>Entrevistas e Posicionamento</li>
                                    <li>Materiais para patrocinadores</li>
                                </ul>
                            </div>

                            <div className="service-card">
                                <h3> Identidade Visual</h3>
                                <p className="service-subtitle">A sua assinatura visual.</p>
                                <ul>
                                    <li>Criação de logotipo/marca do atleta</li>
                                    <li>Definição de paleta e tipografia</li>
                                    <li>Templates para redes sociais</li>
                                    <li>Materiais gráficos profissionais</li>
                                </ul>
                            </div>

                            <div className="service-card">
                                <h3> Gestão de Redes Sociais</h3>
                                <p className="service-subtitle">Muito mais que "postar".</p>
                                <ul>
                                    <li>Planejamento e Calendário</li>
                                    <li>Criação, publicação e métricas</li>
                                    <li>Posicionamento estratégico</li>
                                    <li>Relacionamento com seguidores</li>
                                </ul>
                            </div>

                            <div className="service-card">
                                <h3> Assessoria de Imprensa</h3>
                                <p className="service-subtitle">Construção de reputação.</p>
                                <ul>
                                    <li>Releases e divulgação de conquistas</li>
                                    <li>Relacionamento com jornalistas</li>
                                    <li>Gestão de entrevistas e transferências</li>
                                    <li>Media training e Clipping</li>
                                </ul>
                            </div>

                            <div className="service-card" style={{ backgroundColor: '#fbf0fa', border: `2px solid ${corPrincipal}` }}>
                                <h3 style={{ color: corPrincipal }}> Relacionamento & Mercado</h3>
                                <p className="service-subtitle" style={{ color: '#555' }}>Construção de presença de mercado.</p>
                                <ul>
                                    <li>Aproximação com marcas patrocinadoras</li>
                                    <li>Conexão com clubes e imprensa</li>
                                    <li>Participação em eventos estratégicos</li>
                                    <li>Geração de oportunidades comerciais</li>
                                </ul>
                            </div>

                        </div>

                    </div>
                )}


                {/* ========================================================= */}
                {/*                       ABA: CLUBES                         */}
                {/* ========================================================= */}
                {activeTab === 'clubes' && (
                    <div className="tab-content fade-in">
                        
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ color: corPrincipal, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '15px' }}>Do campo à comunidade.</h2>
                            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                                Construímos a comunicação, a imagem e a presença do seu clube <strong>dentro e fora do estádio</strong>. Transformamos a sua marca numa potência de engajamento e negócios.
                            </p>
                        </div>

                        {/* GRID DE SERVIÇOS CLUBES */}
                        <h3 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#333', marginBottom: '40px' }}>Nossas Soluções para Clubes</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '60px' }}>
                            
                            <div className="service-card">
                                <h3> Ativação de Marca</h3>
                                <p className="service-subtitle">Clube não é só futebol. É comunidade.</p>
                                <ul>
                                    <li>Ações em escolas e comunidade</li>
                                    <li>Experiências em dias de jogo</li>
                                    <li>Ativações do mascote</li>
                                </ul>
                            </div>

                            <div className="service-card">
                                <h3> Patrocinadores</h3>
                                <p className="service-subtitle">Geramos exposição para quem investe.</p>
                                <ul>
                                    <li>Conteúdos exclusivos p/ parceiros</li>
                                    <li>Ativações e campanhas em campo</li>
                                    <li>Exposição digital estratégica</li>
                                </ul>
                            </div>

                            <div className="service-card">
                                <h3> Marketing Esportivo</h3>
                                <p className="service-subtitle">Relacionamento e Rentabilidade.</p>
                                <ul>
                                    <li>Campanhas de ingresso e sócio</li>
                                    <li>Desenvolvimento de produtos</li>
                                    <li>Ações comerciais</li>
                                </ul>
                            </div>

                            <div className="service-card">
                                <h3> Identidade & Media Day</h3>
                                <p className="service-subtitle">A cara do clube.</p>
                                <ul>
                                    <li>Identidade visual padronizada</li>
                                    <li>Planejamento e produção do Media Day</li>
                                    <li>Materiais institucionais</li>
                                </ul>
                            </div>
                        </div>

                        {/* CASE DE SUCESSO DESTAQUE 
                        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '60px', border: `1px solid #eee` }}>
                            <div style={{ backgroundColor: corPrincipal, color: 'white', padding: '30px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}> Cases de Sucesso</h3>
                                <p style={{ fontSize: '1rem', margin: '10px 0 0 0', opacity: 0.9 }}>Construção de presença digital do Absoluto Zero</p>
                            </div>
                            
                            <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                                <div>
                                    <h4 style={{ color: corPrincipal, fontSize: '1.3rem', borderBottom: '2px solid #fbf0fa', paddingBottom: '10px' }}>Samas Sport Club</h4>
                                    <p style={{ lineHeight: '1.7', color: '#555', fontSize: '0.95rem' }}>
                                        A Acesso Imagens assumiu a comunicação do clube e trabalhou na construção de sua presença digital durante a competição. O resultado num único mês de competição atingiu a impressionante marca de <strong>mais de 12.000 visualizações orgânicas</strong>.
                                    </p>
                                    
                                    <h4 style={{ color: corPrincipal, fontSize: '1.3rem', borderBottom: '2px solid #fbf0fa', paddingBottom: '10px', marginTop: '30px' }}>O que fizemos?</h4>
                                    <ul className="custom-list" style={{ fontSize: '0.95rem' }}>
                                        <li><strong>Estratégia:</strong> Calendário, identidade e rotina.</li>
                                        <li><strong>Cobertura:</strong> Pré, durante e pós-jogo in loco.</li>
                                        <li><strong>Audiovisual & Foto:</strong> Registos cinematográficos p/ redes.</li>
                                    </ul>
                                </div>

                                <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '12px', borderLeft: `5px solid ${corPrincipal}` }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#333' }}>🐾 Do Desenho para as Ruas (O Mascote)</h4>
                                    <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
                                        Não criámos um mascote para "simplesmente existir". Transformámo-lo numa propriedade da marca e ferramenta de aproximação.
                                    </p>
                                    <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', fontWeight: 'bold' }}>
                                        Conceito &rarr; Desenho &rarr; Produção &rarr; Ativação
                                    </p>
                                    <ul style={{ fontSize: '0.9rem', color: '#555', paddingLeft: '20px' }}>
                                        <li>Apresentado nas redes e escolas.</li>
                                        <li>Aproximou o clube das crianças e famílias.</li>
                                        <li>Ativações nas ruas e praças com patrocinadores.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>*/}
                    </div>
                )}


                {/* ========================================================= */}
                {/*             SECÇÃO COMUM (A ESTRUTURA / EQUIPA)           */}
                {/* ========================================================= */}
                
                <div style={{ backgroundColor: '#111', color: 'white', padding: '40px 20px', borderRadius: '16px', margin: '40px 0', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '15px' }}>Quem está por trás da sua imagem?</h2>
                    <p style={{ fontSize: '1rem', color: '#aaa', marginBottom: '40px', lineHeight: '1.5' }}>
                        Você não está a contratar "uma pessoa". Está a contratar <strong>uma estrutura inteira</strong> a pensar no seu projeto.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div className="team-role"><strong> Fotógrafo:</strong> Banco de imagens.</div>
                        <div className="team-role"><strong> Designer:</strong> Identidade visual.</div>
                        <div className="team-role"><strong> Social Media:</strong> Estratégia de redes.</div>
                        <div className="team-role"><strong> Assessor:</strong> Imprensa e Relações.</div>
                        <div className="team-role"><strong> Videomaker:</strong> Audiovisual.</div>
                        <div className="team-role" style={{ backgroundColor: corPrincipal }}><strong> Estrategista:</strong> Coordenação.</div>
                    </div>
                </div>


                {/* ========================================================= */}
                {/*               RODAPÉ (CONCLUSÃO FORTE E CTA)              */}
                {/* ========================================================= */}
                
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fcfcfc', borderRadius: '16px', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px' }}>Não fazemos tudo igual para todos.</h3>
                    <p style={{ fontSize: '1rem', color: '#555', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
                        Cada projeto possui uma realidade diferente. Partimos de um diagnóstico rigoroso para reunir as ferramentas exatas para construir a sua imagem.
                    </p>

                    <div className="cta-list-container">
                        <ul className="custom-list check-list">
                            <li>A ferramenta é fotografia.<br/><strong style={{color: corPrincipal}}>O produto é imagem.</strong></li>
                            <li>A ferramenta é Instagram.<br/><strong style={{color: corPrincipal}}>O produto é posicionamento.</strong></li>
                            <li>A ferramenta é mascote.<br/><strong style={{color: corPrincipal}}>O produto é relacionamento.</strong></li>
                        </ul>
                        <ul className="custom-list check-list">
                            <li>A ferramenta é assessoria.<br/><strong style={{color: corPrincipal}}>O produto é reputação.</strong></li>
                            <li>A ferramenta é conteúdo.<br/><strong style={{color: corPrincipal}}>O produto é presença.</strong></li>
                        </ul>
                    </div>

                    <a href="https://wa.me/5592984840065?text=Olá!%20Gostaria%20de%20saber%20como%20a%20Acesso%20Imagens%20pode%20ajudar%20o%20meu%20projeto." 
                       target="_blank" rel="noopener noreferrer" 
                       style={{ display: 'inline-block', backgroundColor: '#25D366', color: 'white', padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)', transition: '0.3s' }}>
                         Falar com a nossa equipe
                    </a>
                </div>

            </div>

            {/* --- ESTILOS CSS INJETADOS (Responsividade Automática) --- */}
            <style>{`
                /* Estilos da Capa (Hero Section) */
                .services-hero-section {
                    width: 100%;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    
                    /* IMAGEM PARA COMPUTADOR: */
                    background-image: url('/images/capa_site.jpg'); 
                }
                .services-hero-overlay {
                    background-color: rgba(0, 0, 0, 0.6);
                    min-height: 60vh; /* Garante que o fundo cresce se o texto for grande */
                    padding: 60px 20px 80px 20px; /* Padding extra em baixo para as abas */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .services-title {
                    color: white;
                    font-size: clamp(2rem, 6vw, 3.5rem); /* Cresce e encolhe sozinho */
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 800;
                    line-height: 1.1;
                }
                .services-subtitle-text {
                    color: #eee;
                    font-size: clamp(1rem, 2.5vw, 1.25rem);
                    max-width: 800px;
                    line-height: 1.6;
                    margin: 0 auto 20px auto;
                }
                .services-description-text {
                    color: #ccc;
                    font-size: clamp(0.9rem, 2vw, 1.1rem);
                    max-width: 800px;
                    line-height: 1.6;
                    margin: 0 auto;
                }

                /* Estilos das Abas (Navegação) */
                .services-tabs-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: -35px; /* Puxa os botões para cima da imagem */
                    position: relative;
                    z-index: 10;
                    padding: 0 15px;
                }
                .services-tabs-container {
                    display: flex;
                    flex-direction: row;
                    background-color: #fff;
                    border-radius: 50px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    overflow: hidden;
                    width: 100%;
                    max-width: 600px;
                }
                .services-tab {
                    flex: 1;
                    padding: 20px 10px;
                    font-size: clamp(0.85rem, 3vw, 1.2rem);
                    font-weight: bold;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background-color: transparent;
                    color: #555;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .services-tab.active {
                    background-color: ${corPrincipal};
                    color: #fff;
                }

                /* Estilos dos Cards de Serviço */
                .service-card {
                    background: #fff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    transition: transform 0.3s ease;
                    border-bottom: 4px solid transparent;
                }
                .service-card:hover {
                    transform: translateY(-5px);
                    border-bottom-color: ${corPrincipal};
                }
                .service-card h3 { margin-top: 0; font-size: 1.3rem; color: #333; }
                .service-subtitle { font-size: 0.95rem; color: ${corPrincipal}; font-weight: bold; margin-bottom: 20px; }
                .service-card ul { padding-left: 20px; color: #555; font-size: 0.95rem; line-height: 1.6; }
                
                /* Listas Customizadas */
                .custom-list li { margin-bottom: 10px; }
                .check-list li { list-style: none; position: relative; padding-left: 25px; }
                .check-list li::before { content: '✓'; position: absolute; left: 0; color: ${corPrincipal}; }
                
                .cta-list-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    max-width: 600px;
                    margin: 0 auto 40px auto;
                    text-align: left;
                }

                .team-role {
                    background: rgba(255,255,255,0.1);
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 0.95rem;
                }
                
                .fade-in { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* REGRAS ESPECÍFICAS PARA TELEMÓVEL */
                @media (max-width: 768px) {
                    
                    /* TROCA DE IMAGEM AUTOMÁTICA PARA TELEMÓVEL: */
                    .services-hero-section {
                        background-image: url('/images/capa_site_mobile.png'); 
                    }

                    .services-tabs-container {
                        border-radius: 40px;
                    }
                    .services-tab {
                        flex-direction: column; /* Coloca o ícone em cima do texto no telemóvel */
                        padding: 12px 5px;
                        gap: 4px;
                        text-align: center;
                    }
                    .tab-icon {
                        font-size: 1.2rem;
                    }
                    .cta-list-container {
                        grid-template-columns: 1fr; /* Lista final fica numa única coluna no telemóvel */
                        gap: 0;
                    }
                }
            `}</style>

        </div>
    );
}

export default ServicesPage;