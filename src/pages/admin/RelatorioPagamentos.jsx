import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function RelatorioPagamentos() {
  // Guardam as datas que você escolher no calendário
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Função que roda quando clica no botão azul
  const baixarRelatorio = async () => {
    setCarregando(true);
    
    try {
      // 1. Pega o token de acesso do utilizador logado (Ajuste a forma como você guarda o seu token)
      const token = localStorage.getItem('access'); // Pode ser 'token', dependendo de como você programou o login
      
      // 2. Prepara os filtros para enviar na URL
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      
      // Ajuste a URL base se você usar axios ou outra variável de ambiente
      const urlBase = import.meta.env.VITE_API_URL || 'https://api.acessoimagens.com.br';
      const urlCompleta = `${urlBase}/api/loja/admin/exportar-pagamentos/?${params.toString()}`;

      // 3. Faz o pedido ao Django avisando que é um Admin
      const resposta = await fetch(urlCompleta, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Se usar Token simples do Django, mude para `Token ${token}`
        },
      });

      if (!resposta.ok) {
        throw new Error('Não foi possível baixar. Verifique se você está logado como Administrador.');
      }

      // 4. A MÁGICA: Transforma a resposta num arquivo baixável (Blob)
      const blob = await resposta.blob();
      const urlDownload = window.URL.createObjectURL(blob);
      
      // 5. Cria um link invisível e clica nele automaticamente
      const linkInvisivel = document.createElement('a');
      linkInvisivel.href = urlDownload;
      
      // Dá um nome inteligente ao arquivo dependendo da data
      const nomeArquivo = dataInicio && dataFim 
        ? `pagamentos_${dataInicio}_ate_${dataFim}.csv` 
        : `pagamentos_geral.csv`;
        
      linkInvisivel.setAttribute('download', nomeArquivo);
      document.body.appendChild(linkInvisivel);
      linkInvisivel.click();
      
      // Limpa a memória
      linkInvisivel.parentNode.removeChild(linkInvisivel);
      window.URL.revokeObjectURL(urlDownload);

    } catch (erro) {
      console.error(erro);
      toast.error(erro.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        💰 Relatório de Pagamento dos Fotógrafos
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Selecione o período para gerar a planilha do Excel com as comissões calculadas.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={baixarRelatorio}
        disabled={carregando}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors 
          ${carregando 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {carregando ? 'Gerando Planilha...' : 'Baixar Relatório (Excel)'}
      </button>
    </div>
  );
}