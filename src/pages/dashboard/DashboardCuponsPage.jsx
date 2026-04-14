// src/pages/dashboard/DashboardCuponsPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import CupomForm from './CupomForm'; 
import { toast } from 'react-toastify';

function DashboardCuponsPage() {
    const [cupons, setCupons] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado do formulário de criação/edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCupom, setEditingCupom] = useState(null);

    // --- ESTADOS DO MODAL DE EXCLUSÃO ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cupomToDelete, setCupomToDelete] = useState(null);

    const corPrincipal = '#6c0464';

    const fetchCupons = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/cupons/');
            setCupons(response.data);
        } catch (error) {
            console.error("Erro ao buscar cupons:", error);
            toast.error("Erro ao carregar a lista de cupons.");
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
            toast.success(isEditing ? "Cupom atualizado com sucesso!" : "Cupom criado com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar cupom:", error.response?.data);
            toast.error("Erro ao salvar. Verifique os dados (o código do cupom já pode existir).");
        }
    };

    // --- NOVA LÓGICA DO MODAL DE EXCLUSÃO ---
    const handleDeleteClick = (cupom) => {
        setCupomToDelete(cupom);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!cupomToDelete) return;
        
        try {
            await axiosInstance.delete(`/dashboard/cupons/${cupomToDelete.id}/`);
            fetchCupons();
            toast.success("Cupom apagado com sucesso!");
        } catch (error) {
            console.error("Erro ao apagar cupom:", error);
            toast.error("Erro ao tentar apagar o cupom.");
        } finally {
            setIsDeleteModalOpen(false);
            setCupomToDelete(null);
        }
    };
    // ----------------------------------------

    const btnAcaoStyle = {
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', 
        cursor: 'pointer', border: 'none', transition: 'all 0.2s', textDecoration: 'none',
        display: 'inline-block', textAlign: 'center', marginLeft: '5px'
    };

    if (loading) return <p style={{ padding: '20px', color: '#666' }}>A carregar os seus cupons...</p>;

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* CABEÇALHO */}
            <div className="page-header" style={{ 
                marginBottom: '25px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: corPrincipal }} >🏷️ Meus Cupons</h2>
                <button className="create-button" onClick={() => { setEditingCupom({}); setIsModalOpen(true); }}>
                    Criar Novo Cupom +
                </button>
            </div>
            
            {/* TABELA DE CUPONS */}
            <div className="table-wrapper" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#ebddea', color: corPrincipal, textAlign: 'left' }}>
                            <th style={{ padding: '15px 10px', borderRadius: '6px 0 0 0' }}>Código</th>
                            <th style={{ padding: '15px 10px' }}>Desconto (%)</th>
                            <th style={{ padding: '15px 10px' }}>Validade</th>
                            <th style={{ padding: '15px 10px' }}>Status</th>
                            <th style={{ padding: '15px 10px', borderRadius: '0 6px 0 0', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cupons.length > 0 ? cupons.map(cupom => (
                            <tr key={cupom.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{cupom.codigo}</td>
                                <td style={{ padding: '15px 10px', color: '#28a745', fontWeight: 'bold' }}>{parseFloat(cupom.desconto_percentual).toFixed(2)}%</td>
                                <td style={{ padding: '15px 10px', color: '#555' }}>{cupom.data_validade ? new Date(cupom.data_validade).toLocaleDateString() : 'Sem validade'}</td>
                                <td style={{ padding: '15px 10px' }}>
                                    <span style={{ 
                                        backgroundColor: cupom.ativo ? '#d4edda' : '#f8d7da', 
                                        color: cupom.ativo ? '#155724' : '#721c24', 
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                                    }}>
                                        {cupom.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="action-cell" style={{ padding: '15px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => { setEditingCupom(cupom); setIsModalOpen(true); }} 
                                        style={{ ...btnAcaoStyle, backgroundColor: '#fbf0fa', color: corPrincipal, border: `1px solid ${corPrincipal}` }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(cupom)} 
                                        style={{ ...btnAcaoStyle, backgroundColor: '#dc3545', color: 'white' }}
                                    >
                                        Apagar
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Você ainda não criou nenhum cupom.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(108, 4, 100, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                        <CupomForm 
                            onSubmit={handleFormSubmit}
                            initialData={editingCupom}
                            onCancel={() => { setIsModalOpen(false); setEditingCupom(null); }}
                        />
                    </div>
                </div>
            )}

            {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO --- */}
            {isDeleteModalOpen && cupomToDelete && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ color: '#dc3545', marginTop: 0 }}>
                            Excluir Cupom?
                        </h3>
                        <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5' }}>
                            Tem a certeza que deseja APAGAR o cupom <strong>{cupomToDelete.codigo}</strong>? Esta ação é permanente e não pode ser desfeita.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setCupomToDelete(null); }} 
                                className='create_button'
                                style={{ padding: '10px 20px'}}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ---------------------------------------- */}

        </div>
    );
}

export default DashboardCuponsPage;