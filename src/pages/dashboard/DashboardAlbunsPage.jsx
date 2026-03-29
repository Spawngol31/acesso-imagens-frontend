// src/pages/dashboard/DashboardAlbunsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AlbumForm from './AlbumForm';

function DashboardAlbunsPage() {
    const [albuns, setAlbuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);

    const corPrincipal = '#6c0464';

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
            setIsModalOpen(false);
            setEditingAlbum(null);
            fetchAlbuns();
        } catch (error) { 
            console.error("Erro ao editar álbum:", error); 
            alert("Erro ao salvar."); 
        }
    };
    
    const handleToggleArchive = async (album) => {
        const acao = album.is_arquivado ? 'desarquivar' : 'arquivar';
        const confirmMessage = album.is_arquivado 
            ? "Tem certeza que deseja desarquivar este álbum? Ele voltará a ser público."
            : "Tem certeza que deseja arquivar este álbum? Ele não poderá mais ser comprado. (Isto não afeta vendas já concluídas)";
        
        if (window.confirm(confirmMessage)) {
            try {
                await axiosInstance.post(`/dashboard/albuns/${album.id}/${acao}/`);
                fetchAlbuns(); // Recarrega a lista
            } catch (error) {
                console.error(`Erro ao ${acao} álbum:`, error);
            }
        }
    };

    // --- ESTILOS REUTILIZÁVEIS ---
    const btnAcaoStyle = {
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', 
        cursor: 'pointer', border: 'none', transition: 'all 0.2s', textDecoration: 'none',
        display: 'inline-block', textAlign: 'center'
    };

    const btnTopStyle = {
        ...btnAcaoStyle,
        padding: '10px 20px',
        fontSize: '14px'
    };

    if (loading) return <p style={{ padding: '20px', color: '#666' }}>A carregar os seus álbuns...</p>;

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* CABEÇALHO DA PÁGINA (Alinhado e Responsivo) */}
            <div style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <h2 style={{ color: corPrincipal, margin: 0, fontSize: '24px' }}>📸 Meus álbuns</h2>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link to="/dashboard/upload" className='create-button'>
                        Upar mídias
                    </Link>
                    <Link to="/dashboard/albuns/novo" className='create-button'>
                        Criar novo álbum +
                    </Link>
                </div>
            </div>

            {/* ÁREA DA TABELA */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ebddea', color: corPrincipal, textAlign: 'left' }}>
                                <th style={{ padding: '15px 10px', borderRadius: '6px 0 0 0' }}>TÍTULO</th>
                                <th style={{ padding: '15px 10px' }}>DATA DO EVENTO</th>
                                <th className="hide-mobile" style={{ padding: '15px 10px' }}>CATEGORIA</th>
                                <th className="hide-mobile" style={{ padding: '15px 10px' }}>STATUS</th>
                                <th style={{ padding: '15px 10px', borderRadius: '0 6px 0 0', textAlign: 'center' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albuns.length > 0 ? albuns.map(album => (
                                <tr key={album.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>
                                        <Link to={`/dashboard/albuns/${album.id}`} style={{ color: corPrincipal, textDecoration: 'none' }}>
                                            {album.titulo}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '15px 10px', color: '#555' }}>
                                        {new Date(album.data_evento).toLocaleDateString()}
                                    </td>
                                    <td className="hide-mobile" style={{ padding: '15px 10px' }}>
                                        <span style={{ backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#495057' }}>
                                            {album.categoria.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="hide-mobile" style={{ padding: '15px 10px' }}>
                                        <span style={{ 
                                            backgroundColor: album.is_publico ? '#d4edda' : '#fff3cd', 
                                            color: album.is_publico ? '#155724' : '#856404', 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                                        }}>
                                            {album.is_publico ? 'Público' : 'Privado'}
                                        </span>
                                        {album.is_arquivado && (
                                            <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginLeft: '5px' }}>
                                                Arquivado
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button 
                                            onClick={() => { setEditingAlbum(album); setIsModalOpen(true); }} 
                                            style={{ ...btnAcaoStyle, backgroundColor: '#fbf0fa', color: corPrincipal, border: `1px solid ${corPrincipal}` }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleToggleArchive(album)} 
                                            style={{ ...btnAcaoStyle, backgroundColor: album.is_arquivado ? '#28a745' : '#dc3545', color: 'white' }}
                                        >
                                            {album.is_arquivado ? 'Desarquivar' : 'Arquivar'}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                                        Você ainda não criou nenhum álbum.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE EDIÇÃO (Com fundo desfocado idêntico ao Admin) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <AlbumForm 
                            onSubmit={handleEditSubmit} 
                            initialData={editingAlbum} 
                            onCancel={() => { setIsModalOpen(false); setEditingAlbum(null); }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAlbunsPage;