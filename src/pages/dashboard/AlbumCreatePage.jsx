// src/pages/dashboard/AlbumCreatePage.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AlbumForm from './AlbumForm';
import { toast } from 'react-toastify';

function AlbumCreatePage() {
    const navigate = useNavigate();

    const handleCreateAlbum = async (albumData, capaFile) => {
        const formData = new FormData();

        Object.keys(albumData).forEach(key => {
            if (albumData[key] !== null && key !== 'id') {
                formData.append(key, albumData[key]);
            }
        });

        if (capaFile) {
            formData.append('capa', capaFile);
        }

        try {
            const response = await axiosInstance.post('/dashboard/albuns/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newAlbumId = response.data.id;
            toast.success('Álbum criado com sucesso! A redirecionar para a página de upload.');
            navigate(`/dashboard/albuns/${newAlbumId}`);

        } catch (error) {
            console.error("Erro ao criar álbum:", error);
            toast.error("Erro ao criar o álbum. Verifique os dados e tente novamente.");
        }
    };

    return (
        <div className="dashboard-page-content">
            <div className="page-header" style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <h2 style={{ margin: 0, fontSize: '28px' }}>🖼️ Criação de álbuns</h2>
                {/* O botão de cancelar agora fica dentro do próprio formulário */}
            </div>

            {/* --- MUDANÇA PRINCIPAL AQUI --- */}
            {/* Envolvemos o formulário num contentor com o estilo que já temos */}
            <div className="table-wrapper" style={{ padding: '2rem' }}>
                <AlbumForm 
                    onSubmit={handleCreateAlbum}
                    onCancel={() => navigate('/dashboard/albuns')}
                />
            </div>
        </div>
    );
}

export default AlbumCreatePage;