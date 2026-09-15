// src/pages/admin/AdminAvaliacoesPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function AdminAvaliacoesPage() {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados do Modal de Criação/Edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        autor: '',
        papel: '',
        texto: '',
        estrelas: 5,
        mostrar_na_home: true
    });

    // 🚀 ESTADOS DO MODAL DE EXCLUSÃO PERSONALIZADO
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [avaliacaoParaExcluir, setAvaliacaoParaExcluir] = useState(null);

    const fetchAvaliacoes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/avaliacoes/');
            setAvaliacoes(response.data.results || response.data);
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
            toast.error("Erro ao carregar avaliações.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvaliacoes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const openModal = (avaliacao = null) => {
        if (avaliacao) {
            setEditingId(avaliacao.id);
            setFormData({
                autor: avaliacao.autor,
                papel: avaliacao.papel || '',
                texto: avaliacao.texto,
                estrelas: avaliacao.estrelas,
                mostrar_na_home: avaliacao.mostrar_na_home
            });
        } else {
            setEditingId(null);
            setFormData({ autor: '', papel: '', texto: '', estrelas: 5, mostrar_na_home: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosInstance.put(`/dashboard/avaliacoes/${editingId}/`, formData);
                toast.success("Avaliação atualizada!");
            } else {
                await axiosInstance.post('/dashboard/avaliacoes/', formData);
                toast.success("Avaliação criada!");
            }
            fetchAvaliacoes();
            closeModal();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar avaliação.");
        }
    };

    // Abre o modal bonito em vez do window.confirm
    const abrirModalExclusao = (avaliacao) => {
        setAvaliacaoParaExcluir(avaliacao);
        setIsDeleteModalOpen(true);
    };

    const confirmarExclusao = async () => {
        if (!avaliacaoParaExcluir) return;
        try {
            await axiosInstance.delete(`/dashboard/avaliacoes/${avaliacaoParaExcluir.id}/`);
            toast.success("Avaliação apagada!");
            fetchAvaliacoes();
        } catch (error) {
            toast.error("Erro ao apagar.");
        } finally {
            setIsDeleteModalOpen(false);
            setAvaliacaoParaExcluir(null);
        }
    };

    return (
        <div className="dashboard-page-content avaliacoes-page-wrapper">
            
            <div className="dash-header-box header-flex-between">
                <h2 className="dash-main-title margin-0">Avaliações do google</h2>
                <button className="create-button" onClick={() => openModal()}>
                    + Nova Avaliação
                </button>
            </div>

            {loading ? (
                <p className="page-subtitle" style={{ padding: '20px' }}>A carregar avaliações...</p>
            ) : (
                <div className="dash-table-card">
                    <div className="dash-table-responsive">
                        <table className="dash-table min-width-700">
                            <thead>
                                <tr>
                                    <th className="th-left-radius">Autor</th>
                                    <th>Papel/Cargo</th>
                                    <th>Estrelas</th>
                                    <th>Na Home?</th>
                                    <th className="th-right-radius text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {avaliacoes.length > 0 ? (
                                    avaliacoes.map(av => (
                                        <tr key={av.id}>
                                            <td className="dash-td-bold">{av.autor}</td>
                                            <td className="dash-td-muted">{av.papel}</td>
                                            <td className="rating-stars-cell">{'★'.repeat(av.estrelas)}</td>
                                            <td>
                                                <span className={`status-badge-lg ${av.mostrar_na_home ? 'status-badge-accepted' : 'status-badge-rejected'}`}>
                                                    {av.mostrar_na_home ? 'Sim' : 'Não'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="dash-action-buttons">
                                                    <button onClick={() => openModal(av)} className="btn-acao btn-acao-edit">Editar</button>
                                                    <button onClick={() => abrirModalExclusao(av)} className="btn-acao btn-acao-archive">Apagar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="dash-table-empty">Nenhuma avaliação cadastrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Criação / Edição */}
            {isModalOpen && (
                <div className="dash-modal-overlay" onClick={closeModal}>
                    <div className="dash-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="dash-modal-header">
                            <h3 className="dash-modal-title">{editingId ? 'Editar Avaliação' : 'Nova Avaliação'}</h3>
                            <button onClick={closeModal} className="dash-modal-close">✖</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form-flex">
                            <div className="modal-input-group">
                                <label className="modal-label">Nome do Cliente</label>
                                <input 
                                    type="text" 
                                    name="autor" 
                                    placeholder="Ex: Luan Santos" 
                                    value={formData.autor} 
                                    onChange={handleInputChange} 
                                    className="modal-input"
                                    required 
                                />
                            </div>
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Cargo / Papel</label>
                                <input 
                                    type="text" 
                                    name="papel" 
                                    placeholder="Ex: Cliente Acesso Imagens" 
                                    value={formData.papel} 
                                    onChange={handleInputChange} 
                                    className="modal-input"
                                />
                            </div>
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Texto da Avaliação</label>
                                <textarea 
                                    name="texto" 
                                    rows="4"
                                    placeholder="Escreva a avaliação..." 
                                    value={formData.texto} 
                                    onChange={handleInputChange} 
                                    className="modal-input modal-textarea"
                                    required 
                                />
                            </div>

                            <div className="avaliacao-stars-row">
                                <label className="modal-label label-inline">Estrelas:</label>
                                <select name="estrelas" value={formData.estrelas} onChange={handleInputChange} className="modal-input avaliacao-select">
                                    <option value={5}>5 Estrelas</option>
                                    <option value={4}>4 Estrelas</option>
                                    <option value={3}>3 Estrelas</option>
                                </select>
                            </div>

                            <label className="album-form-checkbox-wrapper avaliacao-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="mostrar_na_home" 
                                    checked={formData.mostrar_na_home} 
                                    onChange={handleInputChange} 
                                    className="custom-checkbox"
                                />
                                <span>Mostrar na página inicial?</span>
                            </label>

                            <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                                <button type="button" onClick={closeModal} className="button-outline modal-btn-half">Cancelar</button>
                                <button type="submit" className="create-button modal-btn-half">Salvar Avaliação</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🚀 MODAL DE CONFIRMAÇÃO DE EXCLUSÃO PERSONALIZADO */}
            {isDeleteModalOpen && avaliacaoParaExcluir && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small text-center">
                        <div className="users-block-icon">⚠️</div>
                        <h3 className="dash-modal-title text-danger">Excluir Avaliação?</h3>
                        
                        <p className="dash-modal-text">
                            Tem a certeza que deseja APAGAR a avaliação feita por <strong>{avaliacaoParaExcluir.autor}</strong>? Esta ação é permanente e não pode ser desfeita.
                        </p>
                        
                        <div className="dash-modal-actions">
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setAvaliacaoParaExcluir(null); }} 
                                className="modal-btn-cancel"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarExclusao} 
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

export default AdminAvaliacoesPage;