// src/pages/dashboard/DashboardPropostasPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function DashboardPropostasPage() {
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [valoresContraproposta, setValoresContraproposta] = useState({});
    
    // --- NOVO ESTADO: FILTRO DE STATUS ---
    const [filtroStatus, setFiltroStatus] = useState('TODAS');

    // --- ESTADOS DE PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const itensPorPagina = 10; 

    const fetchPropostas = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/propostas/');
            setPropostas(response.data);
        } catch (error) {
            toast.error("Erro ao carregar as propostas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPropostas(); }, []);

    const responderProposta = async (id, acao) => {
        try {
            let payload = {};
            if (acao === 'contraproposta') {
                const valor = valoresContraproposta[id];
                if (!valor || valor <= 0) return toast.warning("Digite um valor válido para a contra-proposta.");
                payload = { valor_contraproposta: valor };
            }

            await axiosInstance.post(`/dashboard/propostas/${id}/${acao}/`, payload);
            toast.success("Proposta atualizada com sucesso!");
            fetchPropostas(); 
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao responder proposta.");
        }
    };

    const getStatusStyle = (status) => {
        if (status.includes('ACEITA')) return 'status-badge-accepted';
        if (status.includes('RECUSADA')) return 'status-badge-rejected';
        if (status === 'CONTRAPROPOSTA') return 'status-badge-counter'; 
        return 'status-badge-pending'; // PENDENTE
    };

    const propostasFiltradas = propostas.filter(proposta => {
        if (filtroStatus === 'TODAS') return true;
        if (filtroStatus === 'PENDENTE') return proposta.status === 'PENDENTE';
        if (filtroStatus === 'CONTRAPROPOSTA') return proposta.status === 'CONTRAPROPOSTA';
        if (filtroStatus === 'ACEITA') return proposta.status.includes('ACEITA');
        if (filtroStatus === 'RECUSADA') return proposta.status.includes('RECUSADA');
        return true;
    });

    const handleFiltroChange = (e) => {
        setFiltroStatus(e.target.value);
        setCurrentPage(1); 
    };

    const totalPages = Math.ceil(propostasFiltradas.length / itensPorPagina);
    const indexOfLastItem = currentPage * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const currentPropostas = propostasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (novaPagina) => {
        setCurrentPage(novaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
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
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                            onClick={() => handlePageChange(number)}
                            className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                            style={{ cursor: 'pointer', transition: 'all 0.2s', fontWeight: currentPage === number ? 'bold' : 'normal' }}
                        >
                            {number}
                        </button>
                    )
                ))}

                <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
        <div className="dashboard-page-content propostas-dash-wrapper">
            <div className="dash-header-box">
                <h2 className="dash-main-title">Negociações e propostas</h2>
            </div>

            {/* --- COMPONENTE DO FILTRO VISUAL --- */}
            <div className="propostas-filter-wrapper">
                <label htmlFor="filtro-status" className="filtro-label">
                    Status
                </label>
                <select
                    id="filtro-status"
                    value={filtroStatus}
                    onChange={handleFiltroChange}
                    className="filtro-select"
                >
                    <option value="TODAS">Todas as propostas</option>
                    <option value="PENDENTE">Aguardando aprovação</option>
                    <option value="CONTRAPROPOSTA">Aguardando resposta do cliente</option>
                    <option value="ACEITA">Aceitas</option>
                    <option value="RECUSADA">Recusadas</option>
                </select>
            </div>

            {loading ? <p className="page-subtitle">A carregar propostas...</p> : propostas.length === 0 ? (
                <div className="empty-state-message">
                    <p>Nenhuma proposta em aberto.</p>
                </div>
            ) : propostasFiltradas.length === 0 ? (
                <div className="empty-state-message">
                    <p>Nenhuma proposta encontrada com o status selecionado.</p>
                </div>
            ) : (
                <>
                    <div className="propostas-dash-grid">
                        {currentPropostas.map(proposta => (
                            <div key={proposta.id} className="proposta-dash-card">
                                
                                <div className="proposta-dash-info">
                                    <h3 className="proposta-dash-client">{proposta.cliente_nome}</h3>
                                    <p className="proposta-dash-email">{proposta.cliente_email}</p>
                                    <p className="proposta-dash-detail"><strong>Álbum:</strong> {proposta.album_titulo}</p>
                                    <p className="proposta-dash-detail">
                                        <strong>Pedido:</strong> {proposta.quantidade_fotos} Foto(s) e {proposta.quantidade_videos} Vídeo(s)
                                    </p>

                                    {/* 🚀 BLOCO DO COMENTÁRIO */}
                                    {proposta.comentario && (
                                        <div className="proposta-dash-comment">
                                            <strong className="comment-label">Mensagem do cliente:</strong>
                                            "{proposta.comentario}"
                                        </div>
                                    )}
                                </div>

                                <div className="proposta-dash-value-box">
                                    <span className="value-label">Valor Oferecido</span>
                                    <span className="value-amount">R$ {parseFloat(proposta.valor_oferecido).toFixed(2)}</span>
                                </div>

                                <div className="proposta-dash-actions-col">
                                    <span className={`status-badge-lg ${getStatusStyle(proposta.status)}`}>
                                        {proposta.status.replace(/_/g, ' ')}
                                    </span>
                                    
                                    {proposta.status === 'PENDENTE' && (
                                        <div className="proposta-action-panel">
                                            <div className="proposta-btn-row">
                                                <button onClick={() => responderProposta(proposta.id, 'recusar')} className="btn-dash-reject">Recusar</button>
                                                <button onClick={() => responderProposta(proposta.id, 'aceitar')} className="btn-dash-accept">Aceitar</button>
                                            </div>
                                            
                                            <div className="proposta-counter-row">
                                                <input 
                                                    type="number" step="0.01" placeholder="R$ Nova Oferta" 
                                                    value={valoresContraproposta[proposta.id] || ''}
                                                    onChange={(e) => setValoresContraproposta({...valoresContraproposta, [proposta.id]: e.target.value})}
                                                    className="counter-input"
                                                />
                                                <button onClick={() => responderProposta(proposta.id, 'contraproposta')} className="btn-dash-counter">Enviar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {renderPagination()}
                </>
            )}
        </div>
    );
}

export default DashboardPropostasPage;