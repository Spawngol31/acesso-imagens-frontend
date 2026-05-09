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

    const papeisColaborador = ['FOTOGRAFO', 'JORNALISTA', 'ASSESSOR_IMPRENSA', 'ASSESSOR_COMUNICACAO', 'VIDEOMAKER', 'CRIADOR_CONTEUDO'];
    const isColaborador = papeisColaborador.includes(formData.papel);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(user.id, formData, profilePicFile);
    };

    // Estilo blindado contra Modo Escuro
    const inputStyle = { 
        width: '100%', 
        padding: '10px 12px', 
        marginBottom: '15px', 
        borderRadius: '6px', 
        border: '1px solid #ced4da', 
        backgroundColor: '#ffffff', 
        color: '#333333', 
        fontSize: '14px',
        boxSizing: 'border-box', 
        outline: 'none',
        colorScheme: 'light'
    };

    const labelStyle = {
        display: 'block', fontWeight: '600', fontSize: '12px', color: '#555', marginBottom: '4px', textTransform: 'uppercase'
    };

    const gridDuplo = {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 15px'
    };
    
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#6c0464', marginTop: 0, borderBottom: '2px solid #fbf0fa', paddingBottom: '15px', marginBottom: '20px' }}>Editar: {user.nome_completo || user.email}</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div style={gridDuplo}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Nome Completo</label>
                            <input name="nome_completo" value={formData.nome_completo || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Papel no Sistema</label>
                            <select name="papel" value={formData.papel} onChange={handleChange} style={inputStyle}>
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
                    </div>
                    
                    {formData.papel === 'CLIENTE' && formData.perfil_cliente && (
                        <div style={{marginTop: '10px', padding: '20px', backgroundColor: '#fdfbfe', borderRadius: '10px', border: '1px solid #e1bce0'}}>
                            <h4 style={{margin: '0 0 15px 0', color: '#6c0464'}}>💳 Perfil de Cliente</h4>
                            <div style={gridDuplo}>
                                <div>
                                    <label style={labelStyle}>CPF</label>
                                    <input name="cpf" value={formData.perfil_cliente.cpf || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>CEP</label>
                                    <input name="cep" value={formData.perfil_cliente.cep || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Endereço Completo</label>
                                    <input name="endereco" value={formData.perfil_cliente.endereco || ''} onChange={(e) => handleProfileChange('perfil_cliente', e)} style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    )}

                    {isColaborador && formData.perfil_fotografo && (
                        <div style={{marginTop: '10px', padding: '20px', backgroundColor: '#fdfbfe', borderRadius: '10px', border: '1px solid #e1bce0'}}>
                            <h4 style={{margin: '0 0 15px 0', color: '#6c0464'}}>💼 Perfil de Colaborador</h4>
                            
                            <div style={{ marginBottom: '20px', padding: '15px', border: '2px dashed #e1bce0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                                <label style={{ ...labelStyle, marginBottom: '12px' }}>Atualizar Foto de Perfil</label>
                                
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <input 
                                        type="file" 
                                        id={`foto-upload-${user.id}`} 
                                        accept="image/*" 
                                        onChange={(e) => setProfilePicFile(e.target.files[0])} 
                                        style={{ display: 'none' }} 
                                    />
                                    
                                    <label 
                                        htmlFor={`foto-upload-${user.id}`} 
                                        className="create-button" 
                                        style={{ fontSize: '13px', fontWeight: 'bold' }}
                                    >
                                        Escolher Foto...
                                    </label>
                                </div>

                                {profilePicFile ? (
                                    <p style={{fontSize: '13px', color: '#28a745', marginTop: '10px', fontWeight: '600'}}>
                                        ✅ Arquivo selecionado: {profilePicFile.name} (Será enviado ao salvar)
                                    </p>
                                ) : (
                                    <p style={{fontSize: '12px', color: '#888', marginTop: '10px'}}>
                                        Nenhuma foto selecionada.
                                    </p>
                                )}
                            </div>

                            <div style={gridDuplo}>
                                <div>
                                    <label style={labelStyle}>CPF</label>
                                    <input name="cpf" value={formData.perfil_fotografo.cpf || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>CEP</label>
                                    <input name="cep" value={formData.perfil_fotografo.cep || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Endereço Completo</label>
                                    <input name="endereco" value={formData.perfil_fotografo.endereco || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Especialidade</label>
                                    <input name="especialidade" value={formData.perfil_fotografo.especialidade || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="Ex: Esportes" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Rede Social</label>
                                    <input name="rede_social" value={formData.perfil_fotografo.rede_social || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} placeholder="@instagram" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Registro Profissional</label>
                                    <input name="registro_profissional" value={formData.perfil_fotografo.registro_profissional || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Nº do Registro</label>
                                    <input name="numero_registro" value={formData.perfil_fotografo.numero_registro || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                
                                <div style={{ gridColumn: '1 / -1', marginTop: '15px' }}>
                                    <h5 style={{ margin: '0 0 12px 0', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Dados Bancários para Pagamento</h5>
                                </div>
                                
                                <div>
                                    <label style={labelStyle}>Banco</label>
                                    <input name="banco" value={formData.perfil_fotografo.banco || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Agência</label>
                                    <input name="agencia" value={formData.perfil_fotografo.agencia || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Conta</label>
                                    <input name="conta" value={formData.perfil_fotografo.conta || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Chave PIX</label>
                                    <input name="chave_pix" value={formData.perfil_fotografo.chave_pix || ''} onChange={(e) => handleProfileChange('perfil_fotografo', e)} style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                        <button type="button" onClick={onCancel} className="create-button" >Cancelar</button>
                        <button type="submit" className="create-button" >Salvar Alterações</button>
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
    const corPrincipal = '#6c0464';

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

    // --- ESTILOS REUTILIZÁVEIS ---
    const inputStyle = {
        padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', outline: 'none', color: '#495057', background: 'white'
    };

    const btnAcaoStyle = {
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: 'none', transition: 'all 0.2s'
    };

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            <div style={{ marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '10px' }}>
                <h2 style={{ color: corPrincipal, margin: 0, fontSize: '24px' }}>👥 Gerir Usuários</h2>
            </div>

            <div style={{ backgroundColor: '#fbf0fa', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #e1bce0', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 250px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: corPrincipal, marginBottom: '5px', textTransform: 'uppercase' }}>Pesquisar por Nome ou Email</label>
                    <input 
                        type="text" 
                        placeholder="Ex: João, admin@..." 
                        value={termoBusca} 
                        onChange={(e) => setTermoBusca(e.target.value)} 
                        style={{...inputStyle, width: '100%' }} 
                    />
                </div>

                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: corPrincipal, marginBottom: '5px', textTransform: 'uppercase' }}>Filtrar por Papel</label>
                    <select value={filtroPapel} onChange={(e) => setFiltroPapel(e.target.value)} style={{...inputStyle, width: '100%' }}>
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

                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: corPrincipal, marginBottom: '5px', textTransform: 'uppercase' }}>Filtrar por Status</label>
                    <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{...inputStyle, width: '100%' }}>
                        <option value="">Todos os Status</option>
                        <option value="ativo">Apenas Ativos</option>
                        <option value="bloqueado">Apenas Bloqueados</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                    <button onClick={fetchUsers} className='create-button'>🔍 Filtrar</button>
                    <button onClick={handleLimparFiltros} className='create-button'>Limpar</button>
                </div>
            </div>

            {!hasActiveFilters && !loading && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e2f3f5', color: '#0c5460', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #bee5eb' }}>
                    ⚡ MODO RÁPIDO: A mostrar apenas os 50 cadastros mais recentes. Use os filtros acima para pesquisar contas antigas.
                </div>
            )}

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {loading ? <p style={{ color: '#666' }}>A carregar utilizadores...</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                    <th style={{ padding: '15px 10px', borderRadius: '6px 0 0 0' }}>ID</th>
                                    <th style={{ padding: '15px 10px' }}>NOME COMPLETO</th>
                                    <th style={{ padding: '15px 10px' }}>EMAIL</th>
                                    <th style={{ padding: '15px 10px' }}>PAPEL</th>
                                    <th style={{ padding: '15px 10px' }}>STATUS</th>
                                    <th style={{ padding: '15px 10px', borderRadius: '0 6px 0 0', textAlign: 'center' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px 10px', fontWeight: '500' }}>#{user.id}</td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <Link style={{ color: corPrincipal, textDecoration: 'none', fontWeight: 'bold' }} to={`/admin/users/${user.id}`}>
                                                {user.nome_completo || 'Sem Nome'}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '15px 10px', color: '#555' }}>{user.email}</td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#495057' }}>
                                                {user.papel}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ 
                                                backgroundColor: user.is_active ? '#d4edda' : '#f8d7da', 
                                                color: user.is_active ? '#155724' : '#721c24', 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                                            }}>
                                                {user.is_active ? 'Ativo' : 'Bloqueado'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => { setEditingUser(user); setIsModalOpen(true); }} 
                                                style={{ ...btnAcaoStyle, backgroundColor: '#fbf0fa', color: corPrincipal, border: `1px solid ${corPrincipal}` }}
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => abrirModalBloqueio(user)} 
                                                style={{ ...btnAcaoStyle, backgroundColor: user.is_active ? '#dc3545' : '#28a745', color: 'white' }}
                                            >
                                                {user.is_active ? 'Bloquear' : 'Desbloquear'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                                            Nenhum utilizador encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <p style={{ marginTop: '20px', fontSize: '13px', color: '#888' }}>Mostrando {users.length} utilizadores.</p>
            </div>

            {isModalOpen && (
                <UserEditForm user={editingUser} onSubmit={handleEditSubmit} onCancel={() => setIsModalOpen(false)} />
            )}

            {/* 🚀 MODAL BONITÃO DE CONFIRMAÇÃO DE BLOQUEIO */}
            {modalBloqueioAberto && usuarioParaBloquear && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                            {usuarioParaBloquear.is_active ? '🔒' : '🔓'}
                        </div>
                        
                        <h3 style={{ color: '#6c0464', marginTop: 0, marginBottom: '15px', fontSize: '22px' }}>
                            {usuarioParaBloquear.is_active ? 'Bloquear Utilizador?' : 'Desbloquear Utilizador?'}
                        </h3>
                        
                        <p style={{ color: '#555', marginBottom: '25px', lineHeight: '1.5', fontSize: '15px' }}>
                            Tem a certeza que deseja {usuarioParaBloquear.is_active ? 'bloquear o acesso de' : 'restaurar o acesso de'} <br/>
                            <strong>{usuarioParaBloquear.email}</strong>?
                        </p>
                        
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => {
                                    setModalBloqueioAberto(false);
                                    setUsuarioParaBloquear(null);
                                }} 
                                style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', color: '#555', cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: '0.2s' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarBloqueio} 
                                style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: usuarioParaBloquear.is_active ? '#dc3545' : '#28a745', color: 'white', cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: '0.2s' }}
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