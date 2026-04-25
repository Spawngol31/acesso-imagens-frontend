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
        nome_jornal: '',
        usuario: '',
        ftp_host: '',
        ftp_user: '',
        ftp_password: '',
        ftp_pasta: '/',
        ativo: true
    });
    
    // Lista de utilizadores para o dropdown (apenas Jornalistas e Assessores)
    const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);

    const corPrincipal = '#6c0464';

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
            // Buscamos usuários para poder linkar o FTP a uma conta
            const response = await axiosInstance.get('admin/users/');
            const fotografos = response.data.filter(u =>
                 u.papel === 'FOTOGRAFO'
            );
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
            await axiosInstance.post('admin/jornais-parceiros/', formData);
            toast.success("Jornal cadastrado com sucesso!");
            setIsModalOpen(false);
            fetchJornais();
            // Resetar form
            setFormData({
                nome_jornal: '', usuario: '', ftp_host: '', ftp_user: '', ftp_password: '', ftp_pasta: '/', ativo: true
            });
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao cadastrar jornal.");
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

    // 1. Função que apenas abre a janela e guarda qual jornal foi clicado
    const abrirModalExclusao = (jornalId, nomeJornal) => {
        setJornalParaExcluir({ id: jornalId, nome: nomeJornal });
        setIsDeleteModalOpen(true);
    };

    // 2. Função que realmente apaga o jornal (acionada pelo botão do modal)
    const confirmarExclusao = async () => {
        if (!jornalParaExcluir) return;

        try {
            await axiosInstance.delete(`admin/jornais-parceiros/${jornalParaExcluir.id}/`);
            toast.success("Jornal excluído com sucesso!");
            fetchJornais(); // Atualiza a lista na tela
            setIsDeleteModalOpen(false); // Fecha o modal
            setJornalParaExcluir(null); // Limpa a memória
        } catch (error) {
            toast.error("Erro ao excluir o jornal.");
            console.error(error);
        }
    };

    // Estilos
    const inputStyle = { padding: '10px', width: '100%', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'white', color: '#666' };
    const btnNovoStyle = { padding: '10px 20px', backgroundColor: corPrincipal, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #fbf0fa', paddingBottom: '15px' }}>
                <h2 style={{ color: corPrincipal, margin: 0 }}>📰 Distribuição via FTP (Jornais)</h2>
                <button onClick={() => setIsModalOpen(true)} className='create_buttom'>+ Adicionar Jornal Parceiro</button>
            </div>

            {loading ? <p>Carregando parceiros...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {jornais.length === 0 && <p>Nenhum jornal parceiro cadastrado.</p>}
                    
                    {jornais.map((jornal) => (
                        <div key={jornal.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: `5px solid ${jornal.ativo ? '#28a745' : '#dc3545'}` }}>
                            <h3 style={{ margin: '0 0 10px 0', color: corPrincipal }}>{jornal.nome_jornal}</h3>
                            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Host:</strong> {jornal.ftp_host}</p>
                            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Pasta:</strong> {jornal.ftp_pasta}</p>
                            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Usuário FTP:</strong> {jornal.ftp_user}</p>
                            <div style={{ marginTop: '15px' }}>
                                <button 
                                    onClick={() => toggleStatus(jornal.id, jornal.ativo)}
                                    style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: jornal.ativo ? '#f8d7da' : '#d4edda', color: jornal.ativo ? '#721c24' : '#155724' }}
                                >
                                    {jornal.ativo ? 'Pausar Envios' : 'Retomar Envios'}
                                </button>

                                <button 
                                    onClick={() => abrirModalExclusao(jornal.id, jornal.nome_jornal)}
                                    className= 'delete-button-pill'
                                    style={{ padding: '5px 10px', marginLeft: '15px', borderRadius: '4px', fontSize: '12px'}}
                                    title="Excluir Jornal"
                                >
                                    🗑️ Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ color: corPrincipal, marginTop: 0 }}>Novo Jornal Parceiro</h3>
                        <form onSubmit={handleSubmit}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nome do Veículo (Jornal)</label>
                            <input name="nome_jornal" value={formData.nome_jornal} onChange={handleInputChange} style={inputStyle} required />

                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Vincular a Conta de Usuário</label>
                            <select name="usuario" value={formData.usuario_id} onChange={handleInputChange} style={inputStyle} required>
                                <option value="">Selecione um Fotógrafo(a)...</option>
                                {usuariosDisponiveis.map(u => (
                                    <option key={u.id} value={u.id}>{u.nome_completo} ({u.email})</option>
                                ))}
                            </select>

                            <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
                            <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Dados do Servidor FTP (fornecidos pelo jornal)</p>

                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Host FTP (ex: ftp.oglobo.com.br)</label>
                            <input name="ftp_host" value={formData.ftp_host} onChange={handleInputChange} style={inputStyle} required />

                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Usuário FTP</label>
                            <input name="ftp_user" value={formData.ftp_user} onChange={handleInputChange} style={inputStyle} required />

                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Senha FTP</label>
                            <input type="password" name="ftp_password" value={formData.ftp_password} onChange={handleInputChange} style={inputStyle} required />

                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Pasta de Destino (padrão é /)</label>
                            <input name="ftp_pasta" value={formData.ftp_pasta} onChange={handleInputChange} style={inputStyle} />

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className='create_buttom' style={{ flex: 1, padding: '10px' }}>Cancelar</button>
                                <button type="submit" className='create_buttom' style={{ flex: 1, padding: '10px' }}>Salvar Jornal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && jornalParaExcluir && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚠️</div>
                        <h3 style={{ color: '#dc3545', marginTop: 0, marginBottom: '15px' }}>Confirmar Exclusão</h3>
                        
                        <p style={{ color: '#555', fontSize: '15px', marginBottom: '30px' }}>
                            Tem a certeza que deseja excluir permanentemente a ligação de envio para o <strong>"{jornalParaExcluir.nome}"</strong>?<br/><br/>
                            <span style={{ fontSize: '13px', color: '#888' }}>Esta ação não pode ser desfeita.</span>
                        </p>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className='create_buttom'
                                style={{ flex: 1, padding: '10px'}}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarExclusao} 
                                className= 'delete-button-pill'
                                style={{ flex: 1, padding: '10px', fontSize: '16px'}}
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