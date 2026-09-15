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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- 🚀 COMPONENTE: RANKING GERAL PARA ADMIN ---
// Agora recebe o periodo como prop para atualizar junto com o resto da página
const RankingAlbunsAdmin = ({ periodo, labelPeriodo }) => {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchRanking = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/admin/ranking-albuns/?periodo=${periodo}`);
                setRanking(response.data);
            } catch (error) {
                console.error("Erro ao buscar ranking:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [periodo]); 

    return (
        <div className="stats-section-card">
            <h3 className="stats-section-title">Top 10 Álbuns Mais Rentáveis {labelPeriodo}</h3>
            
            <div className="stats-table-responsive">
                <table className="stats-table min-width-600">
                    <thead>
                        <tr>
                            <th className="th-left-radius">POSIÇÃO</th>
                            <th>ÁLBUM</th>
                            <th>FOTÓGRAFO(A)</th>
                            <th>FOTOS VENDIDAS</th>
                            <th className="th-right-radius">TOTAL ARRECADADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="stats-empty-row">A atualizar ranking...</td>
                            </tr>
                        ) : ranking.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="stats-empty-row">Nenhum álbum vendido neste período.</td>
                            </tr>
                        ) : (
                            ranking.map((album, index) => {
                                const medalha = `${index + 1}º`;
                                return (
                                    <tr key={album.album_id}>
                                        <td className="stats-bold-col txt-lg">{medalha}</td>
                                        <td className="stats-bold-col txt-main">{album.album_titulo}</td>
                                        <td className="stats-muted-col">{album.fotografo_nome}</td>
                                        <td className="stats-muted-col">{album.qtd_vendida} mídias</td>
                                        <td className="stats-success-col">R$ {parseFloat(album.total_arrecadado).toFixed(2)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

function AdminStatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('mensal');
    
    // Estado para forçar a re-renderização do gráfico quando o tema muda
    const [isDarkMode, setIsDarkMode] = useState(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/admin/stats/?periodo=${periodo}`);
                setStats(response.data);
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [periodo]); 

    // Ouve as mudanças de tema do sistema (claro/escuro) para atualizar as cores do gráfico
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const topFotografosChartData = {
        labels: stats?.top_fotografos.map(f => f.nome_completo) || [],
        datasets: [
            {
                label: 'Total Vendido (R$)',
                data: stats?.top_fotografos.map(f => f.total_vendido) || [],
                backgroundColor: 'rgba(108, 4, 100, 0.7)',
                borderColor: '#6c0464',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const getLabelPeriodo = () => {
        switch(periodo) {
            case 'diario': return '(Hoje)';
            case 'semanal': return '(Esta Semana)';
            case 'mensal': return '(Este Mês)';
            case 'anual': return '(Este Ano)';
            default: return '(Todo o Período)';
        }
    };

    if (loading && !stats) return <p className="page-subtitle" style={{ padding: '20px' }}>A carregar estatísticas do sistema...</p>;
    if (!stats) return <p className="page-subtitle text-danger" style={{ padding: '20px' }}>Não foi possível carregar as estatísticas.</p>;

    return (
        <div className="dashboard-page-content stats-page-wrapper">
            
            <div className="dash-header-box">
                <h2 className="dash-main-title">Visão geral do sistema</h2>
                
                <div className="stats-filter-container">
                    <label className="stats-filter-label">Filtrar por:</label>
                    <select 
                        value={periodo} 
                        onChange={(e) => setPeriodo(e.target.value)}
                        className="stats-filter-select"
                    >
                        <option value="diario">Hoje (Diário)</option>
                        <option value="semanal">Esta semana</option>
                        <option value="mensal">Este mês</option>
                        <option value="anual">Este ano</option>
                        <option value="todos">Todo o histórico</option>
                    </select>
                </div>
            </div>

            <div className="stats-cards-grid">
                <div className="stats-data-card">
                    <p className="stats-card-label">Faturação {getLabelPeriodo()}</p>
                    <h2 className="stats-card-value">R$ {parseFloat(stats.geral.faturacao_total).toFixed(2)}</h2>
                </div>
                <div className="stats-data-card">
                    <p className="stats-card-label">Fotos vendidas {getLabelPeriodo()}</p>
                    <h2 className="stats-card-value">{stats.geral.fotos_vendidas_total}</h2>
                </div>
                <div className="stats-data-card">
                    <p className="stats-card-label">Utilizadores totais</p>
                    <h2 className="stats-card-value">{stats.geral.utilizadores_total}</h2>
                </div>
                <div className="stats-data-card">
                    <p className="stats-card-label">Fotógrafos ativos</p>
                    <h2 className="stats-card-value">{stats.geral.fotografos_total}</h2>
                </div>
            </div>

            <div className="stats-sections-container">
                
                <div className="stats-section-card">
                    <h3 className="stats-section-title">Top 5 Fotógrafos {getLabelPeriodo()}</h3>
                    <div className="chart-wrapper">
                        <Bar 
                            data={topFotografosChartData} 
                            options={{ 
                                responsive: true,
                                maintainAspectRatio: false, 
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { ticks: { color: isDarkMode ? '#ccc' : '#666' } },
                                    y: { ticks: { color: isDarkMode ? '#ccc' : '#666' } }
                                }
                            }} 
                        />
                    </div>
                </div>

                <div className="stats-section-card">
                    <h3 className="stats-section-title">Top 5 Fotos Mais Vendidas {getLabelPeriodo()}</h3>
                    <div className="stats-table-responsive">
                        <table className="stats-table min-width-500">
                            <thead>
                                <tr>
                                    <th className="th-left-radius">ID DA FOTO</th>
                                    <th>LEGENDA</th>
                                    <th>FOTÓGRAFO(A)</th>
                                    <th className="th-right-radius">Nº DE VENDAS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.top_fotos.map(foto => (
                                    <tr key={foto.id}>
                                        <td className="stats-bold-col txt-main">#{foto.id}</td>
                                        <td className="stats-muted-col">{foto.legenda || '-'}</td>
                                        <td className="stats-main-col">{foto.album__fotografo__nome_completo}</td>
                                        <td className="stats-primary-col stats-bold-col">
                                            {foto.num_vendas} {foto.num_vendas === 1 ? 'venda' : 'vendas'}
                                        </td>
                                    </tr>
                                ))}
                                {stats.top_fotos.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="stats-empty-row">Nenhuma foto vendida neste período.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RANKING DE ÁLBUNS COM PARÂMETROS */}
                <RankingAlbunsAdmin periodo={periodo} labelPeriodo={getLabelPeriodo()} />

            </div>
        </div>
    );
}

export default AdminStatsPage;