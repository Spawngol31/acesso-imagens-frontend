// src/pages/dashboard/DashboardCuponsPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import CupomForm from './CupomForm'; 
import { toast } from 'react-toastify';

function DashboardCuponsPage() {
    const [cupons, setCupons] = useState([]);
    const [albunsDisponiveis, setAlbunsDisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado do formulário de criação/edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCupom, setEditingCupom] = useState(null);

    // --- ESTADOS DO MODAL DE EXCLUSÃO ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cupomToDelete, setCupomToDelete] = useState(null);

    // 🚀 ESTADOS DE PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const fetchCupons = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/cupons/');
            setCupons(response.data);
        } catch (error) {
            console.error("Erro ao buscar cupons:", error);
            toast.error("Erro ao carregar a lista de cupons.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMeusAlbuns = async () => {
        try {
            const response = await axiosInstance.get('/dashboard/albuns/');
            const lista = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setAlbunsDisponiveis(lista);
        } catch (error) {
            try {
                // Fallback caso a rota principal de álbuns seja /albuns/
                const fallback = await axiosInstance.get('/albuns/');
                const listaFallback = Array.isArray(fallback.data) ? fallback.data : (fallback.data.results || []);
                setAlbunsDisponiveis(listaFallback);
            } catch (err) {
                console.error("Erro ao buscar álbuns para o cupom:", err);
            }
        }
    };

    useEffect(() => {
        fetchCupons();
        fetchMeusAlbuns();
    }, []);

    const handleFormSubmit = async (cupomData) => {
        const isEditing = !!editingCupom?.id;
        const url = isEditing ? `/dashboard/cupons/${editingCupom.id}/` : '/dashboard/cupons/';
        const method = isEditing ? 'patch' : 'post';

        try {
            await axiosInstance[method](url, cupomData);
            setIsModalOpen(false);
            setEditingCupom(null);
            fetchCupons();
            setCurrentPage(1);
            toast.success(isEditing ? "Cupom atualizado com sucesso!" : "Cupom criado com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar cupom:", error.response?.data);
            toast.error("Erro ao salvar. Verifique os dados (o código do cupom já pode existir).");
        }
    };

    const handleDeleteClick = (cupom) => {
        setCupomToDelete(cupom);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!cupomToDelete) return;
        
        try {
            await axiosInstance.delete(`/dashboard/cupons/${cupomToDelete.id}/`);
            fetchCupons();
            toast.success("Cupom apagado com sucesso!");
            
            if (currentCupons.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (error) {
            console.error("Erro ao apagar cupom:", error);
            toast.error("Erro ao tentar apagar o cupom.");
        } finally {
            setIsDeleteModalOpen(false);
            setCupomToDelete(null);
        }
    };

    // Renderiza os emblemas de álbuns na tabela
    const renderAlbunsDoCupom = (cupom) => {
        const titulos = cupom.albuns_titulos || [];
        if (titulos.length === 0) {
            return <span className="cupom-album-badge-all">Todos os álbuns</span>;
        }

        const primeiros = titulos.slice(0, 2);
        const restantes = titulos.length - primeiros.length;

        return (
            <div className="cupom-album-badges-wrap" title={titulos.join(', ')}>
                {primeiros.map((titulo, idx) => (
                    <span key={idx} className="cupom-album-badge-specific">
                        {titulo}
                    </span>
                ))}
                {restantes > 0 && (
                    <span className="cupom-album-badge-more">
                        +{restantes}
                    </span>
                )}
            </div>
        );
    };

    // 🚀 LÓGICA DE FATIAMENTO (SLICE) PARA PAGINAÇÃO
    const indexOfLastCupom = currentPage * itemsPerPage;
    const indexOfFirstCupom = indexOfLastCupom - itemsPerPage;
    const currentCupons = cupons.slice(indexOfFirstCupom, indexOfLastCupom);
    const totalPages = Math.ceil(cupons.length / itemsPerPage);

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
                >
                    &#62;
                </button>
            </div>
        );
    };

    if (loading) return <p className="page-subtitle">A carregar os seus cupons...</p>;

    return (
        <div className="dashboard-page-content cupons-page-wrapper">
            
            {/* CABEÇALHO */}
            <div className="dash-header-box">
                <h2 className="dash-main-title">Meus cupons</h2>
                <button className="create-button" onClick={() => { setEditingCupom({}); setIsModalOpen(true); }}>
                    Novo cupom +
                </button>
            </div>
            
            {/* TABELA DE CUPONS */}
            <div className="dash-table-card">
                <div className="dash-table-responsive">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Desconto (%)</th>
                                <th>Álbuns</th>
                                <th>Validade</th>
                                <th>Status</th>
                                <th className="dash-th-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCupons.length > 0 ? currentCupons.map(cupom => (
                                <tr key={cupom.id}>
                                    <td className="dash-td-bold">{cupom.codigo}</td>
                                    <td className="dash-td-success">{parseFloat(cupom.desconto_percentual).toFixed(2)}%</td>
                                    <td>{renderAlbunsDoCupom(cupom)}</td>
                                    <td className="dash-td-text">{cupom.data_validade ? new Date(cupom.data_validade).toLocaleDateString() : 'Sem validade'}</td>
                                    <td>
                                        {cupom.ativo ? (
                                            <span className="dash-badge dash-badge-public">Ativo</span>
                                        ) : (
                                            <span className="dash-badge dash-badge-archived">Inativo</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="dash-action-buttons">
                                            <button 
                                                onClick={() => { setEditingCupom(cupom); setIsModalOpen(true); }} 
                                                className="btn-acao btn-acao-edit"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(cupom)} 
                                                className="btn-acao btn-acao-archive"
                                            >
                                                Apagar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="dash-table-empty">Você ainda não criou nenhum cupom.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {renderPagination()}

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {isModalOpen && (
                <CupomForm 
                    onSubmit={handleFormSubmit}
                    initialData={editingCupom}
                    albunsDisponiveis={albunsDisponiveis}
                    onCancel={() => { setIsModalOpen(false); setEditingCupom(null); }}
                />
            )}

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            {isDeleteModalOpen && cupomToDelete && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title text-danger">
                            Excluir Cupom?
                        </h3>
                        <p className="dash-modal-text">
                            Tem a certeza que deseja APAGAR o cupom <strong>{cupomToDelete.codigo}</strong>? Esta ação é permanente e não pode ser desfeita.
                        </p>
                        <div className="dash-modal-actions">
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setCupomToDelete(null); }} 
                                className="modal-btn-cancel"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="modal-btn-confirm btn-danger"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default DashboardCuponsPage;