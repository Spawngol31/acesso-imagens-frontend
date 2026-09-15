// src/pages/admin/AdminUserPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// --- COMPONENTE DE EDIÇÃO (MODAL) FINAL E CORRIGIDO ---
function UserEditForm({ user, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(user);
    const [profilePicFile, setProfilePicFile] = useState(null);

    useEffect(() => { setFormData(user); }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleProfileChange = (profileType, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [profileType]: { ...prev[profileType], [name]: value }
        }));
    };

    const papeisColaborador = ['FOTOGRAFO', 'JORNALISTA', 'ASSESSOR_IMPRENSA', 'ASSESSOR_COMUNICACAO', 'VIDEOMAKER', 'CRIADOR_CONTEUDO'];
    const isColaborador = papeisColaborador.includes(formData.papel);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(user.id, formData, profilePicFile);
    };

    return (
        <div className="dash-modal-overlay">
            <div className="dash-modal-content edit-user-modal">
                <h2 className="dash-modal-title" style={{ marginBottom: '20px', paddingBottom: '15px' }}>Editar: {user.nome_completo || user.email}</h2>
                <form onSubmit={handleSubmit} className="modal-form-flex">
                    
                    <div className="modal-grid-duplo">
                        <div className="modal-full-width">
                            <label className="modal-label">Nome Completo</label>
                            <input name="nome_completo" value={formData.nome_completo || ''} onChange={handleChange} className="modal-input" />
                        </div>
                        <div className="modal-full-width">
                            <label className="modal-label">Papel no Sistema</label>
                            <select name="papel" value={formData.papel} onChange={handleChange} className="modal-input">
                                <option value="CLIENTE">Cliente</option>
                                <option value="ADMIN">Administrador</option>
                                <option disabled>--- Equipe ---</option>
                                <option value="FOTOGRAFO">Fotógrafo(a)</option>
                                <option value="JORNALISTA">Jornalista</option>
                                <option value="ASSESSOR_IMPRENSA">Assessor(a) de Imprensa</option>
                                <option value="ASSESSOR_COMUNICACAO">Assessor(a) de Comunicação</option>
                                <option value="VIDEOMAKER">Videomaker</option>
                                <option value="CRIADOR_CONTEUDO">Criador(a) de Conteúdo</option>
                            </select>
                        </div>
                        
                        {/* --- 🔥 NOVO CHECKBOX DE VISIBILIDADE PARA O ADMIN 🔥 --- */}
                        {isColaborador && (
                            <div className="modal-full-width team-visibility-box">
                                <label className="team-visibility-label">
                                    <input 
                                        type="checkbox" 
                                        name="mostrar_no_quem_somos" 
                                        checked={formData.mostrar_no_quem_somos !== false} 
                                        onChange={handleChange} 
                                        className="custom-checkbox visibility-check"
                                    />
                                    Mostrar profissional na página "Quem Somos"
                                </label>
                                <p className="team-visibility-desc">
                                    Se desmarcado, este profissional venderá fotos normalmente no site, mas ficará oculto na página oficial da sua equipe.
                                </p>
                            </div>
                        )}
                        {/* --------------------------------------------------------- */}
                    </div>
                    
                    {formData.papel === 'CLIENTE' && formData.perfil_cliente && (
                        <div className="user-profile-section">
                            <h4 className="user-profile-title">Perfil de Cliente</h4>
                            <div className="modal-grid-duplo">
                                <div>
                                    <label className="modal-label">CPF</label>
                                    <input name="cpf" value={formData.perfil_cliente.cpf || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">CEP</label>
                                    <input name="cep" value={formData.perfil_cliente.cep || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} className="modal-input" />
                                </div>
                                <div className="modal-full-width">
                                    <label className="modal-label">Endereço Completo</label>
                                    <input name="endereco" value={formData.perfil_cliente.endereco || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} className="modal-input" />
                                </div>
                            </div>
                        </div>
                    )}

                    {isColaborador && formData.perfil_fotografo && (
                        <div className="user-profile-section">
                            <h4 className="user-profile-title">Perfil de Colaborador</h4>
                            
                            <div className="profile-pic-upload-box">
                                <label className="modal-label">Atualizar Foto de Perfil</label>
                                
                                <div className="profile-pic-actions">
                                    <input 
                                        type="file" 
                                        id={`foto-upload-${user.id}`} 
                                        accept="image/*" 
                                        onChange={(e) => setProfilePicFile(e.target.files[0])} 
                                        style={{ display: 'none' }} 
                                    />
                                    
                                    <label htmlFor={`foto-upload-${user.id}`} className="create-button profile-pic-btn">
                                        Escolher Foto...
                                    </label>
                                </div>

                                {profilePicFile ? (
                                    <p className="profile-pic-success">
                                        ✅ Arquivo selecionado: {profilePicFile.name} (Será enviado ao salvar)
                                    </p>
                                ) : (
                                    <p className="profile-pic-empty">
                                        Nenhuma foto selecionada.
                                    </p>
                                )}
                            </div>

                            <div className="modal-grid-duplo">
                                <div>
                                    <label className="modal-label">CPF</label>
                                    <input name="cpf" value={formData.perfil_fotografo.cpf || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">CEP</label>
                                    <input name="cep" value={formData.perfil_fotografo.cep || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                <div className="modal-full-width">
                                    <label className="modal-label">Endereço Completo</label>
                                    <input name="endereco" value={formData.perfil_fotografo.endereco || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Especialidade</label>
                                    <input name="especialidade" value={formData.perfil_fotografo.especialidade || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Ex: Esportes" className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Rede Social</label>
                                    <input name="rede_social" value={formData.perfil_fotografo.rede_social || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="@instagram" className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Registro Profissional</label>
                                    <input name="registro_profissional" value={formData.perfil_fotografo.registro_profissional || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Nº do Registro</label>
                                    <input name="numero_registro" value={formData.perfil_fotografo.numero_registro || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                
                                <div className="modal-full-width modal-subtitle-box">
                                    <h5 className="modal-subtitle">Dados Bancários para Pagamento</h5>
                                </div>
                                
                                <div>
                                    <label className="modal-label">Banco</label>
                                    <input name="banco" value={formData.perfil_fotografo.banco || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Agência</label>
                                    <input name="agencia" value={formData.perfil_fotografo.agencia || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Conta</label>
                                    <input name="conta" value={formData.perfil_fotografo.conta || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                                <div>
                                    <label className="modal-label">Chave PIX</label>
                                    <input name="chave_pix" value={formData.perfil_fotografo.chave_pix || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} className="modal-input" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions-row">
                        <button type="button" onClick={onCancel} className="button-outline modal-btn-half" >Cancelar</button>
                        <button type="submit" className="create-button modal-btn-half" >Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL DA PÁGINA (ATUALIZADO) ---
function AdminUserPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // 🚀 NOVOS ESTADOS PARA O MODAL DE BLOQUEIO
    const [modalBloqueioAberto, setModalBloqueioAberto] = useState(false);
    const [usuarioParaBloquear, setUsuarioParaBloquear] = useState(null);

    // --- ESTADOS PARA OS FILTROS ---
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroPapel, setFiltroPapel] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    
    const hasActiveFilters = termoBusca !== '' || filtroPapel !== '' || filtroStatus !== '';

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (termoBusca) params.append('q', termoBusca);
            if (filtroPapel) params.append('papel', filtroPapel);
            if (filtroStatus) params.append('status', filtroStatus);

            const response = await axiosInstance.get(`/admin/users/?${params.toString()}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Erro ao buscar utilizadores:", error);
            toast.error("Erro ao carregar a lista de utilizadores.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleLimparFiltros = () => {
        setTermoBusca('');
        setFiltroPapel('');
        setFiltroStatus('');
        setTimeout(() => {
            fetchUsers();
        }, 100);
    };

    // 🚀 NOVA LÓGICA DE BLOQUEIO (ABRE O MODAL)
    const abrirModalBloqueio = (user) => {
        setUsuarioParaBloquear(user);
        setModalBloqueioAberto(true);
    };

    // 🚀 NOVA LÓGICA DE BLOQUEIO (CONFIRMA A AÇÃO)
    const confirmarBloqueio = async () => {
        if (!usuarioParaBloquear) return;
        const action = usuarioParaBloquear.is_active ? 'bloquear' : 'desbloquear';
        
        try {
            await axiosInstance.post(`/admin/users/${usuarioParaBloquear.id}/${action}/`);
            toast.success(`Utilizador ${action === 'bloquear' ? 'bloqueado' : 'desbloqueado'} com sucesso!`);
            
            setModalBloqueioAberto(false);
            setUsuarioParaBloquear(null);
            fetchUsers(); // Recarrega a lista
        } catch (error) {
            console.error(`Erro ao ${action} utilizador:`, error);
            toast.error("Erro ao alterar o status do utilizador.");
        }
    };

    const handleEditSubmit = async (userId, userData, profileFile) => {
        const dataToSubmit = { ...userData };
        const papeisColaborador = ['FOTOGRAFO', 'JORNALISTA', 'ASSESSOR_IMPRENSA', 'ASSESSOR_COMUNICACAO', 'VIDEOMAKER', 'CRIADOR_CONTEUDO'];

        if (dataToSubmit.papel === 'CLIENTE') {
            delete dataToSubmit.perfil_fotografo; 
        } else if (papeisColaborador.includes(dataToSubmit.papel)) {
            delete dataToSubmit.perfil_cliente;
        }

        try {
            await axiosInstance.patch(`/admin/users/${userId}/`, dataToSubmit);
            if (profileFile) {
                const fileFormData = new FormData();
                fileFormData.append('foto_perfil', profileFile);
                await axiosInstance.post(`/admin/users/${userId}/upload_foto_perfil/`, fileFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            toast.success("Utilizador atualizado com sucesso!");
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            toast.error("Erro ao salvar. Verifique os dados.");
            console.error(error);
        }
    };

    return (
        <div className="dashboard-page-content users-page-wrapper">
            
            <div className="dash-header-box">
                <h2 className="dash-main-title">Gerir usuários</h2>
            </div>

            <div className="users-filter-card">
                <div className="filter-search-col">
                    <label className="users-filter-label">Pesquisar por Nome ou Email</label>
                    <input 
                        type="text" 
                        placeholder="Ex: João, admin@..." 
                        value={termoBusca} 
                        onChange={(e) => setTermoBusca(e.target.value)} 
                        className="users-filter-input"
                    />
                </div>

                <div className="filter-select-col">
                    <label className="users-filter-label">Filtrar por Papel</label>
                    <select value={filtroPapel} onChange={(e) => setFiltroPapel(e.target.value)} className="users-filter-input">
                        <option value="">Todos os Papéis</option>
                        <option value="CLIENTE">Cliente</option>
                        <option value="FOTOGRAFO">Fotógrafo(a)</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="JORNALISTA">Jornalista</option>
                        <option value="ASSESSOR_IMPRENSA">Assessor de Imprensa</option>
                        <option value="ASSESSOR_COMUNICACAO">Assessor de Comunicação</option>
                        <option value="VIDEOMAKER">Videomaker</option>
                        <option value="CRIADOR_CONTEUDO">Criador de Conteúdo</option>
                    </select>
                </div>

                <div className="filter-select-col">
                    <label className="users-filter-label">Filtrar por Status</label>
                    <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="users-filter-input">
                        <option value="">Todos os Status</option>
                        <option value="ativo">Apenas Ativos</option>
                        <option value="bloqueado">Apenas Bloqueados</option>
                    </select>
                </div>

                <div className="filter-actions-col">
                    <button onClick={fetchUsers} className='create-button'>Filtrar</button>
                    <button onClick={handleLimparFiltros} className='create-button'>Limpar</button>
                </div>
            </div>

            {!hasActiveFilters && !loading && (
                <div className="users-fast-mode-alert">
                    MODO RÁPIDO: A mostrar apenas os 50 cadastros mais recentes. Use os filtros acima para pesquisar contas antigas.
                </div>
            )}

            <div className="dash-table-card">
                {loading ? <p className="page-subtitle" style={{ padding: '20px' }}>A carregar utilizadores...</p> : (
                    <div className="dash-table-responsive">
                        <table className="dash-table min-width-800">
                            <thead>
                                <tr>
                                    <th className="th-left-radius">ID</th>
                                    <th>NOME COMPLETO</th>
                                    <th>EMAIL</th>
                                    <th>PAPEL</th>
                                    <th>STATUS</th>
                                    <th className="th-right-radius text-center">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="dash-td-bold">#{user.id}</td>
                                        <td>
                                            <Link className="users-link-name" to={`/admin/users/${user.id}`}>
                                                {user.nome_completo || 'Sem Nome'}
                                            </Link>
                                        </td>
                                        <td className="dash-td-muted">{user.email}</td>
                                        <td>
                                            <span className="user-role-badge">
                                                {user.papel}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge-lg ${user.is_active ? 'status-badge-accepted' : 'status-badge-rejected'}`}>
                                                {user.is_active ? 'Ativo' : 'Bloqueado'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="dash-action-buttons">
                                                <button 
                                                    onClick={() => { setEditingUser(user); setIsModalOpen(true); }} 
                                                    className="btn-acao btn-acao-edit"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => abrirModalBloqueio(user)} 
                                                    className={`btn-acao ${user.is_active ? 'btn-acao-archive' : 'btn-acao-unarchive'}`}
                                                >
                                                    {user.is_active ? 'Bloquear' : 'Desbloquear'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="dash-table-empty">
                                            Nenhum utilizador encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <p className="users-count-text">Mostrando {users.length} utilizadores.</p>
            </div>

            {isModalOpen && (
                <UserEditForm user={editingUser} onSubmit={handleEditSubmit} onCancel={() => setIsModalOpen(false)} />
            )}

            {/* 🚀 MODAL BONITÃO DE CONFIRMAÇÃO DE BLOQUEIO */}
            {modalBloqueioAberto && usuarioParaBloquear && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        
                        <div className="users-block-icon">
                            {usuarioParaBloquear.is_active ? '🔒' : '🔓'}
                        </div>
                        
                        <h3 className="dash-modal-title">
                            {usuarioParaBloquear.is_active ? 'Bloquear Utilizador?' : 'Desbloquear Utilizador?'}
                        </h3>
                        
                        <p className="dash-modal-text">
                            Tem a certeza que deseja {usuarioParaBloquear.is_active ? 'bloquear o acesso de' : 'restaurar o acesso de'} <br/>
                            <strong>{usuarioParaBloquear.email}</strong>?
                        </p>
                        
                        <div className="dash-modal-actions">
                            <button 
                                onClick={() => {
                                    setModalBloqueioAberto(false);
                                    setUsuarioParaBloquear(null);
                                }} 
                                className="modal-btn-cancel"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarBloqueio} 
                                className={`modal-btn-confirm ${usuarioParaBloquear.is_active ? 'btn-danger' : 'btn-success'}`}
                            >
                                Sim, {usuarioParaBloquear.is_active ? 'Bloquear' : 'Desbloquear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUserPage;