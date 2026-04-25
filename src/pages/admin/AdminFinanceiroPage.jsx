// src/pages/admin/AdminFinanceiroPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function AdminFinanceiroPage() {
    // --- ESTADOS GERAIS ---
    const [activeTab, setActiveTab] = useState('pendentes'); // 'pendentes' ou 'historico'
    const [loading, setLoading] = useState(true);
    const [larguraJanela, setLarguraJanela] = useState(window.innerWidth);
    const isMobile = larguraJanela < 900;

    // --- ESTADOS DA ABA DE CAIXA PENDENTE ---
    const [dados, setDados] = useState([]);
    const [resumo, setResumo] = useState({ total_vendas: 0, total_pagar: 0 });
    const [listaFotografos, setListaFotografos] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '', status: '', search: '', fotografo_id: '' });

    // --- ESTADOS DA ABA DE HISTÓRICO ---
    const [historicoRecibos, setHistoricoRecibos] = useState([]);

    useEffect(() => {
        const handleResize = () => setLarguraJanela(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Atualiza os dados sempre que a aba muda
    useEffect(() => {
        if (activeTab === 'pendentes') {
            buscarDadosVendas();
        } else {
            buscarHistorico();
        }
    }, [activeTab]);

    // ================= LÓGICA DA ABA: VENDAS PENDENTES =================
    const buscarDadosVendas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
            if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
            if (filtros.status) params.append('status', filtros.status);
            if (filtros.search) params.append('search', filtros.search);
            if (filtros.fotografo_id) params.append('fotografo_id', filtros.fotografo_id);

            const response = await axiosInstance.get(`/admin/vendas-json/?${params.toString()}`);
            setDados(response.data.resultados);
            setResumo(response.data.resumo);
            setListaFotografos(response.data.fotografos || []);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            toast.error("Erro ao carregar os dados financeiros.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

    const baixarPlanilha = async () => {
        try {
            toast.info("A gerar planilha, aguarde...");
            const params = new URLSearchParams(filtros).toString();
            
            // O axios faz o pedido com o Token, e avisamos que a resposta é um Blob (Ficheiro)
            const response = await axiosInstance.get(`/admin/exportar-pagamentos/?${params}`, {
                responseType: 'blob' 
            });

            // Cria um link temporário e invisível para forçar o download no navegador
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Define um nome para o ficheiro baseado na data
            const nomeArquivo = filtros.data_inicio && filtros.data_fim 
                ? `pagamentos_${filtros.data_inicio}_ate_${filtros.data_fim}.csv` 
                : `pagamentos_geral.csv`;
                
            link.setAttribute('download', nomeArquivo);
            document.body.appendChild(link);
            link.click();
            
            // Limpa a memória do navegador
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Erro ao baixar planilha:", error);
            toast.error("Erro ao transferir a planilha. Verifique a sua conexão.");
        }
    };

    const handlePagarFotografoClick = () => {
        if (!filtros.fotografo_id) return;
        setIsPaymentModalOpen(true);
    };

    const confirmarPagamento = async () => {
        try {
            const payload = {
                fotografo_id: filtros.fotografo_id,
                data_inicio: filtros.data_inicio,
                data_fim: filtros.data_fim,
                valor_pago: resumo.total_pagar
            };
            await axiosInstance.post('/admin/registrar-pagamento-fotografo/', payload);
            toast.success("Pagamento registrado com sucesso! O saldo foi zerado.");
            buscarDadosVendas(); 
            // Se o pagamento for bem sucedido, podemos pular para a aba de histórico para ele ver o recibo
            setActiveTab('historico');
        } catch (error) {
            console.error("Erro ao registrar pagamento:", error);
            toast.error("Erro ao tentar registrar o pagamento.");
        } finally {
            setIsPaymentModalOpen(false); 
        }
    };

    // ================= LÓGICA DA ABA: HISTÓRICO =================
    const buscarHistorico = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/admin/historico-pagamentos/');
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
                    .header { border-bottom: 3px solid #6c0464; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; alignItems: center; }
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
        
        // Aguarda um milissegundo para o navegador renderizar o HTML antes de abrir a janela de impressão
        setTimeout(() => {
            janela.print();
        }, 250);
    };

    // --- ESTILOS REUTILIZÁVEIS ---
    const corPrincipal = '#6c0464';
    const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px', outline: 'none', marginBottom: '15px', color: '#495057', backgroundColor: '#fff' };
    
    const tabBtnStyle = (isActive) => ({
        padding: '12px 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
        borderBottom: isActive ? `3px solid ${corPrincipal}` : '3px solid transparent',
        backgroundColor: isActive ? '#fff' : '#f8f9fa',
        color: isActive ? corPrincipal : '#666',
        transition: 'all 0.2s', flex: isMobile ? 1 : 'none'
    });

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* NAVEGAÇÃO DE ABAS */}
            <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '25px', backgroundColor: '#f8f9fa', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
                <button style={tabBtnStyle(activeTab === 'pendentes')} onClick={() => setActiveTab('pendentes')}>
                    ⏳ Caixa Pendente (Vendas)
                </button>
                <button style={tabBtnStyle(activeTab === 'historico')} onClick={() => setActiveTab('historico')}>
                    🧾 Histórico de Recibos
                </button>
            </div>

            {/* CONTEÚDO DA ABA 1: VENDAS PENDENTES */}
            {activeTab === 'pendentes' && (
                <>
                    <div style={{ backgroundColor: '#fbf0fa', border: `1px solid #e1bce0`, color: corPrincipal, padding: '16px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', boxShadow: '0 2px 4px rgba(108, 4, 100, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>💰</span>
                            <span>RESUMO: Vendas Pagas (R$ {parseFloat(resumo.total_vendas).toFixed(2)}) | LÍQUIDO A REPASSAR: R$ {parseFloat(resumo.total_pagar).toFixed(2)}</span>
                        </div>
                        {filtros.fotografo_id && resumo.total_pagar > 0 && (
                            <button onClick={handlePagarFotografoClick} style={{ padding: '10px 16px', backgroundColor: '#6c0464', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(40,167,69,0.3)' }}>
                                💸 Registrar Pagamento (Zerar Saldo)
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box', order: isMobile ? 2 : 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexDirection: isMobile ? 'column' : 'row', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                                    <input type="text" name="search" placeholder="Pesquisar ID do pedido..." value={filtros.search} onChange={handleChange} style={{ ...inputStyle, width: isMobile ? '100%' : '280px', marginBottom: '0', backgroundColor: '#fff' }} />
                                    <button onClick={buscarDadosVendas} className='create-button'>Pesquisar</button>
                                </div>
                                {!isMobile && <button onClick={baixarPlanilha} className='create-button'>Baixar Planilha (Excel)</button>}
                            </div>

                            {loading ? <p style={{ color: '#666' }}>A carregar vendas...</p> : (
                                <div className="table-wrapper" style={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '850px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                                <th style={{ padding: '12px 10px', borderRadius: '6px 0 0 0' }}>ID</th>
                                                <th style={{ padding: '12px 10px' }}>FOTÓGRAFO</th>
                                                <th style={{ padding: '12px 10px' }}>FOTO</th>
                                                <th style={{ padding: '12px 10px' }}>DATA</th>
                                                <th style={{ padding: '12px 10px' }}>PGTO CLIENTE</th>
                                                <th style={{ padding: '12px 10px' }}>REPASSE</th>
                                                <th style={{ padding: '12px 10px', borderRadius: '0 6px 0 0' }}>COMISSÃO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dados.map((venda, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '14px 10px', fontWeight: '500' }}>{venda.pedido_id}</td>
                                                    <td style={{ padding: '14px 10px', color: '#555' }}>{venda.fotografo}</td>
                                                    <td style={{ padding: '14px 10px' }}>{venda.foto_id}</td>
                                                    <td style={{ padding: '14px 10px' }}>{venda.data}</td>
                                                    <td style={{ padding: '14px 10px' }}>
                                                        <span style={{ backgroundColor: venda.status === 'PAGO' ? '#d4edda' : (venda.status === 'FALHOU' ? '#f8d7da' : '#fff3cd'), color: venda.status === 'PAGO' ? '#155724' : (venda.status === 'FALHOU' ? '#721c24' : '#856404'), padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                            {venda.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 10px' }}>
                                                        {venda.pago_ao_fotografo ? <span style={{color: '#28a745', fontWeight: 'bold'}}>✓ Feito</span> : <span style={{color: '#dc3545', fontWeight: 'bold'}}>⏳ Pendente</span>}
                                                    </td>
                                                    <td style={{ padding: '14px 10px', fontWeight: '500' }}>R$ {venda.comissao.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {dados.length === 0 && <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhuma venda encontrada.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {isMobile && <button onClick={baixarPlanilha} className='create-button' style={{marginTop: '20px', width: '100%'}}>Baixar Planilha (Excel)</button>}
                        </div>

                        {/* FILTROS DA ABA VENDAS */}
                        <div style={{ width: isMobile ? '100%' : '260px', backgroundColor: '#fdfbfe', padding: '20px', borderRadius: '10px', border: `1px solid #e1bce0`, boxSizing: 'border-box', order: isMobile ? 1 : 2 }}>
                            <h3 style={{ marginTop: 0, backgroundColor: corPrincipal, color: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '15px' }}>🔍︎ FILTROS</h3>
                            <div style={{ marginTop: '25px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Data Inicial</label>
                                <input type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleChange} style={inputStyle} />
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Data Final</label>
                                <input type="date" name="data_fim" value={filtros.data_fim} onChange={handleChange} style={inputStyle} />
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Fotógrafo</label>
                                <select name="fotografo_id" value={filtros.fotografo_id} onChange={handleChange} style={inputStyle}>
                                    <option value="">Todos os fotógrafos</option>
                                    {listaFotografos.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </select>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Status</label>
                                <select name="status" value={filtros.status} onChange={handleChange} style={inputStyle}>
                                    <option value="">Todos</option>
                                    <option value="PENDENTE">Pendente</option>
                                    <option value="PAGO">Pago</option>
                                    <option value="FALHOU">Falhou</option>
                                </select>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button onClick={buscarDadosVendas} className='create-button'>Filtrar</button>
                                    <button onClick={() => { setFiltros({data_inicio:'', data_fim:'', status:'', search:'', fotografo_id:''}); setTimeout(buscarDadosVendas, 100); }} className='create-button'>Limpar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* CONTEÚDO DA ABA 2: HISTÓRICO DE RECIBOS */}
            {activeTab === 'historico' && (
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
                    <h3 style={{ marginTop: 0, color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '15px' }}>🧾 Registos de Pagamentos Anteriores</h3>
                    
                    {loading ? <p style={{ color: '#666' }}>A carregar recibos...</p> : (
                        <div className="table-wrapper" style={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '750px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                        <th style={{ padding: '12px 10px', borderRadius: '6px 0 0 0' }}>Nº DO RECIBO</th>
                                        <th style={{ padding: '12px 10px' }}>FOTÓGRAFO</th>
                                        <th style={{ padding: '12px 10px' }}>DATA DO PGTO</th>
                                        <th style={{ padding: '12px 10px' }}>PERÍODO APURADO</th>
                                        <th style={{ padding: '12px 10px' }}>VALOR PAGO</th>
                                        <th style={{ padding: '12px 10px', borderRadius: '0 6px 0 0', textAlign: 'center' }}>AÇÃO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicoRecibos.map((recibo) => (
                                        <tr key={recibo.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '14px 10px', fontWeight: 'bold' }}>#{recibo.id.toString().padStart(5, '0')}</td>
                                            <td style={{ padding: '14px 10px', color: '#555' }}>{recibo.fotografo}</td>
                                            <td style={{ padding: '14px 10px' }}>{recibo.data_pagamento}</td>
                                            <td style={{ padding: '14px 10px', fontSize: '12px', color: '#666' }}>
                                                {recibo.referencia_inicio} até {recibo.referencia_fim}
                                            </td>
                                            <td style={{ padding: '14px 10px', fontWeight: 'bold', color: '#28a745' }}>R$ {recibo.valor_pago.toFixed(2)}</td>
                                            <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                                                <button 
                                                    onClick={() => imprimirRecibo(recibo)}
                                                    style={{ padding: '6px 12px', backgroundColor: corPrincipal, color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                                >
                                                    🖨️ Ver Recibo
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {historicoRecibos.length === 0 && <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Nenhum histórico de pagamento registado ainda.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE PAGAMENTO */}
            {isPaymentModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#28a745', marginTop: 0 }}>Registrar Pagamento?</h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            Tem a certeza que deseja registrar o pagamento de <strong>R$ {parseFloat(resumo.total_pagar).toFixed(2)}</strong> para este fotógrafo?
                        </p>
                        <p style={{ color: '#dc3545', fontSize: '14px', lineHeight: '1.5', fontWeight: 'bold' }}>Isso irá zerar o saldo pendente dele na plataforma até a data de hoje.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => setIsPaymentModalOpen(false)} className='create_button' style={{ padding: '10px 20px'}}>Cancelar</button>
                            <button onClick={confirmarPagamento} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Sim, Registrar Pagamento</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminFinanceiroPage;