// 11src/pages/admin/AdminUserPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

// --- Componente de Formulário para Edição ---
function UserEditForm({ user, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(user);
    const [profilePicFile, setProfilePicFile] = useState(null);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (profileType, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [profileType]: { ...prev[profileType], [name]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(user.id, formData);
    };

    const handleProfilePicUpload = async () => {
        if (!profilePicFile) return;
        const fileFormData = new FormData();
        fileFormData.append('foto_perfil', profilePicFile);
        try {
            await axiosInstance.post(`/admin/users/${user.id}/upload_foto_perfil/`, fileFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Foto de perfil atualizada com sucesso!");
            setProfilePicFile(null);
            onUpdate(); // Recarrega a lista de utilizadores para obter a nova URL
        } catch (error) {
            console.error("Erro ao fazer upload da foto:", error);
            alert("Erro ao enviar a foto.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Editar Utilizador: {user.email}</h2>
                <form onSubmit={handleSubmit}>
                    <input name="nome_completo" value={formData.nome_completo || ''} onChange={handleChange} placeholder="Nome Completo" />
                    <select name="papel" value={formData.papel} onChange={handleChange}>
                        <option value="CLIENTE">Cliente</option>
                        <option value="FOTOGRAFO">Fotógrafo</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    
                    {formData.papel === 'CLIENTE' && formData.perfil_cliente && (
                        <fieldset>
                            <legend>Perfil de cliente</legend>
                            <input name="cpf" value={formData.perfil_cliente.cpf || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} placeholder="CPF" />
                            <input name="endereco" value={formData.perfil_cliente.endereco || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} placeholder="Endereço Completo" />
                            <input name="cep" value={formData.perfil_cliente.cep || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} placeholder="CEP" />
                        </fieldset>
                    )}

                    {formData.papel === 'FOTOGRAFO' && formData.perfil_fotografo && (
                        <fieldset>
                            <legend>Perfil de fotógrafo</legend>
                            <p>Dados pessoais:</p>
                            <div className="profile-pic-section">
                                <img 
                                    src={formData.perfil_fotografo.foto_perfil_url || '/images/default-avatar.png'} 
                                    alt="Foto de Perfil"
                                    className="profile-pic-preview" 
                                />
                                <div className="profile-pic-upload">
                                    <label htmlFor="profile-pic-upload" className="custom-file-upload">
                                        Escolher nova foto
                                    </label>
                                    <input id="profile-pic-upload" type="file" accept="image/*" onChange={(e) => setProfilePicFile(e.target.files[0])} />
                                    {profilePicFile && <span className="file-name">{profilePicFile.name}</span>}
                                    <button type="button" onClick={handleProfilePicUpload} className="save-button" disabled={!profilePicFile}>
                                        Salvar foto
                                    </button>
                                </div>
                            </div>
                            <hr />
                            <input name="cpf" value={formData.perfil_fotografo.cpf || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="CPF" />
                            <input name="endereco" value={formData.perfil_fotografo.endereco || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Endereço Completo" />
                            <input name="cep" value={formData.perfil_fotografo.cep || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="CEP" />
                            <hr />
                            <p>Dados profissionais:</p>
                            <input name="registro_profissional" value={formData.perfil_fotografo.registro_profissional || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Registo Profissional" />
                            <input name="numero_registro" value={formData.perfil_fotografo.numero_registro || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Nº do Registo" />
                            <hr />
                            <p>Dados bancários:</p>
                            <input name="banco" value={formData.perfil_fotografo.banco || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Banco" />
                            <input name="agencia" value={formData.perfil_fotografo.agencia || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Agência" />
                            <input name="conta" value={formData.perfil_fotografo.conta || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Conta" />
                            <input name="chave_pix" value={formData.perfil_fotografo.chave_pix || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Chave PIX" />
                        </fieldset>
                    )}

                    <div className="modal-actions">
                        <button type="button" onClick={onCancel}>Cancelar</button>
                        <button type="submit">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Componente Principal da Página ---
function AdminUserPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/users/');
            setUsers(response.data);
        } catch (error) {
            console.error("Erro ao buscar utilizadores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleBlock = async (user) => {
        const action = user.is_active ? 'bloquear' : 'desbloquear';
        if (window.confirm(`Tem a certeza que deseja ${action} o utilizador ${user.email}?`)) {
            try {
                await axiosInstance.post(`/admin/users/${user.id}/${action}/`);
                fetchUsers();
            } catch (error) {
                console.error(`Erro ao ${action} utilizador:`, error);
            }
        }
    };

    const handleEditSubmit = async (userId, userData) => {
        const dataToSubmit = { ...userData };
        if (dataToSubmit.papel === 'CLIENTE') {
            delete dataToSubmit.perfil_fotografo;
        } else if (dataToSubmit.papel === 'FOTOGRAFO') {
            delete dataToSubmit.perfil_cliente;
        }

        try {
            await axiosInstance.patch(`/admin/users/${userId}/`, dataToSubmit);
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Erro ao atualizar utilizador:", error.response?.data);
            alert("Erro ao salvar. Verifique os dados.");
        }
    };

    if (loading) return <p>A carregar utilizadores...</p>;

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Gerir utilizadores</h2>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Nome completo</th>
                            <th>Papel</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>
                                    <Link to={`/admin/users/${user.id}`}>{user.nome_completo}</Link>
                                </td>
                                <td>{user.papel}</td>
                                <td>
                                    <span className={`status ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                                        {user.is_active ? 'Ativo' : 'Bloqueado'}
                                    </span>
                                </td>
                                <td className="action-cell">
                                    <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="edit-button-pill">Editar</button>
                                    <button onClick={() => handleToggleBlock(user)} className={user.is_active ? 'delete-button-pill' : 'activate-button'}>
                                        {user.is_active ? 'Bloquear' : 'Desbloquear'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <UserEditForm
                    user={editingUser}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    onUpdate={fetchUsers}
                />
            )}
        </div>
    );
}

export default AdminUserPage;