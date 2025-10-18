// src/pages/dashboard/DashboardCuponsPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import CupomForm from './CupomForm'; // O formulário que já tínhamos

function DashboardCuponsPage() {
    const [cupons, setCupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCupom, setEditingCupom] = useState(null);

    const fetchCupons = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/cupons/');
            setCupons(response.data);
        } catch (error) {
            console.error("Erro ao buscar cupons:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCupons();
    }, []);

    const handleFormSubmit = async (cupomData) => {
        const isEditing = !!editingCupom?.id;
        const url = isEditing ? `/dashboard/cupons/${editingCupom.id}/` : '/dashboard/cupons/';
        const method = isEditing ? 'patch' : 'post';

        try {
            await axiosInstance[method](url, cupomData);
            setIsModalOpen(false);
            setEditingCupom(null);
            fetchCupons();
        } catch (error) {
            console.error("Erro ao salvar cupom:", error.response.data);
            alert("Erro ao salvar. Verifique os dados (o código do cupom já pode existir).");
        }
    };

    const handleDelete = async (cupomId) => {
        if (window.confirm("Tem certeza que deseja apagar este cupom?")) {
            try {
                await axiosInstance.delete(`/dashboard/cupons/${cupomId}/`);
                fetchCupons();
            } catch (error) {
                console.error("Erro ao apagar cupom:", error);
            }
        }
    };

    if (loading) return <p>A carregar os seus cupons...</p>;

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Meus Cupons</h2>
                <button className="create-button" onClick={() => { setEditingCupom({}); setIsModalOpen(true); }}>
                    Criar Novo Cupom +
                </button>
            </div>
            
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Desconto (%)</th>
                            <th>Validade</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cupons.length > 0 ? cupons.map(cupom => (
                            <tr key={cupom.id}>
                                <td>{cupom.codigo}</td>
                                <td>{parseFloat(cupom.desconto_percentual).toFixed(2)}%</td>
                                <td>{cupom.data_validade ? new Date(cupom.data_validade).toLocaleDateString() : 'Sem validade'}</td>
                                <td>{cupom.ativo ? 'Ativo' : 'Inativo'}</td>
                                <td className="action-cell">
                                    <button onClick={() => { setEditingCupom(cupom); setIsModalOpen(true); }} className="edit-button-pill">Editar</button>
                                    <button onClick={() => handleDelete(cupom.id)} className="delete-button-pill">Apagar</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>Você ainda não criou nenhum cupom.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <CupomForm 
                    onSubmit={handleFormSubmit}
                    initialData={editingCupom}
                    onCancel={() => { setIsModalOpen(false); setEditingCupom(null); }}
                />
            )}
        </div>
    );
}

export default DashboardCuponsPage;