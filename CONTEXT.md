# 📋 Contexto do Projeto Frontend - Acesso Imagens

## 1. Visão Geral e Stack Tecnológica
* **Framework Core:** React 19 (JS/ES6 Module) construído com Vite.
* **Roteamento:** React Router Dom (v7).
* **Consumo de API:** Axios (comunicação com backend Django).
* **Gerenciamento de Autenticação:** JWT (`jwt-decode`), Login Social via Google (`@react-oauth/google`) e Facebook (`@greatsumini/react-facebook-login`).
* **Pagamentos:** SDK Oficial do Mercado Pago React (`@mercadopago/sdk-react`).
* **UI e Utilitários:** 
  * Ícones: `react-icons`.
  * Alertas/Notificações: `react-toastify`.
  * Dashboards e Gráficos: `chart.js` e `react-chartjs-2`.
  * Ferramentas de imagem: `html-to-image`.
* **Linting:** ESLint configurado para React.

## 2. Estrutura de Pastas Principal (React)
*(Dica: Atualize esta seção com as pastas reais do seu `src/` para a IA saber onde ficam os componentes)*
* `src/components/` -> [Componentes reutilizáveis como Botões, Modais, Navbar]
* `src/pages/` -> [Páginas inteiras como Home, Login, Dashboard, Carrinho]
* `src/services/` -> [Configurações do Axios e requisições para a API]
* `src/context/` (se houver) -> [Gerenciadores de estado globais]

## 3. Padrões de Comunicação com a API (Backend)
* O Frontend consome a API do Django REST Framework (DRF) rodando no servidor.
* As requisições que exigem autenticação enviam o token JWT no cabeçalho (Header `Authorization: Bearer <token>`).
* Rotas principais mapeadas no React Router espelham as funcionalidades da Loja, Galeria, Dashboard de Fotógrafos e Área do Cliente.

## 4. Scripts Disponíveis
* Rodar em desenvolvimento: `npm run dev`
* Gerar build para produção: `npm run build`