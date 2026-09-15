// src/pages/dashboard/CupomForm.jsx

import React, { useState, useEffect } from 'react';

function CupomForm({ onSubmit, initialData = {}, onCancel }) {
    const [cupomData, setCupomData] = useState({
        codigo: '',
        desconto_percentual: '',
        data_validade: '',
        ativo: true,
        ...initialData
    });

    useEffect(() => {
        // Formata a data para o tipo 'date' do input, se ela existir
        const formattedData = {
            ...initialData,
            data_validade: initialData.data_validade ? new Date(initialData.data_validade).toISOString().split('T')[0] : '',
            ativo: initialData.ativo !== false,
        };
        setCupomData(formattedData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCupomData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Envia null para a data se o campo estiver vazio
        const dataToSend = {
            ...cupomData,
            data_validade: cupomData.data_validade || null,
        };
        onSubmit(dataToSend);
    };

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
                    
                    <label className="album-form-checkbox-wrapper" style={{ marginTop: '5px' }}>
                        <input 
                            name="ativo" 
                            type="checkbox" 
                            checked={cupomData.ativo} 
                            onChange={handleChange} 
                            className="custom-checkbox" 
                        />
                        Cupom ativo
                    </label>
                    
                    <div className="modal-actions-row" style={{ marginTop: '30px' }}>
                        <button type="button" onClick={onCancel} className="button-outline modal-btn-half">
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