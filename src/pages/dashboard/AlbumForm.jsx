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
        // --- NOVOS CAMPOS NO ESTADO ---
        qtd_desconto_1: '', pct_desconto_1: '',
        qtd_desconto_2: '', pct_desconto_2: '',
        qtd_desconto_3: '', pct_desconto_3: '',
    });
    const [capaFile, setCapaFile] = useState(null);

    useEffect(() => {
        if (initialData && initialData.id) { // Se estamos a editar
            setAlbumData({
                titulo: initialData.titulo || '',
                descricao: initialData.descricao || '',
                data_evento: initialData.data_evento ? initialData.data_evento.split('T')[0] : '',
                categoria: initialData.categoria || 'OUTRO',
                local: initialData.local || '',
                is_publico: initialData.is_publico !== false,
                // --- CARREGA OS DESCONTOS SE EXISTIREM ---
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
        
        // Formata os campos vazios de desconto para "0" antes de enviar para o backend
        const dadosFormatados = { ...albumData };
        ['qtd_desconto_1', 'pct_desconto_1', 'qtd_desconto_2', 'pct_desconto_2', 'qtd_desconto_3', 'pct_desconto_3'].forEach(campo => {
            if (!dadosFormatados[campo]) dadosFormatados[campo] = 0;
        });

        onSubmit(dadosFormatados, capaFile);
    };

    return (
        <form onSubmit={handleSubmit} className="album-form">
            {initialData.id && <h2>Editar álbum</h2>}
            
            <input name="titulo" value={albumData.titulo} onChange={handleChange} placeholder="Título do álbum" required />
            <textarea name="descricao" value={albumData.descricao} onChange={handleChange} placeholder="Descrição" />
            <input name="local" value={albumData.local} onChange={handleChange} placeholder="Local do evento" />
            <input name="data_evento" type="date" value={albumData.data_evento} onChange={handleChange} required />
            <select name="categoria" value={albumData.categoria} onChange={handleChange}>
                {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
            </select>

            {/* --- INÍCIO DA SESSÃO DE DESCONTOS PROGRESSIVOS --- */}
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                <h3 style={{ marginBottom: '5px', fontSize: '1.1rem', color: '#333' }}>Descontos por Quantidade (Opcional)</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                    Incentive os clientes a comprarem mais fotos deste álbum. Deixe em branco se não quiser dar desconto.
                </p>

                {/* Nível 1 */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#888', width: '60px' }}>Nível 1:</span>
                    <input type="number" name="qtd_desconto_1" value={albumData.qtd_desconto_1} onChange={handleChange} placeholder="Qtd. Fotos (Ex: 5)" min="0" style={{ flex: 1, margin: 0 }} />
                    <input type="number" step="0.01" name="pct_desconto_1" value={albumData.pct_desconto_1} onChange={handleChange} placeholder="Desconto % (Ex: 5.00)" min="0" max="100" style={{ flex: 1, margin: 0 }} />
                </div>

                {/* Nível 2 */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#888', width: '60px' }}>Nível 2:</span>
                    <input type="number" name="qtd_desconto_2" value={albumData.qtd_desconto_2} onChange={handleChange} placeholder="Qtd. Fotos (Ex: 10)" min="0" style={{ flex: 1, margin: 0 }} />
                    <input type="number" step="0.01" name="pct_desconto_2" value={albumData.pct_desconto_2} onChange={handleChange} placeholder="Desconto % (Ex: 10.00)" min="0" max="100" style={{ flex: 1, margin: 0 }} />
                </div>

                {/* Nível 3 */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#888', width: '60px' }}>Nível 3:</span>
                    <input type="number" name="qtd_desconto_3" value={albumData.qtd_desconto_3} onChange={handleChange} placeholder="Qtd. Fotos (Ex: 15)" min="0" style={{ flex: 1, margin: 0 }} />
                    <input type="number" step="0.01" name="pct_desconto_3" value={albumData.pct_desconto_3} onChange={handleChange} placeholder="Desconto % (Ex: 15.00)" min="0" max="100" style={{ flex: 1, margin: 0 }} />
                </div>
            </div>
            {/* --- FIM DA SESSÃO DE DESCONTOS PROGRESSIVOS --- */}

            <div style={{ marginTop: '20px' }}>
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
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '15px' }}>
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