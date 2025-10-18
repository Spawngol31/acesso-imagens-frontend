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
    });
    const [capaFile, setCapaFile] = useState(null);

    useEffect(() => {
        if (initialData && initialData.id) { // Se estamos a editar
            setAlbumData({
                titulo: initialData.titulo || '',
                descricao: initialData.descricao || '',
                data_evento: initialData.data_evento ? new Date(initialData.data_evento).toISOString().split('T')[0] : '',
                categoria: initialData.categoria || 'OUTRO',
                local: initialData.local || '',
                is_publico: initialData.is_publico !== false,
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
        onSubmit(albumData, capaFile);
    };

    return (
        <form onSubmit={handleSubmit} className="album-form">
            {/* --- TÍTULO CONDICIONAL ADICIONADO --- */}
            {/* O título só aparece se 'initialData.id' existir (ou seja, no modo de edição) */}
            {initialData.id && <h2>Editar álbum</h2>}
            
            <input name="titulo" value={albumData.titulo} onChange={handleChange} placeholder="Título do álbum" required />
            <textarea name="descricao" value={albumData.descricao} onChange={handleChange} placeholder="Descrição" />
            <input name="local" value={albumData.local} onChange={handleChange} placeholder="Local do evento" />
            <input name="data_evento" type="date" value={albumData.data_evento} onChange={handleChange} required />
            <select name="categoria" value={albumData.categoria} onChange={handleChange}>
                {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
            </select>

            <div>
                <label htmlFor="album-cover-upload" className="custom-file-upload">
                    Escolher Imagem de Capa
                </label>
                <input id="album-cover-upload" type="file" accept="image/*" onChange={(e) => setCapaFile(e.target.files[0])} />
                {capaFile ? (
                    <span className="file-name">{capaFile.name}</span>
                ) : (
                    initialData.capa && <span className="file-name">Ficheiro atual: {initialData.capa.split('/').pop()}</span>
                )}
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input name="is_publico" type="checkbox" checked={albumData.is_publico} onChange={handleChange} />
                Álbum público
            </label>
            
            <div className="modal-actions">
                <button type="button" onClick={onCancel}>Cancelar</button>
                <button type="submit">{initialData.id ? 'Salvar' : 'Salvar e continuar'}</button>
            </div>
        </form>
    );
}

export default AlbumForm;