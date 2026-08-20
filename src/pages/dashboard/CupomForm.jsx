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
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{initialData.id ? 'Editar cupom' : 'Criar novo cupom'}</h2>
                <form onSubmit={handleSubmit}>
                    <input name="codigo" value={cupomData.codigo || ''} onChange={handleChange} placeholder="Código do cupom (ex: ACESSO10)" required />
                    <input name="desconto_percentual" type="number" step="0.01" value={cupomData.desconto_percentual || ''} onChange={handleChange} placeholder="Desconto % (ex: 15.00)" required />
                    <label>Data de validade (opcional):</label>
                    <input name="data_validade" type="date" value={cupomData.data_validade || ''} onChange={handleChange} />
                    <label>
                        <input name="ativo" type="checkbox" checked={cupomData.ativo} onChange={handleChange} />
                        Cupom ativo
                    </label>
                    <div className="modal-actions">
                        <button type="button" onClick={onCancel}>Cancelar</button>
                        <button type="submit">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CupomForm;