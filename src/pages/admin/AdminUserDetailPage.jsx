import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance'; // Ajuste o caminho se necessário

function AdminUserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const corPrincipal = '#6c0464';

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Ajuste a rota se a sua API for diferente
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

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>A carregar detalhes do utilizador...</div>;
    if (!user) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Utilizador não encontrado.</div>;

    // --- IDENTIFICA QUAL PERFIL MOSTRAR ---
    const perfil = user.perfil_fotografo || user.perfil_cliente || {};
    const isEquipa = ['FOTOGRAFO', 'JORNALISTA', 'ASSESSOR_IMPRENSA', 'ASSESSOR_COMUNICACAO', 'VIDEOMAKER', 'CRIADOR_CONTEUDO'].includes(user.papel);

    // --- ESTILOS MODERNOS (CSS in JS) ---
    const pageStyle = { maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' };
    const cardStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', marginBottom: '20px' };
    const sectionTitleStyle = { color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '10px', marginTop: 0, marginBottom: '20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' };
    const infoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' };
    const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: '4px' };
    const valueStyle = { fontSize: '15px', color: '#333', margin: 0, fontWeight: '500' };

    return (
        <div className="dashboard-page-content" style={pageStyle}>
            
            {/* CABEÇALHO COM BOTÃO VOLTAR E NOME */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate(-1)} className='create-button' >
                        ← Voltar
                    </button>
                    <h2 style={{ margin: 0, color: corPrincipal, fontSize: '26px' }}>
                        {user.nome_completo || 'Utilizador sem nome'}
                    </h2>
                </div>
                
                {/* BADGE DE STATUS GRANDE */}
                <div style={{ padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', backgroundColor: user.is_active ? '#d4edda' : '#f8d7da', color: user.is_active ? '#155724' : '#721c24', border: `1px solid ${user.is_active ? '#c3e6cb' : '#f5c6cb'}` }}>
                    {user.is_active ? '🟢 Conta Ativa' : '🔴 Conta Bloqueada'}
                </div>
            </div>

            {/* GRID PRINCIPAL: Divide a tela em duas colunas em PCs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                
                {/* CARTÃO 1: INFORMAÇÕES GERAIS */}
                <div style={cardStyle}>
                    <h3 style={sectionTitleStyle}>👤 Informações da Conta</h3>
                    <div style={infoGridStyle}>
                        <div>
                            <span style={labelStyle}>ID do Sistema</span>
                            <p style={valueStyle}>#{user.id}</p>
                        </div>
                        <div>
                            <span style={labelStyle}>Papel / Cargo</span>
                            <span style={{ backgroundColor: '#fbf0fa', color: corPrincipal, padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', border: `1px solid #e1bce0`, display: 'inline-block' }}>
                                {user.papel}
                            </span>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <span style={labelStyle}>E-mail de Acesso</span>
                            <p style={valueStyle}>📧 {user.email}</p>
                        </div>
                    </div>
                </div>

                {/* CARTÃO 2: PERFIL DE COLABORADOR OU CLIENTE */}
                {(isEquipa || user.papel === 'CLIENTE') && (
                    <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>
                            {isEquipa ? '💼 Perfil Profissional' : '🛒 Dados do Cliente'}
                        </h3>
                        <div style={infoGridStyle}>
                            <div>
                                <span style={labelStyle}>CPF</span>
                                <p style={valueStyle}>{perfil.cpf || 'Não informado'}</p>
                            </div>
                            
                            {isEquipa && (
                                <div>
                                    <span style={labelStyle}>Rede Social</span>
                                    <p style={{ ...valueStyle, color: corPrincipal, fontWeight: 'bold' }}>
                                        {perfil.rede_social || 'Não informado'}
                                    </p>
                                </div>
                            )}

                            {isEquipa && (
                                <>
                                    <div>
                                        <span style={labelStyle}>Registo Profissional</span>
                                        <p style={valueStyle}>{perfil.registro_profissional || '-'}</p>
                                    </div>
                                    <div>
                                        <span style={labelStyle}>Nº do Registo</span>
                                        <p style={valueStyle}>{perfil.numero_registro || '-'}</p>
                                    </div>
                                </>
                            )}
                            
                            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px' }}>
                                <span style={labelStyle}>Endereço Completo</span>
                                <p style={valueStyle}>📍 {perfil.endereco ? `${perfil.endereco} - CEP: ${perfil.cep}` : 'Não informado'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CARTÃO 3: DADOS BANCÁRIOS (APENAS PARA EQUIPA) */}
                {isEquipa && (
                    <div style={{ ...cardStyle, gridColumn: '1 / -1', backgroundColor: '#fdfbfe', borderColor: '#e1bce0' }}>
                        <h3 style={sectionTitleStyle}>🏦 Dados Bancários para Pagamento</h3>
                        <div style={infoGridStyle}>
                            <div>
                                <span style={labelStyle}>Banco</span>
                                <p style={valueStyle}>{perfil.banco || 'Não informado'}</p>
                            </div>
                            <div>
                                <span style={labelStyle}>Agência</span>
                                <p style={valueStyle}>{perfil.agencia || 'Não informado'}</p>
                            </div>
                            <div>
                                <span style={labelStyle}>Conta</span>
                                <p style={valueStyle}>{perfil.conta || 'Não informado'}</p>
                            </div>
                            <div>
                                <span style={labelStyle}>Chave PIX</span>
                                <p style={{ ...valueStyle, backgroundColor: '#d4edda', color: '#155724', padding: '4px 10px', borderRadius: '4px', display: 'inline-block', border: '1px solid #c3e6cb' }}>
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