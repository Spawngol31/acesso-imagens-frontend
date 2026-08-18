import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function FotografoSaquesPage() {
    const [saques, setSaques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- NOVO: Estado para guardar o saldo real que vem do banco ---
    const [saldoPendente, setSaldoPendente] = useState(0);
    
    const [chavePix, setChavePix] = useState('');

    const corPrincipal = '#6c0464';

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Busca o histórico de saques
            const responseSaques = await axiosInstance.get('/dashboard/saques/');
            setSaques(responseSaques.data);

            // 2. Busca o saldo atual (aproveitando a rota de vendas que já faz esse cálculo)
            const responseVendas = await axiosInstance.get('/dashboard/minhas-vendas-json/');
            setSaldoPendente(responseVendas.data.resumo.saldo_pendente);

        } catch (error) {
            toast.error("Erro ao carregar os dados financeiros.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSolicitarSaque = async (e) => {
        e.preventDefault();
        
        if (saldoPendente <= 0) {
            return toast.warning("Você não possui saldo disponível para saque no momento.");
        }
        if (!chavePix) {
            return toast.warning("Preencha a chave PIX.");
        }

        setIsSubmitting(true);
        try {
            // O valor não é mais enviado daqui. O backend calcula sozinho!
            await axiosInstance.post('/dashboard/saques/', { chave_pix: chavePix });
            toast.success("Solicitação enviada com sucesso! O Admin analisará o seu pedido.");
            setChavePix('');
            fetchData(); // Recarrega tudo para atualizar o saldo para zero
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao solicitar saque.");
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
        <div className="dashboard-page-content" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
            <h2 style={{ color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '15px', marginBottom: '25px' }}>
                💸 Meus saques
            </h2>

            {/* FORMULÁRIO DE SOLICITAÇÃO */}
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px', borderLeft: `5px solid ${corPrincipal}` }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Solicitar repasse de vendas</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                    O sistema transfere automaticamente todo o seu saldo disponível em uma única transação.
                </p>
                
                <form onSubmit={handleSolicitarSaque} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    
                    {/* --- CAIXA DE SALDO BLOQUEADA --- */}
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Valor do saque (R$)</label>
                        <div style={{ backgroundColor: '#2a2a2a', color: saldoPendente > 0 ? '#4caf50' : '#888', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #444', boxSizing: 'border-box', fontWeight: 'bold', fontSize: '16px' }}>
                            R$ {parseFloat(saldoPendente).toFixed(2)}
                        </div>
                    </div>

                    <div style={{ flex: '2 1 300px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Sua chave PIX</label>
                        <input type="text" required value={chavePix} onChange={(e) => setChavePix(e.target.value)} placeholder="CPF, E-mail, Telefone ou Chave Aleatória" style={{ backgroundColor: '#fff', color: '#666', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    
                    <button type="submit" disabled={isSubmitting || saldoPendente <= 0} className="create-button" style={{ height: '43px', flex: '1 1 150px', opacity: (isSubmitting || saldoPendente <= 0) ? 0.6 : 1 }}>
                        {isSubmitting ? 'Enviando...' : 'Pedir saque total'}
                    </button>
                </form>
            </div>

            {/* HISTÓRICO DE SAQUES */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, color: corPrincipal, marginBottom: '20px' }}>Histórico de solicitações</h3>
                
                {loading ? <p>A carregar histórico...</p> : saques.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Nenhuma solicitação de saque realizada até o momento.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderRadius: '6px 0 0 0' }}>DATA DO PEDIDO</th>
                                    <th style={{ padding: '12px' }}>VALOR</th>
                                    <th style={{ padding: '12px' }}>CHAVE PIX</th>
                                    <th style={{ padding: '12px' }}>STATUS</th>
                                    <th style={{ padding: '12px', borderRadius: '0 6px 0 0' }}>OBSERVAÇÃO DO ADMIN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saques.map((saque) => {
                                    const style = getStatusStyle(saque.status);
                                    return (
                                        <tr key={saque.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{new Date(saque.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>R$ {parseFloat(saque.valor).toFixed(2)}</td>
                                            <td style={{ padding: '12px', color: '#555' }}>{saque.chave_pix}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ backgroundColor: style.bg, color: style.color, padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {saque.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                                                {saque.comprovante && (
                                                    <a 
                                                        href={saque.comprovante} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        style={{ display: 'inline-block', marginBottom: '5px', color: '#f794f7', textDecoration: 'none', fontWeight: 'bold', backgroundColor: 'rgba(247, 148, 247, 0.15)', padding: '6px 12px', borderRadius: '6px', border: '1px solid #f794f7' }}
                                                    >
                                                        📎 Ver Comprovante
                                                    </a>
                                                )}
                                                <div style={{ marginTop: saque.comprovante ? '5px' : '0' }}>
                                                    {saque.observacao || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FotografoSaquesPage;