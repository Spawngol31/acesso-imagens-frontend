// src/pages/admin/AdminFinanceiroPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function AdminFinanceiroPage() {
    const [activeTab, setActiveTab] = useState('pendentes'); 
    const [loading, setLoading] = useState(false);
    const [larguraJanela, setLarguraJanela] = useState(window.innerWidth);
    const isMobile = larguraJanela < 900;

    const [dados, setDados] = useState([]);
    const [resumo, setResumo] = useState({ total_vendas: 0, total_pagar: 0 });
    const [listaFotografos, setListaFotografos] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '', status: '', search: '', fotografo_id: '' });
    const [vendasBuscadas, setVendasBuscadas] = useState(false);

    const [periodoPagamento, setPeriodoPagamento] = useState({ inicio: '', fim: '' });

    const [historicoRecibos, setHistoricoRecibos] = useState([]);
    const [filtrosHistorico, setFiltrosHistorico] = useState({ data_inicio: '', data_fim: '', fotografo_id: '' });
    const [historicoBuscado, setHistoricoBuscado] = useState(false); 

    const [currentPagePendentes, setCurrentPagePendentes] = useState(1);
    const [currentPageHistorico, setCurrentPageHistorico] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const handleResize = () => setLarguraJanela(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (activeTab === 'pendentes') {
            buscarDadosVendas();
        } 
    }, [activeTab]);

    const buscarDadosVendas = async (foiClicado = false) => {
        setLoading(true);
        if (foiClicado === true) {
            setVendasBuscadas(true);
            setCurrentPagePendentes(1);
        }
        
        try {
            const params = new URLSearchParams();
            if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
            if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
            if (filtros.status) params.append('status', filtros.status);
            if (filtros.search) params.append('search', filtros.search);
            if (filtros.fotografo_id) params.append('fotografo_id', filtros.fotografo_id);

            if (!foiClicado) {
                params.append('apenas_fotografos', 'true');
            }

            const response = await axiosInstance.get(`/admin/vendas-json/?${params.toString()}`);
            setDados(response.data.resultados || []);
            setResumo(response.data.resumo || { total_vendas: 0, total_pagar: 0 });
            setListaFotografos(response.data.fotografos || []);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            toast.error("Erro ao carregar os dados financeiros.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });
    const handleChangeHistorico = (e) => setFiltrosHistorico({ ...filtrosHistorico, [e.target.name]: e.target.value });

    const baixarPlanilha = async () => {
        try {
            toast.info("A gerar planilha, aguarde...");
            const params = new URLSearchParams(filtros).toString();
            const response = await axiosInstance.get(`/admin/exportar-pagamentos/?${params}`, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const nomeArquivo = filtros.data_inicio && filtros.data_fim 
                ? `pagamentos_${filtros.data_inicio}_ate_${filtros.data_fim}.csv` 
                : `pagamentos_geral.csv`;
                
            link.setAttribute('download', nomeArquivo);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erro ao baixar planilha:", error);
            toast.error("Erro ao transferir a planilha. Verifique a sua conexão.");
        }
    };

    const handlePagarFotografoClick = () => {
        if (!filtros.fotografo_id) return;

        const vendasPendentes = dados.filter(v => !v.pago_ao_fotografo && v.status === 'PAGO');
        
        let dataInicioCalc = filtros.data_inicio;
        let dataFimCalc = filtros.data_fim || new Date().toISOString().split('T')[0];

        if (vendasPendentes.length > 0 && !filtros.data_inicio) {
            const datasEmMs = vendasPendentes.map(v => {
                const [datePart] = v.data.split(' '); 
                const [dia, mes, ano] = datePart.split('/');
                return new Date(`${ano}-${mes}-${dia}T12:00:00`).getTime();
            });
            const dataMaisAntiga = new Date(Math.min(...datasEmMs));
            dataInicioCalc = dataMaisAntiga.toISOString().split('T')[0];
        }

        setPeriodoPagamento({ inicio: dataInicioCalc, fim: dataFimCalc });
        setIsPaymentModalOpen(true);
    };

    const confirmarPagamento = async () => {
        try {
            const payload = {
                fotografo_id: filtros.fotografo_id,
                data_inicio: periodoPagamento.inicio, 
                data_fim: periodoPagamento.fim,
                valor_pago: resumo.total_pagar
            };
            await axiosInstance.post('/admin/registrar-pagamento-fotografo/', payload);
            toast.success("Pagamento registrado com sucesso! O saldo foi zerado.");
            buscarDadosVendas(); 
            setActiveTab('historico');
            buscarHistorico();
        } catch (error) {
            console.error("Erro ao registrar pagamento:", error);
            toast.error("Erro ao tentar registrar o pagamento.");
        } finally {
            setIsPaymentModalOpen(false); 
        }
    };

    const buscarHistorico = async () => {
        setLoading(true);
        setHistoricoBuscado(true);
        setCurrentPageHistorico(1); 
        try {
            const params = new URLSearchParams();
            if (filtrosHistorico.data_inicio) params.append('data_inicio', filtrosHistorico.data_inicio);
            if (filtrosHistorico.data_fim) params.append('data_fim', filtrosHistorico.data_fim);
            if (filtrosHistorico.fotografo_id) params.append('fotografo_id', filtrosHistorico.fotografo_id);

            const response = await axiosInstance.get(`/admin/historico-pagamentos/?${params.toString()}`);
            setHistoricoRecibos(response.data);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            toast.error("Erro ao carregar o histórico de recibos.");
        } finally {
            setLoading(false);
        }
    };

    const imprimirRecibo = (recibo) => {
        const janela = window.open('', '', 'width=800,height=600');
        janela.document.write(`
            <html>
            <head>
                <title>Recibo de Pagamento - ${recibo.fotografo}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { border-bottom: 3px solid #6c0464; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .title { color: #6c0464; margin: 0; font-size: 28px; }
                    .info-box { background: #f8f9fa; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                    .value-box { background: #d4edda; color: #6c0464; padding: 20px; text-align: center; border-radius: 8px; border: 1px solid #eee; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="title">Recibo de Repasse</h1>
                        <p style="margin: 5px 0 0 0; color: #666;">Acesso Imagens - Comunicação & Fotografia esportiva</p>
                    </div>
                    <div style="text-align: right; color: #888;">
                        <p style="margin: 0;">Recibo Nº: <strong>#${recibo.id.toString().padStart(5, '0')}</strong></p>
                        <p style="margin: 0;">Emitido em: ${recibo.data_pagamento}</p>
                    </div>
                </div>
                <div class="info-box">
                    <p><strong>Beneficiário:</strong> ${recibo.fotografo}</p>
                    <p><strong>Período de Referência das Vendas:</strong> De ${recibo.referencia_inicio} a ${recibo.referencia_fim}</p>
                    <p><strong>Status:</strong> Pagamento Efetivado</p>
                </div>
                <div class="value-box">
                    <h2 style="margin: 0; font-size: 24px;">VALOR TOTAL REPASSADO</h2>
                    <h1 style="margin: 10px 0 0 0; font-size: 42px;">R$ ${recibo.valor_pago.toFixed(2)}</h1>
                </div>
                <p style="margin-top: 40px; text-align: justify;">
                    Declaramos para os devidos fins que o valor acima especificado foi repassado integralmente 
                    ao beneficiário referente às comissões de vendas de fotografias e vídeos realizadas através 
                    da plataforma Acesso Imagens no período indicado.
                </p>
                <div class="footer">
                    Este é um documento gerado automaticamente por nosso sistema.<br/>
                    Acesso Imagens - ${new Date().getFullYear()}
                </div>
            </body>
            </html>
        `);
        janela.document.close();
        setTimeout(() => { janela.print(); }, 250);
    };

    const indexOfLastPendente = currentPagePendentes * itemsPerPage;
    const indexOfFirstPendente = indexOfLastPendente - itemsPerPage;
    const currentPendentes = dados.slice(indexOfFirstPendente, indexOfLastPendente);
    const totalPagesPendentes = Math.ceil(dados.length / itemsPerPage);

    const indexOfLastHistorico = currentPageHistorico * itemsPerPage;
    const indexOfFirstHistorico = indexOfLastHistorico - itemsPerPage;
    const currentHistorico = historicoRecibos.slice(indexOfFirstHistorico, indexOfLastHistorico);
    const totalPagesHistorico = Math.ceil(historicoRecibos.length / itemsPerPage);

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
            
            <div className="finance-tabs-container">
                <button className={`finance-tab ${activeTab === 'pendentes' ? 'active' : ''}`} onClick={() => setActiveTab('pendentes')}>
                    Caixa Pendente (Vendas)
                </button>
                <button className={`finance-tab ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')}>
                    Histórico de Recibos
                </button>
            </div>

            {activeTab === 'pendentes' && (
                <>
                    <div className="finance-balance-box finance-admin-resume">
                        <div className="admin-resume-text">
                            <span>RESUMO: Vendas Pagas (R$ {parseFloat(resumo.total_vendas).toFixed(2)}) | LÍQUIDO A REPASSAR: R$ {parseFloat(resumo.total_pagar).toFixed(2)}</span>
                        </div>
                        {filtros.fotografo_id && resumo.total_pagar > 0 && (
                            <button onClick={handlePagarFotografoClick} className="btn-pay-photographer">
                                Registrar Pagamento (Zerar Saldo)
                            </button>
                        )}
                    </div>

                    <div className={`finance-split-layout ${isMobile ? 'mobile-layout' : ''}`}>
                        <div className="finance-main-content">
                            <div className="finance-search-row">
                                <div className="finance-search-inputs">
                                    <input 
                                        type="text" 
                                        name="search" 
                                        placeholder="Pesquisar ID do pedido..." 
                                        value={filtros.search} 
                                        onChange={handleChange} 
                                        className="filter-input search-input" 
                                    />
                                    <button onClick={() => buscarDadosVendas(true)} className='create-button'>Pesquisar</button>
                                </div>
                                {!isMobile && <button onClick={baixarPlanilha} className='create-button'>Baixar Planilha (Excel)</button>}
                            </div>

                            {!vendasBuscadas ? (
                                <div className="finance-fast-mode-box">
                                    <h4 className="fast-mode-title">Modo Rápido Ativado</h4>
                                    <p className="fast-mode-desc">Utilize os filtros e clique em Pesquisar para carregar as vendas de forma rápida.</p>
                                </div>
                            ) : loading ? (
                                <p className="finance-loading-text">A carregar vendas...</p>
                            ) : (
                                <div className="finance-table-responsive no-border-shadow">
                                    <table className="finance-table min-width-850">
                                        <thead>
                                            <tr>
                                                <th className="th-left-radius">ID</th>
                                                <th>FOTÓGRAFO</th>
                                                <th>FOTO</th>
                                                <th>DATA</th>
                                                <th>PGTO CLIENTE</th>
                                                <th>REPASSE</th>
                                                <th className="th-right-radius">COMISSÃO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentPendentes.map((venda, index) => (
                                                <tr key={index}>
                                                    <td className="col-photo-id">{venda.pedido_id}</td>
                                                    <td className="col-client">{venda.fotografo}</td>
                                                    <td className="col-date">{venda.foto_id}</td>
                                                    <td className="col-date">{venda.data}</td>
                                                    <td>
                                                        <span className={venda.status === 'PAGO' ? 'status-badge-paid' : (venda.status === 'FALHOU' ? 'status-badge-pending text-danger' : 'status-badge-pending text-warning')}>
                                                            {venda.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {venda.pago_ao_fotografo ? <span className="status-badge-paid">✓ Feito</span> : <span className="status-badge-pending">⏳ Pendente</span>}
                                                    </td>
                                                    <td className="col-comission">R$ {venda.comissao.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {dados.length === 0 && <tr><td colSpan="7" className="finance-empty-row">Nenhuma venda encontrada.</td></tr>}
                                        </tbody>
                                    </table>
                                    
                                    {renderPagination(currentPagePendentes, totalPagesPendentes, setCurrentPagePendentes)}
                                </div>
                            )}
                            {isMobile && <button onClick={baixarPlanilha} className='create-button' style={{marginTop: '20px', width: '100%'}}>Baixar Planilha (Excel)</button>}
                        </div>

                        <div className="finance-sidebar">
                            <h3 className="sidebar-filter-title">FILTROS</h3>
                            <div className="sidebar-filter-form">
                                <label className="filter-label">Data Inicial</label>
                                <input type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleChange} className="filter-input" />
                                
                                <label className="filter-label">Data Final</label>
                                <input type="date" name="data_fim" value={filtros.data_fim} onChange={handleChange} className="filter-input" />
                                
                                <label className="filter-label">Fotógrafo</label>
                                <select name="fotografo_id" value={filtros.fotografo_id} onChange={handleChange} className="filter-input">
                                    <option value="">Todos os fotógrafos</option>
                                    {listaFotografos.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </select>
                                
                                <label className="filter-label">Status</label>
                                <select name="status" value={filtros.status} onChange={handleChange} className="filter-input">
                                    <option value="">Todos</option>
                                    <option value="PENDENTE">Pendente</option>
                                    <option value="PAGO">Pago</option>
                                    <option value="FALHOU">Falhou</option>
                                </select>
                                
                                <div className="filter-actions">
                                    <button onClick={() => buscarDadosVendas(true)} className='create-button filter-btn'>Filtrar</button>
                                    <button onClick={() => { setFiltros({data_inicio:'', data_fim:'', status:'', search:'', fotografo_id:''}); setCurrentPagePendentes(1); setTimeout(buscarDadosVendas, 100); }} className='create-button filter-btn filter-btn-clear'>Limpar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'historico' && (
                <div className={`finance-split-layout ${isMobile ? 'mobile-layout' : ''}`}>
                    
                    <div className="finance-main-content">
                        <h3 className="finance-section-title">Registros de Pagamentos Anteriores</h3>
                        
                        {!historicoBuscado ? (
                            <div className="finance-fast-mode-box">
                                <h4 className="fast-mode-title">Modo Rápido Ativado</h4>
                                <p className="fast-mode-desc">Utilize os filtros ao lado para pesquisar recibos antigos de forma rápida.</p>
                            </div>
                        ) : loading ? (
                            <p className="finance-loading-text">A carregar recibos...</p>
                        ) : (
                            <div className="finance-table-responsive no-border-shadow">
                                <table className="finance-table min-width-750">
                                    <thead>
                                        <tr>
                                            <th className="th-left-radius">Nº DO RECIBO</th>
                                            <th>FOTÓGRAFO</th>
                                            <th>DATA DO PGTO</th>
                                            <th>PERÍODO APURADO</th>
                                            <th>VALOR PAGO</th>
                                            <th className="th-right-radius text-center">AÇÃO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentHistorico.map((recibo) => (
                                            <tr key={recibo.id}>
                                                <td className="col-receipt-id">#{recibo.id.toString().padStart(5, '0')}</td>
                                                <td className="col-client">{recibo.fotografo}</td>
                                                <td className="col-date">{recibo.data_pagamento}</td>
                                                <td className="col-receipt-period">
                                                    {recibo.referencia_inicio} até {recibo.referencia_fim}
                                                </td>
                                                <td className="col-comission">R$ {recibo.valor_pago.toFixed(2)}</td>
                                                <td className="col-receipt-action">
                                                    <button onClick={() => imprimirRecibo(recibo)} className="print-receipt-btn">
                                                        Ver Recibo
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {historicoRecibos.length === 0 && <tr><td colSpan="6" className="finance-empty-row">Nenhum recibo encontrado para este filtro.</td></tr>}
                                    </tbody>
                                </table>

                                {renderPagination(currentPageHistorico, totalPagesHistorico, setCurrentPageHistorico)}
                            </div>
                        )}
                    </div>

                    <div className="finance-sidebar">
                        <h3 className="sidebar-filter-title">FILTRAR RECIBOS</h3>
                        <div className="sidebar-filter-form">
                            <label className="filter-label">Data Inicial</label>
                            <input type="date" name="data_inicio" value={filtrosHistorico.data_inicio} onChange={handleChangeHistorico} className="filter-input" />
                            
                            <label className="filter-label">Data Final</label>
                            <input type="date" name="data_fim" value={filtrosHistorico.data_fim} onChange={handleChangeHistorico} className="filter-input" />
                            
                            <label className="filter-label">Fotógrafo</label>
                            <select name="fotografo_id" value={filtrosHistorico.fotografo_id} onChange={handleChangeHistorico} className="filter-input">
                                <option value="">Todos os fotógrafos</option>
                                {listaFotografos.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                            </select>
                            
                            <div className="filter-actions">
                                <button onClick={buscarHistorico} className='create-button filter-btn'>Pesquisar</button>
                                <button onClick={() => { setFiltrosHistorico({data_inicio:'', data_fim:'', fotografo_id:''}); setHistoricoBuscado(false); setCurrentPageHistorico(1); }} className='create-button filter-btn filter-btn-clear'>Limpar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isPaymentModalOpen && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title" style={{color: '#28a745'}}>Registrar Pagamento?</h3>
                        
                        <div className="finance-payment-period-box">
                            <p className="period-label">Período Apurado Automaticamente:</p>
                            <p className="period-value">
                                {periodoPagamento.inicio ? periodoPagamento.inicio.split('-').reverse().join('/') : 'Início das vendas'} 
                                &nbsp; até &nbsp; 
                                {periodoPagamento.fim ? periodoPagamento.fim.split('-').reverse().join('/') : 'Hoje'}
                            </p>
                        </div>

                        <p className="dash-modal-text">
                            Tem a certeza que deseja registrar o pagamento de <strong>R$ {parseFloat(resumo.total_pagar).toFixed(2)}</strong> para este fotógrafo?
                        </p>
                        <p className="dash-modal-warning">Isso irá zerar o saldo pendente dele na plataforma.</p>
                        
                        <div className="dash-modal-actions">
                            <button onClick={() => setIsPaymentModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
                            <button onClick={confirmarPagamento} className="modal-btn-confirm btn-success">Sim, Registrar Pagamento</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminFinanceiroPage;