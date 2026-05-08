// src/pages/MinhasComprasPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

// --- FUNÇÃO DETETORA DE REDES SOCIAIS ---
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

    // --- NOVOS ESTADOS PARA SELEÇÃO EM MASSA ---
    const [selecionadas, setSelecionadas] = useState([]);
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);
    const [isBulkEmailing, setIsBulkEmailing] = useState(false);

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

    // Lógica para verificar se expirou (reutilizável)
    const verificarExpirado = (dataCompraStr) => {
        const sessentaDiasEmMs = 60 * 24 * 60 * 60 * 1000;
        const dataCompra = new Date(dataCompraStr).getTime();
        const agora = new Date().getTime();
        return (agora - dataCompra) > sessentaDiasEmMs;
    };

    // --- LÓGICA DE SELEÇÃO ---
    const handleToggleSelect = (fotoId) => {
        setSelecionadas(prev => 
            prev.includes(fotoId) ? prev.filter(id => id !== fotoId) : [...prev, fotoId]
        );
    };

    const handleSelectAll = () => {
        // Seleciona apenas as que não estão expiradas
        const fotosValidas = itensComprados.filter(item => !verificarExpirado(item.data_compra));
        if (selecionadas.length === fotosValidas.length) {
            setSelecionadas([]); // Desmarca todas
        } else {
            setSelecionadas(fotosValidas.map(item => item.foto.id)); // Marca todas as válidas
        }
    };

    // --- FUNÇÕES DE AÇÃO EM MASSA (NOVAS) ---
    const handleBulkDownloadZip = async () => {
        if (selecionadas.length === 0) return;
        setIsBulkDownloading(true);
        toast.info("A preparar o seu ficheiro ZIP. Isto pode demorar alguns segundos...", { autoClose: 3000 });

        try {
            // Faremos esta rota no Django a seguir!
            const response = await axiosInstance.post('/download-fotos-zip/', { foto_ids: selecionadas }, { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `acesso_imagens_fotos_${new Date().getTime()}.zip`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Download do ZIP iniciado!");
            setSelecionadas([]); // Limpa a seleção após sucesso
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
            // Faremos esta rota no Django a seguir!
            const response = await axiosInstance.post('/enviar-fotos-email/', { foto_ids: selecionadas });
            
            toast.success(`📸 Fotos enviadas com sucesso para:\n${response.data.email_destino}`, {
                position: "top-center", autoClose: 5000, theme: "colored"
            });
            setSelecionadas([]); // Limpa a seleção após sucesso
        } catch (error) {
            console.error("Erro ao enviar e-mail em massa:", error);
            toast.error("Erro ao enviar o e-mail. Tente novamente.");
        } finally {
            setIsBulkEmailing(false);
        }
    };

    // --- FUNÇÕES INDIVIDUAIS (MANTIDAS INTACTAS) ---
    const handleDownload = async (fotoId, fileName) => {
        setDownloading(fotoId);
        let urlOriginal = '';
        try {
            const response = await axiosInstance.get(`/download-foto/${fotoId}/`);
            urlOriginal = response.data.download_url;
            const imageResponse = await fetch(urlOriginal);
            if (!imageResponse.ok) throw new Error("Falha na rede");
            const blob = await imageResponse.blob();
            const urlTemporaria = window.URL.createObjectURL(blob);
            const linkInvisivel = document.createElement('a');
            linkInvisivel.style.display = 'none';
            linkInvisivel.href = urlTemporaria;
            linkInvisivel.download = fileName || `foto_${fotoId}.jpg`;
            document.body.appendChild(linkInvisivel);
            linkInvisivel.click();
            window.URL.revokeObjectURL(urlTemporaria);
            document.body.removeChild(linkInvisivel);
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
            toast.success(`📸 Link da foto enviado para:\n${response.data.email_destino}`, {
                position: "top-center", autoClose: 5000, theme: "colored"
            });
        } catch (error) {
            toast.error("Erro ao enviar o e-mail. Tente novamente.");
        } finally {
            setSendingEmail(null);
        }
    };

    if (loading) return <p>A carregar o seu histórico...</p>;

    const fotosValidasCount = itensComprados.filter(item => !verificarExpirado(item.data_compra)).length;

    return (
        <div className="page-container" style={{ position: 'relative', paddingBottom: selecionadas.length > 0 ? '100px' : '40px' }}>
            <h1>💰 Minhas compras</h1>
            <p>Aqui estão todas as fotos que comprou. O link para download é válido por 60 dias após a data da compra.</p>

            {itensComprados.length === 0 ? (
                <div className="empty-state-container">
                    <p>Você ainda não fez nenhuma compra.</p>
                    <Link to="/eventos" className="create-button" style={{ textDecoration: 'none' }}>Ver álbuns</Link>
                </div>
            ) : (
                <>
                    {/* BOTÃO SELECIONAR TUDO */}
                    {fotosValidasCount > 0 && (
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input 
                                type="checkbox" 
                                id="selectAll"
                                checked={selecionadas.length > 0 && selecionadas.length === fotosValidasCount}
                                onChange={handleSelectAll}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="selectAll" style={{ fontWeight: 'bold', cursor: 'pointer', color: '#6c0464' }}>
                                Selecionar Todas as Fotos ({fotosValidasCount})
                            </label>
                        </div>
                    )}

                    <div className="purchase-grid">
                        {itensComprados.map(item => {
                            const expirado = verificarExpirado(item.data_compra);
                            const isSelected = selecionadas.includes(item.foto.id);

                            return (
                                <div key={item.foto.id} className="purchase-card" style={{ border: isSelected ? '2px solid #6c0464' : '1px solid #ddd', position: 'relative' }}>
                                    
                                    {/* CHECKBOX INDIVIDUAL NA FOTO */}
                                    {!expirado && (
                                        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '4px', padding: '5px', display: 'flex' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => handleToggleSelect(item.foto.id)}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                        </div>
                                    )}

                                    <div className="purchase-card-image" style={{ opacity: expirado ? 0.5 : 1 }}>
                                        <img 
                                            src={item.foto.imagem_url} 
                                            alt={item.foto.legenda}
                                            style={{ transform: `rotate(${item.foto.rotacao}deg)` }}
                                        />
                                    </div>
                                    <div className="purchase-card-info">
                                        <p><strong>Comprado em:</strong> {new Date(item.data_compra).toLocaleDateString()}</p>
                                        
                                        {expirado ? (
                                            <p style={{ color: 'red', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '10px' }}>
                                                ⚠️ Prazo de download expirado (60 dias)
                                            </p>
                                        ) : isInAppBrowser ? (
                                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <p style={{ fontSize: '12px', color: '#856404', margin: 0, textAlign: 'center' }}>
                                                    O Instagram bloqueia downloads diretos.
                                                </p>
                                                <button 
                                                    onClick={() => handleSendEmail(item.foto.id)}
                                                    disabled={sendingEmail === item.foto.id}
                                                    className="download-button"
                                                >
                                                    {sendingEmail === item.foto.id ? 'A enviar...' : '📧 E-mail Individual'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleDownload(item.foto.id, item.foto.legenda)}
                                                disabled={downloading === item.foto.id}
                                                className="download-button"
                                            >
                                                {downloading === item.foto.id ? 'A baixar...' : 'Baixar Original'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* BARRA FLUTUANTE DE AÇÕES EM MASSA */}
            {selecionadas.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fdfbfe',
                    borderTop: '2px solid #6c0464', padding: '15px 20px', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                    boxShadow: '0 -4px 10px rgba(0,0,0,0.1)', zIndex: 1000
                }}>
                    <span style={{ fontWeight: 'bold', color: '#6c0464', fontSize: '16px' }}>
                        {selecionadas.length} foto(s) selecionada(s)
                    </span>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {/* Se não estiver no Instagram, permite ZIP */}
                        {!isInAppBrowser && (
                            <button 
                                onClick={handleBulkDownloadZip} 
                                disabled={isBulkDownloading || isBulkEmailing}
                                className="create-button"
                            >
                                {isBulkDownloading ? 'A gerar ZIP...' : '📥 Baixar ZIP'}
                            </button>
                        )}
                        
                        {/* O E-mail está sempre disponível */}
                        <button 
                            onClick={handleBulkSendEmail} 
                            disabled={isBulkDownloading || isBulkEmailing}
                            className="create-button"
                            style={{ backgroundColor: '#e076ee', borderColor: '#e076ee' }}
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