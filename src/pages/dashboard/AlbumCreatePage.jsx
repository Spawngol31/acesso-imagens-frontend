// src/pages/dashboard/AlbumCreatePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AlbumForm from './AlbumForm';
import { toast } from 'react-toastify';

function AlbumCreatePage() {
    const navigate = useNavigate();

    const handleCreateAlbum = async (albumData) => {
        const formData = new FormData();

        Object.keys(albumData).forEach(key => {
            if (albumData[key] !== null && key !== 'id') {
                formData.append(key, albumData[key]);
            }
        });

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
        <div className="dashboard-page-content album-create-page-wrapper">
            <div className="dash-header-box">
                <h2 className="dash-main-title">Novo álbum</h2>
            </div>

            <div className="dash-form-wrapper">
                <AlbumForm 
                    onSubmit={handleCreateAlbum}
                    onCancel={() => navigate('/dashboard/albuns')}
                    isCreation={true} 
                />
            </div>
        </div>
    );
}

export default AlbumCreatePage;