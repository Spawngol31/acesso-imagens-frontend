// src/pages/dashboard/WatermarkToolPage.jsx
import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

function WatermarkToolPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const corPrincipal = '#6c0464';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    // Nova função para limpar a seleção e escolher outra foto
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

            // Opcional: Limpa a tela após o download bem-sucedido
            // handleClearSelection();

        } catch (err) {
            console.error("Erro ao processar imagem:", err);
            setError("❌ Ocorreu um erro ao processar a imagem. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* CABEÇALHO */}
            <div className="page-header" style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: corPrincipal }}>
                    ⚙️ Ferramenta de Marca d'água
                </h2>
            </div>

            {/* CARTÃO PRINCIPAL */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                
                <p style={{ textAlign: 'center', color: '#555', fontSize: '15px', marginBottom: '30px', lineHeight: '1.6' }}>
                    Envie uma foto para aplicar a marca d'água exclusiva da <strong>Acesso Imagens</strong>.<br/> 
                    O download começará automaticamente após o processamento.
                </p>

                <form onSubmit={handleSubmit}>
                    
                    {/* ÁREA DE UPLOAD VS. PRÉ-VISUALIZAÇÃO */}
                    {!previewUrl ? (
                        // Estado 1: Nenhuma foto selecionada (Mostra a zona de drop/clique)
                        <label htmlFor="watermark-upload" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '60px 20px', border: `2px dashed #e1bce0`, borderRadius: '12px',
                            backgroundColor: '#fdfbfe', cursor: 'pointer', transition: 'background-color 0.2s',
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '48px', marginBottom: '15px' }}>📸</span>
                            <span style={{ color: corPrincipal, fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>
                                Clique para escolher a foto
                            </span>
                            <span style={{ color: '#888', fontSize: '13px' }}>Ficheiros suportados: JPG, PNG</span>
                        </label>
                    ) : (
                        // Estado 2: Foto selecionada (Mostra o preview elegante)
                        <div style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', 
                            padding: '20px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fafafa' 
                        }}>
                            <div style={{ width: '100%', maxHeight: '400px', display: 'flex', justifyContent: 'center', backgroundColor: '#eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={previewUrl} alt="Pré-visualização" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                            </div>
                            
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#555', fontWeight: '600' }}>
                                    Ficheiro selecionado: <span style={{ color: corPrincipal }}>{selectedFile.name}</span>
                                </p>
                                <button type="button" onClick={handleClearSelection} style={{ 
                                    padding: '8px 20px', borderRadius: '50px', border: '1px solid #ced4da', 
                                    backgroundColor: '#fff', color: '#495057', fontWeight: 'bold', cursor: 'pointer' 
                                }}>
                                    Trocar Imagem
                                </button>
                            </div>
                        </div>
                    )}

                    {/* INPUT INVISÍVEL */}
                    <input id="watermark-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

                    {/* MENSAGEM DE ERRO */}
                    {error && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '15px', fontWeight: 'bold', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '6px' }}>{error}</p>}

                    {/* BOTÃO FINAL (Inteligente) */}
                    <div style={{ marginTop: '30px' }}>
                        <button 
                            type="submit" 
                            disabled={isLoading || !selectedFile} 
                            style={{
                                width: '100%', padding: '16px', borderRadius: '30px', border: 'none',
                                backgroundColor: (!selectedFile || isLoading) ? '#ccc' : corPrincipal,
                                color: 'white', fontSize: '16px', fontWeight: 'bold', 
                                cursor: (!selectedFile || isLoading) ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                            }}
                        >
                            {isLoading ? '⏳ A aplicar marca d\'água...' : '✨ Gerar e Baixar Foto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WatermarkToolPage;