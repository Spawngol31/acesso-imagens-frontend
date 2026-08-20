import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function AdminAvaliacoesPage() {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        autor: '',
        papel: '',
        texto: '',
        estrelas: 5,
        mostrar_na_home: true
    });

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

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja apagar esta avaliação?")) {
            try {
                await axiosInstance.delete(`/dashboard/avaliacoes/${id}/`);
                toast.success("Avaliação apagada!");
                fetchAvaliacoes();
            } catch (error) {
                toast.error("Erro ao apagar.");
            }
        }
    };

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Avaliações do google</h2>
                <button className="create-button" onClick={() => openModal()}>
                    + Nova Avaliação
                </button>
            </div>

            {loading ? (
                <p>A carregar avaliações...</p>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Autor</th>
                                <th>Papel/Cargo</th>
                                <th>Estrelas</th>
                                <th>Na Home?</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {avaliacoes.length > 0 ? (
                                avaliacoes.map(av => (
                                    <tr key={av.id}>
                                        <td><strong>{av.autor}</strong></td>
                                        <td>{av.papel}</td>
                                        <td>{'★'.repeat(av.estrelas)}</td>
                                        <td>
                                            <span style={{ 
                                                color: av.mostrar_na_home ? 'green' : 'red', 
                                                fontWeight: 'bold' 
                                            }}>
                                                {av.mostrar_na_home ? 'Sim' : 'Não'}
                                            </span>
                                        </td>
                                        <td className="action-cell">
                                            <button className="edit-button-pill" onClick={() => openModal(av)}>Editar</button>
                                            <button className="delete-button-pill" onClick={() => handleDelete(av.id)}>Apagar</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>Nenhuma avaliação cadastrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Criação / Edição */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{editingId ? 'Editar Avaliação' : 'Nova Avaliação'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                name="autor" 
                                placeholder="Nome do Cliente (Ex: Luan Santos)" 
                                value={formData.autor} 
                                onChange={handleInputChange} 
                                required 
                            />
                            
                            <input 
                                type="text" 
                                name="papel" 
                                placeholder="Cargo/Papel (Ex: Cliente Acesso Imagens)" 
                                value={formData.papel} 
                                onChange={handleInputChange} 
                            />
                            
                            <textarea 
                                name="texto" 
                                placeholder="Texto da avaliação..." 
                                value={formData.texto} 
                                onChange={handleInputChange} 
                                required 
                            />

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <label style={{ fontWeight: 'bold', color: '#6c0464' }}>Estrelas:</label>
                                <select name="estrelas" value={formData.estrelas} onChange={handleInputChange} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                    <option value={5}>5 Estrelas</option>
                                    <option value={4}>4 Estrelas</option>
                                    <option value={3}>3 Estrelas</option>
                                </select>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    name="mostrar_na_home" 
                                    checked={formData.mostrar_na_home} 
                                    onChange={handleInputChange} 
                                />
                                <span>Mostrar na página inicial?</span>
                            </label>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>Cancelar</button>
                                <button type="submit">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAvaliacoesPage;