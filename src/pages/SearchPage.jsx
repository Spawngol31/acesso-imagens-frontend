// src/pages/SearchPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Lightbox from '../components/Lightbox';
import { useAuth } from '../contexts/AuthContext'; 
import { useCart } from '../contexts/CartContext'; 

function SearchPage() {
    const [referenceImage, setReferenceImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const { user } = useAuth();
    const { addToCart } = useCart();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReferenceImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setReferenceImage(null);
            setPreviewUrl('');
        }
    };

    // 🚀 A MÁGICA DA ECONOMIA E VELOCIDADE: Função nativa para comprimir a foto no navegador do cliente
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 800; // Tamanho ideal e minúsculo para a IA da AWS
                    let width = img.width;
                    let height = img.height;

                    // Mantém a proporção correta da imagem
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Transforma o Canvas num novo ficheiro JPEG levezinho (80% de qualidade)
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!referenceImage) {
            setError("Por favor, selecione uma imagem de referência.");
            return;
        }
        setIsLoading(true);
        setError('');
        setSearched(true);
        setSearchResults([]);
        
        try {
            // 1. O React comprime a selfie na hora (Ex: de 6MB cai para 150KB)
            const compressedFile = await compressImage(referenceImage);
            
            // 2. Monta o formulário com o ficheiro "peso-pluma"
            const formData = new FormData();
            formData.append('imagem_referencia', compressedFile); 
            
            // 3. Envia para o Django (que vai disparar mais rápido para a AWS)
            const response = await axiosInstance.post('/fotos/busca-facial/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSearchResults(response.data);
            
        } catch (err) {
            console.error("Erro na busca facial:", err);
            setError("Ocorreu um erro ao realizar a busca. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1>Busca facial</h1>
            <p style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem auto'}}>
                Envie uma selfie nítida para que o nosso sistema possa encontrar e reunir todas as suas fotos com mais precisão.
            </p>

            <form onSubmit={handleSubmit} className="search-form">
                
                <label htmlFor="file-upload" className="custom-file-upload">
                  Escolher imagem
                </label>
                
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                
                {referenceImage && <span className="file-name">{referenceImage.name}</span>}
                
                {previewUrl && <img src={previewUrl} alt="Pré-visualização" className="image-preview" />}
                
                <button type="submit" className="cta-button" disabled={isLoading || !referenceImage}>
                    {isLoading ? 'A procurar...' : 'Procurar Fotos'}
                </button>
            </form>

            {error && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}


            <hr style={{margin: '3rem 0', border: '1px solid #eee'}} />

            <div className="search-results">
                {isLoading ? (
                    <p style={{textAlign: 'center'}}>Aguarde, a busca facial pode demorar alguns segundos...</p>
                ) : searched && (
                    <>
                        <h2>Resultados da busca</h2>
                        {searchResults.length === 0 ? (
                            <p style={{textAlign: 'center'}}>Nenhuma foto foi encontrada com este rosto.</p>
                        ) : (
                            <div className="purchase-grid">
                                {searchResults.map(foto => (
                                    <div key={foto.id} className="purchase-card">                                        
                                        <div className="purchase-card-image" onClick={() => setSelectedImage(foto)}>
                                            <img 
                                                src={foto.imagem_url} 
                                                alt={foto.legenda || `Foto ${foto.id}`}
                                                style={{ transform: `rotate(${foto.rotacao}deg)` }}
                                            />
                                        </div>
                                        <div className="purchase-card-info">
                                            <p>R$ {parseFloat(foto.preco).toFixed(2)}</p>                                            
                                            
                                            {(!user || user.papel === 'CLIENTE') && (
                                                
                                                <button onClick={() => addToCart(foto)} className="create-button">
                                                    Adicionar ao carrinho
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedImage && (
                <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
            )}
        </div>
    );
}

export default SearchPage;