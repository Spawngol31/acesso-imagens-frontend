// src/pages/MinhasComprasPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

// --- NOVA FUNÇÃO DETETORA DE REDES SOCIAIS ---
const isSocialMediaBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("Instagram") > -1) || (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
};

function MinhasComprasPage() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const { user } = useAuth();

    // --- NOVO ESTADO ---
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(null);

    // --- VERIFICA O NAVEGADOR AO ABRIR A PÁGINA ---
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

    // --- FUNÇÃO DE DOWNLOAD SILENCIOSO ANTI-INSTAGRAM ---
    const handleDownload = async (fotoId, fileName) => {
        setDownloading(fotoId);
        let urlOriginal = '';
        
        try {
            // 1. Pede a URL segura da Amazon ao Django
            const response = await axiosInstance.get(`/download-foto/${fotoId}/`);
            urlOriginal = response.data.download_url;

            // 2. Faz o "Download Silencioso" nos bastidores
            const imageResponse = await fetch(urlOriginal);
            if (!imageResponse.ok) throw new Error("Falha na resposta da rede ao buscar a imagem");

            // 3. Transforma a imagem num pacote de dados puro (Blob)
            const blob = await imageResponse.blob();
            
            // 4. Cria uma URL temporária na memória interna do telemóvel
            const urlTemporaria = window.URL.createObjectURL(blob);
            
            // 5. Cria o botão invisível e clica nele
            const linkInvisivel = document.createElement('a');
            linkInvisivel.style.display = 'none';
            linkInvisivel.href = urlTemporaria;
            linkInvisivel.download = fileName || `foto_${fotoId}.jpg`;
            
            document.body.appendChild(linkInvisivel);
            linkInvisivel.click();
            
            // 6. Limpa a memória
            window.URL.revokeObjectURL(urlTemporaria);
            document.body.removeChild(linkInvisivel);

        } catch (error) {
            console.error("Erro no download silencioso, a tentar o Plano B:", error);
            
            // PLANO B DE EMERGÊNCIA
            // Se o silencioso falhar (ex: bloqueio de rede), tenta forçar a abertura noutra aba
            if (urlOriginal) {
                const linkFallback = document.createElement('a');
                linkFallback.href = urlOriginal;
                linkFallback.download = fileName || `foto_${fotoId}.jpg`;
                linkFallback.target = '_blank';
                document.body.appendChild(linkFallback);
                linkFallback.click();
                document.body.removeChild(linkFallback);
            } else {
                toast.error("Não foi possível gerar o link de download. Tente novamente.");
            }
        } finally {
            setDownloading(null);
        }
    };

    // --- NOVA FUNÇÃO PARA ENVIAR POR E-MAIL ---
    const handleSendEmail = async (fotoId) => {
        setSendingEmail(fotoId);
        try {
            // Vamos criar esta rota no Django no Passo 2!
            const response = await axiosInstance.post(`/download-foto/${fotoId}/enviar-email/`);
            
            // Pop-up bonitão na tela avisando o sucesso e mostrando o e-mail
            toast.success(`📸 Link da foto enviado com sucesso para:\n${response.data.email_destino}`, {
                position: "top-center",
                autoClose: 5000,
                theme: "colored"
            });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            toast.error("Erro ao enviar o e-mail. Tente novamente ou abra no navegador Chrome/Safari.");
        } finally {
            setSendingEmail(null);
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
                        // --- LÓGICA DE 60 DIAS ---
                        const sessentaDiasEmMs = 60 * 24 * 60 * 60 * 1000;
                        const dataCompra = new Date(item.data_compra).getTime();
                        const agora = new Date().getTime();
                        const expirado = (agora - dataCompra) > sessentaDiasEmMs;

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
                                    
                                    {/* --- BOTÃO CONDICIONAL INTELIGENTE --- */}
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
                                                // style={{ backgroundColor: '#790da3', borderColor: '#790da3' }}
                                            >
                                                {sendingEmail === item.foto.id ? 'A enviar...' : '📧 Enviar para o meu E-mail'}
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
            )}
        </div>
    );
}

export default MinhasComprasPage;