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
                toast.success("Chave PIX copiada com sucesso!");
            })
            .catch((err) => {
                console.error("Erro ao copiar o Pix: ", err);
                toast.error("Erro ao copiar a chave PIX.");
            });
    };
    // --------------------------------------

    const abrirModal = (id, acao) => {
        setModalConfig({ isOpen: true, acao: acao, saqueId: id });
        setObservacao(''); 
        setComprovante(null);
    };

    const confirmarAcao = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
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
        if (status === 'PAGO') return 'status-badge-paid';
        if (status === 'RECUSADA') return 'status-badge-rejected';
        return 'status-badge-pending'; // PENDENTE
    };

    return (
        <div className="dashboard-page-content saques-admin-wrapper">
            <div className="dash-header-box header-flex-between">
                <h2 className="dash-main-title margin-0">Gestão de saques</h2>
                
                <select 
                    value={filtroStatus} 
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="saques-admin-filter"
                >
                    <option value="">Todos os Status</option>
                    <option value="PENDENTE">Pendentes</option>
                    <option value="PAGO">Já pagos</option>
                    <option value="RECUSADA">Recusados</option>
                </select>
            </div>

            <div className="dash-table-card">
                {loading ? <p className="page-subtitle" style={{ padding: '20px' }}>A carregar dados...</p> : saques.length === 0 ? (
                    <p className="dash-table-empty">Nenhuma solicitação encontrada para este filtro.</p>
                ) : (
                    <div className="dash-table-responsive">
                        <table className="dash-table min-width-900">
                            <thead>
                                <tr>
                                    <th className="th-left-radius">DATA</th>
                                    <th>FOTÓGRAFO</th>
                                    <th>VALOR</th>
                                    <th>CHAVE PIX</th>
                                    <th>STATUS</th>
                                    <th className="th-right-radius text-center">AÇÕES ADMIN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saques.map((saque) => {
                                    return (
                                        <tr key={saque.id}>
                                            <td className="col-date">
                                                {new Date(saque.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="col-client-bold">
                                                {saque.fotografo_nome}<br/>
                                                <span className="client-email-muted">{saque.fotografo_email}</span>
                                            </td>
                                            <td className="col-comission txt-lg">
                                                R$ {parseFloat(saque.valor).toFixed(2)}
                                            </td>
                                            <td className="col-pix-copy">
                                                <div className="pix-copy-box">
                                                    <div className="pix-key-text">
                                                        {saque.chave_pix}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleCopiarPix(saque.chave_pix)}
                                                        title="Copiar Chave PIX"
                                                        className="pix-copy-btn"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge-lg ${getStatusStyle(saque.status)}`}>
                                                    {saque.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {saque.status === 'PENDENTE' ? (
                                                    <div className="admin-saque-actions">
                                                        <button onClick={() => abrirModal(saque.id, 'recusar')} className="btn-acao-outline-danger">Recusar</button>
                                                        <button onClick={() => abrirModal(saque.id, 'aprovar')} className="btn-acao-success">✅ Confirmar PIX</button>
                                                    </div>
                                                ) : (
                                                    <span className="saque-obs-muted">{saque.observacao || 'Finalizado'}</span>
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
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className={`dash-modal-title ${modalConfig.acao === 'aprovar' ? 'text-success' : 'text-danger'}`}>
                            {modalConfig.acao === 'aprovar' ? 'Confirmar Pagamento' : 'Recusar Saque'}
                        </h3>
                        
                        <form onSubmit={confirmarAcao} className="modal-form-flex">
                            
                            {modalConfig.acao === 'aprovar' && (
                                <div className="saque-comprovante-box">
                                    
                                    <label className="create-button comprovante-btn">
                                        📎 Procurar Ficheiro (Opcional)
                                        <input 
                                            type="file" 
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setComprovante(e.target.files[0])}
                                            style={{ display: 'none' }} 
                                        />
                                    </label>

                                    <div className="comprovante-status-text">
                                        {comprovante ? (
                                            <span className="text-success-bold">
                                                Selecionado: {comprovante.name}
                                            </span>
                                        ) : (
                                            "Nenhum ficheiro selecionado (Imagem ou PDF)"
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="modal-input-group">
                                <label className="modal-label">
                                    {modalConfig.acao === 'aprovar' ? 'ID da Transação Bancária (Opcional)' : 'Motivo da Recusa (Obrigatório)'}
                                </label>
                                <textarea 
                                    rows="3"
                                    required={modalConfig.acao === 'recusar'}
                                    value={observacao} 
                                    onChange={(e) => setObservacao(e.target.value)}
                                    placeholder={modalConfig.acao === 'aprovar' ? 'Ex: ID E000000002024...' : 'Ex: A chave PIX informada não está cadastrada...'}
                                    className="modal-input modal-textarea" 
                                />
                            </div>

                            <div className="dash-modal-actions">
                                <button type="button" onClick={() => setModalConfig({ isOpen: false, acao: null, saqueId: null })} className="modal-btn-cancel">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className={`modal-btn-confirm ${modalConfig.acao === 'aprovar' ? 'btn-success' : 'btn-danger'}`}>
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