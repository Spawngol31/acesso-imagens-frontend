// src/pages/dashboard/DashboardUploadPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify'; 

function DashboardUploadPage() {
    const [albuns, setAlbuns] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState('');
    
    // 🚀 NOVO: Estado para guardar as categorias que já existem no álbum selecionado
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
    
    // 🚀 NOVO: Categoria global para vídeos nesta página também
    const [videoCategoria, setVideoCategoria] = useState('');

    const [tamanhoFila, setTamanhoFila] = useState(0);

    // 🚀 ESTILOS LIMPOS PADRONIZADOS
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', backgroundColor: '#ffffff', color: '#333333', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
    
    // Mudamos o display para block para o span se comportar como uma label, mas imune ao CSS global!
    const labelStyleClean = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '8px', border: 'none', outline: 'none', background: 'transparent', boxShadow: 'none', padding: 0 };

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

    // 🚀 NOVO: Busca as categorias sempre que o fotógrafo escolhe um álbum no Passo 1
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
            prev.includes(jornalId) 
            ? prev.filter(id => id !== jornalId) 
            : [...prev, jornalId] 
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
                    await axiosInstance.post('/fotos/upload/', formData, { 
                        headers: { 'Content-Type': 'multipart/form-data' } 
                    });
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
            
            // 🚀 Aplica a categoria a todos os vídeos enviados neste lote
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
        <div className="dashboard-page-content">
            <div className="page-header" style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>Upload de mídias</h2>
            </div>

            {tamanhoFila > 0 && (
                <div style={{ 
                    backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', padding: '10px 15px', 
                    borderRadius: '8px', marginBottom: '20px', color: '#0050b3',
                    display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'
                }}>
                    
                    <span>Radar do Servidor: Estamos processando <span style={{ color: '#cf1322', fontSize: '1.1em', margin: '0 5px' }}>{tamanhoFila}</span> fotos neste momento.</span>
                </div>
            )}
            
            <div className="album-selector-wrapper">
                <span style={labelStyleClean}>1. Selecione o álbum de destino:</span>
                <select id="album-select" value={selectedAlbum} onChange={(e) => setSelectedAlbum(e.target.value)} style={{...inputStyle, marginBottom: '20px'}}>
                    <option value="" disabled>-- Escolha um álbum --</option>
                    {albuns.map(album => (<option key={album.id} value={album.id}>{album.titulo}</option>))}
                </select>
            </div>
            
            {selectedAlbum && (
                <div className="upload-section">
                    
                    {/* FORMULÁRIO DE FOTOS */}
                    <form onSubmit={handlePhotoSubmit} className="upload-form" style={{ marginBottom: '40px' }}>
                        <h3 style={{ marginBottom: '20px' }}>2. Adicionar novas fotos</h3>

                        {meusJornais.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <span style={labelStyleClean}>Para onde quer mandar essas fotos?</span>
                                <select
                                    value={uploadDestino}
                                    onChange={(e) => {
                                        setUploadDestino(e.target.value);
                                        if(e.target.value === 'site') setSelectedJornais([]);
                                    }}
                                    style={inputStyle}
                                    disabled={isUploadingFotos}
                                >
                                    <option value="site">Salvar APENAS na minha Loja (Site)</option>
                                    <option value="ambos">Duplo Envio: Salvar na Loja + Enviar para Jornais</option>
                                    <option value="ftp">Enviar APENAS para os Jornais (FTP)</option>
                                </select>
                            </div>
                        )}

                        {/* 🚀 DROP DOWN INTELIGENTE: ABA / CATEGORIA (FOTOS) */}
                        <div style={{ marginBottom: '15px' }}>
                            <span style={labelStyleClean}>
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
                                    style={{...inputStyle, marginBottom: (!existingCategories.includes(fotoCategoria) || fotoCategoria === '') ? '10px' : '0'}}
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
                                    style={inputStyle}
                                />
                            )}
                        </div>
                        {/* ------------------------------- */}

                        <div style={{ padding: '15px', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fafafa', marginBottom: '15px' }}>
                            <label htmlFor="photo-upload" className="create-button" style={{ display: 'inline-block', cursor: 'pointer', margin: 0 }}>Selecionar Ficheiros...</label>
                            <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple disabled={isUploadingFotos} style={{ display: 'none' }}/>
                            {fotoFiles.length > 0 && <p style={{ color: '#28a745', fontWeight: 'bold', margin: '10px 0 0 0', fontSize: '13px' }}>{fotoFiles.length} foto(s) selecionada(s)</p>}
                        </div>
                        
                        {uploadDestino !== 'ftp' && (
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ flex: 2 }}>
                                    <span style={labelStyleClean}>Legenda para o Site (Opcional)</span>
                                    <input type="text" style={inputStyle} onChange={(e) => setFotoLegenda(e.target.value)} disabled={isUploadingFotos}/>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={labelStyleClean}>Preço de Venda (R$)</span>
                                    <input type="number" step="0.01" style={inputStyle} value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required={uploadDestino !== 'ftp'} disabled={isUploadingFotos} />
                                </div>
                            </div>
                        )}
                        
                        {isUploadingFotos && (
                            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', border: '1px solid #ffeeba', fontWeight: 'bold', textAlign: 'center' }}>
                                {uploadStatusMsg}
                            </div>
                        )}
                        
                        {uploadDestino !== 'site' && meusJornais.length > 0 && (
                            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fbf0fa', borderRadius: '8px', border: '1px solid #e1bce0' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#6c0464' }}>🚀 Distribuir via FTP para:</h4>
                                <p style={{ fontSize: '12px', color: '#555', marginTop: 0, marginBottom: '10px' }}>
                                    (Obrigatório) Escolha para quais parceiros deseja enviar estas fotos automaticamente.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {meusJornais.map(jornal => (
                                        <label key={jornal.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedJornais.includes(jornal.id)}
                                                onChange={() => toggleJornal(jornal.id)}
                                                disabled={isUploadingFotos}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            {jornal.nome_jornal}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%' }}>
                            <Link to="/dashboard/albuns" className="button-outline" style={{ flex: 1, padding: 0, fontSize: '14px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', textDecoration: 'none', borderRadius: '25px', border: '1px solid #e1bce0', color: '#e1bce0' }}>
                                Voltar
                            </Link>
                            <button type="submit" className="create-button" disabled={isUploadingFotos || fotoFiles.length === 0} style={{ flex: 1, opacity: (isUploadingFotos || fotoFiles.length === 0) ? 0.6 : 1, padding: 0, fontSize: '14px', height: '45px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', borderRadius: '25px', border: 'none', backgroundColor: '#6c0464', color: '#fff', cursor: (isUploadingFotos || fotoFiles.length === 0) ? 'not-allowed' : 'pointer' }}>
                                {isUploadingFotos ? 'A enviar...' : `Enviar Fotos`}
                            </button>
                        </div>
                    </form>

                    {/* FORMULÁRIO DE VÍDEOS */}
                    <form onSubmit={handleVideoSubmit} className="upload-form">
                        <h3 style={{ marginBottom: '20px' }}>3. Adicionar novos vídeos</h3>
                        
                        {/* 🚀 DROP DOWN INTELIGENTE: ABA / CATEGORIA (VÍDEOS) */}
                        <div style={{ marginBottom: '15px' }}>
                            <span style={labelStyleClean}>
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
                                    style={{...inputStyle, marginBottom: (!existingCategories.includes(videoCategoria) || videoCategoria === '') ? '10px' : '0'}}
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
                                    style={inputStyle}
                                />
                            )}
                        </div>

                        <div style={{ padding: '15px', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fafafa', marginBottom: '15px' }}>
                            <label htmlFor="video-upload" className="create-button" style={{ display: 'inline-block', cursor: 'pointer', margin: 0 }}>Selecionar Ficheiros de Vídeo...</label>
                            <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple disabled={isUploadingVideos} style={{ display: 'none' }}/>
                        </div>
                        
                        {stagedVideos.length > 0 && (
                            <div className="staging-area" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '15px' }}>
                                <h4 style={{ marginTop: 0 }}>Vídeos selecionados:</h4>
                                {stagedVideos.map((video) => (
                                    <div key={video.id} className="staged-item" style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 5px 0', color: '#6c0464' }}>{video.videoFile.name}</p>
                                        
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Título do vídeo" 
                                                style={{...inputStyle, flex: '1 1 200px', marginBottom: 0}}
                                                onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} 
                                                disabled={isUploadingVideos}
                                            />
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="Preço R$"
                                                style={{...inputStyle, flex: '1 1 100px', marginBottom: 0}}
                                                value={video.preco} 
                                                onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} 
                                                required 
                                                disabled={isUploadingVideos}
                                            />
                                        </div>

                                        <button type="button" onClick={() => removeStagedVideo(video.id)} className="remove-button-small" disabled={isUploadingVideos} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remover</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isUploadingVideos && <p style={{ fontWeight: 'bold', color: '#6c0464', textAlign: 'center' }}>⏳ Enviando e processando vídeo {uploadProgressVideos} de {stagedVideos.length}... Por favor, não feche a página.</p>}
                        
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%' }}>
                            <Link to="/dashboard/albuns" className="button-outline" style={{ flex: 1, padding: 0, fontSize: '14px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', textDecoration: 'none', borderRadius: '25px', border: '1px solid #e1bce0', color: '#e1bce0' }}>
                                Voltar
                            </Link>
                            <button onClick={handleVideoSubmit} className="create-button" disabled={isUploadingVideos || stagedVideos.length === 0} style={{ flex: 1, opacity: (isUploadingVideos || stagedVideos.length === 0) ? 0.6 : 1, padding: 0, fontSize: '14px', height: '45px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', borderRadius: '25px', border: 'none', backgroundColor: '#6c0464', color: '#fff', cursor: (isUploadingVideos || stagedVideos.length === 0) ? 'not-allowed' : 'pointer' }}>
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