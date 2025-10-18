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
    
    const handleDelete = async (albumId) => {
        if (window.confirm("Tem certeza que deseja apagar este álbum e todas as suas fotos?")) {
            try {
                await axiosInstance.delete(`/dashboard/albuns/${albumId}/`);
                fetchAlbuns();
            } catch (error) { 
                console.error("Erro ao apagar álbum:", error); 
            }
        }
    };

    if (loading) return <p>A carregar os seus álbuns...</p>;

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Meus álbuns</h2>
                <div className="header-actions">
                    <Link to="/dashboard/upload" className="create-button secondary">
                        Upar mídias
                    </Link>
                    <Link to="/dashboard/albuns/novo" className="create-button">
                        Criar novo álbum +
                    </Link>
                </div>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Data do evento</th>
                            <th className="hide-mobile">Categoria</th> {/* Esconder no telemóvel */}
                            <th className="hide-mobile">Status</th>    {/* Esconder no telemóvel */}
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {albuns.length > 0 ? albuns.map(album => (
                            <tr key={album.id}>
                                <td><Link to={`/dashboard/albuns/${album.id}`}>{album.titulo}</Link></td>
                                <td>{new Date(album.data_evento).toLocaleDateString()}</td>
                                <td className="hide-mobile">{album.categoria.replace('_', ' ')}</td> {/* Esconder no telemóvel */}
                                <td className="hide-mobile">{album.is_publico ? 'Público' : 'Privado'}</td> {/* Esconder no telemóvel */}
                                <td className="action-cell">
                                    <button onClick={() => { setEditingAlbum(album); setIsModalOpen(true); }} className="edit-button-pill">Editar</button>
                                    <button onClick={() => handleDelete(album.id)} className="delete-button-pill">Excluir</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Você ainda não criou nenhum álbum.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
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