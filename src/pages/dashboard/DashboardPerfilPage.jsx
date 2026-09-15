// src/pages/dashboard/DashboardPerfilPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function DashboardPerfilPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
    
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        nova_senha: '',
        confirmar_senha: '',
        papel: '',
        cpf: '',
        endereco: '',
        cep: '',
        rede_social: '',
        registro_profissional: '',
        numero_registro: '',
        banco: '',
        agencia: '',
        conta: '',
        chave_pix: ''
    });

    const papeisEquipe = [
        'FOTOGRAFO', 'JORNALISTA', 'ASSESSOR_IMPRENSA', 
        'ASSESSOR_COMUNICACAO', 'VIDEOMAKER', 'CRIADOR_CONTEUDO'
    ];

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/meu-perfil/');
                const data = response.data;
                
                setFormData(prev => ({
                    ...prev,
                    nome_completo: data.nome_completo || '',
                    email: data.email || '',
                    papel: data.papel || '',
                    cpf: data.cpf || '',
                    endereco: data.endereco || '',
                    cep: data.cep || '',
                    rede_social: data.rede_social || '',
                    registro_profissional: data.registro_profissional || '',
                    numero_registro: data.numero_registro || '',
                    banco: data.banco || '',
                    agencia: data.agencia || '',
                    conta: data.conta || '',
                    chave_pix: data.chave_pix || ''
                }));
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                toast.error("Erro ao carregar os dados do perfil.");
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.nova_senha && formData.nova_senha !== formData.confirmar_senha) {
            toast.error("As novas senhas não coincidem!");
            return;
        }

        setSaving(true);
        try {
            const payload = { nome_completo: formData.nome_completo };
            if (formData.nova_senha) payload.nova_senha = formData.nova_senha;

            if (papeisEquipe.includes(formData.papel)) {
                payload.cpf = formData.cpf;
                payload.endereco = formData.endereco;
                payload.cep = formData.cep;
                payload.rede_social = formData.rede_social;
                payload.registro_profissional = formData.registro_profissional;
                payload.numero_registro = formData.numero_registro;
                payload.banco = formData.banco;
                payload.agencia = formData.agencia;
                payload.conta = formData.conta;
                payload.chave_pix = formData.chave_pix;
            }

            await axiosInstance.patch('/dashboard/meu-perfil/', payload);
            toast.success("Perfil atualizado com sucesso!");
            setFormData(prev => ({ ...prev, nova_senha: '', confirmar_senha: '' }));
            
            setShowNovaSenha(false);
            setShowConfirmarSenha(false);
            
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast.error("Não foi possível atualizar o perfil. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="dashboard-page-content"><p className="page-subtitle">A carregar o seu perfil...</p></div>;

    return (
        <div className="dashboard-page-content profile-page-wrapper">
            
            <div className="page-header profile-header">
                <h2 className="profile-main-title">Meu perfil</h2>
            </div>

            <div className="profile-card">
                <form onSubmit={handleSubmit}>
                    
                    {/* --- DADOS BÁSICOS --- */}
                    <h3 className="profile-section-title">
                        Informações básicas
                    </h3>

                    <label className="profile-label">Nome Completo</label>
                    <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} className="profile-input" required />

                    <label className="profile-label">Endereço de E-mail <span className="profile-hint">(Não pode ser alterado)</span></label>
                    <input type="email" value={formData.email} disabled className="profile-input profile-input-disabled" />

                    {/* --- DADOS PROFISSIONAIS DA EQUIPA --- */}
                    {papeisEquipe.includes(formData.papel) && (
                        <>
                            <h3 className="profile-section-title">
                                Dados profissionais
                            </h3>

                            <div className="profile-row">
                                <div className="profile-col">
                                    <label className="profile-label">CPF / CNPJ</label>
                                    <input type="text" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} className="profile-input" />
                                </div>
                                <div className="profile-col">
                                    <label className="profile-label">Rede Social</label>
                                    <input type="text" name="rede_social" placeholder="@seu_instagram" value={formData.rede_social} onChange={handleChange} className="profile-input" />
                                </div>
                            </div>

                            <div className="profile-row">
                                <div className="profile-col" style={{ flex: 2 }}>
                                    <label className="profile-label">Endereço Completo</label>
                                    <input type="text" name="endereco" placeholder="Sua rua, número, bairro..." value={formData.endereco} onChange={handleChange} className="profile-input" />
                                </div>
                                <div className="profile-col">
                                    <label className="profile-label">CEP</label>
                                    <input type="text" name="cep" placeholder="00000-000" value={formData.cep} onChange={handleChange} className="profile-input" />
                                </div>
                            </div>

                            <div className="profile-row">
                                <div className="profile-col">
                                    <label className="profile-label">Órgão Profissional (Ex: MTB)</label>
                                    <input type="text" name="registro_profissional" placeholder="Sigla do Órgão" value={formData.registro_profissional} onChange={handleChange} className="profile-input" />
                                </div>
                                <div className="profile-col">
                                    <label className="profile-label">Número de Registro</label>
                                    <input type="text" name="numero_registro" placeholder="Seu número de registro" value={formData.numero_registro} onChange={handleChange} className="profile-input" />
                                </div>
                            </div>

                            <h3 className="profile-section-title">
                                Dados de recebimento
                            </h3>
                            <p className="profile-section-desc">Utilizados para o pagamento das suas comissões.</p>

                            <div className="profile-row">
                                <div className="profile-col" style={{ flex: 2 }}>
                                    <label className="profile-label">Banco</label>
                                    <input type="text" name="banco" placeholder="Ex: Nubank, Itaú..." value={formData.banco} onChange={handleChange} className="profile-input" />
                                </div>
                                <div className="profile-col">
                                    <label className="profile-label">Agência</label>
                                    <input type="text" name="agencia" placeholder="0000" value={formData.agencia} onChange={handleChange} className="profile-input" />
                                </div>
                                <div className="profile-col">
                                    <label className="profile-label">Conta</label>
                                    <input type="text" name="conta" placeholder="000000-0" value={formData.conta} onChange={handleChange} className="profile-input" />
                                </div>
                            </div>

                            <label className="profile-label">Chave PIX</label>
                            <input type="text" name="chave_pix" placeholder="Celular, CPF, E-mail ou Aleatória" value={formData.chave_pix} onChange={handleChange} className="profile-input profile-input-highlight" />
                        </>
                    )}

                    {/* --- SEGURANÇA / SENHA --- */}
                    <h3 className="profile-section-title">
                        Segurança (opcional)
                    </h3>
                    <p className="profile-section-desc">Preencha apenas se quiser alterar a sua senha de acesso.</p>

                    <div className="profile-row">
                        
                        {/* CAMPO: NOVA SENHA COM OLHO */}
                        <div className="profile-col">
                            <label className="profile-label">Nova Senha</label>
                            <div className="password-input-container">
                                <input 
                                    type={showNovaSenha ? "text" : "password"} 
                                    name="nova_senha" 
                                    placeholder="Digite a nova senha..." 
                                    value={formData.nova_senha} 
                                    onChange={handleChange} 
                                    className="profile-input profile-input-password" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowNovaSenha(!showNovaSenha)} 
                                    className="profile-eye-btn"
                                    title={showNovaSenha ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showNovaSenha ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> )}
                                </button>
                            </div>
                        </div>

                        {/* CAMPO: CONFIRMAR SENHA COM OLHO */}
                        <div className="profile-col">
                            <label className="profile-label">Confirmar Nova Senha</label>
                            <div className="password-input-container">
                                <input 
                                    type={showConfirmarSenha ? "text" : "password"} 
                                    name="confirmar_senha" 
                                    placeholder="Repita a nova senha..." 
                                    value={formData.confirmar_senha} 
                                    onChange={handleChange} 
                                    className="profile-input profile-input-password" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} 
                                    className="profile-eye-btn"
                                    title={showConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showConfirmarSenha ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> )}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* BOTÃO DE SALVAR */}
                    <div className="profile-actions">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="create-button"
                        >
                            {saving ? 'A salvar alterações...' : 'Salvar alterações'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default DashboardPerfilPage;