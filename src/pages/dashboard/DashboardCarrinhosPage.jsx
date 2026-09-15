// src/pages/dashboard/DashboardCarrinhosPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function DashboardCarrinhosPage() {
    const [carrinhos, setCarrinhos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itensPorPagina = 10;

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

    const clientes = Object.values(carrinhosAgrupados);

    const totalPages = Math.ceil(clientes.length / itensPorPagina);
    const indexOfLastItem = currentPage * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const currentClientes = clientes.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (novaPagina) => {
        setCurrentPage(novaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                pageNumbers.push(i);
            } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
                pageNumbers.push('...');
            }
        }

        return (
            <div className="pagination-container">
                <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-nav-btn"
                    style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                    &#60;
                </button>

                {pageNumbers.map((number, index) => (
                    number === '...' ? (
                        <span key={index} className="pagination-ellipsis">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => handlePageChange(number)}
                            className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                            style={{ cursor: 'pointer', transition: 'all 0.2s', fontWeight: currentPage === number ? 'bold' : 'normal' }}
                        >
                            {number}
                        </button>
                    )
                ))}

                <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-nav-btn"
                    style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                    &#62;
                </button>
            </div>
        );
    };

    return (
        <div className="dashboard-page-content carts-page-wrapper">
            
            <div className="dash-header-box">
                <div>
                    <h2 className="dash-main-title">Carrinhos em aberto</h2>
                    <p className="carts-page-desc">
                        Veja as fotos que os clientes já escolheram, mas ainda não finalizaram a compra.
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="page-subtitle">A procurar carrinhos em aberto...</p>
            ) : clientes.length === 0 ? (
                <div className="empty-state-message">
                    <p>Nenhum cliente logado tem fotos suas no carrinho no momento.</p>
                </div>
            ) : (
                <>
                    <div className="carts-grid">
                        {currentClientes.map((cliente, index) => (
                            <div className="cart-cliente-card" key={index}>
                                
                                {/* Cabeçalho do Cliente */}
                                <div className="cart-cliente-header">
                                    <div className="cart-cliente-info">
                                        <h3 className="cart-cliente-name">{cliente.nome}</h3>
                                        <p className="cart-cliente-email">{cliente.email}</p>
                                    </div>
                                    <div className="cart-cliente-total-box">
                                        <span className="cart-total-label">Valor no Carrinho</span>
                                        <span className="cart-total-value">
                                            R$ {cliente.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Grid das fotos no carrinho */}
                                <div className="cart-items-grid">
                                    {cliente.itens.map(item => (
                                        <div key={item.id} className="cart-item-card">
                                            {item.foto_url ? (
                                                <img src={item.foto_url} alt="Miniatura" className="cart-item-thumb" />
                                            ) : (
                                                <div className="cart-item-placeholder">Sem Img</div>
                                            )}
                                            <div className="cart-item-details">
                                                <p className="cart-item-id">Foto #{item.foto_id}</p>
                                                <p className="cart-item-album">Álbum: {item.album_titulo}</p>
                                                <p className="cart-item-date">Adicionado: {item.data_adicao}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Botão de contato / ação */}
                                <div className="cart-action-row">
                                    {(() => {
                                        const assunto = 'As suas fotos da Acesso Imagens estão à espera!';
                                        const mensagem = `Olá ${cliente.nome},\n\nSuas fotos da Acesso Imagens estão esperando você no carrinho, caso esteja tendo alguma dificuldade, entre em contato com nossa equipe no (92) 9 84840065 ou entrando no site www.acessoimagens.com.br e clicando no botão do WhatsApp no canto inferior do site que você será redirecionado a nossa equipe.\n\nAbraço,\nEquipe Acesso Imagens`;
                                        
                                        const mailtoLink = `mailto:${cliente.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
                                        
                                        return (
                                            <a 
                                                href={mailtoLink} 
                                                className="button-outline cart-email-btn"
                                            >
                                                ✉️ Enviar E-mail
                                            </a>
                                        );
                                    })()}
                                </div>

                            </div>
                        ))}
                    </div>

                    {renderPagination()}
                </>
            )}
        </div>
    );
}

export default DashboardCarrinhosPage;