import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

function AdminFinanceiroPage() {
    const [dados, setDados] = useState([]);
    const [resumo, setResumo] = useState({ total_vendas: 0, total_pagar: 0 });
    const [listaFotografos, setListaFotografos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- DETEÇÃO DE MOBILE ---
    const [larguraJanela, setLarguraJanela] = useState(window.innerWidth);
    const isMobile = larguraJanela < 900; // Se a tela for menor que 900px, ativa o modo mobile

    useEffect(() => {
        const handleResize = () => setLarguraJanela(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        buscarDados(); // Busca inicial

        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // -------------------------

    const [filtros, setFiltros] = useState({
        data_inicio: '',
        data_fim: '',
        status: '',
        search: '',
        fotografo_id: ''
    });

    const buscarDados = async () => {
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
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    const baixarPlanilha = async () => {
        const params = new URLSearchParams(filtros).toString();
        const urlBase = axiosInstance.defaults.baseURL;
        window.open(`${urlBase}/admin/exportar-pagamentos/?${params}`, '_blank');
    };

    // --- ESTILOS REUTILIZÁVEIS ---
    const corPrincipal = '#6c0464';
    
    const inputStyle = {
        width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '6px',
        boxSizing: 'border-box', fontSize: '14px', outline: 'none', marginBottom: '15px', color: '#495057'
    };

    const btnStyle = {
        padding: '10px 18px', backgroundColor: corPrincipal, color: 'white', border: 'none',
        borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'opacity 0.2s',
    };

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* BANNER DE RESUMO */}
            <div style={{ 
                backgroundColor: '#fbf0fa', border: `1px solid #e1bce0`, color: corPrincipal, 
                padding: '16px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', 
                display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(108, 4, 100, 0.05)',
                flexDirection: isMobile ? 'column' : 'row', // Empilha o texto no mobile se precisar
                textAlign: isMobile ? 'center' : 'left'
            }}>
                <span style={{ marginRight: isMobile ? '0' : '12px', marginBottom: isMobile ? '10px' : '0', fontSize: '1.2rem' }}>💰</span>
                <span>
                    RESUMO DA TELA ATUAL: Vendas Totais (R$ {parseFloat(resumo.total_vendas).toFixed(2)}) | 
                    <br style={{ display: isMobile ? 'block' : 'none' }}/> {/* Quebra a linha só no mobile */}
                    TOTAL LÍQUIDO AOS FOTÓGRAFOS: R$ {parseFloat(resumo.total_pagar).toFixed(2)}
                </span>
            </div>

            {/* CONTAINER PRINCIPAL (Usa flexbox para mudar a ordem no mobile) */}
            <div style={{ 
                display: 'flex', 
                gap: '20px', 
                flexDirection: isMobile ? 'column' : 'row', // Muda para coluna no mobile
                alignItems: 'flex-start' 
            }}>
                
                {/* ÁREA DA TABELA (No desktop fica à esquerda, no mobile vai para baixo usando 'order: 2') */}
                <div style={{ 
                    flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '10px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box',
                    order: isMobile ? 2 : 1 // MÁGICA: Empurra a tabela para baixo no mobile
                }}>
                    
                    {/* BARRA DE PESQUISA (E botão de baixar no Desktop) */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '25px',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '15px'
                    }}>
                        <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                            <input 
                                type="text" name="search" placeholder="Pesquisar por ID do pedido..." 
                                value={filtros.search} onChange={handleChange}
                                style={{ ...inputStyle, width: isMobile ? '100%' : '280px', marginBottom: '0', backgroundColor: '#fff' }}
                            />
                            <button onClick={buscarDados} className='create-button'>
                                Pesquisar
                            </button>
                        </div>

                        {/* Botão Baixar Planilha - APARECE AQUI SÓ NO DESKTOP */}
                        {!isMobile && (
                            <button onClick={baixarPlanilha} className='create-button'>
                                Baixar Planilha (Excel)
                            </button>
                        )}
                    </div>

                    {/* TABELA COM SCROLL HORIZONTAL */}
                    {loading ? <p style={{ color: '#666' }}>A carregar vendas...</p> : (
                        <div className="table-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: 'none', boxShadow: 'none' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                        <th style={{ padding: '12px 10px', borderRadius: '6px 0 0 0' }}>ID</th>
                                        <th style={{ padding: '12px 10px' }}>FOTÓGRAFO</th>
                                        <th style={{ padding: '12px 10px' }}>FOTO</th>
                                        <th style={{ padding: '12px 10px' }}>DATA</th>
                                        <th style={{ padding: '12px 10px' }}>FORMA DE PGTO</th>
                                        <th style={{ padding: '12px 10px' }}>STATUS</th>
                                        <th style={{ padding: '12px 10px' }}>VALOR DA VENDA</th>
                                        <th style={{ padding: '12px 10px', borderRadius: '0 6px 0 0' }}>COMISSÃO (UN.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.map((venda, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '14px 10px', fontWeight: '500' }}>{venda.pedido_id}</td>
                                            <td style={{ padding: '14px 10px', color: '#555' }}>{venda.fotografo}</td>
                                            <td style={{ padding: '14px 10px' }}>{venda.foto_id}</td>
                                            <td style={{ padding: '14px 10px' }}>{venda.data}</td>
                                            <td style={{ padding: '14px 10px' }}>{venda.forma_pgto}</td>
                                            <td style={{ padding: '14px 10px' }}>{venda.status}</td>
                                            <td style={{ padding: '14px 10px' }}>R$ {venda.valor_venda.toFixed(2)}</td>
                                            <td style={{ padding: '14px 10px', fontWeight: '500' }}>R$ {venda.comissao.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {dados.length === 0 && (
                                        <tr>
                                            <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                                Nenhuma venda encontrada com estes filtros.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p style={{ marginTop: '20px', fontSize: '13px', color: '#888' }}>{dados.length} itens encontrados.</p>

                    {/* Botão Baixar Planilha - APARECE AQUI SÓ NO MOBILE (Debaixo da tabela) */}
                    {isMobile && (
                        <button onClick={baixarPlanilha} className='create-button'>
                            Baixar Planilha (Excel)
                        </button>
                    )}
                </div>

                {/* BARRA LATERAL (FILTROS) - No mobile vai para cima usando 'order: 1' */}
                <div style={{ 
                    width: isMobile ? '100%' : '260px', backgroundColor: '#fdfbfe', padding: '20px', 
                    borderRadius: '10px', border: `1px solid #e1bce0`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    boxSizing: 'border-box',
                    order: isMobile ? 1 : 2 // MÁGICA: Puxa os filtros para cima no mobile
                }}>
                    <h3 style={{ marginTop: 0, backgroundColor: corPrincipal, color: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '15px', letterSpacing: '1px' }}>
                        🔍︎ FILTROS
                    </h3>
                    
                    <div style={{ marginTop: '25px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#444', textTransform: 'uppercase' }}>Data Inicial</label>
                        <input type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleChange} style={{ ...inputStyle, background:'white'}} />

                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#444', textTransform: 'uppercase' }}>Data Final</label>
                        <input type="date" name="data_fim" value={filtros.data_fim} onChange={handleChange} style={{ ...inputStyle, background:'white'}} />

                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#444', textTransform: 'uppercase' }}>Fotógrafo</label>
                        <select name="fotografo_id" value={filtros.fotografo_id} onChange={handleChange} style={{ ...inputStyle, background:'white'}}>
                            <option value="">Todos os fotógrafos</option>
                            {listaFotografos.map(f => (
                                <option key={f.id} value={f.id}>{f.nome}</option>
                            ))}
                        </select>

                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#444', textTransform: 'uppercase' }}>Status</label>
                        <select name="status" value={filtros.status} onChange={handleChange} style={{ ...inputStyle, background:'white'}}>
                            <option value="">Todos</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="PAGO">Pago</option>
                            <option value="FALHOU">Falhou</option>
                        </select>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={buscarDados} className='create-button'>Filtrar</button>
                            <button 
                                onClick={() => { 
                                    setFiltros({data_inicio:'', data_fim:'', status:'', search:'', fotografo_id:''}); 
                                    setTimeout(buscarDados, 100); 
                                }} 
                                className='create-button'
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminFinanceiroPage;