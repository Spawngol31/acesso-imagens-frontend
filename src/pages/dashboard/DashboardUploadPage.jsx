// src/pages/dashboard/DashboardUploadPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify'; 

function DashboardUploadPage() {
    const [albuns, setAlbuns] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState('');
    const [existingCategories, setExistingCategories] = useState([]);

    const [fotoFiles, setFotoFiles] = useState([]);
    const [fotoPreco, setFotoPreco] = useState('15.00');
    const [fotoLegenda, setFotoLegenda] = useState('');
    const [fotoCategoria, setFotoCategoria] = useState(''); 
    
    const [meusJornais, setMeusJornais] = useState([]); 
    const [selectedJornais, setSelectedJornais] = useState([]); 
    const [uploadDestino, setUploadDestino] = useState('site');

    const [isUploadingFotos, setIsUploadingFotos] = useState(false);
    const [uploadStatusMsg, setUploadStatusMsg] = useState('');

    const [stagedVideos, setStagedVideos] = useState([]);
    const [isUploadingVideos, setIsUploadingVideos] = useState(false);
    const [uploadProgressVideos, setUploadProgressVideos] = useState(0);
    const [videoCategoria, setVideoCategoria] = useState('');

    const [tamanhoFila, setTamanhoFila] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resAlbuns = await axiosInstance.get('/dashboard/albuns/');
                setAlbuns(resAlbuns.data);
                
                const resJornais = await axiosInstance.get('/admin/jornais-parceiros/meus_jornais/');
                setMeusJornais(resJornais.data);
            } catch (error) {
                console.error("Erro ao buscar dados iniciais:", error);
                toast.error("Erro ao carregar os dados da página.");
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchAlbumCategories = async () => {
            if (!selectedAlbum) {
                setExistingCategories([]);
                return;
            }
            try {
                const response = await axiosInstance.get(`/albuns/${selectedAlbum}/?timestamp=${new Date().getTime()}`);
                const albumData = response.data;
                const todasCategorias = new Set();
                
                if (albumData.fotos) {
                    albumData.fotos.forEach(f => {
                        if (f.categoria && f.categoria.trim() !== '') todasCategorias.add(f.categoria.trim());
                    });
                }
                if (albumData.videos) {
                    albumData.videos.forEach(v => {
                        if (v.categoria && v.categoria.trim() !== '') todasCategorias.add(v.categoria.trim());
                    });
                }
                
                setExistingCategories(Array.from(todasCategorias).sort());
            } catch (error) {
                console.error("Erro ao buscar categorias do álbum", error);
            }
        };
        fetchAlbumCategories();
    }, [selectedAlbum]);

    useEffect(() => {
        const verificarFila = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/status-fila/');
                setTamanhoFila(response.data.fotos_na_fila);
            } catch (error) {
                console.error("Erro ao ler o status da fila.");
            }
        };

        verificarFila(); 
        const intervalo = setInterval(verificarFila, 10000); 
        return () => clearInterval(intervalo); 
    }, []);

    const toggleJornal = (jornalId) => {
        setSelectedJornais(prev => 
            prev.includes(jornalId) ? prev.filter(id => id !== jornalId) : [...prev, jornalId] 
        );
    };

    const handlePhotoSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedAlbum) {
            toast.info("Por favor, selecione um álbum de destino primeiro (Passo 1).");
            return;
        }
        if (fotoFiles.length === 0) {
            toast.info("Por favor, selecione pelo menos um ficheiro de foto.");
            return;
        }
        
        if ((uploadDestino === 'ambos' || uploadDestino === 'ftp') && selectedJornais.length === 0) {
            toast.error("Selecione pelo menos um jornal parceiro na lista de FTP!");
            return;
        }

        setIsUploadingFotos(true);
        let fotosEnviadasComSucesso = 0;
        let fotosComErro = 0;
        const LOTE_SIZE = 5; 
        
        for (let i = 0; i < fotoFiles.length; i += LOTE_SIZE) {
            const loteAtual = Array.from(fotoFiles).slice(i, i + LOTE_SIZE);
            setUploadStatusMsg(`A enviar pacote ${i + 1} a ${Math.min(i + LOTE_SIZE, fotoFiles.length)} de ${fotoFiles.length}... Por favor, não feche a página!`);

            const promessasDeUpload = loteAtual.map(async (file) => {
                const formData = new FormData();
                formData.append('album', selectedAlbum);
                formData.append('imagem', file);
                formData.append('destino_upload', uploadDestino); 
                formData.append('categoria', fotoCategoria);
                
                if (uploadDestino !== 'ftp') {
                    formData.append('preco', fotoPreco);
                    formData.append('legenda', fotoLegenda);
                }

                if (uploadDestino !== 'site' && selectedJornais.length > 0) {
                    formData.append('jornais', selectedJornais.join(','));
                }

                try {
                    await axiosInstance.post('/fotos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    return 'sucesso';
                } catch (error) {
                    console.error(`Erro ao enviar a foto ${file.name}:`, error);
                    return 'erro';
                }
            });

            const resultadosDoLote = await Promise.all(promessasDeUpload);
            resultadosDoLote.forEach(resultado => {
                if (resultado === 'sucesso') fotosEnviadasComSucesso++;
                else fotosComErro++;
            });
        }

        setIsUploadingFotos(false);
        setUploadStatusMsg('');
        
        if (fotosComErro > 0) {
            toast.error(`${fotosEnviadasComSucesso} fotos enviadas. ${fotosComErro} falharam. Verifique a sua conexão.`);
        } else {
            toast.success(`${fotosEnviadasComSucesso} foto(s) enviadas com sucesso para a fila de processamento!`);
        }

        setFotoFiles([]);
        setUploadDestino('site');
        setSelectedJornais([]);
        const photoForm = e.target;
        const fileInput = photoForm.querySelector('#photo-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleVideoSelect = (e) => {
        const files = Array.from(e.target.files);
        const newStagedVideos = files.map(file => ({ id: Date.now() + Math.random(), videoFile: file, titulo: '', preco: '50.00' }));
        setStagedVideos(prev => [...prev, ...newStagedVideos]);
    };

    const handleStagedVideoChange = (id, field, value) => {
        setStagedVideos(prev => prev.map(video => video.id === id ? { ...video, [field]: value } : video));
    };

    const removeStagedVideo = (id) => {
        setStagedVideos(prev => prev.filter(video => video.id !== id));
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlbum) {
            toast.info("Por favor, selecione um álbum de destino primeiro (Passo 1).");
            return;
        }
        if (stagedVideos.length === 0) {
            toast.info("Nenhum vídeo selecionado para envio.");
            return;
        }
        
        setIsUploadingVideos(true);
        setUploadProgressVideos(0);
        for (let i = 0; i < stagedVideos.length; i++) {
            const video = stagedVideos[i];
            setUploadProgressVideos(i + 1);
            const formData = new FormData();
            formData.append('album', selectedAlbum);
            formData.append('titulo', video.titulo);
            formData.append('preco', video.preco);
            formData.append('arquivo_video', video.videoFile);
            formData.append('categoria', videoCategoria);
            
            try {
                await axiosInstance.post('/dashboard/videos/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } catch (error) {
                console.error(`Erro ao enviar o vídeo ${video.videoFile.name}:`, error);
                toast.error(`Erro ao enviar o vídeo ${video.videoFile.name}`);
            }
        }
        setIsUploadingVideos(false);
        toast.success(`${stagedVideos.length} vídeo(s) enviados com sucesso!`);
        setStagedVideos([]);
        const videoUploadInput = document.getElementById('video-upload');
        if(videoUploadInput) videoUploadInput.value = '';
    };

    return (
        <div className="dashboard-page-content upload-page-wrapper">
            <div className="upload-header-box">
                <h2 className="upload-main-title">Upload de mídias</h2>
            </div>

            {tamanhoFila > 0 && (
                <div className="upload-radar-box">
                    <span>Radar do Servidor: Estamos processando <span className="upload-radar-number">{tamanhoFila}</span> fotos neste momento.</span>
                </div>
            )}
            
            <div className="album-selector-wrapper">
                <span className="upload-label-clean">1. Selecione o álbum de destino:</span>
                <select id="album-select" value={selectedAlbum} onChange={(e) => setSelectedAlbum(e.target.value)} className="upload-input upload-select-main">
                    <option value="" disabled>-- Escolha um álbum --</option>
                    {albuns.map(album => (<option key={album.id} value={album.id}>{album.titulo}</option>))}
                </select>
            </div>
            
            {selectedAlbum && (
                <div className="upload-section">
                    
                    {/* FORMULÁRIO DE FOTOS */}
                    <form onSubmit={handlePhotoSubmit} className="upload-form">
                        <h3 className="upload-section-title">2. Adicionar novas fotos</h3>

                        {meusJornais.length > 0 && (
                            <div className="upload-input-group">
                                <span className="upload-label-clean">Para onde quer mandar essas fotos?</span>
                                <select
                                    value={uploadDestino}
                                    onChange={(e) => {
                                        setUploadDestino(e.target.value);
                                        if(e.target.value === 'site') setSelectedJornais([]);
                                    }}
                                    className="upload-input"
                                    disabled={isUploadingFotos}
                                >
                                    <option value="site">Salvar APENAS na minha Loja (Site)</option>
                                    <option value="ambos">Duplo Envio: Salvar na Loja + Enviar para Jornais</option>
                                    <option value="ftp">Enviar APENAS para os Jornais (FTP)</option>
                                </select>
                            </div>
                        )}

                        <div className="upload-input-group">
                            <span className="upload-label-clean">
                                Organizar em Aba / Sub-pasta (Opcional)
                            </span>

                            {existingCategories.length > 0 && (
                                <select
                                    value={existingCategories.includes(fotoCategoria) ? fotoCategoria : 'nova'}
                                    onChange={(e) => {
                                        if (e.target.value === 'nova') setFotoCategoria('');
                                        else setFotoCategoria(e.target.value);
                                    }}
                                    disabled={isUploadingFotos}
                                    className={`upload-input ${(!existingCategories.includes(fotoCategoria) || fotoCategoria === '') ? 'upload-input-mb' : ''}`}
                                >
                                    <option value="nova">Criar Nova Aba / Sub-pasta...</option>
                                    {existingCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            )}

                            {(!existingCategories.includes(fotoCategoria) || existingCategories.length === 0) && (
                                <input 
                                    type="text" 
                                    placeholder="Ex: Jogo 1 - Guarany x Pelotas" 
                                    value={fotoCategoria}
                                    onChange={(e) => setFotoCategoria(e.target.value)}
                                    disabled={isUploadingFotos}
                                    className="upload-input"
                                />
                            )}
                        </div>

                        <div className="upload-file-dropzone">
                            <label htmlFor="photo-upload" className="create-button dropzone-btn">Selecionar Ficheiros...</label>
                            <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple disabled={isUploadingFotos} style={{ display: 'none' }}/>
                            {fotoFiles.length > 0 && <p className="upload-files-selected">{fotoFiles.length} foto(s) selecionada(s)</p>}
                        </div>
                        
                        {uploadDestino !== 'ftp' && (
                            <div className="upload-row-flex">
                                <div className="upload-col-flex-2">
                                    <span className="upload-label-clean">Legenda para o Site (Opcional)</span>
                                    <input type="text" className="upload-input" onChange={(e) => setFotoLegenda(e.target.value)} disabled={isUploadingFotos}/>
                                </div>
                                <div className="upload-col-flex-1">
                                    <span className="upload-label-clean">Preço de Venda (R$)</span>
                                    <input type="number" step="0.01" className="upload-input" value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required={uploadDestino !== 'ftp'} disabled={isUploadingFotos} />
                                </div>
                            </div>
                        )}
                        
                        {isUploadingFotos && (
                            <div className="upload-status-alert">
                                {uploadStatusMsg}
                            </div>
                        )}
                        
                        {uploadDestino !== 'site' && meusJornais.length > 0 && (
                            <div className="upload-ftp-box">
                                <h4 className="upload-ftp-title">🚀 Distribuir via FTP para:</h4>
                                <p className="upload-ftp-desc">
                                    (Obrigatório) Escolha para quais parceiros deseja enviar estas fotos automaticamente.
                                </p>
                                <div className="upload-ftp-list">
                                    {meusJornais.map(jornal => (
                                        <label key={jornal.id} className="upload-ftp-checkbox-label">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedJornais.includes(jornal.id)}
                                                onChange={() => toggleJornal(jornal.id)}
                                                disabled={isUploadingFotos}
                                                className="upload-checkbox"
                                            />
                                            {jornal.nome_jornal}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="upload-actions-row">
                            <Link to="/dashboard/albuns" className="button-outline upload-btn-half">
                                Voltar
                            </Link>
                            <button type="submit" className="create-button upload-btn-half" disabled={isUploadingFotos || fotoFiles.length === 0} style={{ cursor: (isUploadingFotos || fotoFiles.length === 0) ? 'not-allowed' : 'pointer', opacity: (isUploadingFotos || fotoFiles.length === 0) ? 0.6 : 1 }}>
                                {isUploadingFotos ? 'A enviar...' : `Enviar Fotos`}
                            </button>
                        </div>
                    </form>

                    {/* FORMULÁRIO DE VÍDEOS */}
                    <form onSubmit={handleVideoSubmit} className="upload-form">
                        <h3 className="upload-section-title">3. Adicionar novos vídeos</h3>
                        
                        <div className="upload-input-group">
                            <span className="upload-label-clean">
                                Organizar em Aba / Sub-pasta (Opcional)
                            </span>

                            {existingCategories.length > 0 && (
                                <select
                                    value={existingCategories.includes(videoCategoria) ? videoCategoria : 'nova'}
                                    onChange={(e) => {
                                        if (e.target.value === 'nova') setVideoCategoria('');
                                        else setVideoCategoria(e.target.value);
                                    }}
                                    disabled={isUploadingVideos}
                                    className={`upload-input ${(!existingCategories.includes(videoCategoria) || videoCategoria === '') ? 'upload-input-mb' : ''}`}
                                >
                                    <option value="nova">Criar Nova Aba / Sub-pasta...</option>
                                    {existingCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            )}

                            {(!existingCategories.includes(videoCategoria) || existingCategories.length === 0) && (
                                <input 
                                    type="text" 
                                    placeholder="Ex: Entrevistas" 
                                    value={videoCategoria}
                                    onChange={(e) => setVideoCategoria(e.target.value)}
                                    disabled={isUploadingVideos}
                                    className="upload-input"
                                />
                            )}
                        </div>

                        <div className="upload-file-dropzone">
                            <label htmlFor="video-upload" className="create-button dropzone-btn">Selecionar Ficheiros de Vídeo...</label>
                            <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple disabled={isUploadingVideos} style={{ display: 'none' }}/>
                        </div>
                        
                        {stagedVideos.length > 0 && (
                            <div className="upload-staging-area">
                                <h4 className="staging-title">Vídeos selecionados:</h4>
                                {stagedVideos.map((video) => (
                                    <div key={video.id} className="staged-item-card">
                                        <p className="staged-item-name">{video.videoFile.name}</p>
                                        
                                        <div className="upload-row-flex staging-inputs">
                                            <input 
                                                type="text" 
                                                placeholder="Título do vídeo" 
                                                className="upload-input staging-input-title"
                                                onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} 
                                                disabled={isUploadingVideos}
                                            />
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="Preço R$"
                                                className="upload-input staging-input-price"
                                                value={video.preco} 
                                                onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} 
                                                required 
                                                disabled={isUploadingVideos}
                                            />
                                        </div>

                                        <button type="button" onClick={() => removeStagedVideo(video.id)} className="staging-remove-btn" disabled={isUploadingVideos}>Remover</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isUploadingVideos && <p className="upload-video-status">⏳ Enviando e processando vídeo {uploadProgressVideos} de {stagedVideos.length}... Por favor, não feche a página.</p>}
                        
                        <div className="upload-actions-row">
                            <Link to="/dashboard/albuns" className="button-outline upload-btn-half">
                                Voltar
                            </Link>
                            <button onClick={handleVideoSubmit} className="create-button upload-btn-half" disabled={isUploadingVideos || stagedVideos.length === 0} style={{ cursor: (isUploadingVideos || stagedVideos.length === 0) ? 'not-allowed' : 'pointer', opacity: (isUploadingVideos || stagedVideos.length === 0) ? 0.6 : 1 }}>
                                {isUploadingVideos ? 'A enviar...' : `Enviar ${stagedVideos.length} Vídeo(s)`}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default DashboardUploadPage;