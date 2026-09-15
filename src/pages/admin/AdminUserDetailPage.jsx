// src/pages/admin/AdminUserDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance'; 

function AdminUserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/admin/users/${id}/`);
                setUser(response.data);
            } catch (error) {
                console.error("Erro ao buscar detalhes do utilizador:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return <div className="page-subtitle" style={{ padding: '40px', textAlign: 'center' }}>A carregar detalhes do utilizador...</div>;
    if (!user) return <div className="page-subtitle text-danger" style={{ padding: '40px', textAlign: 'center' }}>Utilizador não encontrado.</div>;

    // --- IDENTIFICA QUAL PERFIL MOSTRAR ---
    const perfil = user.perfil_fotografo || user.perfil_cliente || {};
    const isEquipa = ['FOTOGRAFO', 'JORNALISTA', 'ASSESSOR_IMPRENSA', 'ASSESSOR_COMUNICACAO', 'VIDEOMAKER', 'CRIADOR_CONTEUDO'].includes(user.papel);

    return (
        <div className="dashboard-page-content user-detail-page-wrapper">
            
            {/* CABEÇALHO COM BOTÃO VOLTAR E NOME */}
            <div className="user-detail-header-row">
                <div className="user-detail-title-group">
                    <button onClick={() => navigate(-1)} className='button-outline user-back-btn'>
                        ← Voltar
                    </button>
                    <h2 className="user-detail-main-title">
                        {user.nome_completo || 'Utilizador sem nome'}
                    </h2>
                </div>
                
                {/* BADGE DE STATUS GRANDE */}
                <div className={`status-badge-lg ${user.is_active ? 'status-badge-accepted' : 'status-badge-rejected'}`}>
                    {user.is_active ? '🟢 Conta Ativa' : '🔴 Conta Bloqueada'}
                </div>
            </div>

            {/* GRID PRINCIPAL: Divide a tela em duas colunas em PCs */}
            <div className="user-detail-grid">
                
                {/* CARTÃO 1: INFORMAÇÕES GERAIS */}
                <div className="user-detail-card">
                    <h3 className="user-detail-section-title">Informações da Conta</h3>
                    <div className="user-info-grid">
                        <div>
                            <span className="user-info-label">ID do Sistema</span>
                            <p className="user-info-value">#{user.id}</p>
                        </div>
                        <div>
                            <span className="user-info-label">Papel / Cargo</span>
                            <span className="user-role-pill">
                                {user.papel}
                            </span>
                        </div>
                        <div className="full-width-col">
                            <span className="user-info-label">E-mail de Acesso</span>
                            <p className="user-info-value">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* CARTÃO 2: PERFIL DE COLABORADOR OU CLIENTE */}
                {(isEquipa || user.papel === 'CLIENTE') && (
                    <div className="user-detail-card">
                        <h3 className="user-detail-section-title">
                            {isEquipa ? 'Perfil Profissional' : 'Dados do Cliente'}
                        </h3>
                        <div className="user-info-grid">
                            <div>
                                <span className="user-info-label">CPF</span>
                                <p className="user-info-value">{perfil.cpf || 'Não informado'}</p>
                            </div>
                            
                            {isEquipa && (
                                <div>
                                    <span className="user-info-label">Rede Social</span>
                                    <p className="user-info-value social-highlight">
                                        {perfil.rede_social || 'Não informado'}
                                    </p>
                                </div>
                            )}

                            {isEquipa && (
                                <>
                                    <div>
                                        <span className="user-info-label">Registo Profissional</span>
                                        <p className="user-info-value">{perfil.registro_profissional || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="user-info-label">Nº do Registo</span>
                                        <p className="user-info-value">{perfil.numero_registro || '-'}</p>
                                    </div>
                                </>
                            )}
                            
                            <div className="user-address-box">
                                <span className="user-info-label">Endereço Completo</span>
                                <p className="user-info-value">{perfil.endereco ? `${perfil.endereco} - CEP: ${perfil.cep}` : 'Não informado'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CARTÃO 3: DADOS BANCÁRIOS (APENAS PARA EQUIPA) */}
                {isEquipa && (
                    <div className="user-detail-card bank-card-highlight">
                        <h3 className="user-detail-section-title">Dados Bancários para Pagamento</h3>
                        <div className="user-info-grid">
                            <div>
                                <span className="user-info-label">Banco</span>
                                <p className="user-info-value">{perfil.banco || 'Não informado'}</p>
                            </div>
                            <div>
                                <span className="user-info-label">Agência</span>
                                <p className="user-info-value">{perfil.agencia || 'Não informado'}</p>
                            </div>
                            <div>
                                <span className="user-info-label">Conta</span>
                                <p className="user-info-value">{perfil.conta || 'Não informado'}</p>
                            </div>
                            <div>
                                <span className="user-info-label">Chave PIX</span>
                                <p className="pix-badge-value">
                                    {perfil.chave_pix || 'Não informada'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default AdminUserDetailPage;