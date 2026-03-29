// src/pages/dashboard/DashboardCuponsPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import CupomForm from './CupomForm'; // O formulário que já tínhamos

function DashboardCuponsPage() {
    const [cupons, setCupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCupom, setEditingCupom] = useState(null);

    const corPrincipal = '#6c0464';

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

    const btnAcaoStyle = {
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', 
        cursor: 'pointer', border: 'none', transition: 'all 0.2s', textDecoration: 'none',
        display: 'inline-block', textAlign: 'center'
    };

    if (loading) return <p>A carregar os seus cupons...</p>;

    return (
        <div className="dashboard-page-content">
            <div className="page-header" style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px' }} >🏷️ Meus Cupons</h2>
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
                                    <button 
                                        onClick={() => { setEditingCupom(cupom); setIsModalOpen(true); }} 
                                        style={{ ...btnAcaoStyle, backgroundColor: '#fbf0fa', color: corPrincipal, border: `1px solid ${corPrincipal}` }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(cupom.id)} 
                                        style={{ ...btnAcaoStyle, backgroundColor: '#dc3545', color: 'white' }}
                                    >
                                        Apagar
                                    </button>
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(156, 15, 156, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                        <CupomForm 
                            onSubmit={handleFormSubmit}
                            initialData={editingCupom}
                            onCancel={() => { setIsModalOpen(false); setEditingCupom(null); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardCuponsPage;