// src/pages/admin/AdminJornaisPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function AdminJornaisPage() {
    const [jornais, setJornais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [jornalParaExcluir, setJornalParaExcluir] = useState(null);
    const [formData, setFormData] = useState({
        id: null,
        nome_jornal: '',
        usuario: '',
        ftp_host: '',
        ftp_user: '',
        ftp_password: '',
        ftp_pasta: '/',
        ativo: true
    });
    
    const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchJornais = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('admin/jornais-parceiros/');
            setJornais(response.data);
        } catch (error) {
            console.error("Erro ao buscar jornais:", error);
            toast.error("Erro ao carregar lista de jornais.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await axiosInstance.get('admin/users/?papel=FOTOGRAFO');
            const fotografos = response.data.filter(u => u.papel === 'FOTOGRAFO');
            setUsuariosDisponiveis(fotografos);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    };

    useEffect(() => {
        fetchJornais();
        fetchUsuarios();
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axiosInstance.put(`admin/jornais-parceiros/${formData.id}/`, formData);
                toast.success("Jornal atualizado com sucesso!");
            } else {
                await axiosInstance.post('admin/jornais-parceiros/', formData);
                toast.success("Jornal cadastrado com sucesso!");
            }
            
            setIsModalOpen(false);
            fetchJornais();
            setFormData({
                id: null, nome_jornal: '', usuario: '', ftp_host: '', ftp_user: '', ftp_password: '', ftp_pasta: '/', ativo: true
            });
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao salvar jornal.");
            console.error(error);
        }
    };

    const toggleStatus = async (jornalId, statusAtual) => {
        try {
            await axiosInstance.patch(`admin/jornais-parceiros/${jornalId}/`, { ativo: !statusAtual });
            fetchJornais();
            toast.success("Status atualizado!");
        } catch (error) {
            toast.error("Erro ao mudar status.");
        }
    };

    const abrirModalExclusao = (jornalId, nomeJornal) => {
        setJornalParaExcluir({ id: jornalId, nome: nomeJornal });
        setIsDeleteModalOpen(true);
    };

    const confirmarExclusao = async () => {
        if (!jornalParaExcluir) return;

        try {
            await axiosInstance.delete(`admin/jornais-parceiros/${jornalParaExcluir.id}/`);
            toast.success("Jornal excluído com sucesso!");
            fetchJornais(); 
            setIsDeleteModalOpen(false); 
            setJornalParaExcluir(null); 
            
            if (currentJornais.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (error) {
            toast.error("Erro ao excluir o jornal.");
            console.error(error);
        }
    };

    const abrirModalEdicao = (jornal) => {
        setFormData({
            id: jornal.id,
            nome_jornal: jornal.nome_jornal,
            usuario: jornal.usuario || '', 
            ftp_host: jornal.ftp_host,
            ftp_user: jornal.ftp_user,
            ftp_password: '', 
            ftp_pasta: jornal.ftp_pasta,
            ativo: jornal.ativo
        });
        setIsModalOpen(true);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJornais = jornais.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(jornais.length / itemsPerPage);

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
        <div className="dashboard-page-content jornais-admin-wrapper">
            <div className="dash-header-box header-flex-between">
                <h2 className="dash-main-title margin-0">Distribuição via FTP (Jornais)</h2>
                <button onClick={() => {
                    setFormData({ id: null, nome_jornal: '', usuario: '', ftp_host: '', ftp_user: '', ftp_password: '', ftp_pasta: '/', ativo: true });
                    setIsModalOpen(true);
                }} className='create-button'>+ Adicionar jornal parceiro</button>
            </div>

            {loading ? <p className="page-subtitle" style={{ padding: '20px' }}>Carregando parceiros...</p> : (
                <>
                    <div className="jornais-grid">
                        {jornais.length === 0 && <p className="dash-table-empty">Nenhum jornal parceiro cadastrado.</p>}
                        
                        {currentJornais.map((jornal) => (
                            <div key={jornal.id} className={`jornal-card ${jornal.ativo ? 'active-border' : 'inactive-border'}`}>
                                <h3 className="jornal-card-title">{jornal.nome_jornal}</h3>
                                <p className="jornal-card-info"><strong>Host:</strong> {jornal.ftp_host}</p>
                                <p className="jornal-card-info"><strong>Pasta:</strong> {jornal.ftp_pasta}</p>
                                <p className="jornal-card-info"><strong>Usuário FTP:</strong> {jornal.ftp_user}</p>
                                
                                <div className="jornal-card-actions">
                                    <button 
                                        onClick={() => abrirModalEdicao(jornal)}
                                        className="btn-acao btn-acao-edit"
                                        title="Editar Jornal"
                                    >
                                        Editar
                                    </button>

                                    <button 
                                        onClick={() => toggleStatus(jornal.id, jornal.ativo)}
                                        className={`btn-acao ${jornal.ativo ? 'btn-acao-archive' : 'btn-acao-unarchive'}`}
                                    >
                                        {jornal.ativo ? 'Pausar Envios' : 'Retomar Envios'}
                                    </button>

                                    <button 
                                        onClick={() => abrirModalExclusao(jornal.id, jornal.nome_jornal)}
                                        className="btn-acao btn-acao-archive"
                                        title="Excluir Jornal"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {renderPagination()}
                </>
            )}

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content">
                        <div className="dash-modal-header">
                            <h3 className="dash-modal-title">
                                {formData.id ? 'Editar Jornal Parceiro' : 'Novo Jornal Parceiro'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="dash-modal-close">✖</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form-flex">
                            <div className="modal-input-group">
                                <label className="modal-label">Nome do Veículo (Jornal)</label>
                                <input name="nome_jornal" value={formData.nome_jornal} onChange={handleInputChange} className="modal-input" required />
                            </div>

                            <div className="modal-input-group">
                                <label className="modal-label">Vincular a Conta de Usuário</label>
                                <select name="usuario" value={formData.usuario} onChange={handleInputChange} className="modal-input" required>
                                    <option value="">Selecione um Fotógrafo(a)...</option>
                                    {usuariosDisponiveis.map(u => (
                                        <option key={u.id} value={u.id}>{u.nome_completo} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <hr className="modal-separator" />
                            <p className="modal-subtitle-desc">Dados do Servidor FTP (fornecidos pelo jornal)</p>

                            <div className="modal-input-group">
                                <label className="modal-label">Host FTP (ex: ftp.oglobo.com.br)</label>
                                <input name="ftp_host" value={formData.ftp_host} onChange={handleInputChange} className="modal-input" required />
                            </div>

                            <div className="modal-input-group">
                                <label className="modal-label">Usuário FTP</label>
                                <input name="ftp_user" value={formData.ftp_user} onChange={handleInputChange} className="modal-input" required />
                            </div>

                            <div className="modal-input-group">
                                <label className="modal-label">Senha FTP</label>
                                <input type="password" name="ftp_password" value={formData.ftp_password} onChange={handleInputChange} className="modal-input" required />
                            </div>

                            <div className="modal-input-group">
                                <label className="modal-label">Pasta de Destino (padrão é /)</label>
                                <input name="ftp_pasta" value={formData.ftp_pasta} onChange={handleInputChange} className="modal-input" />
                            </div>

                            <div className="modal-actions-row">
                                <button type="button" onClick={() => setIsModalOpen(false)} className='button-outline modal-btn-half'>Cancelar</button>
                                <button type="submit" className='create-button modal-btn-half'>
                                    {formData.id ? 'Atualizar Jornal' : 'Salvar Jornal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && jornalParaExcluir && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small text-center">
                        <div className="users-block-icon">⚠️</div>
                        <h3 className="dash-modal-title text-danger">Confirmar Exclusão</h3>
                        
                        <p className="dash-modal-text">
                            Tem a certeza que deseja excluir permanentemente a ligação de envio para o <strong>"{jornalParaExcluir.nome}"</strong>?<br/><br/>
                            <span className="text-muted-small">Esta ação não pode ser desfeita.</span>
                        </p>

                        <div className="dash-modal-actions">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
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

export default AdminJornaisPage;