import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const GerenciarAlbunsAdmin = () => {
    const [albuns, setAlbuns] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [loading, setLoading] = useState(false);

    // Paginação vinda do Servidor
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalAlbuns, setTotalAlbuns] = useState(0);
    const itensPorPagina = 30;

    // Estados dos Modais
    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
    const [modalAvisoOpen, setModalAvisoOpen] = useState(false);
    const [avisoConteudo, setAvisoConteudo] = useState({ titulo: '', mensagem: '' });

    // Carrega sempre que a página atual mudar
    useEffect(() => {
        carregarAlbuns(paginaAtual);
    }, [paginaAtual]);

    // Rola a tela suavemente para o topo ao trocar de página
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [paginaAtual]);

    const carregarAlbuns = async (pagina) => {
        try {
            setLoading(true);
            // Faz UMA ÚNICA requisição rápida pedindo apenas os 30 daquela página
            const response = await axiosInstance.get(`/albuns/?is_arquivado=false&page=${pagina}&page_size=${itensPorPagina}`);
            
            if (response.data.results) {
                setAlbuns(response.data.results);
                setTotalAlbuns(response.data.count || 0);
            } else {
                setAlbuns(response.data);
                setTotalAlbuns(response.data.length || 0);
            }
        } catch (error) {
            console.error("Erro ao buscar álbuns", error);
        } finally {
            setLoading(false);
        }
    };

    // Identifica o nome do fotógrafo considerando os diferentes formatos do backend
    const obterNomeFotografo = (album) => {
        if (typeof album.fotografo === 'string') return album.fotografo;
        return (
            album.fotografo_nome ||
            album.fotografo?.nome_completo ||
            album.fotografo?.nome ||
            album.fotografo?.username ||
            album.usuario_nome ||
            'Não informado'
        );
    };

    const handleSelecionar = (id) => {
        if (selecionados.includes(id)) {
            setSelecionados(selecionados.filter(item => item !== id));
        } else {
            setSelecionados([...selecionados, id]);
        }
    };

    const abrirModalConfirmacao = () => {
        if (selecionados.length === 0) {
            setAvisoConteudo({ titulo: "Atenção", mensagem: "Selecione pelo menos um álbum para arquivar." });
            setModalAvisoOpen(true);
            return;
        }
        setModalConfirmacaoOpen(true);
    };

    const confirmarArquivamento = async () => {
        setModalConfirmacaoOpen(false);
        setLoading(true);

        try {
            const response = await axiosInstance.post('/albuns/arquivar-em-massa/', {
                album_ids: selecionados
            });
            
            setAvisoConteudo({ 
                titulo: "Sucesso!", 
                mensagem: `${response.data.message}\nLimpeza na Cloudflare iniciada: ${response.data.fotos_apagadas} fotos e ${response.data.videos_apagados} vídeos descartados.` 
            });
            setModalAvisoOpen(true);
            
            setSelecionados([]); 
            carregarAlbuns(paginaAtual); 
            
        } catch (error) {
            setAvisoConteudo({ 
                titulo: "Erro", 
                mensagem: "Erro ao arquivar álbuns. Verifique se você está logado como Administrador." 
            });
            setModalAvisoOpen(true);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Cálculo das páginas com base no total vindo do backend
    const totalPaginas = Math.ceil(totalAlbuns / itensPorPagina) || 1;

    const obterPaginasVisiveis = () => {
        const delta = 1;
        const left = paginaAtual - delta;
        const right = paginaAtual + delta;
        let pages = [];
        let pagesWithDots = [];
        let l;

        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= left && i <= right)) {
                pages.push(i);
            }
        }

        for (let i of pages) {
            if (l) {
                if (i - l === 2) {
                    pagesWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    pagesWithDots.push('...');
                }
            }
            pagesWithDots.push(i);
            l = i;
        }

        return pagesWithDots;
    };

    return (
        <div className="admin-container">
            <h2 className="admin-titulo">Limpeza de álbuns</h2>
            
            <button 
                className="btn-arquivar"
                onClick={abrirModalConfirmacao} 
                disabled={loading || selecionados.length === 0}
            >
                {loading ? "Processando..." : `Apagar e Arquivar Selecionados (${selecionados.length})`}
            </button>

            <div className="table-responsive-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr className="admin-table-header">
                            <th>Selecionar</th>
                            <th>ID</th>
                            <th>Título do Álbum</th>
                            <th>Fotógrafo</th>
                            <th>Data do Evento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {albuns.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="admin-td-empty">
                                    {loading ? "Carregando álbuns..." : "Nenhum álbum ativo encontrado."}
                                </td>
                            </tr>
                        ) : (
                            albuns.map(album => (
                                <tr key={album.id} className="admin-table-row">
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            className="admin-checkbox"
                                            checked={selecionados.includes(album.id)}
                                            onChange={() => handleSelecionar(album.id)}
                                        />
                                    </td>
                                    <td className="admin-td-id">#{album.id}</td>
                                    <td className="admin-td-titulo">{album.titulo}</td>
                                    <td className="admin-td-fotografo">{obterNomeFotografo(album)}</td>
                                    <td className="admin-td-data">
                                        {new Date(album.data_evento).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controles de Paginação */}
            {totalPaginas > 1 && (
                <div className="pagination-container">
                    <button 
                        className="pagination-arrow"
                        onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                        disabled={paginaAtual === 1 || loading}
                    >
                        &lt;
                    </button>
                    
                    {obterPaginasVisiveis().map((page, index) => (
                        <button 
                            key={index}
                            className={`pagination-number ${paginaAtual === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                            onClick={() => typeof page === 'number' && setPaginaAtual(page)}
                            disabled={page === '...' || loading}
                        >
                            {page}
                        </button>
                    ))}

                    <button 
                        className="pagination-arrow"
                        onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                        disabled={paginaAtual === totalPaginas || loading}
                    >
                        &gt;
                    </button>
                </div>
            )}

            {/* Modal de Confirmação */}
            {modalConfirmacaoOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-titulo">Tem a certeza?</h3>
                        <p className="modal-texto">
                            Isso arquivará os álbuns selecionados e <strong>APAGARÁ permanentemente</strong> todas as mídias não vendidas da Cloudflare e do Amazon Rekognition.
                        </p>
                        <div className="modal-acoes">
                            <button className="btn-cancelar" onClick={() => setModalConfirmacaoOpen(false)}>
                                Cancelar
                            </button>
                            <button className="btn-confirmar" onClick={confirmarArquivamento}>
                                Sim, Arquivar e Limpar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Aviso */}
            {modalAvisoOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-titulo">{avisoConteudo.titulo}</h3>
                        <p className="modal-texto">{avisoConteudo.mensagem}</p>
                        <button className="btn-ok" onClick={() => setModalAvisoOpen(false)}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciarAlbunsAdmin;