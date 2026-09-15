// src/pages/ServicesPage.jsx

import React, { useState, useEffect } from 'react';

function ServicesPage() {
    const [activeTab, setActiveTab] = useState('atletas'); // 'atletas' ou 'clubes'
    
    // 🚀 DETETA O MODO ESCURO DO SISTEMA PARA OS IFRAMES DO IG/YOUTUBE
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }); 

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    useEffect(() => {
        const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => setIsDarkMode(e.matches);
        matchMedia.addEventListener('change', handler);
        return () => matchMedia.removeEventListener('change', handler);
    }, []);

    const scrollToContent = () => {
        const contentArea = document.getElementById("main-services-content");
        if (contentArea) {
            contentArea.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 🚀 GERA OS IFRAMES
    const renderIframe = (url, title) => {
        let finalUrl = url;
        
        if (url.includes('instagram.com')) {
            const baseUrl = url.split('/embed')[0];
            finalUrl = isDarkMode ? `${baseUrl}/embed/?theme=dark` : `${baseUrl}/embed/`;
        } else if (url.includes('youtube.com')) {
            const separator = url.includes('?') ? '&' : '?';
            finalUrl = isDarkMode ? `${url}${separator}theme=dark` : url;
        }

        return (
            <iframe 
                key={`${finalUrl}-${isDarkMode ? 'dark' : 'light'}`}
                className="preview-iframe" 
                src={finalUrl} 
                title={title} 
                frameBorder="0" 
                scrolling="no" 
                allowtransparency="true" 
                allow="encrypted-media; accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        );
    };

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
                    
                    {/* Botão de Rolagem */}
                    <button onClick={scrollToContent} className="scroll-down-btn" title="Descer para ver serviços">
                        ↓
                    </button>
                </div>
            </section>

            {/* --- 2. NAVEGAÇÃO DE ABAS (ATLETAS vs CLUBES) --- */}
            <div id="main-services-content" className="services-tabs-wrapper">
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

            <div className="container services-container">

                {/* ========================================================= */}
                {/*                       ABA: ATLETAS                        */}
                {/* ========================================================= */}
                {activeTab === 'atletas' && (
                    <div className="tab-content fade-in">

                        <div className="services-section-header">
                            <h2 className="section-main-title">Construção e Gestão de Imagem Profissional</h2>
                            <p className="section-main-desc">
                                A sua carreira dentro e fora das quatro linhas. Trabalhamos para transformar o atleta em uma <strong>marca profissional</strong>, cuidando da imagem, comunicação, conteúdo e relacionamento ao longo da carreira.
                            </p>
                        </div>

                        {/* GRID DE FERRAMENTAS ATLETAS */}
                        <div className="services-grid">

                            {/* 1. Fotografia Esportiva */}
                            <div className="service-card">
                                <h3> Fotografia Esportiva</h3>
                                <p className="service-desc">Construímos um banco de imagens profissional para valorizar a carreira e a identidade do atleta. Realizamos coberturas de jogos, Media Day e registros institucionais, além de conteúdos pensados para redes sociais e materiais profissionais.</p>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.instagram.com/p/DbzIu47jc4i/embed", "Foto 1")}
                                    {renderIframe("https://www.instagram.com/p/DYltK0bDS5v/embed", "Foto 2")}
                                    {renderIframe("https://www.instagram.com/p/DZiWiFjEVhi/embed", "Foto 3")}
                                    {renderIframe("https://www.instagram.com/p/DbuVaattMrR/embed", "Foto 4")}
                                    {renderIframe("https://www.instagram.com/p/Dbs2dqwlnPH/embed", "Foto 5")}
                                    {renderIframe("https://www.instagram.com/p/DbswL9bHN1q/embed", "Foto 6")}
                                </div>
                            </div>

                            {/* 2. Produção de Conteúdo */}
                            <div className="service-card">
                                <h3> Produção de Conteúdo</h3>
                                <p className="service-desc">Contamos a história do atleta dentro e fora de campo. Produzimos vídeos, Reels, entrevistas, bastidores, conteúdos de rotina e materiais para redes sociais, criando uma comunicação mais próxima, autêntica e alinhada aos objetivos da carreira.</p>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.instagram.com/reel/C9f6isqxT2T/embed", "Gabi")}
                                    {renderIframe("https://www.instagram.com/p/DDfxB7lRqhE/embed", "Luan")}
                                    {renderIframe("https://www.instagram.com/p/DHTaxvhREfO/embed", "Jonathan")}
                                    {renderIframe("https://www.instagram.com/p/DW640dgCR4n/embed", "Júlio")}
                                    {renderIframe("https://www.instagram.com/p/DTYtbBNkcJU/embed", "Vitinho")}
                                    {renderIframe("https://www.youtube.com/embed/nnnqypolvEU", "Bastidores Fast")}
                                </div>
                            </div>

                            {/* 3. Assessoria de Imprensa */}
                            <div className="service-card">
                                <h3> Assessoria de Imprensa</h3>
                                <p className="service-desc">Transformamos conquistas, momentos e histórias da carreira em oportunidades de visibilidade. Produzimos releases, pautas e conteúdos jornalísticos, além de trabalhar o relacionamento com jornalistas e veículos de comunicação.</p>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.instagram.com/p/DY5PcgmFWPw/embed", "Organização na CBF")}
                                    {renderIframe("https://www.instagram.com/reel/DPt6XjgEZm2/embed", "Mídia Luan")}
                                    {renderIframe("https://www.instagram.com/p/DbevmGZNFIG/embed", "Mídia Júlio Cesar")}
                                    {renderIframe("https://www.instagram.com/p/DbLmxzrRm9I/embed", "Mídia Kelvin")}
                                    {renderIframe("https://www.instagram.com/p/DccC8TTnR79/embed", "Mídia EC Passo Fundo")}
                                    {renderIframe("https://www.instagram.com/reel/DcHo5cYt85r/embed", "Mídia Léo Salgado")}
                                </div>
                            </div>

                            {/* 4. Relacionamento & Mercado */}
                            <div className="service-card highlight-card">
                                <h3> Relacionamento & Mercado</h3>
                                <p className="service-desc">Criamos conexões que podem gerar novas oportunidades para a carreira. Trabalhamos a aproximação com marcas, patrocinadores, profissionais do futebol e comunidades, ampliando a presença do atleta no mercado esportivo.</p>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.instagram.com/p/DVyePZWDZx_/embed", "SJ x Acesso Imagens")}
                                    {renderIframe("https://www.instagram.com/reel/DWO69N5ji0q/embed", "Léo Salgado")}
                                    {renderIframe("https://www.instagram.com/p/DUWFcpNEf3o/embed", "Jon x N1")}
                                    {renderIframe("https://www.instagram.com/reel/DW4AWvZDeti/embed", "Fatmap")}
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

                        <div className="services-section-header">
                            <h2 className="section-main-title">Do campo à comunidade</h2>
                            <p className="section-main-desc">
                                Construímos a comunicação, a imagem e a presença do seu clube <strong>dentro e fora do estádio</strong>. Transformamos a sua marca numa potência de engajamento e negócios.
                            </p>
                        </div>

                        {/* GRID DE SERVIÇOS CLUBES */}
                        <h3 className="section-sub-title">Nossas Soluções para Clubes</h3>
                        
                        <div className="services-grid">

                            {/* 1. Ativação de Marca */}
                            <div className="service-card">
                                <h3> Ativação de Marca</h3>
                                <p className="service-desc">Transformamos o clube em uma marca presente também fora das quatro linhas, criando experiências que aproximam torcedores, comunidade e parceiros. Desenvolvemos ações em escolas, experiências em dias de jogo e ativações com mascotes, fortalecendo o vínculo entre clube e público.</p>

                                <div className="case-box">
                                    <h4 className="case-title">🐻 Mascote Mateusz</h4>
                                    <p className="case-text">Criado em parceria com a Secretaria de Educação de São Mateus. Baseado no Urso, com forte influência da cultura polonesa enraizada no município, acompanhado de seu Erva-Mate, simbolizando união, comunicação e educação.</p>
                                </div>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.youtube.com/embed/ExmCINyAic0", "Vídeo do Mateusz")}
                                    {renderIframe("https://www.instagram.com/p/DPMEJBkjjBd/embed", "Foto do Mateusz")}
                                </div>
                            </div>

                            {/* 2. Identidade & Media Day */}
                            <div className="service-card">
                                <h3> Identidade & Media Day</h3>
                                <p className="service-desc">Construímos a identidade visual e a comunicação do clube de forma profissional e padronizada. Planejamos e produzimos Media Days, materiais institucionais e conteúdos que valorizam atletas e comissão técnica.</p>

                                <div className="case-box">
                                    <h4 className="case-title">Presskit Passo Fundo</h4>
                                    <p className="case-text" style={{ marginBottom: '10px' }}>Uma construção completa da identidade do clube preparada exclusivamente para a imprensa.</p>

                                    <a href="/PRESSKIT  ECPF X SANTACRUZ-RS.pdf" target="_blank" rel="noopener noreferrer" className="link-tag">
                                        📄 Acessar Presskit Completo
                                    </a>
                                </div>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.instagram.com/reel/DcPkc5pyiax/embed", "Material de Coletiva")}
                                    {renderIframe("https://www.instagram.com/reel/DcKC2XIpjJC/embed", "Boletim Semanal")}
                                </div>
                            </div>

                            {/* 3. Marketing Esportivo */}
                            <div className="service-card">
                                <h3> Marketing Esportivo</h3>
                                <p className="service-desc">Desenvolvemos estratégias comerciais que ajudam o clube a transformar sua audiência em oportunidades de negócio. Criamos campanhas de ingresso e sócio, produtos, ações comerciais e projetos que fortalecem o relacionamento e a rentabilidade do clube.</p>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.instagram.com/p/DbQfkgtFTKi/embed", "Venda na Procissão")}
                                    {renderIframe("https://www.instagram.com/p/DcOkg3fFV1P/embed", "Serviços de Jogo")}
                                </div>
                            </div>

                            {/* 4. Gestão de Redes Sociais */}
                            <div className="service-card">
                                <h3> Gestão de Redes Sociais</h3>
                                <p className="service-desc">Gerimos a redes sociais do clube, desde o Instagram ao YouTube, com planejamento de postagens sobre o calendário do time na temporada atual, vídeos de atualizações do dia a dia no clube.</p>

                                <ul className="custom-list check-list">
                                    <li>Clube, Período e Métricas</li>
                                    <li>Relacionamento direto com a torcida</li>
                                </ul>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.instagram.com/p/DaiUbGbFV3E/embed", "Calendário de Jogos")}
                                    {renderIframe("https://www.instagram.com/p/DbohmSgiYGr/embed", "Passo Pela Estrada")}
                                    {renderIframe("https://www.instagram.com/p/DVHCeiRD3kg/embed", "Contagem Prudentópolis")}
                                    {renderIframe("https://www.instagram.com/p/DbZJ1cWCebz/embed", "Contagem Passo Fundo")}
                                </div>
                            </div>

                            {/* 5. Patrocinadores */}
                            <div className="service-card">
                                <h3> Patrocinadores</h3>
                                <p className="service-desc">Criamos oportunidades para valorizar os patrocinadores e ampliar sua exposição junto à torcida. Desenvolvemos conteúdos exclusivos, ativações em campo, campanhas personalizadas e estratégias digitais que conectam marcas ao universo do futebol.</p>

                                <div className="preview-wrapper">
                                    {renderIframe("https://www.youtube.com/embed/VVIO3X9asTU", "Ativação Mateusz")}
                                    {renderIframe("https://www.instagram.com/p/DVHCeiRD3kg/embed", "Contagem com Marcas")}
                                    {renderIframe("https://www.instagram.com/reel/Dbbt0r7JMA6/embed", "Parceiros no Rodapé")}
                                    {renderIframe("https://www.instagram.com/p/DcZDmCoFXHb/embed", "Destaque Patrocinador")}
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

                <div className="cta-section">
                    <h3 className="cta-title">Não fazemos tudo igual para todos.</h3>
                    <p className="cta-desc">
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
                        className="whatsapp-service-btn">
                         Falar com a nossa equipe
                    </a>
                </div>

            </div>
        </div>
    );
}

export default ServicesPage;