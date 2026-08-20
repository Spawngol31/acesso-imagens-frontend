// src/pages/MinhasPropostasPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

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

function MinhasPropostasPage() {
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);

    const { fetchCart } = useCart();

    // --- ESTADOS DE PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const itensPorPagina = 10;
    // ----------------------------

    const corPrincipal = '#6c0464';

    const fetchPropostas = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/minhas-propostas/');
            setPropostas(response.data);
        } catch (error) {
            toast.error("Erro ao carregar as suas propostas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPropostas(); }, []);

    const responderContraproposta = async (id, acao) => {
        try {
            await axiosInstance.post(`/minhas-propostas/${id}/${acao}/`);
            toast.success("Resposta enviada com sucesso!");
            fetchPropostas();
            
            // --- A MÁGICA ACONTECE AQUI ---
            // Se o cliente aceitou, mandamos o carrinho recalcular tudo imediatamente
            if (acao === 'aceitar') {
                fetchCart();
            }
            // ------------------------------
            
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao responder.");
        }
    };

    const getStatusInfo = (status) => {
        if (status === 'ACEITA' || status === 'CONTRAPROPOSTA_ACEITA') return { bg: '#d4edda', color: '#155724', texto: 'Aprovada!' };
        if (status === 'RECUSADA' || status === 'CONTRAPROPOSTA_RECUSADA') return { bg: '#f8d7da', color: '#721c24', texto: 'Recusada' };
        if (status === 'CONTRAPROPOSTA') return { bg: '#cce5ff', color: '#004085', texto: 'Nova Oferta Recebida' };
        return { bg: '#fff3cd', color: '#856404', texto: 'Em Análise' };
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
        <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
            <h1 style={{ color: corPrincipal, borderBottom: '2px solid #fbf0fa', paddingBottom: '15px' }}>Minhas Propostas</h1>

            {loading ? <p>A carregar as suas propostas...</p> : propostas.length === 0 ? (
                <div style={{ backgroundColor: '#fdfbfe', padding: '40px', borderRadius: '10px', textAlign: 'center', border: '1px dashed #e1bce0' }}>
                    <p style={{ color: '#888', fontSize: '16px' }}>Você ainda não fez nenhuma proposta.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {currentPropostas.map(proposta => {
                            const statusInfo = getStatusInfo(proposta.status);
                            
                            return (
                                <div key={proposta.id} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: `1px solid ${statusInfo.bg}` }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                                        
                                        <div style={{ flex: '1 1 250px' }}>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Álbum: {proposta.album_titulo}</h3>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>
                                                <strong>Quantidade:</strong> {proposta.quantidade_fotos} Foto(s) e {proposta.quantidade_videos} Vídeo(s)
                                            </p>
                                            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                                <strong style={{textDecoration: proposta.status === 'CONTRAPROPOSTA' ? 'line-through' : 'none'}}>Valor Oferecido: R$ {parseFloat(proposta.valor_oferecido).toFixed(2)}</strong>
                                            </p>
                                            {proposta.valor_contraproposta && (
                                                <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#004085', fontWeight: 'bold' }}>
                                                    Nova Oferta do Fotógrafo: R$ {parseFloat(proposta.valor_contraproposta).toFixed(2)}
                                                </p>
                                            )}
                                        </div>

                                        <div style={{ textAlign: 'center', minWidth: '150px' }}>
                                            <div style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: statusInfo.bg, color: statusInfo.color, fontWeight: 'bold', fontSize: '16px' }}>
                                                {statusInfo.icone} {statusInfo.texto}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações se for Contra-proposta */}
                                    {proposta.status === 'CONTRAPROPOSTA' && (
                                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => responderContraproposta(proposta.id, 'recusar')} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #dc3545', backgroundColor: '#fff', color: '#dc3545', fontWeight: 'bold', cursor: 'pointer' }}>Recusar Nova Oferta</button>
                                            <button onClick={() => responderContraproposta(proposta.id, 'aceitar')} style={{ padding: '8px 15px', borderRadius: '6px', border: 'none', backgroundColor: '#28a745', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Aceitar Nova Oferta</button>
                                        </div>
                                    )}

                                    {/* Mensagem de Sucesso */}
                                    {(proposta.status === 'ACEITA' || proposta.status === 'CONTRAPROPOSTA_ACEITA') && (
                                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e2f3f5', borderRadius: '8px', border: '1px solid #bee5eb', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ flex: '1 1 300px' }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#0c5460', fontSize: '16px' }}>Negociação Aprovada!</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#0c5460' }}>
                                                    Para garantir este preço, coloque exatamente as quantidades combinadas no seu carrinho. O sistema aplicará o desconto automaticamente!
                                                </p>
                                            </div>
                                            <Link to={`/album/${proposta.album}`} className="create-button" style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8', textDecoration: 'none', padding: '10px 20px' }}>Ir para o Álbum</Link>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
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
export default MinhasPropostasPage;