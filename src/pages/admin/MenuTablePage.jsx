import { useEffect, useState } from 'react'
import { Download, Edit3, FileSpreadsheet } from 'lucide-react'
import { Link } from 'react-router-dom'
import MenuTable from '../../components/menu-builder/MenuTable'
import WeekSelector from '../../components/menu-builder/WeekSelector'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { getWeekStart } from '../../domain/week'
import { hasExportableMenuContent } from '../../services/export/menuWorkbook'

export default function MenuTablePage() {
  const { foods, categories, getMenu } = useData()
  const { showToast } = useToast()
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true
    getMenu(weekStart).then((data) => active && setMenu(data)).catch(() => showToast('Erro ao carregar a tabela.', 'error')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [getMenu, showToast, weekStart])

  async function handleExport() {
    if (!hasExportableMenuContent(menu)) return
    setExporting(true)
    try {
      const { exportMenuXlsx } = await import('../../services/export/menuXlsx')
      const filename = await exportMenuXlsx({ menu, foods, categories, weekStart })
      showToast(`${filename} exportado com sucesso.`)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Falha ao exportar XLSX:', error)
      showToast('Não foi possível gerar a planilha XLSX.', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="builder-toolbar table-toolbar">
        <WeekSelector value={weekStart} onChange={(nextWeek) => { setLoading(true); setWeekStart(nextWeek) }} compact />
        <div className="builder-toolbar__actions">
          <Button variant="secondary" onClick={handleExport} disabled={loading || exporting || !hasExportableMenuContent(menu)}><Download size={16} /> {exporting ? 'Gerando XLSX...' : 'Exportar XLSX'}</Button>
          <Link className="button button--primary button--md" to="/admin/cardapio"><Edit3 size={16} /> Editar cardápio</Link>
        </div>
      </section>
      <section className="surface-card menu-table-card">
        <header className="section-header"><div><span className="eyebrow">VISÃO CONSOLIDADA</span><h3><FileSpreadsheet size={20} /> Cardápio por categoria</h3></div><span className="count-pill">{categories.length} categorias</span></header>
        {loading ? <Loader label="Montando tabela..." /> : <MenuTable menu={menu} foods={foods} categories={categories} />}
      </section>
    </div>
  )
}
