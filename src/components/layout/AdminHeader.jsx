import { ExternalLink, Menu, PanelLeft, WifiOff } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useData } from '../../context/DataContext'

const routeTitles = {
  '/admin': ['Visão geral', 'Acompanhe o seu buffet em um só lugar.'],
  '/admin/cardapio': ['Cardápio semanal', 'Monte a semana arrastando os alimentos.'],
  '/admin/alimentos': ['Alimentos', 'Gerencie a biblioteca do buffet.'],
  '/admin/categorias': ['Categorias', 'Organize os alimentos por grupos.'],
  '/admin/tabela': ['Tabela semanal', 'Veja o cardápio consolidado por categoria.'],
  '/admin/configuracoes': ['Configurações', 'Ambiente e integração do sistema.'],
}

export default function AdminHeader({ onOpenSidebar }) {
  const { pathname } = useLocation()
  const [title, subtitle] = routeTitles[pathname] || routeTitles['/admin']
  const { isFirebaseEnabled } = useData()
  return (
    <header className="admin-header">
      <div className="admin-header__title">
        <button className="mobile-menu-button" type="button" onClick={onOpenSidebar} aria-label="Abrir menu">
          <Menu size={21} />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="admin-header__actions">
        {!isFirebaseEnabled && <span className="demo-pill"><WifiOff size={14} /> Dados locais</span>}
        <Link className="button button--secondary button--sm" to="/menu" target="_blank">
          Ver menu público <ExternalLink size={15} />
        </Link>
        <button className="desktop-panel-button" type="button" onClick={onOpenSidebar} aria-label="Abrir menu lateral">
          <PanelLeft size={19} />
        </button>
      </div>
    </header>
  )
}
