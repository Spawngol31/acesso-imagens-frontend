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

        onSubmit(dadosFormatados, capaFile);
    };

    // --- ESTILOS VISUAIS BLINDADOS ---
    const corPrincipal = '#6c0464';
    
    const inputStyle = { 
        width: '100%', padding: '10px 12px', marginBottom: '15px', 
        borderRadius: '6px', border: '1px solid #ced4da', 
        backgroundColor: '#ffffff', color: '#333333', // Força branco no fundo e escuro no texto
        fontSize: '14px', boxSizing: 'border-box', outline: 'none', 
        colorScheme: 'light' // Impede que o navegador aplique o Modo Escuro nestas caixas
    };

    const labelStyle = {
        display: 'block', fontWeight: '600', fontSize: '12px', color: '#555', marginBottom: '4px', textTransform: 'uppercase'
    };

    const gridDuplo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 15px' };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* TÍTULO DO MODAL */}
            <h2 style={{ color: corPrincipal, marginTop: 0, borderBottom: '2px solid #fbf0fa', paddingBottom: '15px', marginBottom: '20px' }}>
                {initialData.id ? '✏️ Editar álbum' : '📸 Criar novo álbum'}
            </h2>
            
            <label style={labelStyle}>Título do Álbum</label>
            <input name="titulo" value={albumData.titulo} onChange={handleChange} style={inputStyle} placeholder="Ex: Casamento João e Maria" required />
            
            <label style={labelStyle}>Descrição</label>
            <textarea name="descricao" value={albumData.descricao} onChange={handleChange} style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} placeholder="Detalhes sobre o evento..." />
            
            {/* ORGANIZAÇÃO EM COLUNAS PARA POUPAR ESPAÇO */}
            <div style={gridDuplo}>
                <div>
                    <label style={labelStyle}>Data do Evento</label>
                    <input name="data_evento" type="date" value={albumData.data_evento} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                    <label style={labelStyle}>Categoria</label>
                    <select name="categoria" value={albumData.categoria} onChange={handleChange} style={inputStyle}>
                        {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Local do Evento</label>
                    <input name="local" value={albumData.local} onChange={handleChange} style={inputStyle} placeholder="Ex: Quinta das Flores" />
                </div>
            </div>

            {/* --- SESSÃO DE DESCONTOS COM NOVO VISUAL --- */}
            <div style={{ marginTop: '5px', padding: '15px', border: '1px solid #e1bce0', borderRadius: '8px', backgroundColor: '#fdfbfe' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: corPrincipal }}>🏷️ Descontos por Quantidade (Opcional)</h3>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                    Incentive os clientes a comprarem mais fotos deste álbum. Deixe em branco se não quiser dar desconto.
                </p>

                {[1, 2, 3].map(nivel => (
                    <div key={nivel} style={{ display: 'flex', gap: '10px', marginBottom: nivel === 3 ? '0' : '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 'bold', color: '#555', width: '50px', fontSize: '12px' }}>Nível {nivel}:</span>
                        <input type="number" name={`qtd_desconto_${nivel}`} value={albumData[`qtd_desconto_${nivel}`]} onChange={handleChange} placeholder="Qtd. Fotos (Ex: 5)" min="0" style={{...inputStyle, marginBottom: 0, flex: 1, minWidth: '120px'}} />
                        <input type="number" step="0.01" name={`pct_desconto_${nivel}`} value={albumData[`pct_desconto_${nivel}`]} onChange={handleChange} placeholder="Desconto % (Ex: 10)" min="0" max="100" style={{...inputStyle, marginBottom: 0, flex: 1, minWidth: '120px'}} />
                    </div>
                ))}
            </div>
            {/* ------------------------------------------- */}

            {/* UPLOAD DA IMAGEM DE CAPA COM BOTÃO PERSONALIZADO */}
            <div style={{ marginTop: '20px', padding: '15px', border: '2px dashed #e1bce0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Imagem de Capa do Álbum</label>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input 
                        id="album-cover-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setCapaFile(e.target.files[0])} 
                        style={{ display: 'none' }} // Esconde o botão feio do navegador
                    />
                    
                    <label 
                        htmlFor="album-cover-upload" 
                        style={{ padding: '8px 15px', backgroundColor: '#fbf0fa', color: corPrincipal, border: `1px solid ${corPrincipal}`, borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'inline-block', textAlign: 'center', transition: 'all 0.2s' }}
                    >
                        📁 Escolher Imagem...
                    </label>
                    
                    <div style={{ fontSize: '12px', color: '#555' }}>
                        {capaFile ? (
                            <span style={{color: '#28a745', fontWeight: 'bold'}}>✅ {capaFile.name}</span>
                        ) : (
                            initialData.capa && <span>Atual: {initialData.capa.split('/').pop()}</span>
                        )}
                    </div>
                </div>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '20px', fontSize: '14px', fontWeight: 'bold', color: '#444' }}>
                <input name="is_publico" type="checkbox" checked={albumData.is_publico} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: corPrincipal }} />
                🌍 Tornar este Álbum Público (Visível para os clientes)
            </label>
            
            {/* BOTÕES DE AÇÃO */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={onCancel} className='create-button' style={{ flex: 1, padding: '12px' }}>
                    Cancelar
                </button>
                <button type="submit" className='create-button' style={{ flex: 1, padding: '12px' }}>
                    {initialData.id ? '💾 Salvar Alterações' : '🚀 Criar Álbum'}
                </button>
            </div>
        </form>
    );
}

export default AlbumForm;