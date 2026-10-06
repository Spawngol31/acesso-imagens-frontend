import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const GerenciarAlbunsAdmin = () => {
    const [albuns, setAlbuns] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [loading, setLoading] = useState(false);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
    const [modalAvisoOpen, setModalAvisoOpen] = useState(false);
    const [avisoConteudo, setAvisoConteudo] = useState({ titulo: '', mensagem: '' });

    useEffect(() => {
        carregarAlbuns();
    }, []);

    const carregarAlbuns = async () => {
        try {
            const response = await axiosInstance.get('/albuns/?is_arquivado=false');
            setAlbuns(response.data);
        } catch (error) {
            console.error("Erro ao buscar álbuns", error);
        }
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
            carregarAlbuns(); 
            
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

    return (
        <div className="admin-container">
            <h2 className="admin-titulo">Limpeza de álbuns</h2>
            
            <button 
                className="btn-arquivar"
                onClick={abrirModalConfirmacao} 
                disabled={loading || selecionados.length === 0}
            >
                {loading ? "Processando e limpando o R2..." : `Apagar e Arquivar Selecionados (${selecionados.length})`}
            </button>

            <div className="table-responsive-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr className="admin-table-header">
                            <th>Selecionar</th>
                            <th>ID</th>
                            <th>Título do Álbum</th>
                            <th>Data do Evento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {albuns.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="admin-td-empty">
                                    Nenhum álbum ativo encontrado.
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
                                    <td className="admin-td-data">
                                        {new Date(album.data_evento).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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