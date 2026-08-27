import { useState } from 'react'
import { FolderPlus } from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

export default function AddCategoryModal({ category, categories, onClose, onSave }) {
  const [name, setName] = useState(category?.name || '')
  const [order, setOrder] = useState(category?.order ?? categories.length + 1)
  const [active, setActive] = useState(category?.active ?? true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanName = name.trim()
    if (cleanName.length < 2) return setError('Informe um nome com pelo menos 2 caracteres.')
    const duplicate = categories.some((item) => item.id !== category?.id && item.name.toLocaleLowerCase('pt-BR') === cleanName.toLocaleLowerCase('pt-BR'))
    if (duplicate) return setError('Já existe uma categoria com esse nome.')
    setSaving(true)
    try {
      await onSave({ ...category, name: cleanName, order: Number(order), active })
      onClose()
    } catch {
      setError('Não foi possível salvar a categoria. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} eyebrow="ORGANIZAÇÃO" title={category ? 'Editar categoria' : 'Nova categoria'}>
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="form-icon-intro"><span><FolderPlus size={21} /></span><p>As categorias agrupam os alimentos na biblioteca e no menu público.</p></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label className="field"><span>Nome da categoria <em>*</em></span><div className="field__control"><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="Ex.: Proteínas" maxLength={60} /></div><small>{name.length}/60 caracteres</small></label>
        <label className="field"><span>Ordem de exibição <em>*</em></span><div className="field__control"><input type="number" min="0" max="999" value={order} onChange={(event) => setOrder(event.target.value)} required /></div><small>Define a posição no cardápio público.</small></label>
        <label className="switch-row"><div><strong>Categoria ativa</strong><span>Categorias inativas não aparecem na biblioteca.</span></div><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /><i /></label>
        <div className="modal-actions"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar categoria'}</Button></div>
      </form>
    </Modal>
  )
}
