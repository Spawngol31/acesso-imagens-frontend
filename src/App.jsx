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
import MinhasComprasPage from './pages/MinhasComprasPage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminFinanceiroPage from './pages/admin/AdminFinanceiroPage';
import DashboardAlbunsPage from './pages/dashboard/DashboardAlbunsPage';
import DashboardAlbumDetailPage from './pages/dashboard/DashboardAlbumDetailPage';
import DashboardVendasPage from './pages/dashboard/DashboardVendasPage';
import DashboardCuponsPage from './pages/dashboard/DashboardCuponsPage';
import DashboardUploadPage from './pages/dashboard/DashboardUploadPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ContactPage from './pages/ContactPage';
import WatermarkToolPage from './pages/dashboard/WatermarkToolPage';
import AboutPage from './pages/AboutPage';
import NewsListPage from './pages/NewsListPage';
import NewsDetailPage from './pages/NewsDetailPage';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import PromotionalArtCreatorPage from './pages/dashboard/PromotionalArtCreatorPage';

import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="eventos" element={<AlbumList />} />
          <Route path="album/:id" element={<AlbumDetail />} />
          <Route path="busca" element={<SearchPage />} />
          <Route path="carrinho" element={<CartPage />} />
          <Route path="minhas-compras" element={<MinhasComprasPage />} />
          <Route path="contato" element={<ContactPage />} />
          <Route path="quem-somos" element={<AboutPage />} />
          <Route path="noticias" element={<NewsListPage />} />
          <Route path="noticias/:slug" element={<NewsDetailPage />} />
          <Route path="/privacidade" element={<PoliticaPrivacidade />} />
        </Route>

        {/* Removi rotas duplicadas de login e registrar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido/sucesso" element={<SuccessPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/resetar-senha/:uidb64/:token" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute allowedRoles={['FOTOGRAFO']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="albuns" element={<DashboardAlbunsPage />} />
            <Route path="albuns/novo" element={<AlbumCreatePage />} />
            <Route path="albuns/:id" element={<DashboardAlbumDetailPage />} />
            <Route path="albuns/:id/arte-promocional" element={<PromotionalArtCreatorPage />} />
            <Route path="upload" element={<DashboardUploadPage />} />
            <Route path="vendas" element={<DashboardVendasPage />} />
            <Route path="cupons" element={<DashboardCuponsPage />} />
            <Route path="watermark-tool" element={<WatermarkToolPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminStatsPage />} />
            <Route path="users" element={<AdminUserPage />} />
            <Route path="users/:id" element={<AdminUserDetailPage />} />
            <Route path="vendas" element={<AdminFinanceiroPage />} />
          </Route>
        </Route>
      </Routes>

      {/* --- O CONTAINER GLOBAL DOS TOASTS FICA AQUI --- */}
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
      {/* ----------------------------------------------- */}
    </>
  );
}

export default App;