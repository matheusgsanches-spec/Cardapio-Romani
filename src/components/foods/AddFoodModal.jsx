import { useState } from 'react'
import { ChefHat } from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

export default function AddFoodModal({ food, foods, categories, onClose, onSave }) {
  const activeCategories = categories.filter((category) => category.active || category.id === food?.categoryId)
  const [name, setName] = useState(food?.name || '')
  const [categoryId, setCategoryId] = useState(food?.categoryId || activeCategories[0]?.id || '')
  const [description, setDescription] = useState(food?.description || '')
  const [active, setActive] = useState(food?.active ?? true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanName = name.trim()
    if (cleanName.length < 2) return setError('Informe o nome do alimento.')
    if (!categoryId) return setError('Selecione uma categoria.')
    const duplicate = foods.some((item) => item.id !== food?.id && item.name.toLocaleLowerCase('pt-BR') === cleanName.toLocaleLowerCase('pt-BR'))
    if (duplicate) return setError('Já existe um alimento com esse nome.')
    setSaving(true)
    try {
      await onSave({ ...food, name: cleanName, categoryId, description: description.trim(), active })
      onClose()
    } catch {
      setError('Não foi possível salvar o alimento. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} eyebrow="BIBLIOTECA" title={food ? 'Editar alimento' : 'Novo alimento'}>
      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="form-icon-intro"><span><ChefHat size={21} /></span><p>Depois de salvo, o alimento estará disponível no construtor semanal.</p></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label className="field"><span>Nome do alimento <em>*</em></span><div className="field__control"><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="Ex.: Frango grelhado" maxLength={80} /></div></label>
        <label className="field"><span>Categoria <em>*</em></span><div className="field__control"><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Selecione uma categoria</option>{activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div></label>
        <label className="field"><span>Descrição <small>(opcional)</small></span><div className="field__control field__control--textarea"><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Detalhes de preparo ou ingredientes" maxLength={180} rows={3} /></div><small>{description.length}/180 caracteres</small></label>
        <label className="switch-row"><div><strong>Alimento ativo</strong><span>Itens inativos não aparecem no construtor.</span></div><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /><i /></label>
        <div className="modal-actions"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alimento'}</Button></div>
      </form>
    </Modal>
  )
}
