// src/pages/dashboard/DashboardAlbunsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AlbumForm from './AlbumForm';
import { toast } from 'react-toastify';

function DashboardAlbunsPage() {
    const [albuns, setAlbuns] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [albumParaMudar, setAlbumParaMudar] = useState(null);
    const [albumParaExcluir, setAlbumParaExcluir] = useState(null); 

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const fetchAlbuns = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/albuns/');
            setAlbuns(response.data);
        } catch (error) { 
            console.error("Erro ao buscar álbuns:", error); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { 
        fetchAlbuns(); 
    }, [fetchAlbuns]);

    const handleEditSubmit = async (albumData, capaFile, removerCapa) => {
        if (!editingAlbum?.id) return;
        
        const formData = new FormData();
        Object.keys(albumData).forEach(key => { 
            if (albumData[key] !== null && albumData[key] !== undefined) {
                formData.append(key, albumData[key]);
            }
        });
        if (capaFile) {
            formData.append('capa', capaFile);
        }
        
        if (removerCapa) {
            formData.append('remover_capa', 'true');
        }

        try {
            await axiosInstance.patch(`/dashboard/albuns/${editingAlbum.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setIsEditModalOpen(false);
            setEditingAlbum(null);
            fetchAlbuns();
            toast.success("Alterações salvas com sucesso!");
        } catch (error) { 
            console.error("Erro ao editar álbum:", error); 
            toast.error("Erro ao salvar."); 
        }
    };
    
    const handleToggleArchiveClick = (album) => {
        setAlbumParaMudar(album);
        setIsConfirmModalOpen(true);
    };

    const confirmarAcao = async () => {
        if (!albumParaMudar) return;
        const acao = albumParaMudar.is_arquivado ? 'desarquivar' : 'arquivar';

        try {
            await axiosInstance.post(`/dashboard/albuns/${albumParaMudar.id}/${acao}/`);
            const msgSucesso = albumParaMudar.is_arquivado 
                ? "Álbum desarquivado com sucesso! Ele voltou à vitrine." 
                : "Álbum arquivado com sucesso! Ninguém mais pode comprá-lo.";
            toast.success(msgSucesso);
            fetchAlbuns();
        } catch (error) {
            console.error(`Erro ao ${acao} álbum:`, error);
            toast.error(`Erro ao tentar ${acao} o álbum.`);
        } finally {
            setIsConfirmModalOpen(false);
            setAlbumParaMudar(null);
        }
    };

    const handleDeleteClick = (album) => {
        setAlbumParaExcluir(album);
        setIsDeleteModalOpen(true);
    };

    const confirmarExclusao = async () => {
        if (!albumParaExcluir) return;

        try {
            await axiosInstance.delete(`/dashboard/albuns/${albumParaExcluir.id}/`);
            toast.success("Álbum excluído definitivamente com sucesso!");
            fetchAlbuns();
            
            if (currentAlbuns.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (error) {
            console.error("Erro ao excluir álbum:", error);
            toast.error("Erro ao excluir o álbum. Pode já ter vendas atreladas a ele.");
        } finally {
            setIsDeleteModalOpen(false);
            setAlbumParaExcluir(null);
        }
    };

    if (loading) return <p className="page-subtitle" style={{ padding: '20px' }}>A carregar os seus álbuns...</p>;

    const albunsProcessados = albuns
    .filter(album => {
        if (!termoPesquisa) return true;
        return album.titulo.toLowerCase().includes(termoPesquisa.toLowerCase());
    })
    .sort((a, b) => {
        return b.id - a.id; 
    });

    const indexOfLastAlbum = currentPage * itemsPerPage;
    const indexOfFirstAlbum = indexOfLastAlbum - itemsPerPage;
    const currentAlbuns = albunsProcessados.slice(indexOfFirstAlbum, indexOfLastAlbum);
    const totalPages = Math.ceil(albunsProcessados.length / itemsPerPage);

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
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                            onClick={() => setCurrentPage(number)}
                            className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                            style={{ cursor: 'pointer', transition: 'all 0.2s', fontWeight: currentPage === number ? 'bold' : 'normal' }}
                        >
                            {number}
                        </button>
                    )
                ))}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
        <div className="dashboard-page-content dash-albuns-wrapper">
            
            <div className="dash-albuns-header">
                <h2 className="dash-albuns-title">Meus álbuns</h2>
                
                <div className="dash-albuns-actions">
                    <Link to="/dashboard/upload" className='create-button'>Upar mídias</Link>
                    <Link to="/dashboard/albuns/novo" className='create-button'>Criar novo álbum +</Link>
                </div>
            </div>

            <div className="dash-search-wrapper">
                <div className="dash-search-input-box">
                    <input 
                        type="text" 
                        placeholder="Pesquisar álbum por título..." 
                        value={termoPesquisa}
                        onChange={(e) => {
                            setTermoPesquisa(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="dash-search-input"
                    />
                </div>
            </div>

            <div className="dash-table-card">
                <div className="dash-table-responsive">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>ÁLBUM</th>
                                <th>DATA DO EVENTO</th>
                                <th>QTD VENDIDA</th>
                                <th>ARRECADADO</th>
                                <th className="hide-mobile">STATUS</th>
                                <th style={{ textAlign: 'center' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAlbuns.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="dash-table-empty">
                                        Nenhum álbum encontrado.
                                    </td>
                                </tr>
                            )}
                            {currentAlbuns.map(album => (
                                <tr key={album.id}>
                                    <td>
                                        <div className="dash-album-info">
                                            {album.capa ? (
                                                <img 
                                                    src={album.capa} 
                                                    alt={`Capa do álbum ${album.titulo}`} 
                                                    className="dash-album-cover"
                                                />
                                            ) : (
                                                <div className="dash-album-placeholder">
                                                    Sem Capa
                                                </div>
                                            )}
                                            <Link to={`/dashboard/albuns/${album.id}`} className="dash-album-link">
                                                {album.titulo}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="dash-td-text">
                                        {new Date(album.data_evento).toLocaleDateString()}
                                    </td>
                                    <td className="dash-td-text dash-td-bold">
                                        {album.qtd_vendida || 0} mídias
                                    </td>
                                    <td className="dash-td-success">
                                        R$ {parseFloat(album.total_arrecadado || 0).toFixed(2)}
                                    </td>
                                    <td className="hide-mobile">
                                        {album.is_arquivado ? (
                                            <span className="dash-badge dash-badge-archived">Arquivado</span>
                                        ) : (
                                            <span className="dash-badge dash-badge-public">Público</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="dash-action-buttons">
                                            <button 
                                                onClick={() => { setEditingAlbum(album); setIsEditModalOpen(true); }} 
                                                className="btn-acao btn-acao-edit"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleToggleArchiveClick(album)} 
                                                className={`btn-acao ${album.is_arquivado ? 'btn-acao-unarchive' : 'btn-acao-archive'}`}
                                            >
                                                {album.is_arquivado ? 'Desarquivar' : 'Arquivar'}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(album)} 
                                                className="btn-acao btn-acao-delete"
                                                title="Excluir Álbum Definitivamente"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {renderPagination()}

            {/* MODAL DE EDIÇÃO */}
            {isEditModalOpen && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content">
                        <AlbumForm 
                            onSubmit={handleEditSubmit} 
                            initialData={editingAlbum} 
                            onCancel={() => { setIsEditModalOpen(false); setEditingAlbum(null); }} 
                        />
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE ARQUIVAR */}
            {isConfirmModalOpen && albumParaMudar && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title">
                            {albumParaMudar.is_arquivado ? 'Desarquivar Álbum?' : 'Arquivar Álbum?'}
                        </h3>
                        <p className="dash-modal-text">
                            {albumParaMudar.is_arquivado 
                                ? "Tem certeza que deseja desarquivar este álbum? Ele voltará a ficar público."
                                : "Tem certeza que deseja arquivar este álbum? Ele será removido da loja."}
                        </p>
                        <div className="dash-modal-actions">
                            <button onClick={() => setIsConfirmModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
                            <button onClick={confirmarAcao} className={`modal-btn-confirm ${albumParaMudar.is_arquivado ? 'btn-success' : 'btn-danger'}`}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EXCLUSÃO DEFINITIVA */}
            {isDeleteModalOpen && albumParaExcluir && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal-content dash-modal-small">
                        <h3 className="dash-modal-title text-danger">
                            ⚠️ Excluir Álbum?
                        </h3>
                        <p className="dash-modal-text">
                            Tem certeza que deseja excluir o álbum <strong>{albumParaExcluir.titulo}</strong>?
                        </p>
                        <p className="dash-modal-warning">
                            Atenção: Esta ação é permanente e apagará todas as mídias dentro dele.
                        </p>
                        <div className="dash-modal-actions">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
                            <button onClick={confirmarExclusao} className="modal-btn-confirm btn-danger">
                                Sim, Excluir Definitivamente
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default DashboardAlbunsPage;