import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from '../ui/Loader'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="page-loader"><Loader label="Verificando acesso..." /></div>
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
