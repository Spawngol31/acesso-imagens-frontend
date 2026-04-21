// src/pages/dashboard/DashboardVendasPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { color } from 'chart.js/helpers';

function DashboardVendasPage() {
    const [activeTab, setActiveTab] = useState('vendas'); 
    const [loading, setLoading] = useState(true);
    const [larguraJanela, setLarguraJanela] = useState(window.innerWidth);
    const isMobile = larguraJanela < 900;

    // --- ESTADOS DA ABA: MINHAS VENDAS ---
    const [dados, setDados] = useState([]);
    const [resumo, setResumo] = useState({ saldo_pendente: 0, total_ja_recebido: 0 });
    const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '', status_repasse: '' });

    // --- ESTADOS DA ABA: MEUS RECIBOS ---
    const [historicoRecibos, setHistoricoRecibos] = useState([]);

    const corPrincipal = '#6c0464';

    useEffect(() => {
        const handleResize = () => setLarguraJanela(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Muda a busca dependendo da aba que o fotógrafo clicou
    useEffect(() => {
        if (activeTab === 'vendas') {
            buscarVendas();
        } else {
            buscarHistorico();
        }
    }, [activeTab]);

    const buscarVendas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
            if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
            if (filtros.status_repasse) params.append('status_repasse', filtros.status_repasse);

            // Chama a nova rota do Django que criámos
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
        try {
            // Chama a rota de recibos do Django
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

    // --- FUNÇÃO PARA GERAR O PDF/IMPRESSÃO DO RECIBO ---
    const imprimirRecibo = (recibo) => {
        const janela = window.open('', '', 'width=800,height=600');
        janela.document.write(`
            <html>
            <head>
                <title>Meu Recibo - #${recibo.id}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { border-bottom: 3px solid ${corPrincipal}; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; alignItems: center; }
                    .title { color: ${corPrincipal}; margin: 0; font-size: 28px; }
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

    // --- ESTILOS ---
    const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px', outline: 'none', marginBottom: '15px', backgroundColor: '#fff', color: '#414141' };
    
    const tabBtnStyle = (isActive) => ({
        padding: '12px 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
        borderBottom: isActive ? `3px solid ${corPrincipal}` : '3px solid transparent',
        backgroundColor: isActive ? '#fff' : '#f8f9fa', color: isActive ? corPrincipal : '#666',
        transition: 'all 0.2s', flex: isMobile ? 1 : 'none'
    });

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* TÍTULO */}
            <div className="page-header" style={{ marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: corPrincipal }} >💰 Meu Financeiro</h2>
            </div>

            {/* NAVEGAÇÃO DE ABAS */}
            <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '25px', backgroundColor: '#f8f9fa', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
                <button style={tabBtnStyle(activeTab === 'vendas')} onClick={() => setActiveTab('vendas')}>📈 Minhas Vendas</button>
                <button style={tabBtnStyle(activeTab === 'historico')} onClick={() => setActiveTab('historico')}>🧾 Meus Recebimentos</button>
            </div>

            {/* ==================== ABA 1: MINHAS VENDAS E FILTROS ==================== */}
            {activeTab === 'vendas' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                        <div style={{ backgroundColor: '#fff', borderLeft: `5px solid #28a745`, padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: 0, color: '#666', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Pendente (A Receber)</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#28a745', fontSize: '32px' }}>R$ {parseFloat(resumo.saldo_pendente).toFixed(2)}</h2>
                        </div>
                        <div style={{ backgroundColor: '#fff', borderLeft: `5px solid ${corPrincipal}`, padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: 0, color: '#666', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Já Recebido na Plataforma</p>
                            <h2 style={{ margin: '10px 0 0 0', color: corPrincipal, fontSize: '32px' }}>R$ {parseFloat(resumo.total_ja_recebido).toFixed(2)}</h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>
                        
                        {/* TABELA DE VENDAS */}
                        <div style={{ flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box', order: isMobile ? 2 : 1 }}>
                            <h3 style={{ marginTop: 0, color: corPrincipal, marginBottom: '20px' }}>Lista de Vendas Confirmadas</h3>

                            {loading ? <p style={{ color: '#666' }}>A carregar vendas...</p> : (
                                <div className="table-wrapper" style={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                                <th style={{ padding: '12px 10px', borderRadius: '6px 0 0 0' }}>FOTO ID</th>
                                                {/* --- NOVA COLUNA AQUI --- */}
                                                <th style={{ padding: '12px 10px' }}>CLIENTE</th> 
                                                <th style={{ padding: '12px 10px' }}>DATA DA VENDA</th>
                                                <th style={{ padding: '12px 10px' }}>STATUS DO REPASSE</th>
                                                <th style={{ padding: '12px 10px', borderRadius: '0 6px 0 0' }}>MINHA COMISSÃO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dados.map((venda, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '14px 10px', fontWeight: '500' }}>#{venda.foto_id}</td>
                                                    {/* --- NOVO DADO AQUI --- */}
                                                    <td style={{ padding: '14px 10px', color: '#555' }}>{venda.cliente}</td>
                                                    <td style={{ padding: '14px 10px' }}>{venda.data}</td>
                                                    <td style={{ padding: '14px 10px' }}>
                                                        {venda.pago_ao_fotografo 
                                                            ? <span style={{color: '#28a745', fontWeight: 'bold'}}>✓ Já Recebido</span> 
                                                            : <span style={{color: '#dc3545', fontWeight: 'bold'}}>⏳ A Receber</span>}
                                                    </td>
                                                    <td style={{ padding: '14px 10px', fontWeight: 'bold' }}>R$ {venda.comissao.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {/* Repare que mudei o colSpan de 4 para 5 para acompanhar a nova coluna */}
                                            {dados.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhuma venda encontrada com estes filtros.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* FILTROS */}
                        <div style={{ width: isMobile ? '100%' : '260px', backgroundColor: '#fdfbfe', padding: '20px', borderRadius: '10px', border: `1px solid #e1bce0`, boxSizing: 'border-box', order: isMobile ? 1 : 2 }}>
                            <h3 style={{ marginTop: 0, backgroundColor: corPrincipal, color: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '15px' }}>🔍︎ FILTROS</h3>
                            <div style={{ marginTop: '25px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Data Inicial</label>
                                <input type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleChange} style={inputStyle} />
                                
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Data Final</label>
                                <input type="date" name="data_fim" value={filtros.data_fim} onChange={handleChange} style={inputStyle} />
                                
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Status do Repasse</label>
                                <select name="status_repasse" value={filtros.status_repasse} onChange={handleChange} style={inputStyle}>
                                    <option value="">Todos</option>
                                    <option value="PENDENTE">A Receber (Pendentes)</option>
                                    <option value="PAGO">Já Recebidos (Pagos)</option>
                                </select>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button onClick={buscarVendas} className='create-button'>Filtrar</button>
                                    <button onClick={() => { setFiltros({data_inicio:'', data_fim:'', status_repasse:''}); setTimeout(buscarVendas, 100); }} className='create-button'>Limpar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ==================== ABA 2: HISTÓRICO DE RECIBOS ==================== */}
            {activeTab === 'historico' && (
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
                    <h3 style={{ marginTop: 0, color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '15px' }}>🧾 Meus Recibos da Plataforma</h3>
                    
                    {loading ? <p style={{ color: '#666' }}>A carregar recibos...</p> : (
                        <div className="table-wrapper" style={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                        <th style={{ padding: '12px 10px', borderRadius: '6px 0 0 0' }}>Nº DO RECIBO</th>
                                        <th style={{ padding: '12px 10px' }}>DATA DO PGTO</th>
                                        <th style={{ padding: '12px 10px' }}>PERÍODO APURADO</th>
                                        <th style={{ padding: '12px 10px' }}>VALOR RECEBIDO</th>
                                        <th style={{ padding: '12px 10px', borderRadius: '0 6px 0 0', textAlign: 'center' }}>AÇÃO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicoRecibos.map((recibo) => (
                                        <tr key={recibo.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '14px 10px', fontWeight: 'bold' }}>#{recibo.id.toString().padStart(5, '0')}</td>
                                            <td style={{ padding: '14px 10px' }}>{recibo.data_pagamento}</td>
                                            <td style={{ padding: '14px 10px', fontSize: '12px', color: '#666' }}>
                                                {recibo.referencia_inicio} até {recibo.referencia_fim}
                                            </td>
                                            <td style={{ padding: '14px 10px', fontWeight: 'bold', color: '#28a745' }}>R$ {recibo.valor_pago.toFixed(2)}</td>
                                            <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                                                <button onClick={() => imprimirRecibo(recibo)} style={{ padding: '6px 12px', backgroundColor: corPrincipal, color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                    🖨️ Ver / Imprimir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {historicoRecibos.length === 0 && <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Você ainda não possui recebimentos registados na plataforma.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DashboardVendasPage;