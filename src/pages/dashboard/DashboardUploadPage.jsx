// src/pages/dashboard/DashboardUploadPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify'; 

function DashboardUploadPage() {
    const [albuns, setAlbuns] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState('');
    
    const [fotoFiles, setFotoFiles] = useState([]);
    const [fotoPreco, setFotoPreco] = useState('15.00');
    const [fotoLegenda, setFotoLegenda] = useState('');
    const [meusJornais, setMeusJornais] = useState([]); // Guarda os jornais vindos do backend
    const [selectedJornais, setSelectedJornais] = useState([]); // Guarda os que o fotógrafo marcou
    
    const [isUploadingFotos, setIsUploadingFotos] = useState(false);
    const [uploadStatusMsg, setUploadStatusMsg] = useState('');

    const [stagedVideos, setStagedVideos] = useState([]);
    const [isUploadingVideos, setIsUploadingVideos] = useState(false);
    const [uploadProgressVideos, setUploadProgressVideos] = useState(0);

    // --- 1. ESTADO DO RADAR ---
    const [tamanhoFila, setTamanhoFila] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Busca os álbuns
                const resAlbuns = await axiosInstance.get('/dashboard/albuns/');
                setAlbuns(resAlbuns.data);
                
                // Busca os jornais vinculados a este fotógrafo
                const resJornais = await axiosInstance.get('/admin/jornais-parceiros/meus_jornais/');
                setMeusJornais(resJornais.data);
            } catch (error) {
                console.error("Erro ao buscar dados iniciais:", error);
                toast.error("Erro ao carregar os dados da página.");
            }
        };
        fetchData();
    }, []);

    // --- 2. LÓGICA DO RADAR (RODA A CADA 10 SEGUNDOS) ---
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
    // ----------------------------------------------------

    const toggleJornal = (jornalId) => {
        setSelectedJornais(prev => 
            prev.includes(jornalId) 
            ? prev.filter(id => id !== jornalId) // Desmarca se já estava marcado
            : [...prev, jornalId] // Marca se estava desmarcado
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
                formData.append('preco', fotoPreco);
                formData.append('legenda', fotoLegenda);

                if (selectedJornais.length > 0) {
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
        for (const video of stagedVideos) {
            if (!video.titulo) {
                toast.error(`Por favor, adicione um título para o vídeo: ${video.videoFile.name}`);
                return;
            }
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
                <h2 style={{ margin: 0, fontSize: '24px' }}>📤 Upload de mídias</h2>
            </div>

            {/* --- 3. VISUAL DO RADAR --- */}
            {tamanhoFila > 0 && (
                <div style={{ 
                    backgroundColor: '#e6f7ff', 
                    border: '1px solid #91d5ff', 
                    padding: '10px 15px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    color: '#0050b3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 'bold'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                    <span>
                        Radar do Servidor: A fábrica está a processar 
                        <span style={{ color: '#cf1322', fontSize: '1.1em', margin: '0 5px' }}>{tamanhoFila}</span> 
                        fotos neste momento.
                    </span>
                </div>
            )}
            {/* -------------------------- */}
            
            <div className="album-selector-wrapper">
                <label htmlFor="album-select">1. Selecione o álbum de destino:</label>
                <select id="album-select" value={selectedAlbum} onChange={(e) => setSelectedAlbum(e.target.value)}>
                    <option value="" disabled>-- Escolha um álbum --</option>
                    {albuns.map(album => (<option key={album.id} value={album.id}>{album.titulo}</option>))}
                </select>
            </div>
            
            {selectedAlbum && (
                <div className="upload-section">
                    
                    {/* FORMULÁRIO DE FOTOS */}
                    <form onSubmit={handlePhotoSubmit} className="upload-form">
                        <h3>2. Adicionar novas fotos</h3>
                        <label htmlFor="photo-upload" className="custom-file-upload">Escolher ficheiros</label>
                        <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFotoFiles(e.target.files)} multiple disabled={isUploadingFotos}/>
                        {fotoFiles.length > 0 && <span className='file-name'>{fotoFiles.length} foto(s) selecionada(s)</span>}
                        
                        <input type="text" placeholder="Legenda (será aplicada a todas)" onChange={(e) => setFotoLegenda(e.target.value)} disabled={isUploadingFotos}/>
                        <input type="number" step="0.01" placeholder="Preço (para todas as fotos)" value={fotoPreco} onChange={(e) => setFotoPreco(e.target.value)} required disabled={isUploadingFotos} />
                        
                        {isUploadingFotos && (
                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', border: '1px solid #ffeeba', fontWeight: 'bold' }}>
                                ⏳ {uploadStatusMsg}
                            </div>
                        )}
                        
                        {meusJornais.length > 0 && (
                            <div style={{ marginTop: '15px', marginBottom: '15px', padding: '15px', backgroundColor: '#fbf0fa', borderRadius: '8px', border: '1px solid #e1bce0' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#6c0464' }}>🚀 Distribuir via FTP para:</h4>
                                <p style={{ fontSize: '12px', color: '#555', marginTop: 0, marginBottom: '10px' }}>
                                    (Opcional) Escolha para quais parceiros deseja enviar estas fotos automaticamente.
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
                                            📰 {jornal.nome_jornal}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button type="submit" className="upload-submit-button" disabled={isUploadingFotos || fotoFiles.length === 0} style={{ opacity: isUploadingFotos ? 0.6 : 1 }}>
                            {isUploadingFotos ? '🔒 A enviar e salvar... Aguarde.' : `Enviar ${fotoFiles.length || 0} Foto(s)`}
                        </button>
                    </form>

                    {/* FORMULÁRIO DE VÍDEOS */}
                    <div className="upload-form">
                        <h3>2. Adicionar novos vídeos</h3>
                        <label htmlFor="video-upload" className="custom-file-upload">Escolher ficheiros</label>
                        <input id="video-upload" type="file" accept="video/*" onChange={handleVideoSelect} multiple disabled={isUploadingVideos}/>
                        {stagedVideos.length > 0 && (
                            <div className="staging-area">
                                <h4>Vídeos para enviar:</h4>
                                {stagedVideos.map((video) => (
                                    <div key={video.id} className="staged-item">
                                        <p className='staged-item-name'>{video.videoFile.name}</p>
                                        <input type="text" placeholder="Título do vídeo" onChange={(e) => handleStagedVideoChange(video.id, 'titulo', e.target.value)} required disabled={isUploadingVideos}/>
                                        <input type="number" step="0.01" value={video.preco} onChange={(e) => handleStagedVideoChange(video.id, 'preco', e.target.value)} required disabled={isUploadingVideos}/>
                                        <button type="button" onClick={() => removeStagedVideo(video.id)} className="remove-button-small" disabled={isUploadingVideos}>Remover</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isUploadingVideos && <p style={{ fontWeight: 'bold', color: '#6c0464' }}>⏳ Enviando e processando vídeo {uploadProgressVideos} de {stagedVideos.length}... Por favor, não feche a página.</p>}
                        
                        <button onClick={handleVideoSubmit} className="upload-submit-button" disabled={isUploadingVideos || stagedVideos.length === 0} style={{ opacity: isUploadingVideos ? 0.6 : 1 }}>
                            {isUploadingVideos ? '🔒 A enviar... Aguarde.' : `Enviar ${stagedVideos.length} Vídeo(s)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardUploadPage;