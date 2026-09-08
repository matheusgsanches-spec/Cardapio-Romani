import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import PwaPrompt from './components/pwa/PwaPrompt'
import DashboardPage from './pages/admin/DashboardPage'
import MenuBuilderPage from './pages/admin/MenuBuilderPage'
import FoodsPage from './pages/admin/FoodsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import MenuTablePage from './pages/admin/MenuTablePage'
import PublicMenuPage from './pages/public/PublicMenuPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ToastProvider>
      <PwaPrompt />
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<PublicMenuPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<DataProvider><AdminLayout /></DataProvider>}>
                <Route index element={<DashboardPage />} />
                <Route path="cardapio" element={<MenuBuilderPage />} />
                <Route path="alimentos" element={<FoodsPage />} />
                <Route path="categorias" element={<CategoriesPage />} />
                <Route path="tabela" element={<MenuTablePage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
