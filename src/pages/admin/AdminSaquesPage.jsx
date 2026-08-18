// src/pages/admin/AdminSaquesPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function AdminSaquesPage() {
    const [saques, setSaques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState('PENDENTE');

    // --- ESTADOS DO NOVO MODAL LINDÃO ---
    const [modalConfig, setModalConfig] = useState({ isOpen: false, acao: null, saqueId: null });
    const [observacao, setObservacao] = useState('');
    const [comprovante, setComprovante] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // ------------------------------------

    const corPrincipal = '#6c0464';

    const fetchSaques = async () => {
        setLoading(true);
        try {
            const params = filtroStatus ? `?status=${filtroStatus}` : '';
            const response = await axiosInstance.get(`/admin/saques/${params}`);
            setSaques(response.data);
        } catch (error) {
            toast.error("Erro ao carregar solicitações de saque.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSaques(); }, [filtroStatus]);

    // --- NOVA FUNÇÃO: COPIAR CHAVE PIX ---
    const handleCopiarPix = (chavePix) => {
        if (!chavePix) return;
        navigator.clipboard.writeText(chavePix)
            .then(() => {
                toast.success("✅ Chave PIX copiada com sucesso!");
            })
            .catch((err) => {
                console.error("Erro ao copiar o Pix: ", err);
                toast.error("Erro ao copiar a chave PIX.");
            });
    };
    // --------------------------------------

    // Ao clicar nos botões da tabela, apenas abrimos o modal com os dados
    const abrirModal = (id, acao) => {
        setModalConfig({ isOpen: true, acao: acao, saqueId: id });
        setObservacao(''); // Limpa o campo de texto
        setComprovante(null);
    };

    // Função real que envia os dados para o Django
    const confirmarAcao = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // MÁGICA: Se houver arquivo, usamos FormData em vez de JSON simples
            let data;
            let headers = {};
            
            if (modalConfig.acao === 'aprovar') {
                data = new FormData();
                data.append('observacao', observacao);
                if (comprovante) {
                    data.append('comprovante', comprovante);
                    headers = { 'Content-Type': 'multipart/form-data' };
                }
            } else {
                data = { observacao };
            }

            await axiosInstance.post(`/admin/saques/${modalConfig.saqueId}/${modalConfig.acao}/`, data, { headers });
            
            toast.success(`Saque ${modalConfig.acao === 'aprovar' ? 'Aprovado' : 'Recusado'} com sucesso!`);
            setModalConfig({ isOpen: false, acao: null, saqueId: null }); 
            fetchSaques(); 

            window.dispatchEvent(new Event('atualizar_saques_badge'));
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao processar a solicitação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'PAGO') return { bg: '#d4edda', color: '#155724' };
        if (status === 'RECUSADA') return { bg: '#f8d7da', color: '#721c24' };
        return { bg: '#fff3cd', color: '#856404' }; // PENDENTE
    };

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: corPrincipal }}>🏦 Gestão de saques</h2>
                
                <select 
                    value={filtroStatus} 
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    style={{ backgroundColor: '#fff', color:'#666', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                >
                    <option value="">Todos os Status</option>
                    <option value="PENDENTE">Apenas pendentes (fila de pagamento)</option>
                    <option value="PAGO">Já pagos</option>
                    <option value="RECUSADA">Recusados</option>
                </select>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {loading ? <p>A carregar dados...</p> : saques.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>Nenhuma solicitação encontrada para este filtro.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderRadius: '6px 0 0 0' }}>DATA</th>
                                    <th style={{ padding: '12px' }}>FOTÓGRAFO</th>
                                    <th style={{ padding: '12px' }}>VALOR</th>
                                    <th style={{ padding: '12px' }}>CHAVE PIX</th>
                                    <th style={{ padding: '12px' }}>STATUS</th>
                                    <th style={{ padding: '12px', borderRadius: '0 6px 0 0', textAlign: 'center' }}>AÇÕES ADMIN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saques.map((saque) => {
                                    const style = getStatusStyle(saque.status);
                                    return (
                                        <tr key={saque.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px', color: '#555' }}>{new Date(saque.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>
                                                {saque.fotografo_nome}<br/>
                                                <span style={{fontWeight: 'normal', fontSize: '12px', color: '#888'}}>{saque.fotografo_email}</span>
                                            </td>
                                            <td style={{ padding: '12px', fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>R$ {parseFloat(saque.valor).toFixed(2)}</td>
                                            <td style={{ padding: '12px', color: '#333' }}>
                                                {/* --- BOTÃO DE COPIAR ADICIONADO AQUI --- */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ backgroundColor: '#f8f9fa', padding: '6px 10px', borderRadius: '4px', fontFamily: 'monospace', color: '#333' }}>
                                                        {saque.chave_pix}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleCopiarPix(saque.chave_pix)}
                                                        title="Copiar Chave PIX"
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '18px',
                                                            padding: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: corPrincipal,
                                                            transition: 'transform 0.2s',
                                                            opacity: 0.8
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.opacity = '1'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ backgroundColor: style.bg, color: style.color, padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {saque.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {saque.status === 'PENDENTE' ? (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button onClick={() => abrirModal(saque.id, 'recusar')} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Recusar</button>
                                                        <button onClick={() => abrirModal(saque.id, 'aprovar')} style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Confirmar PIX</button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#888' }}>{saque.observacao || 'Finalizado'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 🚀 MODAL ELEGANTE */}
            {modalConfig.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: modalConfig.acao === 'aprovar' ? '#28a745' : '#dc3545', margin: '0 0 20px 0' }}>
                            {modalConfig.acao === 'aprovar' ? '✅ Confirmar Pagamento' : '❌ Recusar Saque'}
                        </h3>
                        
                        <form onSubmit={confirmarAcao} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {modalConfig.acao === 'aprovar' && (
                                <div style={{ backgroundColor: '#fbf0fa', padding: '20px', borderRadius: '8px', border: '2px dashed #e1bce0', textAlign: 'center' }}>
                                    
                                    <label style={{ display: 'inline-block', backgroundColor: '#6c0464', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                        📎 Procurar Ficheiro (Opcional)
                                        <input 
                                            type="file" 
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setComprovante(e.target.files[0])}
                                            style={{ display: 'none' }} 
                                        />
                                    </label>

                                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#555' }}>
                                        {comprovante ? (
                                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                                ✅ Selecionado: {comprovante.name}
                                            </span>
                                        ) : (
                                            "Nenhum ficheiro selecionado (Imagem ou PDF)"
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>
                                    {modalConfig.acao === 'aprovar' ? 'ID da Transação Bancária (Opcional)' : 'Motivo da Recusa (Obrigatório)'}
                                </label>
                                <textarea 
                                    rows="3"
                                    required={modalConfig.acao === 'recusar'}
                                    value={observacao} 
                                    onChange={(e) => setObservacao(e.target.value)}
                                    placeholder={modalConfig.acao === 'aprovar' ? 'Ex: ID E000000002024...' : 'Ex: A chave PIX informada não está cadastrada...'}
                                    style={{ backgroundColor: '#fff', color: '#666', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setModalConfig({ isOpen: false, acao: null, saqueId: null })} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#555' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: modalConfig.acao === 'aprovar' ? '#28a745' : '#dc3545', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                    {isSubmitting ? 'Aguarde...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default AdminSaquesPage;