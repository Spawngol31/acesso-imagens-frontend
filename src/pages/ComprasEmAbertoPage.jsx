// src/pages/ComprasEmAbertoPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

function ComprasEmAbertoPage() {
    const [comprasPendentes, setComprasPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- ESTADOS DE PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const itensPorPagina = 10;

    const fetchCompras = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/minhas-compras-abertas/');
            setComprasPendentes(response.data);
        } catch (error) {
            console.error("Erro ao buscar compras:", error);
            toast.error("Erro ao carregar as suas compras em aberto.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCompras(); }, []);

    const handlePagarAgora = (compra) => {
        navigate(`/checkout/${compra.id}`);
    };

    const totalPages = Math.ceil(comprasPendentes.length / itensPorPagina);
    const indexOfLastItem = currentPage * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const currentCompras = comprasPendentes.slice(indexOfFirstItem, indexOfLastItem);

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
        <div className="page-container pending-purchases-container">
            <h1 className="page-title pending-purchases-title">
                Compras em aberto
            </h1>
            <p className="page-subtitle pending-purchases-subtitle">
                Aqui estão os seus pedidos que ainda aguardam pagamento. Finalize-os para liberar as suas mídias!
            </p>

            {loading ? (
                <p className="page-subtitle">A procurar compras pendentes...</p>
            ) : comprasPendentes.length === 0 ? (
                <div className="empty-state-message">
                    <p>Você não tem nenhuma compra em aberto no momento.</p>
                    <Link to="/eventos" className="create-button" style={{ display: 'inline-block', marginTop: '15px' }}>
                        Explorar Álbuns
                    </Link>
                </div>
            ) : (
                <>
                    <div className="pending-purchases-grid">
                        {currentCompras.map(compra => (
                            <div key={compra.id} className="pending-purchase-card">
                                <div className="pending-purchase-card-content">
                                    
                                    {/* INFO DO PEDIDO */}
                                    <div className="pending-purchase-info">
                                        <h3 className="pending-purchase-id">Pedido #{compra.id}</h3>
                                        <p className="pending-purchase-text">
                                            <strong>Data:</strong> {new Date(compra.data_criacao || compra.criado_em).toLocaleDateString()}
                                        </p>
                                        <p className="pending-purchase-text">
                                            <strong>Total:</strong> R$ {parseFloat(compra.valor_total || compra.total || 0).toFixed(2)}
                                        </p>
                                        <p className="pending-purchase-text" style={{ margin: 0 }}>
                                            <strong>Status:</strong> <span className="pending-badge">Aguardando Pagamento</span>
                                        </p>
                                    </div>

                                    {/* BOTÕES DE AÇÃO */}
                                    <div className="pending-purchase-actions">
                                        <button 
                                            onClick={() => handlePagarAgora(compra)} 
                                            className="create-button" 
                                        >
                                            Pagar Agora
                                        </button>
                                        
                                        <button 
                                            onClick={() => handlePagarAgora(compra)} 
                                            className="button-outline" 
                                        >
                                            Mudar forma de pagamento
                                        </button>
                                    </div>
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

export default ComprasEmAbertoPage;