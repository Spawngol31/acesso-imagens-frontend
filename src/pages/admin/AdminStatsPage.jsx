// src/pages/admin/AdminStatsPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Regista os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminStatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/admin/stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Prepara os dados para o gráfico de Top Fotógrafos
    const topFotografosChartData = {
        labels: stats?.top_fotografos.map(f => f.nome_completo) || [],
        datasets: [
            {
                label: 'Total Vendido (R$)',
                data: stats?.top_fotografos.map(f => f.total_vendido) || [],
                backgroundColor: 'rgba(97, 218, 251, 0.6)',
                borderColor: 'rgba(97, 218, 251, 1)',
                borderWidth: 1,
            },
        ],
    };

    if (loading) return <p>A carregar estatísticas...</p>;
    if (!stats) return <p>Não foi possível carregar as estatísticas.</p>;

    return (
        <div className="dashboard-page-content">
            <div className="page-header">
                <h2>Estatísticas gerais</h2>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <h2>Faturação total</h2>
                    <p>R$ {parseFloat(stats.geral.faturacao_total).toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h2>Fotos vendidas</h2>
                    <p>{stats.geral.fotos_vendidas_total}</p>
                </div>
                <div className="summary-card">
                    <h2>Utilizadores totais</h2>
                    <p>{stats.geral.utilizadores_total}</p>
                </div>
                <div className="summary-card">
                    <h2>Fotógrafos ativos</h2>
                    <p>{stats.geral.fotografos_total}</p>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-container">
                    <h3>Top 5 fotógrafos por vendas</h3>
                    <Bar data={topFotografosChartData} />
                </div>

                <div className="table-container">
                    <h3>Top 5 fotos mais vendidas</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID da foto</th>
                                <th>Legenda</th>
                                <th>Fotógrafo</th>
                                <th>Nº de vendas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.top_fotos.map(foto => (
                                <tr key={foto.id}>
                                    <td>{foto.id}</td>
                                    <td>{foto.legenda || '-'}</td>
                                    <td>{foto.album__fotografo__nome_completo}</td>
                                    <td>{foto.num_vendas}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminStatsPage;