// src/pages/MinhasPropostasPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function MinhasPropostasPage() {
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [filtroStatus, setFiltroStatus] = useState('TODAS');
    const { fetchCart } = useCart();

    const [currentPage, setCurrentPage] = useState(1);
    const itensPorPagina = 20;

    const fetchPropostas = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/minhas-propostas/');
            setPropostas(response.data);
        } catch (error) {
            toast.error("Erro ao carregar as suas propostas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPropostas(); }, []);

    const responderContraproposta = async (id, acao) => {
        try {
            await axiosInstance.post(`/minhas-propostas/${id}/${acao}/`);
            toast.success("Resposta enviada com sucesso!");
            fetchPropostas();
            
            if (acao === 'aceitar') {
                fetchCart();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao responder.");
        }
    };

    const getStatusInfo = (status) => {
        if (status === 'ACEITA' || status === 'CONTRAPROPOSTA_ACEITA') return { classe: 'status-aceita', texto: 'Aprovada!' };
        if (status === 'RECUSADA' || status === 'CONTRAPROPOSTA_RECUSADA') return { classe: 'status-recusada', texto: 'Recusada' };
        if (status === 'CONTRAPROPOSTA') return { classe: 'status-contra', texto: 'Nova Oferta Recebida' };
        return { classe: 'status-pendente', texto: 'Em Análise' };
    };

    const propostasFiltradas = propostas.filter(proposta => {
        if (filtroStatus === 'TODAS') return true;
        if (filtroStatus === 'PENDENTE') return proposta.status === 'PENDENTE';
        if (filtroStatus === 'CONTRAPROPOSTA') return proposta.status === 'CONTRAPROPOSTA';
        if (filtroStatus === 'ACEITA') return proposta.status === 'ACEITA' || proposta.status === 'CONTRAPROPOSTA_ACEITA';
        if (filtroStatus === 'RECUSADA') return proposta.status === 'RECUSADA' || proposta.status === 'CONTRAPROPOSTA_RECUSADA';
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
        <div className="page-container page-propostas-wrapper">
            <h1 className="page-title propostas-page-title">Minhas Propostas</h1>

            <div className="propostas-filter-wrapper">
                <label className="filtro-label" htmlFor="filtro-status">
                    Filtrar por Status
                </label>
                <select
                    id="filtro-status"
                    className="filtro-select"
                    value={filtroStatus}
                    onChange={handleFiltroChange}
                >
                    <option value="TODAS">Todas as minhas propostas</option>
                    <option value="PENDENTE">Em análise pelo fotógrafo</option>
                    <option value="CONTRAPROPOSTA">Novas ofertas recebidas</option>
                    <option value="ACEITA">Aprovadas</option>
                    <option value="RECUSADA">Recusadas</option>
                </select>
            </div>

            {loading ? <p className="page-subtitle">A carregar as suas propostas...</p> : propostas.length === 0 ? (
                <div className="empty-state-message propostas-empty">
                    <p>Você ainda não fez nenhuma proposta.</p>
                </div>
            ) : propostasFiltradas.length === 0 ? (
                <div className="empty-state-message propostas-empty">
                    <p>Nenhuma proposta encontrada com este status.</p>
                </div>
            ) : (
                <>
                    <div className="propostas-grid">
                        {currentPropostas.map(proposta => {
                            const statusInfo = getStatusInfo(proposta.status);
                            
                            return (
                                <div key={proposta.id} className={`proposta-card ${statusInfo.classe}-border`}>
                                    <div className="proposta-card-header">
                                        
                                        <div className="proposta-info-col">
                                            <h3 className="proposta-title">Álbum: {proposta.album_titulo}</h3>
                                            <p className="proposta-text">
                                                <strong>Quantidade:</strong> {proposta.quantidade_fotos} Foto(s) e {proposta.quantidade_videos} Vídeo(s)
                                            </p>
                                            <p className="proposta-text">
                                                <strong className={proposta.status === 'CONTRAPROPOSTA' ? 'text-strikethrough' : ''}>
                                                    Valor Oferecido: R$ {parseFloat(proposta.valor_oferecido).toFixed(2)}
                                                </strong>
                                            </p>
                                            {proposta.valor_contraproposta && (
                                                <p className="proposta-contra-text">
                                                    Nova Oferta do Fotógrafo: R$ {parseFloat(proposta.valor_contraproposta).toFixed(2)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="proposta-badge-col">
                                            <div className={`proposta-badge ${statusInfo.classe}`}>
                                                {statusInfo.texto}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações se for Contra-proposta */}
                                    {proposta.status === 'CONTRAPROPOSTA' && (
                                        <div className="proposta-contra-box">
                                            <button onClick={() => responderContraproposta(proposta.id, 'recusar')} className="btn-recusar-oferta">Recusar Nova Oferta</button>
                                            <button onClick={() => responderContraproposta(proposta.id, 'aceitar')} className="btn-aceitar-oferta">Aceitar Nova Oferta</button>
                                        </div>
                                    )}

                                    {/* Mensagem de Sucesso */}
                                    {(proposta.status === 'ACEITA' || proposta.status === 'CONTRAPROPOSTA_ACEITA') && (
                                        <div className="proposta-success-box">
                                            <div className="proposta-success-content">
                                                <h4 className="proposta-success-title">Negociação Aprovada!</h4>
                                                <p className="proposta-success-text">
                                                    Para garantir este preço, coloque exatamente as quantidades combinadas no seu carrinho. O sistema aplicará o desconto automaticamente!
                                                </p>
                                            </div>
                                            <Link to={`/album/${proposta.album}`} className="create-button btn-success-action">Ir para o Álbum</Link>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {renderPagination()}
                </>
            )}
        </div>
    );
}

export default MinhasPropostasPage;