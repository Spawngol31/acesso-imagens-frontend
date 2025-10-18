// src/pages/SearchPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Lightbox from '../components/Lightbox';
import { useAuth } from '../contexts/AuthContext'; // Importa para saber se o utilizador está logado
import { useCart } from '../contexts/CartContext'; // Importa para adicionar ao carrinho

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
        const formData = new FormData();
        formData.append('imagem_referencia', referenceImage);
        try {
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
                            // --- GRELHA DE RESULTADOS ATUALIZADA ---
                            <div className="purchase-grid">
                                {searchResults.map(foto => (
                                    <div key={foto.id} className="purchase-card">
                                        <div className="purchase-card-image" onClick={() => setSelectedImage(foto.imagem_url)}>
                                            <img 
                                                src={foto.imagem_url} 
                                                alt={foto.legenda || `Foto ${foto.id}`}
                                                style={{ transform: `rotate(${foto.rotacao}deg)` }}
                                            />
                                        </div>
                                        <div className="purchase-card-info">
                                            <p>R$ {parseFloat(foto.preco).toFixed(2)}</p>
                                            {user && user.papel === 'CLIENTE' && (
                                                <button onClick={() => addToCart(foto.id)} className="create-button">
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
                <Lightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
            )}
        </div>
    );
}

export default SearchPage;
