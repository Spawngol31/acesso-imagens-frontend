// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- IMPORTAÇÕES DO REACT TOASTIFY ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// -------------------------------------

// Layouts e Componentes
import Layout from './components/Layout';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import AdminLayout from './pages/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import HomePage from './pages/HomePage'; 
import AlbumList from './pages/AlbumList'; 
import AlbumDetail from './pages/AlbumDetail';
import AlbumCreatePage from './pages/dashboard/AlbumCreatePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import MinhasPropostasPage from './pages/MinhasPropostasPage';
import MinhasComprasPage from './pages/MinhasComprasPage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminJornaisPage from './pages/admin/AdminJornaisPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminFinanceiroPage from './pages/admin/AdminFinanceiroPage';
import AdminAvaliacoesPage from './pages/admin/AdminAvaliacoesPage';
import DashboardAlbunsPage from './pages/dashboard/DashboardAlbunsPage';
import DashboardCarrinhosPage from './pages/dashboard/DashboardCarrinhosPage';
import DashboardAlbumDetailPage from './pages/dashboard/DashboardAlbumDetailPage';
import DashboardVendasPage from './pages/dashboard/DashboardVendasPage';
import DashboardCuponsPage from './pages/dashboard/DashboardCuponsPage';
import DashboardPropostasPage from './pages/dashboard/DashboardPropostasPage';
import DashboardUploadPage from './pages/dashboard/DashboardUploadPage';
import DashboardPerfilPage from './pages/dashboard/DashboardPerfilPage';
import DashboardImprensaPage from './pages/dashboard/DashboardImprensaPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ContactPage from './pages/ContactPage';
import WatermarkToolPage from './pages/dashboard/WatermarkToolPage';
import ServicesPage from './pages/ServicesPage';
import ImprensaPage from './pages/ImprensaPage';
import AboutPage from './pages/AboutPage';
import NewsListPage from './pages/NewsListPage';
import NewsDetailPage from './pages/NewsDetailPage';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import PromotionalArtCreatorPage from './pages/dashboard/PromotionalArtCreatorPage';

// --- AS NOVAS PÁGINAS DE SAQUE ---
import FotografoSaquesPage from './pages/dashboard/FotografoSaquesPage';
import AdminSaquesPage from './pages/admin/AdminSaquesPage';

import './App.css';

function App() {
  return (
    <>
      <Routes>
        
        {/* ========================================================
            ROTAS COM O LAYOUT PRINCIPAL (Com NavBar Preto) 
        ======================================================== */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="eventos" element={<AlbumList />} />
          <Route path="album/:id" element={<AlbumDetail />} />
          <Route path="busca" element={<SearchPage />} />
          <Route path="carrinho" element={<CartPage />} />
          <Route path="minhas-compras" element={<MinhasComprasPage />} />
          <Route path="minhas-propostas" element={<MinhasPropostasPage />} />
          <Route path="perfil" element={<DashboardPerfilPage />} />
          <Route path="contato" element={<ContactPage />} />
          <Route path="quem-somos" element={<AboutPage />} />
          <Route path="solucoes" element={<ServicesPage />} />
          <Route path="imprensa" element={<ImprensaPage />} />
          <Route path="noticias" element={<NewsListPage />} />
          <Route path="noticias/:slug" element={<NewsDetailPage />} />
          <Route path="privacidade" element={<PoliticaPrivacidade />} />
          
          {/* 🚀 ROTA DE IMPRENSA MOVIDA PARA DENTRO DO LAYOUT PRINCIPAL */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'JORNALISTA', 'ASSESSOR_IMPRENSA', 'ASSESSOR_COMUNICACAO']} />}>
            <Route path="dashboard/imprensa" element={<DashboardImprensaPage />} />
          </Route>

        </Route>


        {/* ========================================================
            ROTAS SEM LAYOUT PRINCIPAL (Login, Registo, etc) 
        ======================================================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido/sucesso" element={<SuccessPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/resetar-senha/:uidb64/:token" element={<ResetPasswordPage />} />


        {/* ========================================================
            ROTAS DO FOTÓGRAFO (Têm um layout específico: DashboardLayout) 
        ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['FOTOGRAFO']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="albuns" element={<DashboardAlbunsPage />} />
            <Route path="albuns/novo" element={<AlbumCreatePage />} />
            <Route path="albuns/:id" element={<DashboardAlbumDetailPage />} />
            <Route path="albuns/:id/arte-promocional" element={<PromotionalArtCreatorPage />} />
            <Route path="upload" element={<DashboardUploadPage />} />
            <Route path="vendas" element={<DashboardVendasPage />} />
            <Route path="cupons" element={<DashboardCuponsPage />} />
            <Route path="carrinhos-ativos" element={<DashboardCarrinhosPage />} />
            <Route path="propostas" element={<DashboardPropostasPage />} />
            <Route path="watermark-tool" element={<WatermarkToolPage />} />
            <Route path="saques" element={<FotografoSaquesPage />} /> 
          </Route>
        </Route>


        {/* ========================================================
            ROTAS DO ADMIN (Têm um layout específico: AdminLayout) 
        ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminStatsPage />} />
            <Route path="users" element={<AdminUserPage />} />
            <Route path="jornais" element={<AdminJornaisPage />} />
            <Route path="users/:id" element={<AdminUserDetailPage />} />
            <Route path="vendas" element={<AdminFinanceiroPage />} />
            <Route path="saques" element={<AdminSaquesPage />} />
            <Route path="avaliacoes" element={<AdminAvaliacoesPage />} />
          </Route>
        </Route>

      </Routes>

      <ToastContainer 
        position="top-right" 
        autoClose={4000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored" 
      />
    </>
  );
}

export default App;