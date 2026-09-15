// src/pages/dashboard/DashboardImprensaPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function DashboardImprensaPage() {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null); 

    // 🚀 ESTADOS PARA O MODAL DE EXCLUSÃO PERSONALIZADO
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [materiaParaExcluir, setMateriaParaExcluir] = useState(null);

    const [formData, setFormData] = useState({
        titulo: '',
        veiculo: '',
        link: '',
        data_publicacao: ''
    });
    
    const [capaFile, setCapaFile] = useState(null); 

    useEffect(() => {
        fetchMaterias();
    }, []);

    const fetchMaterias = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/imprensa/');
            setMaterias(response.data);
        } catch (error) {
            console.error("Erro ao buscar matérias:", error);
            toast.error("Não foi possível carregar as matérias.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ titulo: '', veiculo: '', link: '', data_publicacao: '' });
        setCapaFile(null); 
        setIsModalOpen(true);
    };

    const openEditModal = (materia) => {
        setEditingId(materia.id);
        setFormData({
            titulo: materia.titulo,
            veiculo: materia.veiculo,
            link: materia.link,
            data_publicacao: materia.data_publicacao
        });
        setCapaFile(null); 
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formPayload = new FormData();
        formPayload.append('titulo', formData.titulo);
        formPayload.append('veiculo', formData.veiculo);
        formPayload.append('link', formData.link);
        formPayload.append('data_publicacao', formData.data_publicacao);
        
        if (capaFile) {
            formPayload.append('imagem_capa', capaFile);
        }

        try {
            if (editingId) {
                await axiosInstance.patch(`/imprensa/${editingId}/`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Matéria atualizada com sucesso!");
            } else {
                await axiosInstance.post('/imprensa/', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Nova matéria adicionada!");
            }
            setIsModalOpen(false);
            fetchMaterias();
        } catch (error) {
            toast.error("Erro ao salvar a matéria.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Abre o modal personalizado em vez do window.confirm
    const abrirModalExclusao = (materia) => {
        setMateriaParaExcluir(materia);
        setIsDeleteModalOpen(true);
    };

    const confirmarExclusao = async () => {
        if (!materiaParaExcluir) return;
        try {
            await axiosInstance.delete(`/imprensa/${materiaParaExcluir.id}/`);
            toast.success("Matéria excluída com sucesso!");
            fetchMaterias();
        } catch (error) {
            toast.error("Erro ao excluir matéria.");
        } finally {
            setIsDeleteModalOpen(false);
            setMateriaParaExcluir(null);
        }
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="dashboard-page-content imprensa-page-wrapper">
            
            <header className="dashboard-header-card imprensa-header-card">
                <div className="imprensa-header-inner">
                    <h1 className="dashboard-header-title">Gestão de Imprensa (Clipping)</h1>
                    <p className="dashboard-header-text">
                        Adicione, edite ou remova as publicações que aparecem na página pública "Na Mídia".
                    </p>
                </div>
                <div className="imprensa-header-btn-row">
                    <button onClick={openCreateModal} className="create-button imprensa-create-btn">
                        Nova Matéria
                    </button>
                </div>
            </header>

            {loading ? (
                <p className="page-subtitle" style={{ textAlign: 'center' }}>A carregar dados...</p>
            ) : (
                <div className="dash-table-card">
                    <div className="dash-table-responsive">
                        <table className="dash-table min-width-700">
                            <thead>
                                <tr>
                                    <th className="th-left-radius">Capa</th>
                                    <th>Data</th>
                                    <th>Veículo</th>
                                    <th>Título da Matéria</th>
                                    <th className="th-right-radius text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materias.map(materia => (
                                    <tr key={materia.id}>
                                        <td className="col-thumb-td">
                                            <img 
                                                src={materia.imagem_capa || '/images/default-news.png'} 
                                                alt="Capa" 
                                                className="table-thumb-img" 
                                            />
                                        </td>
                                        <td className="nowrap-col">{formatDate(materia.data_publicacao)}</td>
                                        <td className="dash-td-bold">{materia.veiculo}</td>
                                        <td>
                                            <a href={materia.link} target="_blank" rel="noopener noreferrer" className="imprensa-external-link">
                                                {materia.titulo} ↗
                                            </a>
                                        </td>
                                        <td className="text-center nowrap-col">
                                            <button onClick={() => openEditModal(materia)} className="btn-acao btn-acao-edit">Editar</button>
                                            <button onClick={() => abrirModalExclusao(materia)} className="btn-acao btn-acao-archive">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                                {materias.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="dash-table-empty">
                                            Nenhuma matéria registada no sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL DE ADICIONAR / EDITAR */}
            {isModalOpen && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content imprensa-modal-width">
                        <div className="dash-modal-header">
                            <h3 className="dash-modal-title">
                                {editingId ? 'Editar matéria' : 'Nova matéria'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="dash-modal-close">✖</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form-flex">
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Imagem de capa (Opcional)</label>
                                <div className="imprensa-upload-box">
                                    <label htmlFor="capa-upload" className="button-outline imprensa-upload-label-btn">
                                        {capaFile ? 'Trocar imagem' : 'Escolher imagem'}
                                    </label>
                                    <input 
                                        id="capa-upload"
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setCapaFile(e.target.files[0])} 
                                        style={{ display: 'none' }} 
                                    />
                                    {capaFile && <p className="imprensa-filename-success">{capaFile.name}</p>}
                                </div>
                                {editingId && !capaFile && <small className="imprensa-small-hint">Deixe em branco para manter a imagem atual.</small>}
                            </div>

                            <div className="modal-input-group">
                                <label className="modal-label">Título da matéria</label>
                                <input name="titulo" value={formData.titulo} onChange={handleChange} required className="modal-input" placeholder="Ex: Goleiro defende pênalti..." />
                            </div>
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Veículo de comunicação</label>
                                <input name="veiculo" value={formData.veiculo} onChange={handleChange} required className="modal-input" placeholder="Ex: Globo Esporte" />
                            </div>
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Link (URL)</label>
                                <input name="link" type="url" value={formData.link} onChange={handleChange} required className="modal-input" placeholder="https://..." />
                            </div>
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Data de publicação</label>
                                <input name="data_publicacao" type="date" value={formData.data_publicacao} onChange={handleChange} required className="modal-input" />
                            </div>

                            <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="button-outline modal-btn-half">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="create-button modal-btn-half" style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                                    {isSubmitting ? 'A salvar...' : 'Salvar matéria'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🚀 MODAL DE CONFIRMAÇÃO DE EXCLUSÃO PERSONALIZADO */}
            {isDeleteModalOpen && materiaParaExcluir && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small text-center">
                        <div className="users-block-icon">⚠️</div>
                        <h3 className="dash-modal-title text-danger">Excluir Matéria?</h3>
                        
                        <p className="dash-modal-text">
                            Tem a certeza que deseja APAGAR definitivamente a matéria <strong>"{materiaParaExcluir.titulo}"</strong>? Esta ação é permanente e não pode ser desfeita.
                        </p>
                        
                        <div className="dash-modal-actions">
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setMateriaParaExcluir(null); }} 
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

export default DashboardImprensaPage;