// src/pages/dashboard/DashboardPerfilPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function DashboardPerfilPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // --- NOVOS ESTADOS PARA MOSTRAR/OCULTAR SENHA ---
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

    const corPrincipal = '#6c0464';

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
            
            // Opcional: Voltar a esconder as senhas após salvar
            setShowNovaSenha(false);
            setShowConfirmarSenha(false);
            
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast.error("Não foi possível atualizar o perfil. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box', fontSize: '15px', outline: 'none', marginBottom: '20px', backgroundColor: '#f8f9fa' };
    const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#444', textTransform: 'uppercase' };

    // Estilo para o botão do olho (Mostrar/Ocultar Senha)
    const eyeButtonStyle = {
        position: 'absolute', right: '12px', top: '10px', background: 'transparent', 
        border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666', padding: '0'
    };

    if (loading) return <div className="dashboard-page-content"><p>A carregar o seu perfil...</p></div>;

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            
            <div className="page-header" style={{ marginBottom: '30px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px' }}>
                <h2 style={{ paddingBottom: 10, margin: 0, fontSize: '26px', color: corPrincipal }} >👤 Meu Perfil</h2>
                
            </div>

            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSubmit}>
                    
                    {/* --- DADOS BÁSICOS --- */}
                    <h3 style={{ color: corPrincipal, marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                        🪪 Informações Básicas
                    </h3>

                    <label style={labelStyle}>Nome Completo</label>
                    <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} required />

                    <label style={labelStyle}>Endereço de E-mail <span style={{ color: '#888', fontSize: '11px', textTransform: 'none' }}>(Não pode ser alterado)</span></label>
                    <input type="email" value={formData.email} disabled style={{ ...inputStyle, color: '#6c757d', cursor: 'not-allowed' }} />

                    {/* --- DADOS PROFISSIONAIS DA EQUIPA --- */}
                    {papeisEquipe.includes(formData.papel) && (
                        <>
                            <h3 style={{ color: corPrincipal, marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                                📸 Dados Profissionais
                            </h3>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <label style={labelStyle}>CPF / CNPJ</label>
                                    <input type="text" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <label style={labelStyle}>Rede Social</label>
                                    <input type="text" name="rede_social" placeholder="@seu_instagram" value={formData.rede_social} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 2, minWidth: '250px' }}>
                                    <label style={labelStyle}>Endereço Completo</label>
                                    <input type="text" name="endereco" placeholder="Sua rua, número, bairro..." value={formData.endereco} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={labelStyle}>CEP</label>
                                    <input type="text" name="cep" placeholder="00000-000" value={formData.cep} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <label style={labelStyle}>Órgão Profissional (Ex: MTB)</label>
                                    <input type="text" name="registro_profissional" placeholder="Sigla do Órgão" value={formData.registro_profissional} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <label style={labelStyle}>Número de Registro</label>
                                    <input type="text" name="numero_registro" placeholder="Seu número de registro" value={formData.numero_registro} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                            </div>

                            <h3 style={{ color: corPrincipal, marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                                💸 Dados de Recebimento
                            </h3>
                            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Utilizados para o pagamento das suas comissões.</p>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 2, minWidth: '200px' }}>
                                    <label style={labelStyle}>Banco</label>
                                    <input type="text" name="banco" placeholder="Ex: Nubank, Itaú..." value={formData.banco} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label style={labelStyle}>Agência</label>
                                    <input type="text" name="agencia" placeholder="0000" value={formData.agencia} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={labelStyle}>Conta</label>
                                    <input type="text" name="conta" placeholder="000000-0" value={formData.conta} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', color: '#666' }} />
                                </div>
                            </div>

                            <label style={labelStyle}>Chave PIX</label>
                            <input type="text" name="chave_pix" placeholder="Celular, CPF, E-mail ou Aleatória" value={formData.chave_pix} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff', border: `1px solid ${corPrincipal}`, color: '#666' }} />
                        </>
                    )}

                    {/* --- SEGURANÇA / SENHA --- */}
                    <h3 style={{ color: corPrincipal, marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                        🔐 Segurança (Opcional)
                    </h3>
                    <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Preencha apenas se quiser alterar a sua senha de acesso.</p>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        
                        {/* CAMPO: NOVA SENHA COM OLHO */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label style={labelStyle}>Nova Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showNovaSenha ? "text" : "password"} 
                                    name="nova_senha" 
                                    placeholder="Digite a nova senha..." 
                                    value={formData.nova_senha} 
                                    onChange={handleChange} 
                                    style={{ ...inputStyle, backgroundColor: '#fff', paddingRight: '40px', color: '#666' }} 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowNovaSenha(!showNovaSenha)} 
                                    style={eyeButtonStyle}
                                    title={showNovaSenha ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showNovaSenha ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> )}
                                </button>
                            </div>
                        </div>

                        {/* CAMPO: CONFIRMAR SENHA COM OLHO */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label style={labelStyle}>Confirmar Nova Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showConfirmarSenha ? "text" : "password"} 
                                    name="confirmar_senha" 
                                    placeholder="Repita a nova senha..." 
                                    value={formData.confirmar_senha} 
                                    onChange={handleChange} 
                                    style={{ ...inputStyle, backgroundColor: '#fff', paddingRight: '40px', color: '#666' }} 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} 
                                    style={eyeButtonStyle}
                                    title={showConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showConfirmarSenha ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> )}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* BOTÃO DE SALVAR */}
                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button 
                            type="submit" 
                            disabled={saving}
                            style={{
                                padding: '12px 30px', backgroundColor: corPrincipal, color: 'white', border: 'none',
                                borderRadius: '26px', cursor: saving ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '15px',
                                opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(108, 4, 100, 0.2)'
                            }}
                        >
                            {saving ? 'A salvar alterações...' : '💾 Salvar Alterações'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default DashboardPerfilPage;