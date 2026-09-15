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
            setError('');
        }
    };

    const handleClearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('imagem', selectedFile);

        try {
            const response = await axiosInstance.post('/watermark-tool/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'blob', 
            });

            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'watermarked_image.jpg';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        } catch (err) {
            console.error("Erro ao processar imagem:", err);
            setError("❌ Ocorreu um erro ao processar a imagem. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-page-content watermark-page-wrapper">
            
            {/* CABEÇALHO */}
            <div className="dash-header-box">
                <h2 className="dash-main-title">
                    Aplicar marca d'água
                </h2>
            </div>

            {/* CARTÃO PRINCIPAL */}
            <div className="watermark-main-card">
                
                <p className="watermark-desc">
                    Envie uma foto para aplicar a marca d'água exclusiva da <strong>Acesso Imagens</strong>.<br/> 
                    O download começará automaticamente após o processamento.
                </p>

                <form onSubmit={handleSubmit}>
                    
                    {/* ÁREA DE UPLOAD VS. PRÉ-VISUALIZAÇÃO */}
                    {!previewUrl ? (
                        // Estado 1: Nenhuma foto selecionada (Mostra a zona de drop/clique)
                        <label htmlFor="watermark-upload" className="watermark-dropzone">
                            <span className="watermark-drop-title">
                                Clique para escolher a foto
                            </span>
                            <span className="watermark-drop-subtitle">Ficheiros suportados: JPG, PNG</span>
                        </label>
                    ) : (
                        // Estado 2: Foto selecionada (Mostra o preview elegante)
                        <div className="watermark-preview-box">
                            <div className="watermark-img-wrapper">
                                <img src={previewUrl} alt="Pré-visualização" className="watermark-preview-img" />
                            </div>
                            
                            <div className="watermark-preview-actions">
                                <p className="watermark-file-name">
                                    Ficheiro selecionado: <span>{selectedFile.name}</span>
                                </p>
                                <button type="button" onClick={handleClearSelection} className="button-outline watermark-btn-change">
                                    Trocar Imagem
                                </button>
                            </div>
                        </div>
                    )}

                    {/* INPUT INVISÍVEL */}
                    <input id="watermark-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

                    {/* MENSAGEM DE ERRO */}
                    {error && <p className="watermark-error-msg">{error}</p>}

                    {/* BOTÃO FINAL (Inteligente) */}
                    <div className="watermark-submit-row">
                        <button 
                            type="submit" 
                            disabled={isLoading || !selectedFile} 
                            className={`create-button watermark-submit-btn ${(!selectedFile || isLoading) ? 'disabled' : ''}`}
                        >
                            {isLoading ? 'A aplicar marca d\'água...' : 'Gerar e baixar Foto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WatermarkToolPage;