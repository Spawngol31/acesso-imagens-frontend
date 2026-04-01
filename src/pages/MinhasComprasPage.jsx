// src/pages/MinhasComprasPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function MinhasComprasPage() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const { user } = useAuth();

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

    // Movemos a função para antes do return, mas agora ela só é chamada se o botão estiver habilitado
    const handleDownload = async (fotoId, fileName) => {
        setDownloading(fotoId);
        try {
            const response = await axiosInstance.get(`/download-foto/${fotoId}/`);
            const url = response.data.download_url;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || `foto_${fotoId}.jpg`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Erro ao baixar a foto:", error);
            toast.error("Não foi possível iniciar o download. Tente novamente.");
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return <p>A carregar seu histórico...</p>;
    }

    return (
        <div className="page-container">
            <h1>💰 Minhas compras</h1>
            <p>Aqui estão todas as fotos que você comprou. O link para download é válido por 60 dias após a data da compra.</p>

            {itensComprados.length === 0 ? (
                <div className="empty-state-container">
                    <p>Você ainda não fez nenhuma compra.</p>
                    <Link to="/eventos" className="create-button" style={{ textDecoration: 'none' }}>
                        Ver álbuns
                    </Link>
                </div>
            ) : (
                <div className="purchase-grid">
                    {itensComprados.map(item => {
                        // --- NOVA LÓGICA DE 60 DIAS AQUI ---
                        const sessentaDiasEmMs = 60 * 24 * 60 * 60 * 1000;
                        const dataCompra = new Date(item.data_compra).getTime();
                        const agora = new Date().getTime();
                        const expirado = (agora - dataCompra) > sessentaDiasEmMs;
                        // ------------------------------------

                        return (
                            <div key={item.foto.id} className="purchase-card">
                                <div className="purchase-card-image">
                                    <img 
                                        src={item.foto.imagem_url} 
                                        alt={item.foto.legenda}
                                        style={{ transform: `rotate(${item.foto.rotacao}deg)` }}
                                    />
                                </div>
                                <div className="purchase-card-info">
                                    <p><strong>Comprado em:</strong> {new Date(item.data_compra).toLocaleDateString()}</p>
                                    
                                    {/* --- BOTÃO CONDICIONAL --- */}
                                    {expirado ? (
                                        <p style={{ color: 'red', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '10px' }}>
                                            ⚠️ Prazo de download expirado (60 dias)
                                        </p>
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
            )}
        </div>
    );
}

export default MinhasComprasPage;