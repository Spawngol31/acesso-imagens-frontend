import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// --- FUNÇÃO AUXILIAR PARA CENSURAR VALORES ---
const renderValor = (valor, mostrar) => {
    if (!mostrar) return 'R\$ •••••';
    return `R$ ${parseFloat(valor).toFixed(2)}`;
};

// --- COMPONENTE: RANKING DO FOTÓGRAFO ---
// Recebe a propriedade 'mostrarValores' do pai
const RankingAlbunsFotografo = ({ mostrarValores }) => {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/ranking-albuns/');
                setRanking(response.data);
            } catch (error) {
                console.error("Erro ao buscar ranking:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, []);

    if (loading || ranking.length === 0) return null;

    return (
        <div className="finance-ranking-box">
            <h3 className="finance-ranking-title">Top 5 álbuns mais vendidos</h3>
            <div className="finance-table-responsive">
                <table className="finance-table">
                    <thead>
                        <tr>
                            <th className="th-left-radius">POSIÇÃO</th>
                            <th>ÁLBUM</th>
                            <th>FOTOS VENDIDAS</th>
                            <th className="th-right-radius">TOTAL ARRECADADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((album, index) => {
                            const medalha = `${index + 1}º`;
                            return (
                                <tr key={album.album_id}>
                                    <td className="ranking-medal-col">{medalha}</td>
                                    <td className="ranking-title-col">{album.album_titulo}</td>
                                    <td className="ranking-qtd-col">{album.qtd_vendida} mídias</td>
                                    <td className="ranking-price-col">{renderValor(album.total_arrecadado, mostrarValores)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

function DashboardVendasPage() {
    const [activeTab, setActiveTab] = useState('vendas'); 
    const [loading, setLoading] = useState(true);
    const [larguraJanela, setLarguraJanela] = useState(window.innerWidth);
    const isMobile = larguraJanela < 900;

    // 👇 NOVO ESTADO: Controla a privacidade dos valores 👇
    const [mostrarValores, setMostrarValores] = useState(true);

    const [dados, setDados] = useState([]);
    const [vendaSelecionada, setVendaSelecionada] = useState(null); 
    const [resumo, setResumo] = useState({ saldo_pendente: 0, total_ja_recebido: 0 });
    const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '', status_repasse: '' });
    const [historicoRecibos, setHistoricoRecibos] = useState([]);

    const [currentPageVendas, setCurrentPageVendas] = useState(1);
    const [currentPageHistorico, setCurrentPageHistorico] = useState(1);
    const itemsPerPageVendas = 30; 
    const itemsPerPageHistorico = 20; 

    useEffect(() => {
        const handleResize = () => setLarguraJanela(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (activeTab === 'vendas') {
            buscarVendas();
        } else {
            buscarHistorico();
        }
    }, [activeTab]);

    const buscarVendas = async () => {
        setLoading(true);
        setCurrentPageVendas(1); 
        try {
            const params = new URLSearchParams();
            if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
            if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
            if (filtros.status_repasse) params.append('status_repasse', filtros.status_repasse);

            const response = await axiosInstance.get(`/dashboard/minhas-vendas-json/?${params.toString()}`);
            setDados(response.data.resultados);
            setResumo(response.data.resumo);
        } catch (error) {
            console.error("Erro ao buscar vendas:", error);
            toast.error("Erro ao carregar o seu extrato de vendas.");
        } finally {
            setLoading(false);
        }
    };

    const buscarHistorico = async () => {
        setLoading(true);
        setCurrentPageHistorico(1); 
        try {
            const response = await axiosInstance.get('/dashboard/meus-recibos/');
            setHistoricoRecibos(response.data);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            toast.error("Erro ao carregar os seus recibos.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

    const imprimirRecibo = (recibo) => {
        const janela = window.open('', '', 'width=800,height=600');
        janela.document.write(`
            <html>
            <head>
                <title>Meu Recibo - #${recibo.id}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { border-bottom: 3px solid #6c0464; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .title { color: #6c0464; margin: 0; font-size: 28px; }
                    .info-box { background: #f8f9fa; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                    .value-box { background: #d4edda; color: #155724; padding: 20px; text-align: center; border-radius: 8px; border: 1px solid #c3e6cb; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="title">Comprovativo de Repasse</h1>
                        <p style="margin: 5px 0 0 0; color: #666;">Acesso Imagens - Plataforma de Fotografia</p>
                    </div>
                    <div style="text-align: right; color: #888;">
                        <p style="margin: 0;">Recibo Nº: <strong>#${recibo.id.toString().padStart(5, '0')}</strong></p>
                        <p style="margin: 0;">Emitido em: ${recibo.data_pagamento}</p>
                    </div>
                </div>
                <div class="info-box">
                    <p><strong>Período de Referência das Vendas:</strong> De ${recibo.referencia_inicio} a ${recibo.referencia_fim}</p>
                    <p><strong>Status:</strong> Valor creditado em sua conta bancária / Pix</p>
                </div>
                <div class="value-box">
                    <h2 style="margin: 0; font-size: 24px;">VALOR LÍQUIDO RECEBIDO</h2>
                    <h1 style="margin: 10px 0 0 0; font-size: 42px;">R$ ${recibo.valor_pago.toFixed(2)}</h1>
                </div>
                <p style="margin-top: 40px; text-align: justify;">
                    Este documento atesta o recebimento integral das comissões referentes às vendas de mídias 
                    na plataforma Acesso Imagens durante o período especificado acima.
                </p>
                <div class="footer">Acesso Imagens - ${new Date().getFullYear()}</div>
            </body>
            </html>
        `);
        janela.document.close();
        setTimeout(() => janela.print(), 250);
    };

    const indexOfLastVenda = currentPageVendas * itemsPerPageVendas;
    const indexOfFirstVenda = indexOfLastVenda - itemsPerPageVendas;
    const currentVendas = dados.slice(indexOfFirstVenda, indexOfLastVenda);
    const totalPagesVendas = Math.ceil(dados.length / itemsPerPageVendas);

    const indexOfLastHistorico = currentPageHistorico * itemsPerPageHistorico;
    const indexOfFirstHistorico = indexOfLastHistorico - itemsPerPageHistorico;
    const currentHistorico = historicoRecibos.slice(indexOfFirstHistorico, indexOfLastHistorico);
    const totalPagesHistorico = Math.ceil(historicoRecibos.length / itemsPerPageHistorico);

    const renderPagination = (currentPage, totalPages, setCurrentPage) => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                pageNumbers.push(i);
            } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
                pageNumbers.push('...');
            }
        }

        return (
            <div className="pagination-container">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-nav-btn"
                    style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                    &#60;
                </button>

                {pageNumbers.map((number, index) => (
                    number === '...' ? (
                        <span key={index} className="pagination-ellipsis">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(number)}
                            className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                            style={{ cursor: 'pointer', transition: 'all 0.2s', fontWeight: currentPage === number ? 'bold' : 'normal' }}
                        >
                            {number}
                        </button>
                    )
                ))}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-nav-btn"
                    style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                    &#62;
                </button>
            </div>
        );
    };

    return (
        <div className="dashboard-page-content finance-page-wrapper">
            
            <div className="dash-header-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="dash-main-title">Meu financeiro</h2>
                
                {/* BOTÃO MÁGICO DE PRIVACIDADE COM SVG */}
                <button 
                    onClick={() => setMostrarValores(!mostrarValores)}
                    className="create-button"
                    style={{
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    title={mostrarValores ? "Ocultar valores" : "Mostrar valores"}
                >
                    {mostrarValores ? (
                        <>
                            {/* Ícone de Olho Aberto (Ocultar) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            Ocultar valores
                        </>
                    ) : (
                        <>
                            {/* Ícone de Olho Fechado/Riscado (Mostrar) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                            Mostrar valores
                        </>
                    )}
                </button>
            </div>

            <div className="finance-tabs-container">
                <button className={`finance-tab ${activeTab === 'vendas' ? 'active' : ''}`} onClick={() => setActiveTab('vendas')}>
                    Minhas vendas
                </button>
                <button className={`finance-tab ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')}>
                    Meus recebimentos
                </button>
            </div>

            {activeTab === 'vendas' && (
                <>
                    <div className="finance-balance-box">
                        <div>
                            <p className="balance-label">Saldo pendente (A Receber)</p>
                            {/* Uso da função renderValor */}
                            <h2 className="balance-value">{renderValor(resumo.saldo_pendente, mostrarValores)}</h2>
                        </div>
                        <Link to="/dashboard/saques" className="create-button">
                            Solicitar saque
                        </Link>
                    </div>

                    {/* Passamos o estado para o componente filho */}
                    <RankingAlbunsFotografo mostrarValores={mostrarValores} />

                    <div className={`finance-split-layout ${isMobile ? 'mobile-layout' : ''}`}>
                        
                        <div className="finance-main-content">
                            <h3 className="finance-section-title">Lista de vendas confirmadas</h3>

                            {loading ? <p className="finance-loading-text">A carregar vendas...</p> : (
                                <div className="finance-table-responsive no-border-shadow">
                                    <table className="finance-table min-width-600">
                                        <thead>
                                            <tr>
                                                <th className="th-left-radius">FOTO ID</th>
                                                <th>CLIENTE</th> 
                                                <th>DATA DA VENDA</th>
                                                <th>STATUS DO REPASSE</th>
                                                <th className="th-right-radius">MINHA COMISSÃO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentVendas.map((venda, index) => (
                                                <tr key={index}>
                                                    <td className="col-photo-id">
                                                        <button 
                                                            onClick={() => setVendaSelecionada(venda)}
                                                            className="photo-id-btn"
                                                            title="Ver detalhes da foto"
                                                        >
                                                            #{venda.foto_id}
                                                        </button>
                                                    </td>
                                                    <td className="col-client">{venda.cliente}</td>
                                                    <td className="col-date">{venda.data}</td>
                                                    <td className="col-status">
                                                        {venda.pago_ao_fotografo 
                                                            ? <span className="status-badge-paid">✓ Já Recebido</span> 
                                                            : <span className="status-badge-pending">⏳ A Receber</span>}
                                                    </td>
                                                    <td className="col-comission">{renderValor(venda.comissao, mostrarValores)}</td>
                                                </tr>
                                            ))}
                                            {dados.length === 0 && <tr><td colSpan="5" className="finance-empty-row">Nenhuma venda encontrada com estes filtros.</td></tr>}
                                        </tbody>
                                    </table>

                                    {renderPagination(currentPageVendas, totalPagesVendas, setCurrentPageVendas)}
                                </div>
                            )}
                        </div>

                        <div className="finance-sidebar">
                            <h3 className="sidebar-filter-title">FILTROS</h3>
                            <div className="sidebar-filter-form">
                                <label className="filter-label">Data inicial</label>
                                <input type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleChange} className="filter-input" />
                                
                                <label className="filter-label">Data final</label>
                                <input type="date" name="data_fim" value={filtros.data_fim} onChange={handleChange} className="filter-input" />
                                
                                <label className="filter-label">Status do repasse</label>
                                <select name="status_repasse" value={filtros.status_repasse} onChange={handleChange} className="filter-input">
                                    <option value="">Todos</option>
                                    <option value="PENDENTE">A Receber (Pendentes)</option>
                                    <option value="PAGO">Já Recebidos (Pagos)</option>
                                </select>
                                
                                <div className="filter-actions">
                                    <button onClick={buscarVendas} className='create-button filter-btn'>Filtrar</button>
                                    <button onClick={() => { setFiltros({data_inicio:'', data_fim:'', status_repasse:''}); setTimeout(buscarVendas, 100); }} className='create-button filter-btn filter-btn-clear'>Limpar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'historico' && (
                <div className="finance-main-content">
                    <h3 className="finance-section-title">Meus recibos da plataforma</h3>
                    
                    {loading ? <p className="finance-loading-text">A carregar recibos...</p> : (
                        <div className="finance-table-responsive no-border-shadow">
                            <table className="finance-table min-width-600">
                                <thead>
                                    <tr>
                                        <th className="th-left-radius">Nº DO RECIBO</th>
                                        <th>DATA DO PGTO</th>
                                        <th>PERÍODO APURADO</th>
                                        <th>VALOR RECEBIDO</th>
                                        <th className="th-right-radius text-center">AÇÃO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentHistorico.map((recibo) => (
                                        <tr key={recibo.id}>
                                            <td className="col-receipt-id">#{recibo.id.toString().padStart(5, '0')}</td>
                                            <td className="col-receipt-date">{recibo.data_pagamento}</td>
                                            <td className="col-receipt-period">
                                                {recibo.referencia_inicio} até {recibo.referencia_fim}
                                            </td>
                                            <td className="col-comission">{renderValor(recibo.valor_pago, mostrarValores)}</td>
                                            <td className="col-receipt-action">
                                                <button onClick={() => imprimirRecibo(recibo)} className="print-receipt-btn">
                                                    Ver / Imprimir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {historicoRecibos.length === 0 && <tr><td colSpan="5" className="finance-empty-row">Você ainda não possui recebimentos registados na plataforma.</td></tr>}
                                </tbody>
                            </table>

                            {renderPagination(currentPageHistorico, totalPagesHistorico, setCurrentPageHistorico)}
                        </div>
                    )}
                </div>
            )}

            {vendaSelecionada && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content sale-detail-modal">
                        
                        <h3 className="sale-detail-title">
                            Detalhes da Venda
                        </h3>
                        
                        {vendaSelecionada.foto_url ? (
                            <img 
                                src={vendaSelecionada.foto_url} 
                                alt={`Foto ${vendaSelecionada.foto_id}`} 
                                className="sale-detail-image" 
                            />
                        ) : (
                            <div className="sale-detail-no-image">
                                <p>Opa! Imagem temporariamente indisponível no servidor.</p>
                            </div>
                        )}

                        <div className="sale-detail-info">
                            <p><strong>📸 ID da Foto:</strong> #{vendaSelecionada.foto_id}</p>
                            <p><strong>📁 Álbum:</strong> {vendaSelecionada.album_nome}</p>
                            <p><strong>👤 Cliente:</strong> {vendaSelecionada.cliente}</p>
                            <p><strong>📅 Data da Venda:</strong> {vendaSelecionada.data}</p>
                            
                            <div className="sale-comission-highlight">
                                {/* Ocultamos também a comissão no pop-up! */}
                                <p>Sua Comissão: {renderValor(vendaSelecionada.comissao, mostrarValores)}</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setVendaSelecionada(null)} 
                            className="create-button sale-detail-close-btn" 
                        >
                            Fechar Imagem
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardVendasPage;