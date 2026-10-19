// src/pages/dashboard/CupomForm.jsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function CupomForm({ onSubmit, initialData = {}, onCancel, albunsDisponiveis = [] }) {
    const [cupomData, setCupomData] = useState({
        codigo: '',
        desconto_percentual: '',
        data_validade: '',
        ativo: true,
        albuns: [],
        ...initialData
    });

    // Controla se o cupom vale para 'todos' ou 'especificos'
    const [escopoAlbum, setEscopoAlbum] = useState('todos');
    const [buscaAlbum, setBuscaAlbum] = useState('');

    useEffect(() => {
        const albunsIniciais = Array.isArray(initialData.albuns)
            ? initialData.albuns.map(id => Number(id))
            : [];

        const formattedData = {
            codigo: '',
            desconto_percentual: '',
            ...initialData,
            data_validade: initialData.data_validade
                ? new Date(initialData.data_validade).toISOString().split('T')[0]
                : '',
            ativo: initialData.ativo !== false,
            albuns: albunsIniciais
        };

        setCupomData(formattedData);
        setEscopoAlbum(albunsIniciais.length > 0 ? 'especificos' : 'todos');
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCupomData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleToggleAlbum = (albumId) => {
        const idNumerico = Number(albumId);
        setCupomData(prev => {
            const jaSelecionado = prev.albuns.includes(idNumerico);
            const novaLista = jaSelecionado
                ? prev.albuns.filter(id => id !== idNumerico)
                : [...prev.albuns, idNumerico];
            return { ...prev, albuns: novaLista };
        });
    };

    const handleSelecionarTodosFiltrados = () => {
        const idsFiltrados = albunsFiltrados.map(a => Number(a.id));
        const todosMarcados = idsFiltrados.every(id => cupomData.albuns.includes(id));

        if (todosMarcados) {
            setCupomData(prev => ({
                ...prev,
                albuns: prev.albuns.filter(id => !idsFiltrados.includes(id))
            }));
        } else {
            setCupomData(prev => ({
                ...prev,
                albuns: Array.from(new Set([...prev.albuns, ...idsFiltrados]))
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (escopoAlbum === 'especificos' && cupomData.albuns.length === 0) {
            toast.warning('Selecione pelo menos um álbum ou marque "Todos os álbuns".');
            return;
        }

        const dataToSend = {
            ...cupomData,
            data_validade: cupomData.data_validade || null,
            // Se escolher "todos", enviamos lista vazia para valer em todos os álbuns do fotógrafo
            albuns: escopoAlbum === 'todos' ? [] : cupomData.albuns
        };

        onSubmit(dataToSend);
    };

    const albunsFiltrados = albunsDisponiveis.filter(album =>
        (album.titulo || '').toLowerCase().includes(buscaAlbum.toLowerCase())
    );

    return (
        <div className="dash-modal-overlay">
            <div className="dash-modal-content">
                <div className="dash-modal-header">
                    <h3 className="dash-modal-title">
                        {initialData.id ? 'Editar cupom' : 'Novo cupom'}
                    </h3>
                    <button onClick={onCancel} className="dash-modal-close">✖</button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form-flex">
                    <div className="modal-input-group">
                        <label className="modal-label">Código do cupom</label>
                        <input 
                            name="codigo" 
                            value={cupomData.codigo || ''} 
                            onChange={handleChange} 
                            placeholder="Ex: ACESSO10" 
                            className="modal-input" 
                            required 
                        />
                    </div>
                    
                    <div className="modal-input-group">
                        <label className="modal-label">Desconto (%)</label>
                        <input 
                            name="desconto_percentual" 
                            type="number" 
                            step="0.01" 
                            value={cupomData.desconto_percentual || ''} 
                            onChange={handleChange} 
                            placeholder="Ex: 15.00" 
                            className="modal-input" 
                            required 
                        />
                    </div>
                    
                    <div className="modal-input-group">
                        <label className="modal-label">Data de validade (opcional)</label>
                        <input 
                            name="data_validade" 
                            type="date" 
                            value={cupomData.data_validade || ''} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>

                    {/* SELETOR DE ÁLBUNS DO CUPOM */}
                    <div className="modal-input-group">
                        <label className="modal-label">Onde este cupom será válido?</label>
                        <div className="cupom-scope-toggle">
                            <button
                                type="button"
                                className={`cupom-scope-btn ${escopoAlbum === 'todos' ? 'active' : ''}`}
                                onClick={() => setEscopoAlbum('todos')}
                            >
                                Todos os álbuns
                            </button>
                            <button
                                type="button"
                                className={`cupom-scope-btn ${escopoAlbum === 'especificos' ? 'active' : ''}`}
                                onClick={() => setEscopoAlbum('especificos')}
                            >
                                Álbuns específicos
                            </button>
                        </div>

                        {escopoAlbum === 'especificos' && (
                            <div className="cupom-albums-box">
                                <div className="cupom-albums-header">
                                    <input
                                        type="text"
                                        placeholder="Buscar álbum pelo nome..."
                                        value={buscaAlbum}
                                        onChange={(e) => setBuscaAlbum(e.target.value)}
                                        className="cupom-albums-search"
                                    />
                                    {albunsFiltrados.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelecionarTodosFiltrados}
                                            className="cupom-albums-select-all"
                                        >
                                            Marcar/Desmarcar
                                        </button>
                                    )}
                                </div>

                                <div className="cupom-albums-list">
                                    {albunsFiltrados.length > 0 ? (
                                        albunsFiltrados.map(album => {
                                            const checked = cupomData.albuns.includes(Number(album.id));
                                            return (
                                                <label
                                                    key={album.id}
                                                    className={`cupom-album-item ${checked ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => handleToggleAlbum(album.id)}
                                                        className="custom-checkbox"
                                                    />
                                                    <span className="cupom-album-item-title">{album.titulo}</span>
                                                </label>
                                            );
                                        })
                                    ) : (
                                        <p className="cupom-albums-empty">Nenhum álbum encontrado.</p>
                                    )}
                                </div>

                                <div className="cupom-albums-counter">
                                    {cupomData.albuns.length} {cupomData.albuns.length === 1 ? 'álbum selecionado' : 'álbuns selecionados'}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <label className="album-form-checkbox-wrapper cupom-active-checkbox">
                        <input 
                            name="ativo" 
                            type="checkbox" 
                            checked={cupomData.ativo} 
                            onChange={handleChange} 
                            className="custom-checkbox" 
                        />
                        Cupom ativo
                    </label>
                    
                    <div className="modal-actions-row cupom-modal-actions">
                        <button type="button" onClick={onCancel} className="modal-btn-half-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="create-button modal-btn-half">
                            Salvar Cupom
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CupomForm;