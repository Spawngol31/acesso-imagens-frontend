// src/pages/dashboard/DashboardVendasPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';

function DashboardVendasPage() {
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendas = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/dashboard/vendas/');
                setVendas(response.data);
            } catch (error) {
                console.error("Erro ao buscar o relatório de vendas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendas();
    }, []);

    const summary = useMemo(() => {
        if (!vendas) return { totalVendido: 0, totalFotos: 0 };
        const totalVendido = vendas.reduce((acc, venda) => acc + parseFloat(venda.preco), 0);
        const totalFotos = vendas.length;
        return { totalVendido, totalFotos };
    }, [vendas]);

    if (loading) {
        return <p>A carregar o seu relatório de vendas...</p>;
    }

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Minhas vendas</h2>
            </div>

            {/* Nova secção de resumo estilizada */}
            <div className="sales-summary-wrapper">
                <div className="summary-item">
                    <span className="summary-label">Fotos vendidas</span>
                    <span className="summary-value">{summary.totalFotos}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total vendido</span>
                    <span className="summary-value">R$ {summary.totalVendido.toFixed(2)}</span>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Data do pedido</th>
                            <th>Álbum</th>
                            <th>ID da foto</th>
                            <th>Preço de venda</th>
                            <th>Cliente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendas.length > 0 ? vendas.map(venda => (
                            <tr key={venda.id}>
                                <td>{new Date(venda.data_pedido).toLocaleString('pt-BR')}</td>
                                <td>{venda.album_titulo}</td>
                                <td>{venda.foto_id}</td>
                                <td>R$ {parseFloat(venda.preco).toFixed(2)}</td>
                                <td>{venda.cliente_email}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>Você ainda não realizou nenhuma venda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DashboardVendasPage;