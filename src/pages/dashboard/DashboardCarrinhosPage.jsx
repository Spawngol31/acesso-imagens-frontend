// src/pages/dashboard/DashboardCarrinhosPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// --- COMPONENTE DE PAGINAÇÃO REUTILIZADO ---
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
// -------------------------------------------

function DashboardCarrinhosPage() {
    const [carrinhos, setCarrinhos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1);
    const itensPorPagina = 10;
    // ----------------------------

    const corPrincipal = '#6c0464';

    useEffect(() => {
        const fetchCarrinhos = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/carrinhos-ativos/');
                setCarrinhos(response.data);
            } catch (error) {
                console.error("Erro ao buscar carrinhos ativos:", error);
                toast.error("Não foi possível carregar os carrinhos abandonados.");
            } finally {
                setLoading(false);
            }
        };
        fetchCarrinhos();
    }, []);

    // Agrupar itens por cliente para ficar mais organizado visualmente
    const carrinhosAgrupados = carrinhos.reduce((acc, item) => {
        if (!acc[item.cliente_email]) {
            acc[item.cliente_email] = {
                nome: item.cliente_nome,
                email: item.cliente_email,
                itens: [],
                total: 0
            };
        }
        acc[item.cliente_email].itens.push(item);
        acc[item.cliente_email].total += item.preco;
        return acc;
    }, {});

    // Array final com todos os clientes (cada um representa um carrinho aberto)
    const clientes = Object.values(carrinhosAgrupados);

    // --- LÓGICA MATEMÁTICA DA PAGINAÇÃO ---
    const totalPages = Math.ceil(clientes.length / itensPorPagina);
    const indexOfLastItem = currentPage * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    // Corta a lista para mostrar apenas os 10 clientes da página atual
    const currentClientes = clientes.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (novaPagina) => {
        setCurrentPage(novaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela suavemente ao trocar de página
    };
    // ---------------------------------------

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            <div style={{ marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px' }}>
                <h2 style={{ color: corPrincipal, margin: 0, fontSize: '24px' }}>🛒 Carrinhos em aberto</h2>
                <p style={{ color: '#666', marginTop: '5px', fontSize: '14px' }}>
                    Veja as fotos que os clientes já escolheram, mas ainda não finalizaram a compra.
                </p>
            </div>

            {loading ? (
                <p style={{ color: '#666' }}>A procurar carrinhos em aberto...</p>
            ) : clientes.length === 0 ? (
                <div style={{ backgroundColor: '#fdfbfe', padding: '40px', borderRadius: '10px', textAlign: 'center', border: '1px dashed #e1bce0' }}>
                    <p style={{ color: '#888', fontSize: '16px' }}>Nenhum cliente logado tem fotos suas no carrinho no momento.</p>
                </div>
            ) : (
                <>
                    {/* Renderiza APENAS a página atual (currentClientes) em vez de todos */}
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {currentClientes.map((cliente, index) => (
                            <div key={index} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                                
                                {/* Cabeçalho do Cliente */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>👤 {cliente.nome}</h3>
                                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>✉️ {cliente.email}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ display: 'block', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Valor no Carrinho</span>
                                        <span style={{ fontSize: '20px', color: corPrincipal, fontWeight: 'bold' }}>
                                            R$ {cliente.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Grid das fotos no carrinho */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                    {cliente.itens.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', minWidth: '250px', flex: '1 1 auto' }}>
                                            {item.foto_url ? (
                                                <img src={item.foto_url} alt="Miniatura" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', backgroundColor: '#e9ecef', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>Sem Img</div>
                                            )}
                                            <div>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Foto #{item.foto_id}</p>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Álbum: {item.album_titulo}</p>
                                                <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>Adicionado: {item.data_adicao}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Botão de contato / ação */}
                                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                    <a 
                                        href={`mailto:${cliente.email}?subject=As suas fotos da Acesso Imagens estão à espera!`} 
                                        className="button-outline"
                                        style={{ textDecoration: 'none', display: 'inline-block', padding: '8px 15px', borderRadius: '20px', fontSize: '13px' }}
                                    >
                                        ✉️ Enviar E-mail
                                    </a>
                                </div>

                            </div>
                        ))}
                    </div>

                    {/* --- CONTROLES DE PAGINAÇÃO AO FINAL DA LISTA --- */}
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

export default DashboardCarrinhosPage;