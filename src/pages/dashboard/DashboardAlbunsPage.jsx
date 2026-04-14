import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AlbumForm from './AlbumForm';
import { toast } from 'react-toastify';

function DashboardAlbunsPage() {
    const [albuns, setAlbuns] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modais diferentes para funções diferentes
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [albumParaMudar, setAlbumParaMudar] = useState(null);

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
            setIsEditModalOpen(false);
            setEditingAlbum(null);
            fetchAlbuns();
            toast.success("Alterações salvas com sucesso!");
        } catch (error) { 
            console.error("Erro ao editar álbum:", error); 
            toast.error("Erro ao salvar."); 
        }
    };
    
    // --- LÓGICA DO MODAL DE CONFIRMAÇÃO ---
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

    const btnAcaoStyle = {
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', 
        cursor: 'pointer', border: 'none', transition: 'all 0.2s', textDecoration: 'none',
        display: 'inline-block', textAlign: 'center'
    };

    if (loading) return <p style={{ padding: '20px', color: '#666' }}>A carregar os seus álbuns...</p>;

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            <div style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <h2 style={{ color: corPrincipal, margin: 0, fontSize: '24px' }}>📸 Meus álbuns</h2>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link to="/dashboard/upload" className='create-button'>Upar mídias</Link>
                    <Link to="/dashboard/albuns/novo" className='create-button'>Criar novo álbum +</Link>
                </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ebddea', color: corPrincipal, textAlign: 'left' }}>
                                <th style={{ padding: '15px 10px' }}>TÍTULO</th>
                                <th style={{ padding: '15px 10px' }}>DATA DO EVENTO</th>
                                <th className="hide-mobile" style={{ padding: '15px 10px' }}>STATUS</th>
                                <th style={{ padding: '15px 10px', textAlign: 'center' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albuns.map(album => (
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
                                        {album.is_arquivado ? (
                                            <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Arquivado</span>
                                        ) : (
                                            <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Público</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button 
                                            onClick={() => { setEditingAlbum(album); setIsEditModalOpen(true); }} 
                                            style={{ ...btnAcaoStyle, backgroundColor: '#fbf0fa', color: corPrincipal, border: `1px solid ${corPrincipal}` }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleToggleArchiveClick(album)} 
                                            style={{ ...btnAcaoStyle, backgroundColor: album.is_arquivado ? '#28a745' : '#dc3545', color: 'white' }}
                                        >
                                            {album.is_arquivado ? 'Desarquivar' : 'Arquivar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE EDIÇÃO */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <AlbumForm 
                            onSubmit={handleEditSubmit} 
                            initialData={editingAlbum} 
                            onCancel={() => { setIsEditModalOpen(false); setEditingAlbum(null); }} 
                        />
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO (O NOVO!) */}
            {isConfirmModalOpen && albumParaMudar && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '450px', width: '90%', textAlign: 'center' }}>
                        <h3 style={{ color: corPrincipal, marginTop: 0 }}>
                            {albumParaMudar.is_arquivado ? 'Desarquivar Álbum?' : 'Arquivar Álbum?'}
                        </h3>
                        <p style={{ color: '#555', fontSize: '16px' }}>
                            {albumParaMudar.is_arquivado 
                                ? "Tem certeza que deseja desarquivar este álbum? Ele voltará a ficar público."
                                : "Tem certeza que deseja arquivar este álbum? Ele será removido da loja."}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button onClick={() => setIsConfirmModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #ccc', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={confirmarAcao} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: albumParaMudar.is_arquivado ? '#28a745' : '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAlbunsPage;