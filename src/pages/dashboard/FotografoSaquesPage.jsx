// src/pages/dashboard/FotografoSaquesPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function FotografoSaquesPage() {
    const [saques, setSaques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- NOVO: Estado para guardar o saldo real que vem do banco ---
    const [saldoPendente, setSaldoPendente] = useState(0);
    const [chavePix, setChavePix] = useState('');

    // 🚀 ESTADOS DE PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Busca o histórico de saques
            const responseSaques = await axiosInstance.get('/dashboard/saques/');
            setSaques(responseSaques.data);

            // 2. Busca o saldo atual (aproveitando a rota de vendas que já faz esse cálculo)
            const responseVendas = await axiosInstance.get('/dashboard/minhas-vendas-json/');
            setSaldoPendente(responseVendas.data.resumo.saldo_pendente);

        } catch (error) {
            toast.error("Erro ao carregar os dados financeiros.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSolicitarSaque = async (e) => {
        e.preventDefault();
        
        if (saldoPendente <= 0) {
            return toast.warning("Você não possui saldo disponível para saque no momento.");
        }
        if (!chavePix) {
            return toast.warning("Preencha a chave PIX.");
        }

        setIsSubmitting(true);
        try {
            await axiosInstance.post('/dashboard/saques/', { chave_pix: chavePix });
            toast.success("Solicitação enviada com sucesso! O Admin analisará o seu pedido.");
            setChavePix('');
            setCurrentPage(1); // 🚀 Volta para a página 1 para ver o novo pedido
            fetchData(); // Recarrega tudo para atualizar o saldo para zero
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao solicitar saque.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'PAGO') return 'status-badge-paid';
        if (status === 'RECUSADA') return 'status-badge-rejected';
        return 'status-badge-pending'; // PENDENTE
    };

    // 🚀 LÓGICA DE FATIAMENTO (SLICE) PARA PAGINAÇÃO
    const indexOfLastSaque = currentPage * itemsPerPage;
    const indexOfFirstSaque = indexOfLastSaque - itemsPerPage;
    const currentSaques = saques.slice(indexOfFirstSaque, indexOfLastSaque);
    const totalPages = Math.ceil(saques.length / itemsPerPage);

    // 🚀 COMPONENTE DE UI DA PAGINAÇÃO MINIMALISTA
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
        <div className="dashboard-page-content saques-dash-wrapper">
            <h2 className="dash-main-title border-bottom-title">
                Meus saques
            </h2>

            {/* FORMULÁRIO DE SOLICITAÇÃO */}
            <div className="saque-form-card">
                <h3 className="saque-form-title">Solicitar repasse de vendas</h3>
                <p className="saque-form-desc">
                    O sistema transfere automaticamente todo o seu saldo disponível em uma única transação.
                </p>
                
                <form onSubmit={handleSolicitarSaque} className="saque-form-flex">
                    
                    {/* --- CAIXA DE SALDO BLOQUEADA --- */}
                    <div className="saque-col-balance">
                        <label className="saque-label">Valor do saque (R$)</label>
                        <div className={`saque-balance-display ${saldoPendente > 0 ? 'balance-positive' : 'balance-zero'}`}>
                            R$ {parseFloat(saldoPendente).toFixed(2)}
                        </div>
                    </div>

                    <div className="saque-col-pix">
                        <label className="saque-label">Sua chave PIX</label>
                        <input 
                            type="text" 
                            required 
                            value={chavePix} 
                            onChange={(e) => setChavePix(e.target.value)} 
                            placeholder="CPF, E-mail, Telefone ou Chave Aleatória" 
                            className="saque-input-pix" 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting || saldoPendente <= 0} 
                        className="create-button saque-submit-btn" 
                        style={{ opacity: (isSubmitting || saldoPendente <= 0) ? 0.6 : 1 }}
                    >
                        {isSubmitting ? 'Enviando...' : 'Pedir saque total'}
                    </button>
                </form>
            </div>

            {/* HISTÓRICO DE SAQUES */}
            <div className="saque-history-card">
                <h3 className="saque-history-title">Histórico de solicitações</h3>
                
                {loading ? <p className="page-subtitle">A carregar histórico...</p> : saques.length === 0 ? (
                    <div className="empty-state-message">
                        <p>Nenhuma solicitação de saque realizada até o momento.</p>
                    </div>
                ) : (
                    <>
                        <div className="finance-table-responsive no-border-shadow">
                            <table className="finance-table">
                                <thead>
                                    <tr>
                                        <th className="th-left-radius">DATA DO PEDIDO</th>
                                        <th>VALOR</th>
                                        <th>CHAVE PIX</th>
                                        <th>STATUS</th>
                                        <th className="th-right-radius">OBSERVAÇÃO DO ADMIN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSaques.map((saque) => (
                                        <tr key={saque.id}>
                                            <td className="col-saque-date">
                                                {new Date(saque.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="col-saque-value">R$ {parseFloat(saque.valor).toFixed(2)}</td>
                                            <td className="col-saque-pix">{saque.chave_pix}</td>
                                            <td>
                                                <span className={`status-badge-lg ${getStatusStyle(saque.status)}`}>
                                                    {saque.status}
                                                </span>
                                            </td>
                                            <td className="col-saque-obs">
                                                {saque.comprovante && (
                                                    <a 
                                                        href={saque.comprovante} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="saque-receipt-link"
                                                    >
                                                        Ver Comprovante
                                                    </a>
                                                )}
                                                <div className="saque-obs-text">
                                                    {saque.observacao || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
}

export default FotografoSaquesPage;