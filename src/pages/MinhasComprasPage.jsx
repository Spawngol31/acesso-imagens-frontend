// src/pages/MinhasComprasPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const isSocialMediaBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("Instagram") > -1) || (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
};

function MinhasComprasPage() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const { user } = useAuth();

    const [isInAppBrowser, setIsInAppBrowser] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(null);

    const [selecionadas, setSelecionadas] = useState([]);
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);
    const [isBulkEmailing, setIsBulkEmailing] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setIsInAppBrowser(isSocialMediaBrowser());
    }, []);

    useEffect(() => {
        if (user) {
            const fetchPedidos = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get('/minhas-compras/');
                    setPedidos(response.data);
                } catch (error) {
                    console.error("Erro ao buscar o histórico de compras:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPedidos();
        }
    }, [user]);

    const itensComprados = useMemo(() => {
        return pedidos.flatMap(pedido => 
            pedido.itens.map(item => ({ ...item, data_compra: pedido.criado_em }))
        );
    }, [pedidos]);

    const verificarExpirado = (dataCompraStr) => {
        const sessentaDiasEmMs = 60 * 24 * 60 * 60 * 1000;
        const dataCompra = new Date(dataCompraStr).getTime();
        const agora = new Date().getTime();
        return (agora - dataCompra) > sessentaDiasEmMs;
    };

    const handleToggleSelect = (fotoId) => {
        setSelecionadas(prev => 
            prev.includes(fotoId) ? prev.filter(id => id !== fotoId) : [...prev, fotoId]
        );
    };

    const handleSelectAll = () => {
        const fotosValidas = itensComprados.filter(item => !verificarExpirado(item.data_compra));
        if (selecionadas.length === fotosValidas.length) {
            setSelecionadas([]); 
        } else {
            setSelecionadas(fotosValidas.map(item => item.foto.id)); 
        }
    };

    const handleBulkDownloadZip = async () => {
        if (selecionadas.length === 0) return;
        setIsBulkDownloading(true);
        toast.info("A preparar o seu ficheiro ZIP. Isto pode demorar alguns segundos...", { autoClose: 4000 });

        try {
            const response = await axiosInstance.post('/download-fotos-zip/', { foto_ids: selecionadas });
            const urlOriginal = response.data.download_url;
            
            const isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || window.opera);

            if (isInAppBrowser && isAndroid) {
                const urlSemHttps = urlOriginal.replace(/^https?:\/\//, '');
                const intentUrl = `intent://${urlSemHttps}#Intent;scheme=https;package=com.android.chrome;end;`;
                window.location.href = intentUrl;
                setSelecionadas([]);
                setIsBulkDownloading(false);
                return;
            }

            if (isInAppBrowser && !isAndroid) {
                window.open(urlOriginal, '_blank');
                setSelecionadas([]);
                setIsBulkDownloading(false);
                return;
            }

            const link = document.createElement('a');
            link.href = urlOriginal;
            link.setAttribute('download', `acesso_imagens_pacote.zip`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success("Download do ZIP iniciado!");
            setSelecionadas([]); 
        } catch (error) {
            console.error("Erro ao baixar ZIP:", error);
            toast.error("Erro ao gerar o ficheiro ZIP. Tente selecionar menos fotos.");
        } finally {
            setIsBulkDownloading(false);
        }
    };

    const handleBulkSendEmail = async () => {
        if (selecionadas.length === 0) return;
        setIsBulkEmailing(true);

        try {
            const response = await axiosInstance.post('/enviar-fotos-email/', { foto_ids: selecionadas });
            toast.success(`Fotos enviadas com sucesso para:\n${response.data.email_destino}`, {
                position: "top-center", autoClose: 5000, theme: "colored"
            });
            setSelecionadas([]); 
        } catch (error) {
            console.error("Erro ao enviar e-mail em massa:", error);
            toast.error("Erro ao enviar o e-mail. Tente novamente.");
        } finally {
            setIsBulkEmailing(false);
        }
    };

    const handleDownload = async (fotoId, fileName) => {
        setDownloading(fotoId);
        let urlOriginal = '';
        try {
            const response = await axiosInstance.get(`/download-foto/${fotoId}/`);
            urlOriginal = response.data.download_url;

            const isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || window.opera);
            
            if (isInAppBrowser && isAndroid) {
                const urlSemHttps = urlOriginal.replace(/^https?:\/\//, '');
                const intentUrl = `intent://${urlSemHttps}#Intent;scheme=https;package=com.android.chrome;end;`;
                window.location.href = intentUrl;
                setDownloading(null);
                return;
            }

            if (isInAppBrowser && !isAndroid) {
                window.open(urlOriginal, '_blank');
                setDownloading(null);
                return;
            }

            const link = document.createElement('a');
            link.href = urlOriginal;
            link.setAttribute('download', fileName || `foto_${fotoId}.jpg`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            if (urlOriginal) {
                const linkFallback = document.createElement('a');
                linkFallback.href = urlOriginal;
                linkFallback.download = fileName || `foto_${fotoId}.jpg`;
                linkFallback.target = '_blank';
                document.body.appendChild(linkFallback);
                linkFallback.click();
                document.body.removeChild(linkFallback);
            } else {
                toast.error("Não foi possível gerar o link de download.");
            }
        } finally {
            setDownloading(null);
        }
    };

    const handleSendEmail = async (fotoId) => {
        setSendingEmail(fotoId);
        try {
            const response = await axiosInstance.post(`/download-foto/${fotoId}/enviar-email/`);
            toast.success(`Link da foto enviado para:\n${response.data.email_destino}`, {
                position: "top-center", autoClose: 5000, theme: "colored"
            });
        } catch (error) {
            toast.error("Erro ao enviar o e-mail. Tente novamente.");
        } finally {
            setSendingEmail(null);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItens = itensComprados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(itensComprados.length / itemsPerPage);

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

    if (loading) return <p className="page-subtitle" style={{textAlign: 'center', marginTop: '2rem'}}>A carregar o seu histórico...</p>;

    const fotosValidasCount = itensComprados.filter(item => !verificarExpirado(item.data_compra)).length;

    return (
        <div className="page-container" style={{ position: 'relative', paddingBottom: selecionadas.length > 0 ? '100px' : '40px' }}>
            <h1 className="page-title">Minhas compras</h1>
            <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '30px' }}>
                Aqui estão todas as fotos que comprou. O link para download é válido por 60 dias após a data da compra.
            </p>

            {itensComprados.length === 0 ? (
                <div className="empty-state-message">
                    <p>Você ainda não fez nenhuma compra.</p>
                    <Link to="/eventos" className="create-button" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>Ver álbuns</Link>
                </div>
            ) : (
                <>
                    {fotosValidasCount > 0 && (
                        <div className="select-all-wrapper">
                            <input 
                                type="checkbox" 
                                id="selectAll"
                                checked={selecionadas.length > 0 && selecionadas.length === fotosValidasCount}
                                onChange={handleSelectAll}
                                className="custom-checkbox"
                            />
                            <label htmlFor="selectAll" className="select-all-label">
                                Selecionar Todas as Fotos ({fotosValidasCount})
                            </label>
                        </div>
                    )}

                    <div className="purchase-grid">
                        {currentItens.map(item => {
                            const expirado = verificarExpirado(item.data_compra);
                            const isSelected = selecionadas.includes(item.foto.id);

                            return (
                                <div key={item.foto.id} className={`purchase-card ${isSelected ? 'selected' : ''}`}>
                                    
                                    {!expirado && (
                                        <div className="purchase-checkbox-overlay">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => handleToggleSelect(item.foto.id)}
                                                className="custom-checkbox"
                                            />
                                        </div>
                                    )}

                                    <div className={`purchase-card-image ${expirado ? 'expired' : ''}`}>
                                        <img 
                                            src={item.foto.imagem_url} 
                                            alt={item.foto.legenda}
                                            style={{ transform: `rotate(${item.foto.rotacao}deg)` }}
                                        />
                                    </div>
                                    <div className="purchase-card-info">
                                        <p><strong>Comprado em:</strong> {new Date(item.data_compra).toLocaleDateString()}</p>
                                        
                                        {expirado ? (
                                            <p className="expired-text">
                                                Prazo de download expirado (60 dias)
                                            </p>
                                        ) : isInAppBrowser ? (
                                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button 
                                                    onClick={() => handleDownload(item.foto.id, item.foto.legenda)}
                                                    disabled={downloading === item.foto.id}
                                                    className="create-button"
                                                    style={{ width: '100%' }}
                                                >
                                                    {downloading === item.foto.id ? 'A abrir no Chrome...' : 'Baixar Original'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleDownload(item.foto.id, item.foto.legenda)}
                                                disabled={downloading === item.foto.id}
                                                className="create-button"
                                                style={{ width: '100%', marginTop: '10px' }}
                                            >
                                                {downloading === item.foto.id ? 'A baixar...' : 'Baixar Original'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {renderPagination()}
                </>
            )}

            {selecionadas.length > 0 && (
                <div className="floating-action-bar">
                    <span className="floating-bar-text">
                        {selecionadas.length} foto(s) selecionada(s)
                    </span>
                    
                    <div className="floating-bar-actions">
                        <button 
                            onClick={handleBulkDownloadZip} 
                            disabled={isBulkDownloading || isBulkEmailing}
                            className="create-button"
                        >
                            {isBulkDownloading ? 'A gerar ZIP...' : '📥 Baixar ZIP'}
                        </button>
                        
                        <button 
                            onClick={handleBulkSendEmail} 
                            disabled={isBulkDownloading || isBulkEmailing}
                            className="create-button btn-secondary-pink"
                        >
                            {isBulkEmailing ? 'A enviar...' : '📧 Enviar para E-mail'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MinhasComprasPage;