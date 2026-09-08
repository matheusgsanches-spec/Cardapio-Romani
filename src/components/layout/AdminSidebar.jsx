import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Utensils,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../ui/BrandLogo'

const navigation = [
  { to: '/admin', end: true, label: 'Visão geral', icon: LayoutDashboard },
  { to: '/admin/cardapio', label: 'Cardápio semanal', icon: CalendarDays },
  { to: '/admin/alimentos', label: 'Alimentos', icon: Utensils },
  { to: '/admin/categorias', label: 'Categorias', icon: Grid2X2 },
  { to: '/admin/tabela', label: 'Visualizar tabela', icon: ChartNoAxesColumnIncreasing },
]

export default function AdminSidebar({ collapsed, open, onClose, onToggle }) {
  const { signOut, isDemo } = useAuth()
  return (
    <>
      {open && <button className="sidebar-scrim" type="button" onClick={onClose} aria-label="Fechar menu" />}
      <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''} ${open ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <BrandLogo className="brand-logo--sidebar" alt="" />
          <span className="brand-copy"><strong>ROMANI CAFÉ</strong><small>Gestão de buffet</small></span>
          <button className="sidebar-close" type="button" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button>
        </div>

        <div className="admin-sidebar__section-label">GESTÃO</div>
        <nav className="admin-sidebar__nav">
          {navigation.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} title={collapsed ? label : undefined}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button type="button" onClick={signOut} title={collapsed ? 'Sair' : undefined} disabled={isDemo}>
            <LogOut size={19} /><span>{isDemo ? 'Modo demonstração' : 'Sair'}</span>
          </button>
          <button className="admin-sidebar__collapse" type="button" onClick={onToggle}>
            <ChevronLeft size={18} /><span>Recolher menu</span>
          </button>
        </div>
      </aside>
    </>
  )
}
