import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import BrandLogo from '../components/ui/BrandLogo'

export default function LoginPage() {
  const { user, signIn, isDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email, password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch {
      setError('E-mail ou senha incorretos. Verifique os dados e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual__brand"><BrandLogo className="brand-logo--login" alt="" /><span>ROMANI CAFÉ</span></div>
        <div className="login-visual__content">
          <span className="eyebrow eyebrow--light">GESTÃO DE BUFFET</span>
          <h1>Uma semana bem servida começa aqui.</h1>
          <p>Organize pratos, categorias e cardápios em uma experiência simples e visual.</p>
          <div className="login-mini-menu">
            <span>MENU DA SEMANA</span>
            <div><strong>SEG</strong><i /><i /><i /></div>
            <div><strong>TER</strong><i /><i /></div>
            <div><strong>QUA</strong><i /><i /><i /></div>
          </div>
        </div>
        <small>© 2026 Romani Café</small>
      </section>
      <section className="login-form-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <span className="login-form__mobile-brand"><BrandLogo className="brand-logo--mobile" alt="" /> ROMANI CAFÉ</span>
          <div><span className="eyebrow">ÁREA ADMINISTRATIVA</span><h2>Bem-vindo de volta</h2><p>Entre para gerenciar o cardápio do buffet.</p></div>
          {isDemo && <div className="inline-notice">O projeto está no modo local. A área administrativa é liberada automaticamente.</div>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <label className="field">
            <span>E-mail</span>
            <div className="field__control"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required /></div>
          </label>
          <label className="field">
            <span>Senha</span>
            <div className="field__control"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar senha">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          </label>
          <Button type="submit" disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar'} <ArrowRight size={17} /></Button>
          <a href="/menu">Voltar para o cardápio público</a>
        </form>
      </section>
    </main>
  )
}
