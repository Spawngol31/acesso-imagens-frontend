// src/pages/dashboard/DashboardImprensaPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function DashboardImprensaPage() {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null); 

    const [formData, setFormData] = useState({
        titulo: '',
        veiculo: '',
        link: '',
        data_publicacao: ''
    });
    
    // ESTADO PARA O FICHEIRO DE IMAGEM
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
        setCapaFile(null); // Limpa o ficheiro
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
        setCapaFile(null); // Limpa o ficheiro
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // PREPARAMOS OS DADOS PARA ENVIO COM FICHEIRO
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

    const handleDelete = async (id) => {
        if (!window.confirm("Tem a certeza que deseja APAGAR definitivamente esta matéria?")) return;
        try {
            await axiosInstance.delete(`/imprensa/${id}/`);
            toast.success("Matéria excluída com sucesso!");
            fetchMaterias();
        } catch (error) {
            toast.error("Erro ao excluir matéria.");
        }
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, backdropFilter: 'blur(3px)' };

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            
            <header className="dashboard-header-card">
                <div style={{ textAlign: 'center' }}>
                    <h1 className="dashboard-header-title">Gestão de Imprensa (Clipping)</h1>
                    <p className="dashboard-header-text">
                        Adicione, edite ou remova as publicações que aparecem na página pública "Na Mídia".
                    </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '15px', flexWrap: 'wrap' }}>
                    <button onClick={openCreateModal} className="create-button" style={{ padding: '10px 15px', fontSize: '15px' }}>
                        Nova Matéria
                    </button>
                </div>
            </header>

            {loading ? (
                <p style={{ textAlign: 'center', color: '#888' }}>A carregar dados...</p>
            ) : (
                <div className="table-wrapper">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Capa</th>
                                <th>Data</th>
                                <th>Veículo</th>
                                <th>Título da Matéria</th>
                                <th style={{ textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materias.map(materia => (
                                <tr key={materia.id}>
                                    <td style={{ width: '60px' }}>
                                        <img 
                                            src={materia.imagem_capa || '/images/default-news.png'} 
                                            alt="Capa" 
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} 
                                        />
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(materia.data_publicacao)}</td>
                                    <td style={{ fontWeight: 'bold' }}>{materia.veiculo}</td>
                                    <td>
                                        <a href={materia.link} target="_blank" rel="noopener noreferrer" className="table-link">
                                            {materia.titulo} ↗
                                        </a>
                                    </td>
                                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        <button onClick={() => openEditModal(materia)} className="button-outline table-action-btn">Editar</button>
                                        <button onClick={() => handleDelete(materia.id)} className="button-outline table-action-btn btn-danger">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                            {materias.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="table-empty-state">
                                        Nenhuma matéria registada no sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DE ADICIONAR / EDITAR */}
            {isModalOpen && (
                <div style={overlayStyle}>
                    <div className="dashboard-modal-card" style={{ maxWidth: '500px' }}>
                        <div className="dashboard-modal-divider" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 className="dashboard-modal-title" style={{ margin: 0 }}>
                                {editingId ? 'Editar matéria' : 'Nova matéria'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✖</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {/* 🚀 BOTÃO DE UPLOAD DE IMAGEM BONITO E FUNCIONAL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '5px' }}>Imagem de capa (Opcional)</label>
                                
                                <div style={{ padding: '15px', border: '1px dashed #666', borderRadius: '6px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <label htmlFor="capa-upload" className="button-outline" style={{ display: 'inline-block', cursor: 'pointer', margin: 0, padding: '8px 16px', fontSize: '13px' }}>
                                        {capaFile ? 'Trocar imagem' : 'Escolher imagem'}
                                    </label>
                                    <input 
                                        id="capa-upload"
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setCapaFile(e.target.files[0])} 
                                        style={{ display: 'none' }} 
                                    />
                                    {capaFile && <p style={{ color: '#4dd0e1', margin: '10px 0 0 0', fontSize: '12px', fontWeight: 'bold' }}>{capaFile.name}</p>}
                                </div>
                                
                                {editingId && !capaFile && <small style={{color: '#888', display: 'block', marginTop: '5px'}}>Deixe em branco para manter a imagem atual.</small>}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '5px' }}>Título da matéria</label>
                                <input name="titulo" value={formData.titulo} onChange={handleChange} required className="dashboard-input" placeholder="Ex: Goleiro defende pênalti..." />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '5px' }}>Veículo de comunicação</label>
                                <input name="veiculo" value={formData.veiculo} onChange={handleChange} required className="dashboard-input" placeholder="Ex: Globo Esporte" />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '5px' }}>Link (URL)</label>
                                <input name="link" type="url" value={formData.link} onChange={handleChange} required className="dashboard-input" placeholder="https://..." />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '5px' }}>Data de publicação</label>
                                <input name="data_publicacao" type="date" value={formData.data_publicacao} onChange={handleChange} required className="dashboard-input" />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="button-outline" style={{ flex: 1 }}>Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="create-button" style={{ flex: 1, opacity: isSubmitting ? 0.7 : 1 }}>
                                    {isSubmitting ? 'A salvar...' : 'Salvar matéria'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .dashboard-header-card { background-color: #fff; border: 1px solid #e1bce0; border-radius: 8px; padding: 30px 20px; margin-bottom: 30px; box-shadow: 0 4px 10px rgba(108, 4, 100, 0.05); }
                .dashboard-header-title { color: #6c0464; margin-top: 0; margin-bottom: 10px; font-size: 28px; }
                .dashboard-header-text { color: #555; }
                
                .table-wrapper { background-color: #fff; border-radius: 8px; overflow: auto; border: 1px solid #e1bce0; }
                .dashboard-table { width: 100%; border-collapse: collapse; text-align: left; }
                .dashboard-table th, .dashboard-table td { padding: 15px; }
                .dashboard-table thead tr { background-color: rgba(108, 4, 100, 0.05); color: #6c0464; border-bottom: 2px solid #e1bce0; }
                .dashboard-table tbody tr { border-bottom: 1px solid #eee; transition: background-color 0.2s; }
                .dashboard-table tbody tr:hover { background-color: #fbf0fa; }
                .table-link { color: #17a2b8; text-decoration: none; font-weight: 500; }
                .table-link:hover { text-decoration: underline; }
                .table-action-btn { padding: 6px 12px; font-size: 12px; margin: 0 3px; }
                .btn-danger { border-color: #dc3545; color: #dc3545; }
                .btn-danger:hover { background-color: #dc3545; color: #fff; }
                .table-empty-state { padding: 30px; text-align: center; color: #888; }

                .dashboard-modal-card { background-color: #fff; padding: 30px; border-radius: 12px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); box-sizing: border-box; }
                .dashboard-modal-title { color: #6c0464; margin-top: 0; margin-bottom: 15px; }
                .dashboard-modal-divider { border-bottom: 2px solid #fbf0fa; }
                .dashboard-input { width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #ccc; box-sizing: border-box; background-color: #fff; color: #333; }

                @media (prefers-color-scheme: dark) {
                    .dashboard-header-card { background-color: #2a2a2a; border-color: #444; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
                    .dashboard-header-title { color: #f794f7; }
                    .dashboard-header-text { color: #ccc; }
                    
                    .table-wrapper { background-color: #2a2a2a; border-color: #444; }
                    .dashboard-table thead tr { background-color: #111; color: #f794f7; border-bottom: 1px solid #444; }
                    .dashboard-table tbody tr { background-color: #2a2a2a; border-bottom: 1px solid #666; color: #ccc; }
                    .dashboard-table tbody tr:hover { background-color: #333; }
                    .table-link { color: #4dd0e1; }
                    .table-empty-state { color: #888; }

                    .dashboard-modal-card { background-color: #2a2a2a; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    .dashboard-modal-title { color: #fff; }
                    .dashboard-modal-divider { border-bottom: 1px solid #444; }
                    .dashboard-input { background-color: #111; color: #eee; border-color: #444; color-scheme: dark; }
                }
            `}</style>
        </div>
    );
}

export default DashboardImprensaPage;