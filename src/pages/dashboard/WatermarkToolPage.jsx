// src/pages/dashboard/WatermarkToolPage.jsx
import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

function WatermarkToolPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('imagem', selectedFile);

        try {
            // Importante: a resposta será um 'blob' (o ficheiro da imagem)
            const response = await axiosInstance.post('/watermark-tool/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'blob', 
            });

            // Pega o nome do ficheiro do cabeçalho da resposta
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'watermarked_image.jpg';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
            }

            // Cria um link temporário para iniciar o download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        } catch (err) {
            console.error("Erro ao processar imagem:", err);
            setError("Ocorreu um erro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Ferramenta de marca d'água</h2>
            </div>
            <div className="table-wrapper" style={{ padding: '2rem' }}>
                <p>Envie uma foto para aplicar a marca d'água da acesso e baixá-la imediatamente.</p>
                <form onSubmit={handleSubmit} className="album-form">
                    <div>
                        <label htmlFor="watermark-upload" className="custom-file-upload">
                            Escolher imagem
                        </label>
                        <input id="watermark-upload" type="file" accept="image/*" onChange={handleFileChange} />
                        {selectedFile && <span className="file-name">{selectedFile.name}</span>}
                    </div>

                    {previewUrl && (
                        <div className="rotation-preview-wrapper">
                            <img src={previewUrl} alt="Pré-visualização" className="rotation-preview-image" />
                        </div>
                    )}
                    
                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                        <button type="submit" className="create-button" disabled={isLoading || !selectedFile}>
                            {isLoading ? 'A processar...' : 'Gerar e Baixar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WatermarkToolPage;