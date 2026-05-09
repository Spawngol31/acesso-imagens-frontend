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

function AdminStatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 🚀 NOVO: Estado para controlar o período do filtro
    const [periodo, setPeriodo] = useState('mensal');

    const corPrincipal = '#6c0464';

    // O useEffect agora recarrega os dados toda a vez que o "periodo" muda!
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // 🚀 NOVO: Enviamos o filtro para o Django através da URL
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

    const topFotografosChartData = {
        labels: stats?.top_fotografos.map(f => f.nome_completo) || [],
        datasets: [
            {
                label: 'Total Vendido (R$)',
                data: stats?.top_fotografos.map(f => f.total_vendido) || [],
                backgroundColor: 'rgba(108, 4, 100, 0.7)',
                borderColor: corPrincipal,
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    // 🚀 NOVO: Função para deixar os títulos dos cartões dinâmicos
    const getLabelPeriodo = () => {
        switch(periodo) {
            case 'diario': return '(Hoje)';
            case 'semanal': return '(Esta Semana)';
            case 'mensal': return '(Este Mês)';
            case 'anual': return '(Este Ano)';
            default: return '(Todo o Período)';
        }
    };

    if (loading && !stats) return <p style={{ padding: '20px', color: '#666' }}>A carregar estatísticas do sistema...</p>;
    if (!stats) return <p style={{ padding: '20px', color: 'red' }}>Não foi possível carregar as estatísticas.</p>;

    return (
        <div className="dashboard-page-content" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* TÍTULO E FILTRO (FLEXBOX PARA FICAREM LADO A LADO) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: `2px solid #fbf0fa`, paddingBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ color: corPrincipal, margin: 0, fontSize: '24px' }}>📊 Visão Geral do Sistema</h2>
                
                {/* 🚀 NOVO: O Dropdown de Filtro */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>Filtrar por:</label>
                    <select 
                        value={periodo} 
                        onChange={(e) => setPeriodo(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ced4da', outline: 'none', color: corPrincipal, fontWeight: 'bold', backgroundColor: '#fdfbfe', cursor: 'pointer' }}
                    >
                        <option value="diario">Hoje (Diário)</option>
                        <option value="semanal">Esta Semana</option>
                        <option value="mensal">Este Mês</option>
                        <option value="anual">Este Ano</option>
                        <option value="todos">Todo o Histórico</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Faturação {getLabelPeriodo()}</p>
                    <h2 style={cardValueStyle}>R$ {parseFloat(stats.geral.faturacao_total).toFixed(2)}</h2>
                </div>
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Fotos vendidas {getLabelPeriodo()}</p>
                    <h2 style={cardValueStyle}>{stats.geral.fotos_vendidas_total}</h2>
                </div>
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Utilizadores totais</p>
                    {/* Utilizadores não costumam ser filtrados por tempo, mantemos o total absoluto */}
                    <h2 style={cardValueStyle}>{stats.geral.utilizadores_total}</h2>
                </div>
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Fotógrafos ativos</p>
                    <h2 style={cardValueStyle}>{stats.geral.fotografos_total}</h2>
                </div>
            </div>

            {/* ÁREA DOS GRÁFICOS (Continua igual, mas repare que agora os dados vão respeitar o filtro) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>🏆 Top 5 Fotógrafos {getLabelPeriodo()}</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={topFotografosChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>📸 Top 5 Fotos Mais Vendidas {getLabelPeriodo()}</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', color: corPrincipal, textAlign: 'left' }}>
                                    <th style={{ padding: '12px 10px', borderRadius: '6px 0 0 0' }}>ID DA FOTO</th>
                                    <th style={{ padding: '12px 10px' }}>LEGENDA</th>
                                    <th style={{ padding: '12px 10px' }}>FOTÓGRAFO(A)</th>
                                    <th style={{ padding: '12px 10px', borderRadius: '0 6px 0 0' }}>Nº DE VENDAS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.top_fotos.map(foto => (
                                    <tr key={foto.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '14px 10px', fontWeight: '500' }}>#{foto.id}</td>
                                        <td style={{ padding: '14px 10px', color: '#555' }}>{foto.legenda || '-'}</td>
                                        <td style={{ padding: '14px 10px' }}>{foto.album__fotografo__nome_completo}</td>
                                        <td style={{ padding: '14px 10px', fontWeight: 'bold', color: corPrincipal }}>
                                            {foto.num_vendas} {foto.num_vendas === 1 ? 'venda' : 'vendas'}
                                        </td>
                                    </tr>
                                ))}
                                {stats.top_fotos.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                            Nenhuma foto vendida neste período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- ESTILOS REUTILIZÁVEIS ---
const cardStyle = {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    borderTop: '4px solid #6c0464',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
};

const cardLabelStyle = {
    fontSize: '13px',
    color: '#6c757d',
    textTransform: 'uppercase',
    fontWeight: '600',
    margin: '0 0 8px 0',
    letterSpacing: '0.5px'
};

const cardValueStyle = {
    fontSize: '32px',
    color: '#6c0464',
    fontWeight: 'bold',
    margin: 0
};

const sectionStyle = {
    backgroundColor: '#fff',
    padding: '20px', // Aumentei um pouco o padding para ficar mais elegante
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const sectionTitleStyle = {
    color: '#6c0464',
    fontSize: '18px',
    borderBottom: '2px solid #fbf0fa',
    paddingBottom: '15px',
    marginTop: 0,
    marginBottom: '20px'
};

export default AdminStatsPage;