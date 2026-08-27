import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className={`admin-shell ${collapsed ? 'admin-shell--collapsed' : ''}`}>
      <AdminSidebar
        collapsed={collapsed}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggle={() => setCollapsed((current) => !current)}
      />
      <div className="admin-main">
        <AdminHeader onOpenSidebar={() => window.innerWidth <= 900 ? setMobileOpen(true) : setCollapsed((current) => !current)} />
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  )
}
