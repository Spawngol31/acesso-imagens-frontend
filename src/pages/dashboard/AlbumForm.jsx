// src/pages/dashboard/AlbumForm.jsx

import React, { useState, useEffect } from 'react';

const CATEGORIAS = [
    'ARTES_MARCIAIS', 'AUTOMOBILISMO', 'FUTEBOL', 'FUTSAL', 'BASQUETE', 
    'ATLETISMO', 'FUTEBOL_AMERICANO', 'RUGBY', 'NATACAO', 'VOLEIBOL', 'OUTRO'
];

function AlbumForm({ onSubmit, initialData = {}, onCancel }) {
    const [albumData, setAlbumData] = useState({
        titulo: '',
        descricao: '',
        data_evento: '',
        categoria: 'OUTRO',
        local: '',
        is_publico: true,
        qtd_desconto_1: '', pct_desconto_1: '',
        qtd_desconto_2: '', pct_desconto_2: '',
        qtd_desconto_3: '', pct_desconto_3: '',
    });
    const [capaFile, setCapaFile] = useState(null);

    // Identifica se estamos em modo de Edição (se possui ID válido)
    const isEditing = !!initialData?.id;

    useEffect(() => {
        if (initialData && initialData.id) {
            setAlbumData({
                titulo: initialData.titulo || '',
                descricao: initialData.descricao || '',
                data_evento: initialData.data_evento ? initialData.data_evento.split('T')[0] : '',
                categoria: initialData.categoria || 'OUTRO',
                local: initialData.local || '',
                is_publico: initialData.is_publico !== false,
                qtd_desconto_1: initialData.qtd_desconto_1 || '',
                pct_desconto_1: initialData.pct_desconto_1 || '',
                qtd_desconto_2: initialData.qtd_desconto_2 || '',
                pct_desconto_2: initialData.pct_desconto_2 || '',
                qtd_desconto_3: initialData.qtd_desconto_3 || '',
                pct_desconto_3: initialData.pct_desconto_3 || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAlbumData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const dadosFormatados = { ...albumData };
        ['qtd_desconto_1', 'pct_desconto_1', 'qtd_desconto_2', 'pct_desconto_2', 'qtd_desconto_3', 'pct_desconto_3'].forEach(campo => {
            if (!dadosFormatados[campo]) dadosFormatados[campo] = 0;
        });

        if (isEditing) {
            onSubmit(dadosFormatados, capaFile);
        } else {
            onSubmit(dadosFormatados);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="album-form-container">
            
            {/* TÍTULO DO MODAL */}
            <h2 className="album-form-title">
                {isEditing ? 'Editar álbum' : 'Criar novo álbum'}
            </h2>
            
            <label className="album-form-label">Título do Álbum</label>
            <input name="titulo" value={albumData.titulo} onChange={handleChange} className="album-form-input" placeholder="Ex: Casamento João e Maria" required />
            
            <label className="album-form-label">Descrição</label>
            <textarea name="descricao" value={albumData.descricao} onChange={handleChange} className="album-form-input album-form-textarea" placeholder="Detalhes sobre o evento..." />
            
            {/* ORGANIZAÇÃO EM COLUNAS PARA POUPAR ESPAÇO */}
            <div className="album-form-grid">
                <div>
                    <label className="album-form-label">Data do Evento</label>
                    <input name="data_evento" type="date" value={albumData.data_evento} onChange={handleChange} className="album-form-input" required />
                </div>
                <div>
                    <label className="album-form-label">Categoria</label>
                    <select name="categoria" value={albumData.categoria} onChange={handleChange} className="album-form-input">
                        {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                <div className="album-form-full-width">
                    <label className="album-form-label">Local do Evento</label>
                    <input name="local" value={albumData.local} onChange={handleChange} className="album-form-input" placeholder="Ex: Quinta das Flores" />
                </div>
            </div>

            {/* --- SESSÃO DE DESCONTOS --- */}
            <div className="album-form-discount-box">
                <h3 className="album-form-discount-title">Descontos por quantidade (opcional)</h3>
                <p className="album-form-discount-desc">
                    Incentive os clientes a comprarem mais fotos deste álbum. Deixe em branco se não quiser dar desconto.
                </p>

                {[1, 2, 3].map(nivel => (
                    <div key={nivel} className={`album-form-discount-row ${nivel === 3 ? 'last-row' : ''}`}>
                        <span className="album-form-discount-label">Nível {nivel}:</span>
                        <input type="number" name={`qtd_desconto_${nivel}`} value={albumData[`qtd_desconto_${nivel}`]} onChange={handleChange} placeholder="Qtd. Fotos (Ex: 5)" min="0" className="album-form-input discount-input" />
                        <input type="number" step="0.01" name={`pct_desconto_${nivel}`} value={albumData[`pct_desconto_${nivel}`]} onChange={handleChange} placeholder="Desconto % (Ex: 10)" min="0" max="100" className="album-form-input discount-input" />
                    </div>
                ))}
            </div>

            {/* UPLOAD DA IMAGEM DE CAPA COM BOTÃO PERSONALIZADO (APENAS APARECE SE ESTIVER A EDITAR) */}
            {isEditing && (
                <div className="album-form-cover-box">
                    <label className="album-form-label">Imagem de Capa do Álbum</label>
                    
                    <div className="album-form-cover-actions">
                        <input 
                            id="album-cover-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setCapaFile(e.target.files[0])} 
                            style={{ display: 'none' }} 
                        />
                        
                        <label htmlFor="album-cover-upload" className="album-form-cover-btn">
                            Escolher imagem...
                        </label>
                        
                        <div className="album-form-cover-status">
                            {capaFile ? (
                                <span className="cover-status-success">✅ {capaFile.name}</span>
                            ) : (
                                initialData.capa && <span>Atual: {initialData.capa.split('/').pop()}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <label className="album-form-checkbox-wrapper">
                <input name="is_publico" type="checkbox" checked={albumData.is_publico} onChange={handleChange} className="album-form-checkbox" />
                Tornar este álbum público (visível para os clientes)
            </label>
            
            {/* BOTÕES DE AÇÃO */}
            <div className="album-form-actions">
                <button type="button" onClick={onCancel} className="create-button btn-cancel">
                    Cancelar
                </button>
                <button type="submit" className="create-button">
                    {isEditing ? 'Salvar alterações' : 'Criar Álbum'}
                </button>
            </div>
        </form>
    );
}

export default AlbumForm;