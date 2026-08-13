// src/pages/dashboard/DashboardPropostasPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// --- COMPONENTE DE PAGINAÇÃO ---
const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPaginationRange = () => {
        const delta = 1;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        if (currentPage - delta > 2) range.unshift("...");
        if (currentPage + delta < totalPages - 1) range.push("...");

        range.unshift(1);
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    const pages = getPaginationRange();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '2rem', padding: '1rem' }}>
            <button 
                onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
            >
                &lt;
            </button>

            {pages.map((page, index) => (
                <React.Fragment key={index}>
                    {page === "..." ? (
                        <span style={{ padding: '5px', color: '#888', letterSpacing: '2px' }}>...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page)}
                            style={{
                                width: '40px', height: '40px', border: 'none', borderRadius: '8px',
                                backgroundColor: currentPage === page ? '#6c0464' : 'transparent',
                                color: currentPage === page ? 'white' : '#333',
                                cursor: 'pointer', fontWeight: currentPage === page ? 'bold' : 'normal',
                                fontSize: '1rem', transition: 'all 0.2s'
                            }}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
                &gt;
            </button>
        </div>
    );
};
// -------------------------------

function DashboardPropostasPage() {
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [valoresContraproposta, setValoresContraproposta] = useState({});

    // --- ESTADOS DE PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const itensPorPagina = 10;
    // ----------------------------

    const corPrincipal = '#6c0464';

    const fetchPropostas = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/propostas/');
            setPropostas(response.data);
        } catch (error) {
            toast.error("Erro ao carregar as propostas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPropostas(); }, []);

    const responderProposta = async (id, acao) => {
        try {
            let payload = {};
            if (acao === 'contraproposta') {
                const valor = valoresContraproposta[id];
                if (!valor || valor <= 0) return toast.warning("Digite um valor válido para a contra-proposta.");
                payload = { valor_contraproposta: valor };
            }

            await axiosInstance.post(`/dashboard/propostas/${id}/${acao}/`, payload);
            toast.success("Proposta atualizada com sucesso!");
            fetchPropostas(); 
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao responder proposta.");
        }
    };

    const getStatusStyle = (status) => {
        if (status.includes('ACEITA')) return { bg: '#d4edda', color: '#155724' };
        if (status.includes('RECUSADA')) return { bg: '#f8d7da', color: '#721c24' };
        if (status === 'CONTRAPROPOSTA') return { bg: '#cce5ff', color: '#004085' }; 
        return { bg: '#fff3cd', color: '#856404' }; // PENDENTE
    };

    // --- LÓGICA MATEMÁTICA DA PAGINAÇÃO ---
    const totalPages = Math.ceil(propostas.length / itensPorPagina);
    const indexOfLastItem = currentPage * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const currentPropostas = propostas.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (novaPagina) => {
        setCurrentPage(novaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    // ---------------------------------------

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px' }}>
                <h2 style={{ color: corPrincipal, margin: 0, fontSize: '24px' }}>🤝 Negociações e propostas</h2>
            </div>

            {loading ? <p>A carregar propostas...</p> : propostas.length === 0 ? (
                <div style={{ backgroundColor: '#fdfbfe', padding: '40px', borderRadius: '10px', textAlign: 'center', border: '1px dashed #e1bce0' }}>
                    <p style={{ color: '#888', fontSize: '16px' }}>Nenhuma proposta em aberto.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {currentPropostas.map(proposta => (
                            <div key={proposta.id} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                                
                                <div style={{ flex: '1 1 300px' }}>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>👤 {proposta.cliente_nome}</h3>
                                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>✉️ {proposta.cliente_email}</p>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}><strong>Álbum:</strong> {proposta.album_titulo}</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                        <strong>Pedido:</strong> {proposta.quantidade_fotos} Foto(s) e {proposta.quantidade_videos} Vídeo(s)
                                    </p>
                                </div>

                                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fbf0fa', borderRadius: '8px', border: `1px solid ${corPrincipal}`, minWidth: '150px' }}>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: corPrincipal, textTransform: 'uppercase' }}>Valor Oferecido</span>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>R$ {parseFloat(proposta.valor_oferecido).toFixed(2)}</span>
                                </div>

                                <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: getStatusStyle(proposta.status).bg, color: getStatusStyle(proposta.status).color }}>
                                        {proposta.status.replace(/_/g, ' ')}
                                    </span>
                                    
                                    {proposta.status === 'PENDENTE' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', width: '100%' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => responderProposta(proposta.id, 'recusar')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #dc3545', backgroundColor: '#fff', color: '#dc3545', fontWeight: 'bold', cursor: 'pointer' }}>Recusar</button>
                                                <button onClick={() => responderProposta(proposta.id, 'aceitar')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#28a745', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>✅ Aceitar</button>
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                <input 
                                                    type="number" step="0.01" placeholder="R$ Nova Oferta" 
                                                    value={valoresContraproposta[proposta.id] || ''}
                                                    onChange={(e) => setValoresContraproposta({...valoresContraproposta, [proposta.id]: e.target.value})}
                                                    style={{ backgroundColor: '#fff', color: '#666', flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                                                />
                                                <button onClick={() => responderProposta(proposta.id, 'contraproposta')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Enviar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* --- RENDERIZA A PAGINAÇÃO --- */}
                    <CustomPagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
                </>
            )}
        </div>
    );
}
export default DashboardPropostasPage;