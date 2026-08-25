// src/pages/ServicesPage.jsx

import React, { useState, useEffect } from 'react';

function ServicesPage() {
    const [activeTab, setActiveTab] = useState('atletas'); // 'atletas' ou 'clubes'

    const corPrincipal = '#6c0464';

    // Rola para o topo suavemente ao mudar de aba
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    return (
        <div className="services-page">
            
            {/* --- 1. HERO SECTION --- */}
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
                            <h2 className="section-main-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '15px' }}>Construção e Gestão de Imagem Profissional</h2>
                            <p className="section-main-desc" style={{ fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                                A sua carreira dentro e fora das quatro linhas. Trabalhamos para transformar o atleta em uma <strong>marca profissional</strong>, cuidando da imagem, comunicação, conteúdo e relacionamento ao longo da carreira.
                            </p>
                        </div>

                        {/* GRID DE FERRAMENTAS ATLETAS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                            
                            {/* 1. Fotografia Esportiva (Atualizado) */}
                            <div className="service-card">
                                <h3> Fotografia Esportiva</h3>
                                <p className="service-desc">Construímos um banco de imagens profissional para valorizar a carreira e a identidade do atleta. Realizamos coberturas de jogos, Media Day e registros institucionais, além de conteúdos pensados para redes sociais e materiais profissionais.</p>
                                
                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbzIu47jc4i/embed" title="Foto 1" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DYltK0bDS5v/embed" title="Foto 2" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DZiWiFjEVhi/embed" title="Foto 3" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbuVaattMrR/embed" title="Foto 4" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/Dbs2dqwlnPH/embed" title="Foto 5" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbswL9bHN1q/embed" title="Foto 6" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>

                            </div>

                            {/* 2. Produção de Conteúdo (Atualizado) */}
                            <div className="service-card">
                                <h3> Produção de Conteúdo</h3>
                                <p className="service-desc">Contamos a história do atleta dentro e fora de campo. Produzimos vídeos, Reels, entrevistas, bastidores, conteúdos de rotina e materiais para redes sociais, criando uma comunicação mais próxima, autêntica e alinhada aos objetivos da carreira.</p>
                                
                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.instagram.com/reel/C9f6isqxT2T/embed" title="Gabi" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DDfxB7lRqhE/embed" title="Luan" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DHTaxvhREfO/embed" title="Jonathan" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DW640dgCR4n/embed" title="Júlio" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DTYtbBNkcJU/embed" title="Vitinho" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.youtube.com/embed/nnnqypolvEU" title="Bastidores Fast" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                </div>
                            </div>

                            {/* 3. Assessoria de Imprensa (Atualizado) */}
                            <div className="service-card">
                                <h3> Assessoria de Imprensa</h3>
                                <p className="service-desc">Transformamos conquistas, momentos e histórias da carreira em oportunidades de visibilidade. Produzimos releases, pautas e conteúdos jornalísticos, além de trabalhar o relacionamento com jornalistas e veículos de comunicação.</p>
                                
                                

                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DY5PcgmFWPw/embed" title="Organização na CBF" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/reel/DPt6XjgEZm2/embed" title="Mídia Luan" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbevmGZNFIG/embed" title="Mídia Júlio Cesar" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbLmxzrRm9I/embed" title="Mídia Kelvin" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DccC8TTnR79/embed" title="Mídia EC Passo Fundo" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>

                                <div className="case-box">
                                    <h4 className="case-title" style={{ margin: '0 0 5px 0', fontSize: '0.95rem' }}>Passo Fundo na Mídia</h4>
                                    <p className="case-text" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                                        "Fora de casa, Brasil de Pelotas empata com o Passo Fundo e se mantém no G8" (Litorano)
                                    </p>
                                    <a href="https://rdplanalto.com/passo-fundo-joga-em-vacaria-nesta-quarta-feira-ouca-pela-radio-planalto-news-92-1" target="_blank" rel="noopener noreferrer" className="link-tag" style={{ backgroundColor: corPrincipal, color: 'white', border: 'none', padding: '10px 15px', display: 'inline-flex', marginTop: '10px' }}>
                                        📻 Rádio Planalto News
                                    </a>
                                </div>

                                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                    <a href="https://ge.globo.com/am/futebol/times/nacional-am/noticia/2026/05/26/vitinho-projeta-decisao-historica-da-copa-norte-contra-o-paysandu-estamos-confiantes.ghtml" target="_blank" rel="noopener noreferrer" className="link-tag" style={{ backgroundColor: corPrincipal, color: 'white', border: 'none', padding: '10px 15px', display: 'inline-flex' }}>
                                         Matéria: Vitinho no Globo Esporte (GE)
                                    </a>
                                </div>
                            </div>

                            {/* 4. Relacionamento & Mercado (Atualizado) */}
                            <div className="service-card highlight-card">
                                <h3 style={{ color: corPrincipal }}> Relacionamento & Mercado</h3>
                                <p className="service-desc">Criamos conexões que podem gerar novas oportunidades para a carreira. Trabalhamos a aproximação com marcas, patrocinadores, profissionais do futebol e comunidades, ampliando a presença do atleta no mercado esportivo.</p>
                                
                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DVyePZWDZx_/embed" title="SJ x Acesso Imagens" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/reel/DWO69N5ji0q/embed" title="Léo Salgado" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DUWFcpNEf3o/embed" title="Jon x N1" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/reel/DW4AWvZDeti/embed" title="Fatmap" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>
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
                            <h2 className="section-main-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '15px' }}>Do campo à comunidade.</h2>
                            <p className="section-main-desc" style={{ fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                                Construímos a comunicação, a imagem e a presença do seu clube <strong>dentro e fora do estádio</strong>. Transformamos a sua marca numa potência de engajamento e negócios.
                            </p>
                        </div>

                        {/* GRID DE SERVIÇOS CLUBES */}
                        <h3 className="section-sub-title" style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '40px' }}>Nossas Soluções para Clubes</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '60px' }}>
                            
                            {/* 1. Ativação de Marca */}
                            <div className="service-card">
                                <h3> Ativação de Marca</h3>
                                <p className="service-desc">Transformamos o clube em uma marca presente também fora das quatro linhas, criando experiências que aproximam torcedores, comunidade e parceiros. Desenvolvemos ações em escolas, experiências em dias de jogo e ativações com mascotes, fortalecendo o vínculo entre clube e público.</p>
                                
                                <div className="case-box">
                                    <h4 className="case-title" style={{ margin: '0 0 5px 0', fontSize: '0.95rem' }}>🐻 Mascote Mateusz</h4>
                                    <p className="case-text" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>Criado em parceria com a Secretaria de Educação de São Mateus. Baseado no Urso, com forte influência da cultura polonesa enraizada no município, acompanhado de seu Erva-Mate, simbolizando união, comunicação e educação.</p>
                                </div>

                                <div className="preview-wrapper">
                                    {/* 🚀 VÍDEO DO YOUTUBE INTEGRADO AQUI */}
                                    <iframe className="preview-iframe" src="https://www.youtube.com/embed/ExmCINyAic0" title="Vídeo do Mateusz" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DPMEJBkjjBd/embed" title="Foto do Mateusz" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>
                            </div>

                            {/* 2. Identidade & Media Day */}
                            <div className="service-card">
                                <h3> Identidade & Media Day</h3>
                                <p className="service-desc">Construímos a identidade visual e a comunicação do clube de forma profissional e padronizada. Planejamos e produzimos Media Days, materiais institucionais e conteúdos que valorizam atletas e comissão técnica.</p>
                                
                                <div className="case-box">
                                    <h4 className="case-title" style={{ margin: '0 0 5px 0', fontSize: '0.95rem' }}>Presskit Passo Fundo</h4>
                                    <p className="case-text" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '10px' }}>Uma construção completa da identidade do clube preparada exclusivamente para a imprensa.</p>
                                    
                                    {/* Botão de Download do PDF */}
                                    <a href="/PRESSKIT  ECPF X SANTACRUZ-RS.pdf" target="_blank" rel="noopener noreferrer" className="link-tag" style={{ backgroundColor: corPrincipal, color: 'white', border: 'none', padding: '8px 15px', display: 'inline-flex' }}>
                                        📄 Acessar Presskit Completo
                                    </a>
                                </div>

                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.instagram.com/reel/DcPkc5pyiax/embed" title="Material de Coletiva" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/reel/DcKC2XIpjJC/embed" title="Boletim Semanal" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>
                            </div>

                            {/* 3. Marketing Esportivo */}
                            <div className="service-card">
                                <h3> Marketing Esportivo</h3>
                                <p className="service-desc">Desenvolvemos estratégias comerciais que ajudam o clube a transformar sua audiência em oportunidades de negócio. Criamos campanhas de ingresso e sócio, produtos, ações comerciais e projetos que fortalecem o relacionamento e a rentabilidade do clube.</p>
                                
                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbQfkgtFTKi/embed" title="Venda na Procissão" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DcOkg3fFV1P/embed" title="Serviços de Jogo" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>
                            </div>

                            {/* 4. Gestão de Redes Sociais */}
                            <div className="service-card">
                                <h3> Gestão de Redes Sociais</h3>
                                <p className="service-desc">Gerimos a redes sociais do clube, desde o Instagram ao YouTube, com planejamento de postagens sobre o calendário do time na temporada atual, vídeos de atualizações do dia a dia no clube.</p>
                                
                                <ul className="custom-list check-list" style={{ marginTop: '10px', marginBottom: '15px' }}>
                                    <li>Clube, Período e Métricas</li>
                                    <li>Relacionamento direto com a torcida</li>
                                </ul>

                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DaiUbGbFV3E/embed" title="Calendário de Jogos" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbohmSgiYGr/embed" title="Passo Pela Estrada" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DVHCeiRD3kg/embed" title="Contagem Prudentópolis" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DbZJ1cWCebz/embed" title="Contagem Passo Fundo" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>
                            </div>

                            {/* 5. Patrocinadores */}
                            <div className="service-card">
                                <h3> Patrocinadores</h3>
                                <p className="service-desc">Criamos oportunidades para valorizar os patrocinadores e ampliar sua exposição junto à torcida. Desenvolvemos conteúdos exclusivos, ativações em campo, campanhas personalizadas e estratégias digitais que conectam marcas ao universo do futebol.</p>

                                <div className="preview-wrapper">
                                    <iframe className="preview-iframe" src="https://www.youtube.com/embed/VVIO3X9asTU" title="Ativação Mateusz" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DVHCeiRD3kg/embed" title="Contagem com Marcas" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/reel/Dbbt0r7JMA6/embed" title="Parceiros no Rodapé" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                    <iframe className="preview-iframe" src="https://www.instagram.com/p/DcZDmCoFXHb/embed" title="Destaque Patrocinador" frameBorder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>
                                </div>
                            </div>

                        </div>
                    </div>
                )}


                {/* ========================================================= */}
                {/*             SECÇÃO COMUM (A ESTRUTURA / EQUIPA)           */}
                {/* ========================================================= */}
                
                <div className="team-section">
                    <h2 className="team-title">Quem está por trás da sua imagem?</h2>
                    <p className="team-desc">
                        Você não está a contratar "uma pessoa". Está a contratar <strong>uma estrutura inteira</strong> a pensar no seu projeto.
                    </p>
                    
                    <div className="team-grid">
                        <div className="team-role"><strong> Fotógrafo:</strong> Banco de imagens.</div>
                        <div className="team-role"><strong> Designer:</strong> Identidade visual.</div>
                        <div className="team-role"><strong> Social Media:</strong> Estratégia de redes.</div>
                        <div className="team-role"><strong> Assessor:</strong> Imprensa e Relações.</div>
                        <div className="team-role"><strong> Videomaker:</strong> Audiovisual.</div>
                        <div className="team-role team-role-highlight"><strong> Estrategista:</strong> Coordenação.</div>
                    </div>
                </div>


                {/* ========================================================= */}
                {/*               RODAPÉ (CONCLUSÃO FORTE E CTA)              */}
                {/* ========================================================= */}
                
                <div className="cta-section" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: '16px', borderStyle: 'solid', borderWidth: '1px' }}>
                    <h3 className="cta-title" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: '20px' }}>Não fazemos tudo igual para todos.</h3>
                    <p className="cta-desc" style={{ fontSize: '1rem', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
                        Cada projeto possui uma realidade diferente. Partimos de um diagnóstico rigoroso para reunir as ferramentas exatas para construir a sua imagem.
                    </p>

                    <div className="cta-list-container">
                        <ul className="custom-list check-list">
                            <li>A ferramenta é fotografia.<br/><strong className="cta-strong">O produto é imagem.</strong></li>
                            <li>A ferramenta é Instagram.<br/><strong className="cta-strong">O produto é posicionamento.</strong></li>
                            <li>A ferramenta é mascote.<br/><strong className="cta-strong">O produto é relacionamento.</strong></li>
                        </ul>
                        <ul className="custom-list check-list">
                            <li>A ferramenta é assessoria.<br/><strong className="cta-strong">O produto é reputação.</strong></li>
                            <li>A ferramenta é conteúdo.<br/><strong className="cta-strong">O produto é presença.</strong></li>
                        </ul>
                    </div>

                    <a href="https://wa.me/5592984840065?text=Olá!%20Gostaria%20de%20saber%20como%20a%20Acesso%20Imagens%20pode%20ajudar%20o%20meu%20projeto." 
                       target="_blank" rel="noopener noreferrer" 
                       style={{ display: 'inline-block', backgroundColor: '#25D366', color: 'white', padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)', transition: '0.3s' }}>
                         Falar com a nossa equipe
                    </a>
                </div>

            </div>

            {/* --- ESTILOS CSS INJETADOS (Responsividade & Modo Escuro) --- */}
            <style>{`
                /* Estilos da Capa (Hero Section) */
                .services-hero-section {
                    width: 100%;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-image: url('/images/capa_site.jpg'); 
                }
                .services-hero-overlay {
                    background-color: rgba(0, 0, 0, 0.6);
                    min-height: 60vh; 
                    padding: 60px 20px 80px 20px; 
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .services-title {
                    color: white;
                    font-size: clamp(2rem, 6vw, 3.5rem); 
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
                    margin-top: -35px; 
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

                /* ======================================= */
                /* CORES BASE (MODO CLARO)                 */
                /* ======================================= */
                .section-main-title { color: ${corPrincipal}; }
                .section-main-desc { color: #666; }
                .section-sub-title { color: #333; }
                
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
                .service-desc { font-size: 0.95rem; color: #555; line-height: 1.6; margin-bottom: 15px; }
                .service-card ul { padding-left: 20px; color: #555; font-size: 0.95rem; line-height: 1.6; }
                
                .highlight-card { background-color: #fbf0fa; border: 2px solid ${corPrincipal}; }
                .highlight-card h3 { color: ${corPrincipal}; }

                /* Caixas de Destaque (Cases) */
                .case-box {
                    background-color: #fbf0fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid ${corPrincipal};
                    margin-top: 15px;
                    margin-bottom: 15px;
                }
                .case-title { color: ${corPrincipal}; }
                .case-text { color: #555; }

                /* Botões/Tags de Links das Redes Sociais */
                .link-tag {
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 12px;
                    background-color: #fdf5fc;
                    color: ${corPrincipal};
                    border-radius: 20px;
                    font-size: 0.8rem;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    border: 1px solid #e1bce0;
                }
                .link-tag:hover {
                    background-color: ${corPrincipal};
                    color: white;
                    border-color: ${corPrincipal};
                    transform: translateY(-2px);
                }

                /* 🚀 Estilos para o Carrossel Vertical de Previews 1:1 */
                .preview-wrapper {
                    display: flex;
                    flex-direction: column; 
                    gap: 15px;
                    padding: 10px 0 15px 0;
                    margin-top: 15px;
                }
                .preview-iframe {
                    width: 100%;
                    max-width: 320px; 
                    aspect-ratio: 3 / 5; 
                    height: auto; 
                    border-radius: 12px;
                    border: 1px solid #eee;
                    background-color: #fafafa;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    margin: 0 auto; 
                }
                
                /* Listas Customizadas & Equipe */
                .custom-list li { margin-bottom: 10px; }
                .check-list li { list-style: none; position: relative; padding-left: 25px; }
                .check-list li::before { content: '✓'; position: absolute; left: 0; color: ${corPrincipal}; }
                
                /* Estilos da Equipe no Modo Claro */
                .team-section {
                    background-color: #f8f9fa;
                    color: #333;
                    padding: 40px 20px;
                    border-radius: 16px;
                    margin: 40px 0;
                    text-align: center;
                    border: 1px solid #eee;
                }
                .team-title { font-size: clamp(1.5rem, 3vw, 2.2rem); margin-bottom: 15px; color: #333; }
                .team-desc { font-size: 1rem; color: #555; margin-bottom: 40px; line-height: 1.5; }
                .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
                
                .team-role { 
                    background: #fff; 
                    padding: 15px; 
                    border-radius: 8px; 
                    font-size: 0.95rem; 
                    color: #555; 
                    box-shadow: 0 4px 10px rgba(0,0,0,0.03); 
                    border: 1px solid #eee; 
                }
                .team-role-highlight { background-color: ${corPrincipal}; color: #fff; }

                /* CTA Section */
                .cta-section { background-color: #fcfcfc; border-color: #eee; }
                .cta-title { color: #333; }
                .cta-desc { color: #555; }
                .cta-strong { color: ${corPrincipal}; }
                .cta-list-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    max-width: 600px;
                    margin: 0 auto 40px auto;
                    text-align: left;
                }

                .fade-in { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* ======================================= */
                /* DARK MODE (MODO ESCURO)                 */
                /* ======================================= */
                @media (prefers-color-scheme: dark) {
                    .section-main-title { color: #f794f7; }
                    .section-main-desc { color: #ccc; }
                    .section-sub-title { color: #eee; }
                    
                    .services-tabs-container { background-color: #222; }
                    .services-tab { color: #aaa; }
                    .services-tab.active { background-color: #b832ce; color: #fff; }

                    .service-card {
                        background: #2a2a2a;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    }
                    .service-card h3 { color: #f794f7; }
                    .service-subtitle { color: #e1bce0; }
                    .service-desc, .service-card ul { color: #ccc; }

                    .highlight-card {
                        background-color: rgba(247, 148, 247, 0.05);
                        border-color: #f794f7;
                    }
                    .highlight-card h3 { color: #f794f7; }
                    
                    /* Correção das Caixas e Tags para o Modo Escuro */
                    .case-box {
                        background-color: rgba(255, 255, 255, 0.05);
                        border-left-color: #f794f7;
                    }
                    .case-title { color: #f794f7; }
                    .case-text { color: #aaa; }

                    .link-tag {
                        background-color: rgba(247, 148, 247, 0.1);
                        color: #f794f7;
                        border-color: rgba(247, 148, 247, 0.3);
                    }
                    .link-tag:hover {
                        background-color: #f794f7;
                        color: #111;
                    }

                    /* 🚀 Ajustes das Previews no Dark Mode */
                    .preview-iframe {
                        border-color: #444;
                        background-color: #222;
                    }

                    .check-list li::before { color: #f794f7; }

                    /* Estilos da Equipe no Modo Escuro */
                    .team-section { background-color: #111; border-color: #222; }
                    .team-title { color: #fff; }
                    .team-desc { color: #aaa; }
                    .team-role { background: rgba(255,255,255,0.05); color: #ddd; border-color: transparent; box-shadow: none; }
                    .team-role-highlight { background-color: #b832ce; color: #fff; }

                    .cta-section { background-color: #222; border-color: #444; }
                    .cta-title { color: #eee; }
                    .cta-desc { color: #ccc; }
                    .cta-strong { color: #f794f7; }
                }

                /* REGRAS ESPECÍFICAS PARA TELEMÓVEL */
                @media (max-width: 768px) {
                    .services-hero-section {
                        background-image: url('/images/capa_site_mobile.png'); 
                    }
                    .services-tabs-container {
                        border-radius: 40px;
                    }
                    .services-tab {
                        flex-direction: column;
                        padding: 12px 5px;
                        gap: 4px;
                        text-align: center;
                    }
                    .tab-icon {
                        font-size: 1.2rem;
                    }
                    .cta-list-container {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }
                }
            `}</style>

        </div>
    );
}

export default ServicesPage;