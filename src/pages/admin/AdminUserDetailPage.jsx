// 1src/pages/admin/AdminUserDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

function AdminUserDetailPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams(); // Pega o ID da URL

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
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

    if (loading) {
        return <p>A carregar informações do utilizador...</p>;
    }

    if (!user) {
        return <p>Utilizador não encontrado.</p>;
    }

    return (
        <div className="dashboard-page-content">
            <h1>Usuário(a): {user.nome_completo}</h1>
            
            <div className="detail-card">
                <h3>Informações Gerais</h3>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nome de utilizador:</strong> {user.username}</p>
                <p><strong>Papel:</strong> {user.papel}</p>
                <p><strong>Status:</strong> <span className={`status ${user.is_active ? 'status-active' : 'status-inactive'}`}>{user.is_active ? 'Ativo' : 'Bloqueado'}</span></p>
            </div>

            {user.papel === 'CLIENTE' && user.perfil_cliente && (
                <div className="detail-card">
                    <h3>Perfil de cliente</h3>
                    <p><strong>CPF:</strong> {user.perfil_cliente.cpf || 'Não informado'}</p>
                    <p><strong>Endereço:</strong> {user.perfil_cliente.endereco || 'Não informado'}</p>
                    <p><strong>CEP:</strong> {user.perfil_cliente.cep || 'Não informado'}</p>
                </div>
            )}

            {user.papel === 'FOTOGRAFO' && user.perfil_fotografo && (
                <div className="detail-card">
                    <hr/>
                    <h3>Perfil de fotógrafo</h3>
                    <p><strong>CPF:</strong> {user.perfil_fotografo.cpf || 'Não informado'}</p>
                    <p><strong>Endereço:</strong> {user.perfil_fotografo.endereco || 'Não informado'}</p>
                    <p><strong>CEP:</strong> {user.perfil_fotografo.cep || 'Não informado'}</p>
                    <p><strong>Registo profissional:</strong> {user.perfil_fotografo.registro_profissional || 'Não informado'}</p>
                    <p><strong>Nº do registo:</strong> {user.perfil_fotografo.numero_registro || 'Não informado'}</p>
                    <hr/>
                    <h4>Dados bancários</h4>
                    <p><strong>Banco:</strong> {user.perfil_fotografo.banco || 'Não informado'}</p>
                    <p><strong>Agência:</strong> {user.perfil_fotografo.agencia || 'Não informado'}</p>
                    <p><strong>Conta:</strong> {user.perfil_fotografo.conta || 'Não informado'}</p>
                    <p><strong>Chave PIX:</strong> {user.perfil_fotografo.chave_pix || 'Não informado'}</p>
                </div>
            )}

            <div className="page-actions-footer">
                <Link to="/admin/users" className="button-outline">
                    Voltar à lista de usuário
                </Link>
            </div>
            
        </div>
    );
}

export default AdminUserDetailPage;